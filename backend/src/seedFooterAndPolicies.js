const { Page, Footer, sequelize } = require('./models');

async function seedFooterAndPolicies() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Seed Dynamic Policy Pages
    const policies = [
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        pageType: 'standard',
        template: 'default',
        status: 'published',
        publishedAt: new Date(),
        showInMenu: false,
        metaTitle: 'Privacy Policy | JONIKWIRIA Technology Limited',
        metaDescription: 'Learn how JONIKWIRIA Technology Limited collects, protects, and handles your personal data in compliance with NDPR and GDPR regulations.',
        content: `
          <h2>1. Introduction & Overview</h2>
          <p>Welcome to JONIKWIRIA Technology Limited ("JONIKWIRIA", "we", "our", or "us"). We are committed to safeguarding your privacy and ensuring your personal information is handled in a safe and responsible manner.</p>
          <p>This Privacy Policy outlines how we collect, store, process, and protect your information when you access our learning platforms, enroll in our tech programmes, or use our digital services.</p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Personal Identification:</strong> Full name, email address, telephone number, residential address, and profile photo.</li>
            <li><strong>Academic & Career Records:</strong> Course enrollments, assessment scores, project repositories, verified certificates, and attendance logs.</li>
            <li><strong>Financial & Payment Data:</strong> Transaction reference numbers, invoice details, and billing addresses (all credit/debit card processing is handled securely via PCI-DSS certified payment processors).</li>
            <li><strong>Technical & Usage Data:</strong> IP address, browser type, device information, operating system, and interaction analytics.</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We utilize the collected data to provide personalized education, issue verified certificates, process admissions, deliver technical support, and notify students regarding upcoming workshops, hackathons, and cohort schedules.</p>

          <h2>4. Data Protection & Security</h2>
          <p>We employ 256-bit SSL/TLS encryption, strict role-based access control (RBAC), and regular vulnerability audits to ensure your data is secure against unauthorized access or breaches.</p>

          <h2>5. Your Rights</h2>
          <p>Under applicable data protection laws, you have the right to request access to your personal data, rectify inaccuracies, request deletion, or restrict data processing by emailing <a href="mailto:privacy@jonikwiria.com">privacy@jonikwiria.com</a>.</p>
        `
      },
      {
        title: 'Terms of Service',
        slug: 'terms-of-service',
        pageType: 'standard',
        template: 'default',
        status: 'published',
        publishedAt: new Date(),
        showInMenu: false,
        metaTitle: 'Terms of Service & Academic Regulations | JONIKWIRIA',
        metaDescription: 'Review the terms and conditions governing student enrollment, certification integrity, and software development services at JONIKWIRIA.',
        content: `
          <h2>1. Acceptance of Terms</h2>
          <p>By registering on the JONIKWIRIA platform or enrolling in any of our technical programs, you agree to comply with and be bound by these Terms of Service and Academic Regulations.</p>

          <h2>2. Admissions & Student Conduct</h2>
          <p>Learners must provide accurate details during registration and adhere to our Student Code of Conduct. Harassment, unauthorized code sharing, plagiarism during capstone projects, or academic dishonesty will lead to immediate disciplinary actions or termination without refund.</p>

          <h2>3. Intellectual Property Rights</h2>
          <p>All curriculum materials, video lectures, proprietary exercises, and platform software remain the exclusive intellectual property of JONIKWIRIA Technology Limited. Code and projects created independently by students remain their respective property.</p>

          <h2>4. Verified Certification</h2>
          <p>Certificates of Completion are granted only upon meeting minimum attendance criteria (80%+), fulfilling all lab requirements, and passing the capstone defense.</p>

          <h2>5. Termination & Modifications</h2>
          <p>JONIKWIRIA reserves the right to modify course schedules, instructors, or update syllabus content to align with emerging industry technologies and software standards.</p>
        `
      },
      {
        title: 'Cookie & Tracking Policy',
        slug: 'cookie-policy',
        pageType: 'standard',
        template: 'default',
        status: 'published',
        publishedAt: new Date(),
        showInMenu: false,
        metaTitle: 'Cookie Policy | JONIKWIRIA Technology Limited',
        metaDescription: 'Detailed explanation of how cookies and tracking technologies are used across our website and portal.',
        content: `
          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make web applications work efficiently, retain user preferences, and provide analytical insights.</p>

          <h2>2. Categories of Cookies We Use</h2>
          <ul>
            <li><strong>Strictly Necessary / Essential Cookies:</strong> Essential for user authentication, security, session continuity, and portal navigation.</li>
            <li><strong>Preference & Functional Cookies:</strong> Remember your theme mode (light/dark), language choice, and portal layout preferences.</li>
            <li><strong>Performance & Analytics Cookies:</strong> Help us measure website traffic, user interactions, and optimize page load speeds.</li>
            <li><strong>Marketing & Advertising Cookies:</strong> Deliver relevant tech program alerts and webinar announcements without spam.</li>
          </ul>

          <h2>3. Managing Your Cookie Preferences</h2>
          <p>You can adjust your cookie settings at any time via the cookie settings banner on our website or through your browser configuration.</p>
        `
      },
      {
        title: 'Refund & Cancellation Policy',
        slug: 'refund-policy',
        pageType: 'standard',
        template: 'default',
        status: 'published',
        publishedAt: new Date(),
        showInMenu: false,
        metaTitle: 'Refund & Course Cancellation Policy | JONIKWIRIA',
        metaDescription: 'Transparent guidelines on student course cancellation, cohort deferrals, and money-back guarantees.',
        content: `
          <h2>1. 14-Day Money-Back Guarantee</h2>
          <p>We are confident in the premium quality of our curriculum. If you are not satisfied with your course during the first 14 days or before completing 25% of the coursework, you may request a 100% refund, no questions asked.</p>

          <h2>2. Cohort Deferrals</h2>
          <p>Students who encounter unavoidable scheduling conflicts may defer their enrollment to the subsequent cohort up to 2 times without additional fees by submitting a written notice to the admissions office.</p>

          <h2>3. Corporate & Enterprise Training</h2>
          <p>Custom software development contracts and corporate bootcamps are governed by their respective Service Level Agreements (SLA) and milestone milestones.</p>
        `
      }
    ];

    for (const p of policies) {
      const existing = await Page.findOne({ where: { slug: p.slug } });
      if (existing) {
        await existing.update(p);
        console.log(`Updated policy page: ${p.title}`);
      } else {
        await Page.create(p);
        console.log(`Created policy page: ${p.title}`);
      }
    }

    // 2. Seed Active Footer Layout
    const activeFooterData = {
      name: 'Default JONIKWIRIA Enterprise Footer',
      copyrightText: 'JONIKWIRIA Technology Limited. All rights reserved.',
      status: 'active',
      columns: [
        {
          header: 'About JONIKWIRIA',
          type: 'html',
          content: '<p>Pioneering technology education, artificial intelligence research, and custom enterprise software development. Building confident digital creators and innovative technology solutions.</p>'
        },
        {
          header: 'Academic Faculties',
          type: 'links',
          links: [
            { label: 'Software Engineering', url: '/courses' },
            { label: 'Artificial Intelligence & Data', url: '/courses' },
            { label: 'Cybersecurity & Cloud Defense', url: '/courses' },
            { label: 'Youth Robotics & Gaming', url: '/courses' },
            { label: 'Corporate IT Upskilling', url: '/p/about-us' }
          ]
        },
        {
          header: 'Featured Courses',
          type: 'links',
          links: [
            { label: 'Full-Stack Web Bootcamp', url: '/courses' },
            { label: 'Generative AI & PyTorch', url: '/courses' },
            { label: 'Cloud Architecture & DevOps', url: '/courses' },
            { label: 'Python Robotics for Kids', url: '/courses' },
            { label: 'Data Analytics & PowerBI', url: '/courses' }
          ]
        },
        {
          header: 'Customer Care & Portals',
          type: 'links',
          links: [
            { label: 'Help & Contact Center', url: '/contact' },
            { label: 'Latest News & Media', url: '/news' },
            { label: 'Summits & Workshops', url: '/events' },
            { label: 'Student & Staff Portal', url: '/login' },
            { label: 'Apply for Admission', url: '/register' }
          ]
        }
      ],
      extraSettings: {
        bgStyle: 'dark',
        phone: '+234 800 566 4594',
        email: 'info@jonikwiria.com',
        address: '14 Technology Innovation Boulevard, Digital Hub, Lagos, Nigeria',
        newsletterTitle: 'Subscribe to the JONIKWIRIA Digest',
        newsletterDesc: 'Get weekly technology insights, cohort updates, scholarship notifications, and invitations directly to your inbox.',
        socials: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://instagram.com',
          linkedin: 'https://linkedin.com'
        },
        policies: [
          { label: 'Privacy Policy', url: '/p/privacy-policy' },
          { label: 'Terms of Service', url: '/p/terms-of-service' },
          { label: 'Cookie Policy', url: '/p/cookie-policy' },
          { label: 'Refund Policy', url: '/p/refund-policy' }
        ]
      }
    };

    const existingFooter = await Footer.findOne({ where: { status: 'active' } });
    if (existingFooter) {
      await existingFooter.update(activeFooterData);
      console.log('Updated existing active footer layout.');
    } else {
      await Footer.create(activeFooterData);
      console.log('Created new active footer layout.');
    }

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedFooterAndPolicies();
