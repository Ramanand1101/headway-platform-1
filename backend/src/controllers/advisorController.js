const { parse } = require('csv-parse/sync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const Advisor = require('../models/Advisor');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');

// Subdomains that must never be assignable to an advisor — mirrors
// frontend/middleware.js's RESERVED_SUBDOMAINS plus a couple of backend-only
// reservations (this API is itself served under /api).
const RESERVED_SLUGS = ['www', 'admin', 'api', 'app', 'mail', 'blog'];

// Same cleanup rule used at signup (authController's generateUniqueSlug) —
// lowercase, non-alphanumerics collapsed to single hyphens, capped length.
function sanitizeSlug(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/@.*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

const CSV_COLUMNS = [
  'slug',
  'name',
  'city',
  'specialization',
  'bio',
  'services',
  'contactNumber',
  'whatsappNumber',
  'planTier'
];
const EXAMPLE_SLUG = 'example-slug';

// GET /api/advisor/profile
exports.getAdvisorProfile = (req, res) => {
  res.json({ advisor: req.advisor });
};

// GET /api/advisor  (admin-only — list advisors for the admin panel).
// Paginates when ?page/?limit is passed (e.g. the "Manage advisors" list);
// other admin screens that just need every advisor for a dropdown (content
// generation, blog writer) omit those params and get the full list, same as
// before, so this stays backward compatible.
exports.listAdvisors = async (req, res, next) => {
  try {
    const search = (req.query.q || '').trim();
    const filter = { isActive: true };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { slug: regex }];
    }

    const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;
    if (!isPaginated) {
      const advisors = await Advisor.find(filter).select('slug name city planTier').sort({ name: 1 });
      return res.json({ advisors });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [advisors, total] = await Promise.all([
      Advisor.find(filter)
        .select('slug name city planTier')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Advisor.countDocuments(filter)
    ]);

    res.json({ advisors, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/:slug/admin-enter — an admin clicks an advisor's
// microsite link in the admin panel, then re-enters their own admin email +
// password in a confirmation popup. This endpoint verifies those credentials
// fresh against the database (independent of any existing session token) and,
// only if they belong to a valid admin account, mints a short-lived
// advisor-scoped token so the admin can open that advisor's dashboard and
// edit their full website (profile, content, photos, buttons) on their
// behalf. The token carries `impersonatedBy` so the dashboard shows an
// "Admin Mode" banner instead of the advisor's normal view.
exports.adminEnterAdvisor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and password are required' });
    }

    const admin = await User.findOne({ email });
    if (!admin || !admin.passwordHash) {
      return res.status(401).json({ error: 'Invalid admin email or password' });
    }
    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid admin email or password' });
    }
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'This account does not have admin access' });
    }

    const advisor = await Advisor.findOne({ slug: req.params.slug });
    if (!advisor) return res.status(404).json({ error: 'No advisor found with that slug' });

    const advisorUser = await User.findOne({ advisorId: advisor._id, role: 'advisor' });

    const token = jwt.sign(
      {
        userId: advisorUser?._id || null,
        advisorId: advisor._id,
        role: 'advisor',
        impersonatedBy: admin._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, advisor: { slug: advisor.slug, name: advisor.name } });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/testimonials
exports.getAdvisorTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({
      advisorId: req.advisor._id,
      isPublished: true
    }).sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/template  (admin-only — downloadable CSV for bulk upload)
exports.getAdvisorTemplate = (req, res) => {
  const header = CSV_COLUMNS.join(',');
  const example = [
    EXAMPLE_SLUG,
    'Priya Sharma',
    'Mumbai',
    'Mutual Funds|Insurance',
    '"10+ years helping families plan their finances. Replace this whole row with your own data — it is skipped automatically on upload."',
    'Tax Saving|Retirement Planning',
    '9876543210',
    '919876543210',
    'basic'
  ].join(',');

  const csv = `${header}\n${example}\n`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="advisor-template.csv"');
  res.send(csv);
};

// POST /api/advisor/bulk  (admin-only — bulk-create advisors from an uploaded CSV)
exports.bulkUploadAdvisors = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const records = parse(req.file.buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const created = [];
    const skipped = [];

    for (const row of records) {
      const slug = (row.slug || '').trim().toLowerCase();

      if (!slug || slug === EXAMPLE_SLUG) continue;

      if (!row.name || !row.name.trim()) {
        skipped.push({ slug, reason: 'Missing name' });
        continue;
      }

      const exists = await Advisor.findOne({ slug });
      if (exists) {
        skipped.push({ slug, reason: 'Slug already exists' });
        continue;
      }

      try {
        const advisor = await Advisor.create({
          slug,
          name: row.name.trim(),
          city: row.city?.trim() || undefined,
          specialization: (row.specialization || '')
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          bio: row.bio?.trim() || undefined,
          services: (row.services || '')
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean),
          contactNumber: row.contactNumber?.trim() || undefined,
          whatsappNumber: row.whatsappNumber?.trim() || undefined,
          planTier: ['basic', 'standard', 'premium'].includes(row.planTier)
            ? row.planTier
            : 'basic'
        });
        created.push(advisor.slug);
      } catch (err) {
        skipped.push({ slug, reason: err.message });
      }
    }

    res.status(201).json({ created, skipped });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/onboard  (creates a new advisor tenant)
