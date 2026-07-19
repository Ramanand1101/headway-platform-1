// One-off script: seeds N fictional (but realistic) advisor profiles for
// demo/scale-testing. Deliberately omits contactNumber/whatsappNumber —
// these are placeholder profiles, not real people, so no fake "reachable"
// contact info is generated for them.
//
// Usage: node scripts/seed-advisors.js [count]
require('dotenv').config();
const mongoose = require('mongoose');
const Advisor = require('../src/models/Advisor');

const COUNT = Number(process.argv[2]) || 500;

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Rohan', 'Kabir', 'Aryan', 'Dhruv', 'Kartik', 'Rudra', 'Yash', 'Rajesh', 'Suresh', 'Ramesh',
  'Vikram', 'Amit', 'Sanjay', 'Rakesh', 'Manoj', 'Ashok', 'Vinod', 'Prakash', 'Dinesh', 'Naresh',
  'Mahesh', 'Ravi', 'Sunil', 'Anil', 'Rahul', 'Vijay', 'Sandeep', 'Deepak', 'Nitin', 'Gaurav',
  'Manish', 'Rohit', 'Karan', 'Varun', 'Siddharth', 'Abhishek', 'Vishal', 'Harsh', 'Nikhil', 'Tarun',
  'Pankaj', 'Arun', 'Ajay', 'Vivek', 'Neeraj', 'Ankit', 'Saurabh', 'Rajat', 'Aarohi', 'Ananya',
  'Diya', 'Ishita', 'Kavya', 'Myra', 'Navya', 'Pari', 'Riya', 'Saanvi', 'Siya', 'Tara',
  'Zara', 'Priya', 'Neha', 'Pooja', 'Anjali', 'Sneha', 'Divya', 'Meera', 'Kritika', 'Sanjana',
  'Nisha', 'Deepika', 'Rekha', 'Sunita', 'Anita', 'Swati', 'Preeti', 'Ritu', 'Shruti', 'Vidya',
  'Lakshmi', 'Radhika', 'Bhavna', 'Charu', 'Esha', 'Falguni', 'Geeta', 'Hema', 'Indira', 'Jyoti'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Mehta', 'Shah', 'Joshi', 'Rao',
  'Reddy', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Chatterjee', 'Banerjee', 'Mukherjee', 'Das', 'Sen',
  'Bose', 'Chopra', 'Malhotra', 'Kapoor', 'Khanna', 'Anand', 'Bhatt', 'Trivedi', 'Pandey', 'Mishra',
  'Tiwari', 'Dubey', 'Yadav', 'Chauhan', 'Rathore', 'Bhatia', 'Arora', 'Sethi', 'Khurana', 'Saxena',
  'Agarwal', 'Aggarwal', 'Goyal', 'Jain', 'Bansal', 'Goel', 'Mittal', 'Gill', 'Sandhu', 'Bedi'
];

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Amritsar',
  'Prayagraj', 'Ranchi', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai',
  'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Surat', 'Noida', 'Gurgaon', 'Dehradun'
];

const specializationPool = [
  'Mutual Funds', 'Insurance', 'Tax Planning', 'Retirement Planning', 'Estate Planning',
  'Wealth Management', 'Equity Investments', 'Fixed Income', 'NRI Investments',
  'Child Education Planning', 'Home Loan Advisory', 'Portfolio Management'
];

const servicePool = [
  'Financial Planning', 'Tax Saving', 'Retirement Planning', 'Insurance Advisory',
  'Mutual Fund SIP', 'Portfolio Review', 'Estate Planning', 'Child Education Planning',
  'NRI Advisory', 'Wealth Management', 'Risk Assessment', 'Debt Management'
];

const planTiers = ['basic', 'basic', 'basic', 'standard', 'standard', 'premium'];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildBio(name, city, specializations) {
  const templates = [
    `${name} is a trusted financial advisor based in ${city}, specializing in ${specializations.join(' and ')}. With a client-first approach, ${name.split(' ')[0]} helps individuals and families make confident, informed decisions about their financial future.`,
    `Based in ${city}, ${name} brings years of hands-on experience in ${specializations.join(' and ')}. ${name.split(' ')[0]} believes in simple, jargon-free advice tailored to each client's goals.`,
    `${name} helps clients across ${city} navigate ${specializations.join(' and ')} with practical, easy-to-understand guidance. The focus is always on long-term financial wellbeing over quick wins.`,
    `As a ${city}-based advisor focused on ${specializations.join(' and ')}, ${name} works closely with clients to build financial plans that actually fit their life.`
  ];
  return pick(templates);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await Advisor.find({}).select('slug');
  const usedSlugs = new Set(existing.map((a) => a.slug));
  const usedNames = new Set();

  const docs = [];
  let attempts = 0;

  while (docs.length < COUNT && attempts < COUNT * 20) {
    attempts += 1;
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;

    if (usedNames.has(name)) continue;

    let slug = slugify(name);
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(name)}-${suffix}`;
      suffix += 1;
    }

    usedNames.add(name);
    usedSlugs.add(slug);

    const city = pick(cities);
    const specialization = pickMany(specializationPool, 2 + Math.round(Math.random()));
    const services = pickMany(servicePool, 3 + Math.round(Math.random()));

    docs.push({
      slug,
      name,
      city,
      specialization,
      bio: buildBio(name, city, specialization),
      services,
      planTier: pick(planTiers),
      isActive: true
    });
  }

  const result = await Advisor.insertMany(docs, { ordered: false });
  console.log(`Inserted ${result.length} advisor profiles.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
