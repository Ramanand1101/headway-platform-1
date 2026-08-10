const { uploadBuffer, deleteByUrl } = require('../services/s3Service');
const CompanyDirectory = require('../models/CompanyDirectory');

const { CATEGORIES } = CompanyDirectory;

// GET /api/companies?category=life — any logged-in advisor/admin browses the
// shared company directory to pick a name+logo for their own "Company
// working with", optionally filtered to one folder.
exports.listCompanies = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      if (!CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      filter.category = req.query.category;
    }

    const companies = await CompanyDirectory.find(filter).sort({ name: 1 });
    res.json({ companies, categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
};

// POST /api/companies  (admin-only) — adds one company with its logo to the
// shared directory, under a Life/Health/General folder.
exports.createCompany = async (req, res, next) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Logo file is required' });
    }

    const logoUrl = await uploadBuffer(req.file.buffer, {
      folder: `company-directory/${category}`,
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const company = await CompanyDirectory.create({ name: name.trim(), logoUrl, category });
    res.status(201).json({ company });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/companies/:id  (admin-only)
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await CompanyDirectory.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    if (company.logoUrl) await deleteByUrl(company.logoUrl).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
