const express = require('express');
const multer = require('multer');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  connect,
  disconnect,
  getMedia,
  getInsights,
  publish,
  getComments,
  replyToComment,
  getConversations,
  getConversationMessages,
  sendMessage
} = require('../controllers/instagramController');

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('File must be an image'), { status: 400 }));
    }
    cb(null, true);
  }
});

router.use(authenticate);

router.post('/connect', connect);
router.post('/disconnect', disconnect);
router.get('/media', getMedia);
router.get('/insights', getInsights);
router.post('/publish', uploadPhoto.single('image'), publish);
router.get('/media/:mediaId/comments', getComments);
router.post('/comments/:commentId/reply', replyToComment);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/reply', sendMessage);

module.exports = router;
