const cloudinary = require('cloudinary').v2;
const ContentPost = require('../models/ContentPost');

// Uses a real OpenAI key once OPENAI_API_KEY is set in the environment.
// Falls back to GitHub Models (OpenAI-compatible, same gpt-4o-mini model)
// via GITHUB_MODELS_TOKEN so nothing breaks while that key isn't set yet.

function buildPrompt(advisor, topic) {
  const subject = topic ? `about "${topic}"` : 'sharing one practical financial tip';

  return `Write a simple, informative blog post for an
Indian financial advisor named ${advisor.name}, based in ${advisor.city || 'India'},
specializing in ${(advisor.specialization || []).join(', ') || 'financial planning'}.
The post should be ${subject}.
Length: strictly between 2500 and 3000 characters including spaces — this is a firm requirement,
not a suggestion. Never go over 3000 characters under any circumstance; stop writing and wrap up
with the closing paragraph before you reach that limit. Write in enough detail (explain each
point with a short example or practical tip) to naturally reach at least 2500 characters, but do
not pad with filler just to hit the count.
Tone: simple, trustworthy, no jargon, end with a soft call to action.
Structure: a short opening hook, 3-5 numbered points each explained in 2-3 sentences, and a
closing paragraph. Use fewer, more detailed points rather than many short ones.
Formatting: plain text only. Do not use markdown — no asterisks, no #, no bullet
symbols, no emoji. For the numbered points just use "1. ", "2. " etc. on their own lines.`;
}

async function callModel(prompt) {
  const useOpenAi = Boolean(process.env.OPENAI_API_KEY);

  const response = await fetch(
    useOpenAi ? 'https://api.openai.com/v1/chat/completions' : 'https://models.github.ai/inference/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useOpenAi ? process.env.OPENAI_API_KEY : process.env.GITHUB_MODELS_TOKEN}`
      },
      body: JSON.stringify({
        model: useOpenAi ? 'gpt-4o-mini' : 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Content generation failed');
  }

  return data.choices?.[0]?.message?.content || '';
}

// Generates a featured image for a blog post with OpenAI's image model and
// re-hosts it on Cloudinary immediately — gpt-image-1 only returns base64
// (no hosted URL), and even DALL-E's temporary URLs expire after about an
// hour, so storing anything but a Cloudinary URL would break the post later.
// Best-effort: needs OPENAI_API_KEY; returns null (no image) on any failure
// so a blog draft is never blocked by image generation trouble.
async function generateBlogImage(title, topic) {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const subject = topic || title;
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `A clean, professional editorial featured image for a blog post about "${subject}",
related to Indian personal finance and insurance. Photorealistic or soft modern flat-illustration
style, warm and trustworthy tone, no text or words anywhere in the image, no logos.`,
        n: 1,
        size: '1024x1024'
      })
    });
    const data = await response.json();
    const image = data.data?.[0];
    const source = image?.url || (image?.b64_json && `data:image/png;base64,${image.b64_json}`);
    if (!source) return null;

    const uploaded = await cloudinary.uploader.upload(source, {
      folder: 'blog-images',
      public_id: `${Date.now()}`,
      resource_type: 'image'
    });
    return uploaded.secure_url;
  } catch {
    return null;
  }
}

function buildProfileBlurbPrompt(advisor, field) {
  const specialization = (advisor.specialization || []).join(', ') || 'insurance planning';
  const services = (advisor.services || []).join(', ');
  const experience = advisor.yearsExperience ? `${advisor.yearsExperience} years of experience` : '';
  const credentials = (advisor.credentials || []).join(', ');

  const context = `Advisor name: ${advisor.name}. City: ${advisor.city || 'India'}. Specializes in: ${specialization}.${
    services ? ` Services offered: ${services}.` : ''
  }${experience ? ` ${experience}.` : ''}${credentials ? ` Credentials: ${credentials}.` : ''}`;

  if (field === 'bio') {
    return `${context}
Write a short, warm one-to-two sentence tagline (25-40 words) for this Indian insurance
advisor's website homepage, shown right next to their name.
Tone: confident, simple, no jargon, no emoji, no markdown.
Write in first person ("I help...").
Return only the tagline text, nothing else — no quotes, no preamble.`;
  }

  return `${context}
Write a warm, trustworthy "About Me" paragraph (90-130 words) for this Indian insurance
advisor's website, written in first person.
Tone: simple, confident, client-first, no jargon, no emoji, no markdown, no bullet points.
Return only the paragraph text, nothing else — no quotes, no preamble.`;
}

// Generates a short bio tagline or a longer About Me paragraph from the
// advisor's existing profile fields (name/city/specialization/services/
// experience/credentials) — powers the dashboard's "magic wand" buttons.
async function generateProfileBlurb(advisor, field) {
  return callModel(buildProfileBlurbPrompt(advisor, field));
}

// Models aren't precise character counters, so the prompt's 2500-3000
// target is a best effort, not a guarantee — this is the hard backstop.
// Trims to the last complete sentence at or before `max` chars rather than
// cutting mid-sentence.
const BLOG_MAX_CHARS = 3000;
function capLength(text, max = BLOG_MAX_CHARS) {
  if (!text || text.length <= max) return text;

  const truncated = text.slice(0, max);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  return lastSentenceEnd > max * 0.5 ? truncated.slice(0, lastSentenceEnd + 1) : truncated;
}

// Drafts a post (title/body/imageUrl) WITHOUT saving it — used by the
// "Write blog" admin page so the draft can be reviewed/edited before publish.
async function draftContent(advisor, topic) {
  const body = capLength(await callModel(buildPrompt(advisor, topic)));
  const title = topic || `${advisor.name} — Monthly Update`;
  const imageUrl = await generateBlogImage(title, topic);
  return { title, body, imageUrl };
}

// Drafts a post for one advisor and saves it. By default it's saved as
// 'pending_review' so the advisor approves before it goes live; pass
// publish: true to skip review and make it live immediately.
async function generateContent(advisor, { topic, publish = false } = {}) {
  const body = capLength(await callModel(buildPrompt(advisor, topic)));
  const title = topic || `${advisor.name} — Monthly Update`;
  const imageUrl = await generateBlogImage(title, topic);

  return ContentPost.create({
    advisorId: advisor._id,
    title,
    body,
    imageUrl,
    status: publish ? 'published' : 'pending_review',
    publishedAt: publish ? new Date() : undefined,
    generatedBy: 'ai'
  });
}

module.exports = { generateContent, draftContent, generateProfileBlurb };