exports.onboardAdvisor = async (req, res, next) => {
  try {
    const { slug, name, city, specialization, bio, services, contactNumber } = req.body;

    const existing = await Advisor.findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: 'This slug is already taken' });
    }

    const advisor = await Advisor.create({
      slug,
      name,
      city,
      specialization,
      bio,
      services,
      contactNumber
    });

    res.status(201).json({ advisor });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/me (logged-in advisor's own profile)
exports.getMyProfile = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.user.advisorId).select('-instagram.accessToken');
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });
    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/photo (advisor uploads/replaces their own profile photo)
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'advisor-photos',
      public_id: String(req.user.advisorId),
      overwrite: true,
      resource_type: 'image'
    });

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $set: { photoUrl: uploaded.secure_url } },
      { new: true }
    );
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

const MICROSITE_IMAGE_SECTIONS = ['hero', 'about', 'achievements', 'contact', 'vision', 'mission'];

// POST /api/advisor/microsite-image/:section — advisor uploads a photo for
// one specific microsite section (hero/about/achievements/contact/vision/
// mission). Falls back to the profile photo on the microsite if a section
// has none set (vision/mission fall back to an emoji icon instead — see
// VisionMission.js).
exports.uploadMicrositeImage = async (req, res, next) => {
  try {
    const section = String(req.params.section || '');
    if (!MICROSITE_IMAGE_SECTIONS.includes(section)) {
      return res.status(400).json({ error: 'Invalid microsite image section' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'advisor-microsite-images',
      public_id: `${req.user.advisorId}-${section}`,
      overwrite: true,
      resource_type: 'image'
    });

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $set: { [`micrositeImages.${section}`]: uploaded.secure_url } },
      { new: true }
    );
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/advisor/microsite-image/:section — advisor clears a microsite
// section photo, reverting it to its fallback (profile photo or icon).
exports.deleteMicrositeImage = async (req, res, next) => {
  try {
    const section = String(req.params.section || '');
    if (!MICROSITE_IMAGE_SECTIONS.includes(section)) {
      return res.status(400).json({ error: 'Invalid microsite image section' });
    }

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $unset: { [`micrositeImages.${section}`]: '' } },
      { new: true }
    );
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/content-library — advisor uploads one or more photos to
// their Content Library for use in reels/carousels/posters.
exports.uploadContentLibraryImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'At least one photo file is required' });
    }

    const uploadedUrls = await Promise.all(
      files.map(async (file, index) => {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploaded = await cloudinary.uploader.upload(dataUri, {
          folder: 'advisor-content-library',
          public_id: `${req.user.advisorId}-${Date.now()}-${index}`,
          resource_type: 'image'
        });
        return uploaded.secure_url;
      })
    );

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $push: { contentLibraryImages: { $each: uploadedUrls } } },
      { new: true }
    );
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/advisor/content-library — advisor removes one photo from
// their Content Library by URL.
exports.deleteContentLibraryImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Image url is required' });
    }

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $pull: { contentLibraryImages: url } },
      { new: true }
    );
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/list-image — advisor uploads a single photo for use
// inside a repeating list (a company logo, an achievement/award photo, etc).
// Unlike the content library this doesn't attach the image to the advisor
// doc itself — it just returns the hosted URL for the frontend to store
// inside whichever list item (companiesWorkedWith/achievements) it belongs to.
exports.uploadListImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'advisor-list-images',
      public_id: `${req.user.advisorId}-${Date.now()}`,
      resource_type: 'image'
    });

    res.json({ url: uploaded.secure_url });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/me/testimonials — advisor manages their own text reviews
