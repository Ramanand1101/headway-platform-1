const ContentPost = require('../models/ContentPost');
const Advisor = require('../models/Advisor');
const { generateContent, draftContent } = require('../services/contentGenerator');

// GET /api/content  (published posts for the resolved tenant)
exports.getPublishedContent = async (req, res, next) => {
  try {
    const posts = await ContentPost.find({
      advisorId: req.advisor._id,
      status: 'published'
    }).sort({ publishedAt: -1 });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/post/:slug  (single published post for the resolved tenant)
exports.getPublishedPost = async (req, res, next) => {
  try {
    const post = await ContentPost.findOne({
      slug: req.params.slug,
      advisorId: req.advisor._id,
      status: 'published'
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/pending  (advisor dashboard: review queue)
exports.getPendingContent = async (req, res, next) => {
  try {
    const posts = await ContentPost.find({
      advisorId: req.user.advisorId,
      status: 'pending_review'
    }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/all/:advisorId  (admin-only — every post for one advisor, for the writer UI)
exports.listAllForAdvisor = async (req, res, next) => {
  try {
    const posts = await ContentPost.find({ advisorId: req.params.advisorId }).sort({
      createdAt: -1
    });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/generate/:advisorId  (admin-only — on-demand AI content generation)
exports.generateForAdvisor = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.params.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    const { topic, publish } = req.body || {};
    const post = await generateContent(advisor, { topic, publish: Boolean(publish) });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/draft/:advisorId  (admin-only — AI draft, NOT saved; for review before publish)
exports.draftForAdvisor = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.params.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    const { topic } = req.body || {};
    const draft = await draftContent(advisor, topic);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/manual/:advisorId  (admin-only — hand-written post; pass
// publish: false to save as a draft instead of going live immediately)
exports.createManualPost = async (req, res, next) => {
  try {
    const { title, body, imageUrl, tags, categories, publish = true } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const advisor = await Advisor.findById(req.params.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    const post = await ContentPost.create({
      advisorId: advisor._id,
      title,
      body,
      imageUrl,
      tags,
      categories,
      status: publish ? 'published' : 'draft',
      publishedAt: publish ? new Date() : undefined,
      generatedBy: 'manual'
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/content/:id  (admin-only — edit an existing post; also used to
// move a draft to published by passing publish: true)
exports.updatePost = async (req, res, next) => {
  try {
    const { title, body, imageUrl, tags, categories, publish } = req.body || {};
    const update = { title, body, imageUrl, tags, categories };
    if (publish === true) {
      update.status = 'published';
      update.publishedAt = new Date();
    } else if (publish === false) {
      update.status = 'draft';
    }

    const post = await ContentPost.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/content/:id  (admin-only)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await ContentPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/content/mine  (logged-in advisor — every post of their own)
exports.getMyPosts = async (req, res, next) => {
  try {
    const posts = await ContentPost.find({ advisorId: req.user.advisorId }).sort({
      createdAt: -1
    });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/mine/generate  (advisor — AI-generate + publish to their own blog)
exports.generateMyContent = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    if (advisor.planTier !== 'premium' && advisor.aiCredits <= 0) {
      return res.status(402).json({
        error: 'No AI credits left. Upgrade to Premium for unlimited AI blog posts.',
        creditsExhausted: true
      });
    }

    const { topic } = req.body || {};
    const post = await generateContent(advisor, { topic, publish: true });

    if (advisor.planTier !== 'premium') {
      advisor.aiCredits -= 1;
      await advisor.save();
    }

    res.status(201).json({ post, aiCredits: advisor.aiCredits, planTier: advisor.planTier });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/mine/draft  (advisor — AI draft, NOT saved; free preview
// before posting. Credits are only charged by publishMyDraft below, once
// the advisor actually posts it.)
exports.draftMyContent = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    if (advisor.planTier !== 'premium' && advisor.aiCredits <= 0) {
      return res.status(402).json({
        error: 'No AI credits left. Upgrade to Premium for unlimited AI blog posts.',
        creditsExhausted: true
      });
    }

    const { topic } = req.body || {};
    const draft = await draftContent(advisor, topic);

    res.json({ draft, aiCredits: advisor.aiCredits, planTier: advisor.planTier });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/mine/publish  (advisor — saves and publishes a
// (possibly advisor-edited) AI draft from draftMyContent above. This is the
// actual "posting" moment, so the 1 AI credit is charged here, not at draft
// time.)
exports.publishMyDraft = async (req, res, next) => {
  try {
    const advisor = await Advisor.findById(req.user.advisorId);
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    const { title, body, imageUrl } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    if (advisor.planTier !== 'premium' && advisor.aiCredits <= 0) {
      return res.status(402).json({
        error: 'No AI credits left. Upgrade to Premium for unlimited AI blog posts.',
        creditsExhausted: true
      });
    }

    const post = await ContentPost.create({
      advisorId: advisor._id,
      title,
      body,
      imageUrl,
      status: 'published',
      publishedAt: new Date(),
      generatedBy: 'ai'
    });

    if (advisor.planTier !== 'premium') {
      advisor.aiCredits -= 1;
      await advisor.save();
    }

    res.status(201).json({ post, aiCredits: advisor.aiCredits, planTier: advisor.planTier });
  } catch (err) {
    next(err);
  }
};

// POST /api/content/mine/manual  (advisor — hand-written post, publishes immediately, no credit used)
exports.createMyManualPost = async (req, res, next) => {
  try {
    const { title, body, imageUrl } = req.body || {};
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const post = await ContentPost.create({
      advisorId: req.user.advisorId,
      title,
      body,
      imageUrl,
      status: 'published',
      publishedAt: new Date(),
      generatedBy: 'manual'
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/content/mine/:id  (advisor — only their own posts)
exports.deleteMyPost = async (req, res, next) => {
  try {
    const post = await ContentPost.findOneAndDelete({
      _id: req.params.id,
      advisorId: req.user.advisorId
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/content/:id/approve
exports.approveContent = async (req, res, next) => {
  try {
    const post = await ContentPost.findOneAndUpdate(
      { _id: req.params.id, advisorId: req.user.advisorId },
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};
