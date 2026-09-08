/**
 * seed_jonikwiria_homepage.js
 *
 * Seeds:
 *  1. A "Home Hero" Carousel + 3 slides
 *  2. The homepage Page record with all About Us sections
 *
 * Run: node seed_jonikwiria_homepage.js
 */

require('dotenv').config();
const { Carousel, CarouselSlide, Page, sequelize } = require('./src/models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected.');

    /* ─────────────────────────────────────────────────────────────────────────
       1. CAROUSEL – "Home Hero"
    ───────────────────────────────────────────────────────────────────────── */

    // Remove old homepage carousel if it exists (idempotent)
    const existing = await Carousel.findOne({ where: { name: 'Home Hero' } });
    if (existing) {
      await CarouselSlide.destroy({ where: { carouselId: existing.id } });
      await existing.destroy();
      console.log('🗑️  Removed old "Home Hero" carousel.');
    }

    const carousel = await Carousel.create({
      name: 'Home Hero',
      autoplay: true,
      autoplay_speed: 5000,
      show_arrows: true,
      show_indicators: true,
      status: 'active',
    });

    console.log(`✅ Carousel created (id=${carousel.id}).`);

    await CarouselSlide.bulkCreate([
      {
        carouselId: carousel.id,
        title: 'Technology Starts Here',
        subtitle: 'Learn. Build. Innovate.',
        description:
          'Practical technology training and solutions for kids, students, professionals and organizations.',
        button_text: 'Discover More',
        button_url: '/p/about-us',
        display_order: 1,
        status: 'active',
      },
      {
        carouselId: carousel.id,
        title: 'Training for Everyone',
        subtitle: 'From Kids to Corporates',
        description:
          'We offer technology education that grows with you — from beginner coding for children to advanced AI for businesses.',
        button_text: 'Explore Training',
        button_url: '/p/about-us',
        display_order: 2,
        status: 'active',
      },
      {
        carouselId: carousel.id,
        title: 'Custom Software & AI',
        subtitle: 'Build Solutions That Matter',
        description:
          'We design and develop custom software, AI and data-driven solutions that help organizations solve real-world problems.',
        button_text: 'Build With Us',
        button_url: '/p/about-us',
        display_order: 3,
        status: 'active',
      },
    ]);

    console.log(`✅ 3 carousel slides inserted.`);

    /* ─────────────────────────────────────────────────────────────────────────
       2. HOMEPAGE PAGE RECORD
    ───────────────────────────────────────────────────────────────────────── */

    // Reset any existing homepage flag
    await Page.update({ isHomepage: false }, { where: { isHomepage: true } });

    // Delete existing "home" slug page if present
    await Page.destroy({ where: { slug: 'home' } });

    const sections = [
      /* ── Section 1: Carousel ───────────────────────────────────────────── */
      {
        id: 'sec_carousel_hero',
        type: 'carousel',
        carouselId: carousel.id,
      },

      /* ── Section 2: About Intro ────────────────────────────────────────── */
      {
        id: 'sec_about_intro',
        type: 'about_intro',
        headline: 'About JONIKWIRIA',
        tagline: 'Building People. Building Technology.',
        para1:
          'JONIKWIRIA is a technology training and development company focused on equipping individuals and organizations with practical digital skills while building innovative technology solutions.',
        para2:
          'We provide training in software development, data science, artificial intelligence, machine learning and other emerging technologies, serving children, students, professionals, businesses and institutions.',
        para3:
          'We also design and develop custom software, AI and data-driven solutions that help organizations solve real-world problems and embrace digital transformation.',
        btnText: 'Learn More',
        btnUrl: '/p/about-us',
        features: [
          {
            title: 'Hands-On Practical Training',
            desc: 'Real-world, project-driven curriculum designed for kids, students, and professionals.',
            icon: 'code',
            color: 0,
          },
          {
            title: 'Cutting-Edge AI & Software',
            desc: 'Custom software and artificial intelligence solutions tailored to business needs.',
            icon: 'cpu',
            color: 2,
          },
          {
            title: 'Digital Transformation',
            desc: 'Empowering learners and organizations to build confidence in the digital economy.',
            icon: 'rocket',
            color: 3,
          },
        ],
      },

      /* ── Section 3: Vision, Mission & Goal ────────────────────────────── */
      {
        id: 'sec_vmg',
        type: 'vmg',
        badgeLabel: 'Strategic Direction',
        title: 'Our Vision, Mission & Goal',
        subtitle:
          'Guided by a strong commitment to empowerment, digital excellence, and measurable impact.',
        items: [
          {
            icon: 'eye',
            label: 'Our Vision',
            text: 'To become a leading technology education and innovation company, empowering people and organizations to create solutions for a digital future.',
            grad: 'linear-gradient(135deg,#007bff,#00c6ff)',
            topBar: 'linear-gradient(90deg,#007bff,#00c6ff)',
            glow: 'rgba(0,123,255,0.2)',
          },
          {
            icon: 'target',
            label: 'Our Mission',
            text: 'To provide accessible, practical and industry-relevant technology education while developing innovative software, AI and data solutions that create meaningful impact.',
            grad: 'linear-gradient(135deg,#10b981,#34d399)',
            topBar: 'linear-gradient(90deg,#10b981,#34d399)',
            glow: 'rgba(16,185,129,0.2)',
          },
          {
            icon: 'compass',
            label: 'Our Goal',
            text: 'To bridge the technology skills gap by transforming learners into confident technology creators and helping organizations build the capabilities they need to thrive in the digital economy.',
            grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
            topBar: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
            glow: 'rgba(124,58,237,0.2)',
          },
        ],
      },

      /* ── Section 4: Core Values ────────────────────────────────────────── */
      {
        id: 'sec_values',
        type: 'values_grid',
        title: 'Our Core Values',
        subtitle:
          'The foundational principles that shape our curriculum, engineering standards, and company culture.',
        values: [
          {
            icon: 'lightbulb',
            title: 'Innovation',
            desc: 'We encourage creativity, experimentation and new ways of solving problems.',
          },
          {
            icon: 'award',
            title: 'Excellence',
            desc: 'We strive for high standards in everything we teach and build.',
          },
          {
            icon: 'wrench',
            title: 'Practicality',
            desc: 'We focus on skills and solutions that can be applied to real-world problems.',
          },
          {
            icon: 'shield',
            title: 'Integrity',
            desc: 'We operate with honesty, transparency and professionalism.',
          },
          {
            icon: 'book',
            title: 'Continuous Learning',
            desc: 'We believe technology is constantly evolving, and learning must evolve with it.',
          },
          {
            icon: 'rocket',
            title: 'Impact',
            desc: 'We measure our success by the value we create for learners, clients and society.',
          },
        ],
      },

      /* ── Section 5: What We Do / Services ─────────────────────────────── */
      {
        id: 'sec_services',
        type: 'services_grid',
        badgeLabel: 'Services & Solutions',
        title: 'What We Do',
        subtitle:
          'Practical digital skills training and custom software engineering built for growth.',
        items: [
          {
            icon: 'code',
            label: 'Technology Training',
            text: 'Practical training for kids, students, professionals and organizations.',
            link: '/p/about-us',
            linkText: 'Explore Courses',
            colorIndex: 0,
          },
          {
            icon: 'cpu',
            label: 'Software Development',
            text: 'Design and development of customized digital solutions.',
            link: '/p/about-us',
            linkText: 'Custom Engineering',
            colorIndex: 1,
          },
          {
            icon: 'sparkles',
            label: 'Artificial Intelligence',
            text: 'AI and machine-learning training and solution development.',
            link: '/p/about-us',
            linkText: 'AI Solutions',
            colorIndex: 2,
          },
          {
            icon: 'chart',
            label: 'Data Science',
            text: 'Data analysis, visualization, machine learning and data-driven solutions.',
            link: '/p/about-us',
            linkText: 'Data Analytics',
            colorIndex: 3,
          },
          {
            icon: 'building',
            label: 'IT Capacity Building',
            text: 'Customized technology training for organizations and institutions.',
            link: '/p/about-us',
            linkText: 'Corporate Upskilling',
            colorIndex: 4,
          },
          {
            icon: 'lightbulb',
            label: 'Digital Innovation',
            text: 'Helping individuals and organizations turn ideas into technology-driven solutions.',
            link: '/p/about-us',
            linkText: 'Innovate With Us',
            colorIndex: 5,
          },
        ],
      },

      /* ── Section 6: Our Promise ────────────────────────────────────────── */
      {
        id: 'sec_promise',
        type: 'promise_banner',
        badgeLabel: 'Our Promise',
        headline: 'Learn. Build. Innovate.',
        lines: [
          "At **JONIKWIRIA**, we don't just teach people how technology works.",
          'We teach them how to use technology to create.',
          "And we don't just build software.",
          'We build solutions that solve real problems.',
        ],
        highlightLines: [1, 3],
        ctaPrimaryText: 'Join JONIKWIRIA',
        ctaPrimaryUrl: '/p/about-us',
        ctaSecondaryText: 'Student Portal',
        ctaSecondaryUrl: '/login',
      },
    ];

    const page = await Page.create({
      title: 'Home',
      slug: 'home',
      pageType: 'homepage',
      template: 'home',
      metaTitle: 'JONIKWIRIA | Technology Training & Software Development',
      metaDescription:
        'JONIKWIRIA is a technology training and development company. We offer practical training in software development, data science, AI and emerging technologies.',
      metaKeywords:
        'technology training, software development, AI, data science, machine learning, coding for kids, digital skills, JONIKWIRIA',
      status: 'published',
      publishedAt: new Date(),
      isHomepage: true,
      showInMenu: false,
      menuOrder: 0,
      sections,
    });

    console.log(`✅ Homepage page created (id=${page.id}, slug="${page.slug}").`);
    console.log('🎉 Seed complete! Visit http://localhost:5173 to see the result.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
