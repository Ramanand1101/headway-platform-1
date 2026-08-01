const { sendMessage } = require('../services/chatbotService');

// Whitelisted, length-capped fields only — this endpoint has no auth (the
// public microsite widget needs to work for anonymous visitors), so
// advisorContext is untrusted client input. Keeping it to a fixed key set
// with short max lengths stops it from being used to stuff arbitrarily
// large/odd content into the assistant's instructions.
const ADVISOR_CONTEXT_FIELDS = [
  'name',
  'city',
  'specialization',
  'services',
  'yearsExperience',
  'credentials',
  'existingBio',
  'existingAboutMe',
  'existingVision',
  'existingMission'
];
const MAX_FIELD_LENGTH = 300;

function sanitizeAdvisorContext(raw) {
  if (!raw || typeof raw !== 'object') return undefined;

  const clean = {};
  for (const key of ADVISOR_CONTEXT_FIELDS) {
    const value = raw[key];
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      clean[key] = value.map((v) => String(v).slice(0, 100)).slice(0, 15);
    } else {
      clean[key] = String(value).slice(0, MAX_FIELD_LENGTH);
    }
  }
  return Object.keys(clean).length ? clean : undefined;
}

// POST /api/chatbot/message — public (used by anonymous microsite visitors
// and logged-in advisors alike). Body: { threadId?, message, context?, advisorContext? }.
// context: 'dashboard' unlocks the profile-editing tools (set_bio, etc.) and
// advisorContext personalization — omitted/anything else (public microsite)
// never gets either.
exports.postMessage = async (req, res, next) => {
  try {
    const { threadId, message, context, advisorContext } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isDashboard = context === 'dashboard';
    const result = await sendMessage({
      threadId,
      message: message.trim(),
      allowProfileTools: isDashboard,
      advisorContext: isDashboard ? sanitizeAdvisorContext(advisorContext) : undefined
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
