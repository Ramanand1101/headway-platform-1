const { parse } = require('csv-parse/sync');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const Advisor = require('../models/Advisor');
const Testimonial = require('../models/Testimonial');
const User = require('../models/User');

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
