const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Advisor = require('../models/Advisor');

const googleClient =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? new OAuth2Client({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    : null;

// Google's popup-based Authorization Code flow (initCodeClient) exchanges
// its code using the literal redirect_uri "postmessage" — there's no real
// redirect URL because the code comes back via postMessage to the opener.
const GOOGLE_REDIRECT_URI = 'postmessage';

// Fetches the caller's phone number via the People API using the access
// token obtained from the code exchange. Returns null if the user has no
// phone number on file, or if the scope wasn't granted — never throws,
// since phone lookup is a nice-to-have, not required for login to work.
async function fetchGooglePhoneNumber(accessToken) {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers&sources=READ_SOURCE_TYPE_PROFILE&sources=READ_SOURCE_TYPE_CONTACT&sources=READ_SOURCE_TYPE_DOMAIN_CONTACT',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    if (!res.ok) return null;
    return data.phoneNumbers?.[0]?.value || null;
  } catch {
    return null;
  }
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id, advisorId: user.advisorId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, advisorId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, advisorId });

    res.status(201).json({ userId: user._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/advisor-signup — self-service: creates the Advisor tenant
// and the login account together, then logs them straight in.
exports.advisorSignup = async (req, res, next) => {
  try {
    const { slug, name, email, password } = req.body;

    if (!slug || !name || !email || !password) {
      return res.status(400).json({ error: 'Slug, name, email and password are all required' });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const [slugTaken, emailTaken] = await Promise.all([
      Advisor.findOne({ slug: normalizedSlug }),
      User.findOne({ email })
    ]);

    if (slugTaken) return res.status(409).json({ error: 'This slug is already taken' });
    if (emailTaken) return res.status(409).json({ error: 'Email already registered' });

    const advisor = await Advisor.create({ slug: normalizedSlug, name: name.trim() });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      advisorId: advisor._id,
      role: 'advisor'
    });

    res.status(201).json({ token: signToken(user), advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in — please continue with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user) });
  } catch (err) {
    next(err);
  }
};

// Turns "Priya Sharma" / "priya@gmail.com" into a unique advisor slug,
// appending a random suffix on collision.
async function generateUniqueSlug(base) {
  const cleaned = base
    .toLowerCase()
    .replace(/@.*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'advisor';

  let candidate = cleaned;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const taken = await Advisor.findOne({ slug: candidate });
    if (!taken) return candidate;
    candidate = `${cleaned}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return `${cleaned}-${Date.now()}`;
}

// POST /api/auth/google — exchanges a Google Authorization Code (from the
// Identity Services popup code-client flow) for tokens, verifies identity
// via the ID token, and fetches a phone number via the People API using
// the access token (requires the user.phonenumbers.read scope — granted
// only for test users until the OAuth consent screen is verified by
// Google). If the email already has an account, logs them straight in.
// If not, a new Advisor tenant + User are created immediately using the
// Google profile (name, email, photo, phone) — a true one-click signup.
exports.googleAuth = async (req, res, next) => {
  try {
    if (!googleClient) {
      return res.status(503).json({ error: 'Google sign-in is not configured yet.' });
    }

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing Google authorization code' });

    const { tokens } = await googleClient.getToken({ code, redirect_uri: GOOGLE_REDIRECT_URI });

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name: googleName, picture, sub: googleId } = payload;

    const phone = tokens.access_token ? await fetchGooglePhoneNumber(tokens.access_token) : null;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      const advisor = await Advisor.findById(user.advisorId);
      if (advisor && phone && !advisor.contactNumber) {
        advisor.contactNumber = phone;
        await advisor.save();
      }
      return res.json({ token: signToken(user), advisor, isNewAccount: false });
    }

    const slug = await generateUniqueSlug(googleName || email);
    const advisor = await Advisor.create({
      slug,
      name: (googleName || email.split('@')[0]).trim(),
      photoUrl: picture || undefined,
      contactNumber: phone || undefined
    });
    user = await User.create({
      email,
      googleId,
      advisorId: advisor._id,
      role: 'advisor'
    });

    res.status(201).json({ token: signToken(user), advisor, isNewAccount: true });
  } catch (err) {
    next(err);
  }
};
