const { sendMessage } = require('../services/chatbotService');

// POST /api/chatbot/message — public (used by anonymous microsite visitors
// and logged-in advisors alike). Body: { threadId?, message, context? }.
// context: 'dashboard' unlocks the profile-editing tools (set_bio, etc.) —
// omitted/anything else (public microsite) never gets them.
exports.postMessage = async (req, res, next) => {
  try {
    const { threadId, message, context } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await sendMessage({
      threadId,
      message: message.trim(),
      allowProfileTools: context === 'dashboard'
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
