const Advisor = require('../models/Advisor');

// Identifies which advisor (tenant) a request belongs to,
// based on the subdomain or a mapped custom domain.
async function resolveTenant(req, res, next) {
  try {
    const host = req.headers['x-tenant-host'] || req.headers.host || '';
    const slug = host.split('.')[0];

    const advisor = await Advisor.findOne({
      $or: [{ slug }, { customDomain: host }],
      isActive: true
    }).select('-instagram.accessToken');

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor site not found' });
    }

    req.advisor = advisor;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = resolveTenant;
