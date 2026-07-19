// Automates custom-domain setup for Premium tier advisors via Vercel's Domains API.
// Docs: https://vercel.com/docs/rest-api/endpoints/domains

async function addCustomDomain(domain) {
  const response = await fetch(
    `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: domain })
    }
  );
  return response.json();
}

module.exports = { addCustomDomain };
