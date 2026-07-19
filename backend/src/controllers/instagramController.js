const cloudinary = require('cloudinary').v2;
const Advisor = require('../models/Advisor');

const GRAPH_BASE = 'https://graph.instagram.com/v21.0';

function requireIgConfig(res) {
  if (!process.env.INSTAGRAM_APP_ID || !process.env.INSTAGRAM_APP_SECRET || !process.env.INSTAGRAM_REDIRECT_URI) {
    res.status(503).json({ error: 'Instagram connect is not configured yet.' });
    return false;
  }
  return true;
}

async function getConnectedAdvisor(advisorId) {
  const advisor = await Advisor.findById(advisorId);
  if (!advisor?.instagram?.connected || !advisor.instagram.accessToken) return null;
  return advisor;
}

// POST /api/advisor/instagram/connect — exchanges the OAuth code (from the
// Instagram Business Login redirect) for a short-lived token, upgrades it
// to a long-lived (60-day) token, fetches the connected profile, and saves
// it on the advisor. Publishing/messaging/comments only ever happen when
// the advisor explicitly triggers them from the dashboard — connecting
// alone does not publish or send anything.
exports.connect = async (req, res, next) => {
  try {
    if (!requireIgConfig(res)) return;

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing Instagram authorization code' });

    const shortLivedRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code
      })
    });
    const shortLivedData = await shortLivedRes.json();
    if (!shortLivedRes.ok || !shortLivedData.access_token) {
      return res.status(400).json({ error: shortLivedData.error_message || 'Could not connect Instagram account' });
    }

    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${shortLivedData.access_token}`
    );
    const longLivedData = await longLivedRes.json();
    if (!longLivedRes.ok || !longLivedData.access_token) {
      return res.status(400).json({ error: 'Could not finish connecting Instagram account' });
    }

    const profileRes = await fetch(
      `${GRAPH_BASE}/me?fields=id,username,account_type&access_token=${longLivedData.access_token}`
    );
    const profile = await profileRes.json();
    if (!profileRes.ok) {
      return res.status(400).json({ error: 'Could not read Instagram profile' });
    }

    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      {
        $set: {
          instagram: {
            connected: true,
            igUserId: profile.id,
            username: profile.username,
            accountType: profile.account_type,
            accessToken: longLivedData.access_token,
            tokenExpiresAt: new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000),
            connectedAt: new Date()
          }
        }
      },
      { new: true }
    ).select('-instagram.accessToken');

    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/instagram/disconnect
exports.disconnect = async (req, res, next) => {
  try {
    const advisor = await Advisor.findByIdAndUpdate(
      req.user.advisorId,
      { $set: { instagram: { connected: false } } },
      { new: true }
    );
    res.json({ advisor });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/instagram/media — recent posts with engagement counts
exports.getMedia = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const mediaRes = await fetch(
      `${GRAPH_BASE}/${advisor.instagram.igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${advisor.instagram.accessToken}`
    );
    const data = await mediaRes.json();
    if (!mediaRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load media' });

    res.json({ media: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/instagram/insights — basic account-level insights.
// Requested one metric at a time (rather than one combined call) so a
// single metric Instagram rejects for this account/API version doesn't
// blank out the others. Any per-metric error is collected and returned
// alongside whatever did succeed, instead of being silently dropped, so
// the dashboard (and whoever's debugging) can see exactly what Instagram
// said instead of just an empty state.
exports.getInsights = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const metrics = ['reach', 'profile_views'];
    const errors = [];
    const insights = [];

    for (const metric of metrics) {
      // Newer Graph API versions require metric_type for time-series metrics
      // like these, but older/other account types reject the param entirely
      // — try with it first, then fall back without it, and only report the
      // error if both attempts fail.
      let insightsRes = await fetch(
        `${GRAPH_BASE}/${advisor.instagram.igUserId}/insights?metric=${metric}&period=day&metric_type=time_series&access_token=${advisor.instagram.accessToken}`
      );
      let data = await insightsRes.json();

      if (!insightsRes.ok) {
        insightsRes = await fetch(
          `${GRAPH_BASE}/${advisor.instagram.igUserId}/insights?metric=${metric}&period=day&access_token=${advisor.instagram.accessToken}`
        );
        data = await insightsRes.json();
      }

      if (insightsRes.ok) {
        insights.push(...(data.data || []));
      } else {
        errors.push(`${metric}: ${data.error?.message || 'unknown error'}`);
      }
    }

    res.json({ insights, error: errors.length ? errors.join(' | ') : null });
  } catch (err) {
    next(err);
  }
};

// Instagram needs a moment to fetch/process the image after the container
// is created — publishing before status_code is FINISHED fails with
// "Media ID is not available". Poll briefly before publishing.
async function waitForContainerReady(creationId, accessToken) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const statusRes = await fetch(
      `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${accessToken}`
    );
    const status = await statusRes.json();
    if (status.status_code === 'FINISHED') return true;
    if (status.status_code === 'ERROR') return false;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

// POST /api/advisor/instagram/publish — uploads the image to Cloudinary
// (Instagram requires a public image URL, not a raw file), then creates
// and publishes the post. Only runs when the advisor submits this form.
exports.publish = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    if (!req.file) return res.status(400).json({ error: 'An image is required' });

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'instagram-posts',
      resource_type: 'image'
    });

    const createRes = await fetch(`${GRAPH_BASE}/${advisor.instagram.igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        image_url: uploaded.secure_url,
        caption: req.body.caption || '',
        access_token: advisor.instagram.accessToken
      })
    });
    const created = await createRes.json();
    if (!createRes.ok || !created.id) {
      return res.status(400).json({ error: created.error?.message || 'Could not create the post' });
    }

    const ready = await waitForContainerReady(created.id, advisor.instagram.accessToken);
    if (!ready) {
      return res.status(400).json({ error: 'Instagram could not process the image in time. Please try again.' });
    }

    const publishRes = await fetch(`${GRAPH_BASE}/${advisor.instagram.igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        creation_id: created.id,
        access_token: advisor.instagram.accessToken
      })
    });
    const published = await publishRes.json();
    if (!publishRes.ok) {
      return res.status(400).json({ error: published.error?.message || 'Could not publish the post' });
    }

    res.status(201).json({ mediaId: published.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/instagram/media/:mediaId/comments
exports.getComments = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const commentsRes = await fetch(
      `${GRAPH_BASE}/${req.params.mediaId}/comments?fields=id,text,username,timestamp&access_token=${advisor.instagram.accessToken}`
    );
    const data = await commentsRes.json();
    if (!commentsRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load comments' });

    res.json({ comments: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/instagram/comments/:commentId/reply
exports.replyToComment = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Reply message is required' });

    const replyRes = await fetch(`${GRAPH_BASE}/${req.params.commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ message, access_token: advisor.instagram.accessToken })
    });
    const data = await replyRes.json();
    if (!replyRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not send reply' });

    res.status(201).json({ id: data.id });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/instagram/conversations — recent Instagram DM threads
exports.getConversations = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const convRes = await fetch(
      `${GRAPH_BASE}/${advisor.instagram.igUserId}/conversations?platform=instagram&fields=participants,updated_time&access_token=${advisor.instagram.accessToken}`
    );
    const data = await convRes.json();
    if (!convRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load conversations' });

    const conversations = (data.data || []).map((c) => {
      const other = (c.participants?.data || []).find((p) => p.id !== advisor.instagram.igUserId);
      return { id: c.id, updatedTime: c.updated_time, participant: other || null };
    });

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
};

// GET /api/advisor/instagram/conversations/:conversationId/messages
exports.getConversationMessages = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const msgRes = await fetch(
      `${GRAPH_BASE}/${req.params.conversationId}/messages?fields=id,created_time,from,to,message&access_token=${advisor.instagram.accessToken}`
    );
    const data = await msgRes.json();
    if (!msgRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not load messages' });

    res.json({ messages: data.data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/advisor/instagram/conversations/:conversationId/reply — sends a
// DM reply to the given recipient. Only runs when the advisor submits it.
exports.sendMessage = async (req, res, next) => {
  try {
    const advisor = await getConnectedAdvisor(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Instagram is not connected' });

    const { recipientId, message } = req.body;
    if (!recipientId || !message) {
      return res.status(400).json({ error: 'recipientId and message are required' });
    }

    const sendRes = await fetch(
      `${GRAPH_BASE}/${advisor.instagram.igUserId}/messages?access_token=${advisor.instagram.accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } })
      }
    );
    const data = await sendRes.json();
    if (!sendRes.ok) return res.status(400).json({ error: data.error?.message || 'Could not send message' });

    res.status(201).json({ messageId: data.message_id });
  } catch (err) {
    next(err);
  }
};