// (both published and unpublished) from the dashboard.
exports.getMyTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ advisorId: req.user.advisorId }).sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/me/testimonials — advisor adds a customer review
// themselves (text, plus an optional customer photo). Published immediately
// since the advisor is vouching for it directly, unlike client-submitted
// testimonials.
exports.createMyTestimonial = async (req, res, next) => {
  try {
    const { clientName, role, photoUrl, message, rating } = req.body;
    if (!clientName || !message) {
      return res.status(400).json({ error: 'Customer name and review are required' });
    }

    const testimonial = await Testimonial.create({
      advisorId: req.user.advisorId,
      clientName,
      role,
      photoUrl,
      message,
      rating,
      isVerified: true,
      isPublished: true
    });

    res.status(201).json({ testimonial });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/advisor/me/testimonials/:id
exports.updateMyTestimonial = async (req, res, next) => {
  try {
    const { clientName, role, photoUrl, message, rating } = req.body;

    const testimonial = await Testimonial.findOneAndUpdate(
      { _id: req.params.id, advisorId: req.user.advisorId },
      { $set: { clientName, role, photoUrl, message, rating } },
      { new: true, runValidators: true }
    );
    if (!testimonial) return res.status(404).json({ error: 'Review not found' });

    res.json({ testimonial });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/advisor/me/testimonials/:id
exports.deleteMyTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      _id: req.params.id,
      advisorId: req.user.advisorId
    });
    if (!testimonial) return res.status(404).json({ error: 'Review not found' });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/advisor/profile (advisor edits own profile)
exports.updateAdvisorProfile = async (req, res, next) => {
  try {
    const {
      name,
      city,
      bio,
      aboutMe,
      specialization,
      services,
      serviceOfferings,
      companiesWorkedWith,
      achievements,
      googleBusiness,
      faqs,
      email,
      officeAddress,
      irdaiLicenseNumber,
      yearsExperience,
      credentials,
      vision,
      mission,
      missionPillars,
      themeKey,
      contactNumber,
      whatsappNumber,
      photoUrl,
      socialLinks,
      micrositeContent
    } = req.body;

    const updated = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      {
        $set: {
          name,
          city,
          bio,
          aboutMe,
          specialization,
          services,
          serviceOfferings,
          companiesWorkedWith,
          achievements,
          googleBusiness,
          faqs,
          email,
          officeAddress,
          irdaiLicenseNumber,
          yearsExperience,
          credentials,
          vision,
          mission,
          missionPillars,
          themeKey,
          contactNumber,
          whatsappNumber,
          photoUrl,
          socialLinks,
          micrositeContent
        }
      },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Advisor not found' });
    res.json({ advisor: updated });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/slug-availability?slug=xyz — as the advisor types a new
// website address, checks whether it's free and, if not, offers a handful
// of available alternatives (Gmail-style username suggestions).
exports.checkSlugAvailability = async (req, res, next) => {
  try {
    const cleaned = sanitizeSlug(req.query.slug);
    if (cleaned.length < 3) {
      return res.json({ slug: cleaned, available: false, reason: 'Must be at least 3 characters.', suggestions: [] });
    }

    // Excluding the advisor's own _id means re-submitting their current slug
    // correctly comes back as available rather than "taken by myself".
    const taken = await Advisor.exists({ slug: cleaned, _id: { $ne: req.user.advisorId } });
    const reserved = !taken && RESERVED_SLUGS.includes(cleaned);

    if (!taken && !reserved) {
      return res.json({ slug: cleaned, available: true, suggestions: [] });
    }

    // Build candidates the way Gmail suggests free usernames: numbered
    // variants plus a couple of short random-suffix ones, then check them
    // all in one query and return the first handful that are actually free.
    const candidates = [
      `${cleaned}-2`,
      `${cleaned}-3`,
      `${cleaned}${Math.floor(10 + Math.random() * 90)}`,
      `${cleaned}-advisor`,
      `${cleaned}-${Math.floor(1000 + Math.random() * 9000)}`,
      `${cleaned}-${Math.floor(1000 + Math.random() * 9000)}`
    ].filter((c) => !RESERVED_SLUGS.includes(c));

    const takenDocs = await Advisor.find({ slug: { $in: candidates } }).select('slug').lean();
    const takenSet = new Set(takenDocs.map((d) => d.slug));
    const suggestions = candidates.filter((c) => !takenSet.has(c)).slice(0, 4);

    res.json({
      slug: cleaned,
      available: false,
      reason: reserved ? 'This address is reserved.' : 'This address is already taken.',
      suggestions
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/advisor/slug — advisor changes their own website address.
exports.updateAdvisorSlug = async (req, res, next) => {
  try {
    const cleaned = sanitizeSlug(req.body.slug);
    if (cleaned.length < 3) {
      return res.status(400).json({ error: 'Website address must be at least 3 characters.' });
    }
    if (RESERVED_SLUGS.includes(cleaned)) {
      return res.status(409).json({ error: 'This address is reserved.' });
    }

    const taken = await Advisor.exists({ slug: cleaned, _id: { $ne: req.user.advisorId } });
    if (taken) {
      return res.status(409).json({ error: 'This address is already taken.' });
    }

    const updated = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $set: { slug: cleaned } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Advisor not found' });
    res.json({ advisor: updated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This address is already taken.' });
    }
    next(err);
  }
};
