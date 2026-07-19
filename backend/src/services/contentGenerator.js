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

module.exports = { generateContent, draftContent };
