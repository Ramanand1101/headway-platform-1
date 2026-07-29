const ContentPost = require('../models/ContentPost');

// TEMPORARY: using GitHub Models (OpenAI-compatible) via GITHUB_MODELS_TOKEN
// until an Anthropic API key is available. Switch back to the Anthropic
// Messages API (see git history) once CLAUDE_API_KEY is set.

function buildPrompt(advisor, topic) {
  const subject = topic ? `about "${topic}"` : 'sharing one practical financial tip';

  return `Write a short, simple LinkedIn-style post (150-200 words) for an
Indian financial advisor named ${advisor.name}, based in ${advisor.city || 'India'},
specializing in ${(advisor.specialization || []).join(', ') || 'financial planning'}.
The post should be ${subject}.
Tone: simple, trustworthy, no jargon, end with a soft call to action.
Formatting: plain text only. Do not use markdown — no asterisks, no #, no bullet
symbols, no emoji. For a numbered list just use "1. ", "2. " etc. on their own lines.`;
}

async function callModel(prompt) {
  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_MODELS_TOKEN}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Content generation failed');
  }

  return data.choices?.[0]?.message?.content || '';
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

// Drafts a post and returns { title, body } WITHOUT saving it — used by the
// "Write blog" admin page so the draft can be reviewed/edited before publish.
async function draftContent(advisor, topic) {
  const body = await callModel(buildPrompt(advisor, topic));
  return { title: topic || `${advisor.name} — Monthly Update`, body };
}

// Drafts a post for one advisor and saves it. By default it's saved as
// 'pending_review' so the advisor approves before it goes live; pass
// publish: true to skip review and make it live immediately.
async function generateContent(advisor, { topic, publish = false } = {}) {
  const body = await callModel(buildPrompt(advisor, topic));

  return ContentPost.create({
    advisorId: advisor._id,
    title: topic || `${advisor.name} — Monthly Update`,
    body,
    status: publish ? 'published' : 'pending_review',
    publishedAt: publish ? new Date() : undefined,
    generatedBy: 'ai'
  });
}

module.exports = { generateContent, draftContent, generateProfileBlurb };
