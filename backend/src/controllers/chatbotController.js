const { sendMessage } = require('../services/chatbotService');

// POST /api/chatbot/message — public (used by anonymous microsite visitors
// and logged-in advisors alike). Body: { threadId?, message }.
exports.postMessage = async (req, res, next) => {
  try {
    const { threadId, message } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await sendMessage({ threadId, message: message.trim() });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
