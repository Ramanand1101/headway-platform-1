const cloudinary = require('cloudinary').v2;
const CompanyDirectory = require('../models/CompanyDirectory');

// GET /api/companies — any logged-in advisor/admin browses the shared
// company directory to pick a name+logo for their own "Company working with".
exports.listCompanies = async (req, res, next) => {
  try {
    const companies = await CompanyDirectory.find().sort({ name: 1 });
    res.json({ companies });
  } catch (err) {
    next(err);
  }
};

// POST /api/companies  (admin-only) — adds one company with its logo to the
// shared directory.
exports.createCompany = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Company name is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Logo file is required' });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'company-directory',
      public_id: `${Date.now()}`,
      resource_type: 'image'
    });

    const company = await CompanyDirectory.create({ name: name.trim(), logoUrl: uploaded.secure_url });
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
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
