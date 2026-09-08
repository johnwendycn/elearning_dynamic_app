
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const sequelize = require('./config/database');
const Event = require('./models/event');

const now = new Date();
const addDays = (d) => { const r = new Date(now); r.setDate(r.getDate() + d); return r; };

const events = [
  {
    title: 'Annual Tech Innovation Summit 2026',
    slug: 'annual-tech-innovation-summit-2026',
    description: `Join us for JONIKWIRIA's flagship annual technology summit, bringing together industry leaders, educators, innovators, and students from across Nigeria and beyond.\n\nThis year's theme is "Bridging the Digital Divide Through Education and AI" — featuring:\n\n• Keynote addresses from leading technology executives and policymakers\n• Panel discussions on AI in education, cybersecurity, and digital skills development\n• Live coding challenges and hackathon showcases\n• Networking sessions with top employers and tech recruiters\n• Exhibition stands from 30+ technology companies\n\nRegister early to secure your free seat. Limited capacity available.`,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80',
    location: 'JONIKWIRIA Innovation Hub, Lagos, Nigeria',
    startDate: addDays(14),
    endDate: addDays(15),
    registrationUrl: 'https://jonikwiria.org/register/summit-2026',
    category: 'Conference',
    status: 'upcoming'
  },
  {
    title: 'Web Development Bootcamp — React & Node.js',
    slug: 'web-development-bootcamp-react-nodejs',
    description: `A hands-on, intensive 3-day bootcamp designed for aspiring and junior web developers who want to level up their skills in modern full-stack web development.\n\nWhat you will build:\n• A fully functional REST API with Node.js, Express and MySQL\n• A responsive React single-page application connected to the API\n• A deployed production application on a cloud server\n\nWho should attend:\n• Computer science students and recent graduates\n• Self-taught developers looking to solidify fundamentals\n• Professionals transitioning into tech\n\nPrerequisites: Basic HTML, CSS and JavaScript knowledge. All materials, meals, and certificates are included.`,
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80',
    location: 'JONIKWIRIA Computer Lab B, Abuja Campus',
    startDate: addDays(7),
    endDate: addDays(9),
    registrationUrl: 'https://jonikwiria.org/register/bootcamp-web',
    category: 'Workshop',
    status: 'upcoming'
  },
  {
    title: 'Cybersecurity Awareness Week 2026',
    slug: 'cybersecurity-awareness-week-2026',
    description: `A week-long program of free seminars, demonstrations, and workshops dedicated to building cybersecurity awareness among students, staff, and community members.\n\nSchedule highlights:\n• Day 1: Introduction to Ethical Hacking — live demo\n• Day 2: Protecting Personal Data Online — best practices\n• Day 3: Social Engineering and Phishing Simulations\n• Day 4: Career Paths in Cybersecurity — panel with industry experts\n• Day 5: CTF (Capture The Flag) Competition — prizes worth N500,000!\n\nAll sessions are free and open to the public.`,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80',
    location: 'JONIKWIRIA Auditorium & Online (Hybrid)',
    startDate: addDays(21),
    endDate: addDays(25),
    registrationUrl: null,
    category: 'Seminar',
    status: 'upcoming'
  },
  {
    title: 'AI & Machine Learning for Beginners',
    slug: 'ai-machine-learning-for-beginners',
    description: `Demystify Artificial Intelligence and Machine Learning in this accessible, beginner-friendly one-day workshop. No coding experience required!\n\nTopics covered:\n• What is AI and how does it actually work?\n• How machine learning models are trained\n• Real-world AI applications in healthcare, agriculture, and education\n• Using AI tools effectively and responsibly\n• Hands-on exercise: Building a simple classifier using no-code tools\n\nPerfect for secondary school students, teachers, business owners, and curious professionals. Certificate of participation awarded to all attendees.`,
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&auto=format&fit=crop&q=80',
    location: 'JONIKWIRIA Learning Centre, Port Harcourt',
    startDate: addDays(3),
    endDate: addDays(3),
    registrationUrl: 'https://jonikwiria.org/register/ai-beginners',
    category: 'Workshop',
    status: 'upcoming'
  },
  {
    title: 'Digital Skills for Rural Youth — Outreach Program',
    slug: 'digital-skills-rural-youth-outreach',
    description: `JONIKWIRIA's community outreach initiative brings free digital literacy training directly to underserved rural communities across Ogun State.\n\nThe program covers:\n• Basic computer operations and internet safety\n• Microsoft Office Suite fundamentals\n• Introduction to digital entrepreneurship and online earning\n• Using mobile apps for farming, healthcare access, and education\n\nAll participants receive a free data SIM card and access to our e-learning platform for 6 months.`,
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80',
    location: 'Multiple Venues — Ogun State',
    startDate: addDays(-7),
    endDate: addDays(-5),
    registrationUrl: null,
    category: 'Outreach',
    status: 'completed'
  },
  {
    title: 'JONIKWIRIA Graduation Ceremony 2025/2026',
    slug: 'jonikwiria-graduation-ceremony-2025-2026',
    description: `We are proud to celebrate the achievements of our graduating cohort of 2025/2026 — over 850 students who have completed our professional certification programs in Software Development, Data Analysis, Cybersecurity, Digital Marketing, and Graphic Design.\n\nThe ceremony will feature:\n• Welcome address by the Executive Director\n• Keynote speech by a distinguished industry leader\n• Certificate and award presentations\n• Valedictorian address\n• Cultural performances and reception\n\nFamily, friends, employers, and well-wishers are warmly invited. Formal attire is required. Gates open at 9:00 AM. Ceremony begins at 10:30 AM sharp.`,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80',
    location: 'JONIKWIRIA Grand Hall, Victoria Island, Lagos',
    startDate: addDays(35),
    endDate: addDays(35),
    registrationUrl: 'https://jonikwiria.org/register/graduation-2026',
    category: 'Ceremony',
    status: 'upcoming'
  }
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await Event.sync();
    
    for (const ev of events) {
      const [instance, created] = await Event.findOrCreate({
        where: { slug: ev.slug },
        defaults: ev
      });
      console.log(`${created ? 'CREATED' : 'SKIPPED (exists)'}: ${ev.title}`);
    }
    
    console.log('\nEvents seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
})();
