const cloudinary = require('cloudinary').v2;
const Advisor = require('../models/Advisor');

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

function requireFbConfig(res) {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !process.env.FACEBOOK_REDIRECT_URI) {
    res.status(503).json({ error: 'Facebook connect is not configured yet.' });
    return false;
  }
  return true;
}

async function getConnectedAdvisor(advisorId) {
  const advisor = await Advisor.findById(advisorId);
  if (!advisor?.facebook?.connected || !advisor.facebook.pageAccessToken) return null;
  return advisor;
}

async function fetchPages(userAccessToken) {
  const pagesRes = await fetch(`${GRAPH_BASE}/me/accounts?access_token=${userAccessToken}`);
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok) {
    throw Object.assign(new Error(pagesData.error?.message || 'Could not load your Facebook Pages'), {
      status: 400
    });
  }
  return pagesData.data || [];
}

function savePage(advisorId, page) {
  return Advisor.findByIdAndUpdate(
    advisorId,
    {
      $set: {
        facebook: {
          connected: true,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          connectedAt: new Date()
        }
      }
    },
    { new: true }
  ).select('-facebook.pageAccessToken');
}

// POST /api/advisor/facebook/connect — exchanges the OAuth code (from
// Facebook Login) for a short-lived user token, upgrades it to a long-lived
// token, then lists the Facebook Pages the advisor administers. If they
// manage exactly one Page it's connected immediately; otherwise the advisor
// picks one via /select-page. Publishing/messaging only ever happen when the
// advisor explicitly triggers them from the dashboard — connecting alone
// does not publish or send anything.
exports.connect = async (req, res, next) => {
  try {
    if (!requireFbConfig(res)) return;

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing Facebook authorization code' });

    const shortRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
        process.env.FACEBOOK_REDIRECT_URI
      )}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
    );
    const shortData = await shortRes.json();
    if (!shortRes.ok || !shortData.access_token) {
      return res.status(400).json({ error: shortData.error?.message || 'Could not connect Facebook account' });
    }

    const longRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${shortData.access_token}`
    );
    const longData = await longRes.json();
    if (!longRes.ok || !longData.access_token) {
      return res.status(400).json({ error: 'Could not finish connecting Facebook account' });
    }

    const pages = await fetchPages(longData.access_token);
    if (pages.length === 0) {
      return res.status(400).json({
        error: 'No Facebook Pages found. You need to be an admin of a Facebook Page to connect.'
      });
    }

    if (pages.length === 1) {
      const advisor = await savePage(req.user.advisorId, pages[0]);
      if (!advisor) return res.status(404).json({ error: 'Advisor not found' });
      return res.json({ advisor });
    }

    // Multiple Pages — don't guess which one; let the advisor pick.
    res.json({
      needsPageSelection: true,
      userAccessToken: longData.access_token,
      pages: pages.map((p) => ({ id: p.id, name: p.name }))
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/facebook/select-page — finishes connecting after the
// advisor picks a Page (only needed when they manage more than one).
exports.selectPage = async (req, res, next) => {
  try {
    const { pageId, userAccessToken } = req.body;
    if (!pageId || !userAccessToken) {
      return res.status(400).json({ error: 'pageId and userAccessToken are required' });
    }

    const pages = await fetchPages(userAccessToken);
    const page = pages.find((p) => p.id === pageId);
    if (!page) return res.status(400).json({ error: 'Selected Page was not found' });

    const advisor = await savePage(req.user.advisorId, page);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/facebook/disconnect
exports.disconnect = async (req, res, next) => {
  try {
    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $set: { facebook: { connected: false } } },
      { new: true }
    );
    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/facebook/posts — recent Page posts with engagement counts
exports.getPosts = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const postsRes = await fetch(
      `${GRAPH_BASE}/${advisor.facebook.pageId}/posts?fields=id,message,full_picture,permalink_url,created_time,likes.summary(true),comments.summary(true)&access_token=${advisor.facebook.pageAccessToken}`
    );
    const data = await postsRes.json();
    if (!postsRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load posts' });

    res.json({ posts: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/facebook/insights — basic Page-level insights. Falls
// back gracefully (empty metrics) since some metrics need a minimum
// follower count or extra permissions Meta may not have granted yet.
exports.getInsights = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const insightsRes = await fetch(
      `${GRAPH_BASE}/${advisor.facebook.pageId}/insights?metric=page_impressions,page_engaged_users&period=day&access_token=${advisor.facebook.pageAccessToken}`
    );
    const data = await insightsRes.json();

    res.json({ insights: insightsRes.ok ? data.data || [] : [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/facebook/publish — uploads the image to Cloudinary
// (Facebook needs a public image URL for the /photos endpoint), then
// publishes it to the connected Page. Only runs when the advisor submits
// this form.
exports.publish = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });
    if (!req.file) return res.status(400).json({ error: 'An image is required' });

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'facebook-posts',
      resource_type: 'image'
    });

    const publishRes = await fetch(`${GRAPH_BASE}/${advisor.facebook.pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        url: uploaded.secure_url,
        caption: req.body.caption || '',
        access_token: advisor.facebook.pageAccessToken
      })
    });
    const published = await publishRes.json();
    if (!publishRes.ok) {
      return res.status(400).json({ error: published.error?.message || 'Could not publish the post' });
    }

    res.status(201).json({ postId: published.post_id || published.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/facebook/posts/:postId/comments
exports.getComments = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const commentsRes = await fetch(
      `${GRAPH_BASE}/${req.params.postId}/comments?fields=id,message,from,created_time&access_token=${advisor.facebook.pageAccessToken}`
    );
    const data = await commentsRes.json();
    if (!commentsRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load comments' });

    res.json({ comments: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/facebook/comments/:commentId/reply
exports.replyToComment = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Reply message is required' });

    const replyRes = await fetch(`${GRAPH_BASE}/${req.params.commentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message, access_token: advisor.facebook.pageAccessToken })
    });
    const data = await replyRes.json();
    if (!replyRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not send reply' });

    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/facebook/conversations — recent Page inbox (Messenger) threads
exports.getConversations = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const convRes = await fetch(
      `${GRAPH_BASE}/${advisor.facebook.pageId}/conversations?platform=messenger&fields=participants,updated_time&access_token=${advisor.facebook.pageAccessToken}`
    );
    const data = await convRes.json();
    if (!convRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load conversations' });

    const conversations = (data.data || []).map((c) => {
      const other = (c.participants?.data || []).find((p) => p.id !== advisor.facebook.pageId);
      return { id: c.id, updatedTime: c.updated_time, participant: other || null };
    });

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/facebook/conversations/:conversationId/messages
exports.getConversationMessages = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const msgRes = await fetch(
      `${GRAPH_BASE}/${req.params.conversationId}/messages?fields=id,created_time,from,to,message&access_token=${advisor.facebook.pageAccessToken}`
    );
    const data = await msgRes.json();
    if (!msgRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load messages' });

    res.json({ messages: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/facebook/conversations/:conversationId/reply — sends a
// Messenger reply to the given recipient. Only runs when the advisor
// submits it.
exports.sendMessage = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Facebook is not connected' });

    const { recipientId, message } = req.body;
    if (!recipientId || !message) {
      return res.status(400).json({ error: 'recipientId and message are required' });
    }

    const sendRes = await fetch(`${GRAPH_BASE}/me/messages?access_token=${advisor.facebook.pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } })
    });
    const data = await sendRes.json();
    if (!sendRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not send message' });

    res.status(201).json({ messageId: data.message_id });
  } catch (err) {
    next(err);
  }
};
