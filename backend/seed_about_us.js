const { Page } = require('./src/models');

async function seedAboutUs() {
  try {
    const aboutSections = [
      // 1. High-Impact Scale & Metrics Banner
      {
        id: 'sec_about_stats',
        type: 'stats',
        title: 'Our Global Reach & Educational Impact',
        items: [
          { number: '73,000+', label: 'Active Learners', subtext: 'Across 45+ countries and tech hubs' },
          { number: '85+', label: 'Specialized Tech Modules', subtext: 'Curated by senior Silicon Valley & African engineers' },
          { number: '120+', label: 'Hiring Tech Partners', subtext: 'Direct corporate recruitment pipeline' },
          { number: '95.4%', label: 'Career Growth Rate', subtext: 'Graduates placed or promoted within 6 months' }
        ]
      },

      // 2. Mission & Story Split Section
      {
        id: 'sec_about_story',
        type: 'split',
        layout: 'media-right',
        badge: 'Our Mission & Story',
        title: 'Empowering the Next Generation of Global Tech Innovators',
        content: `
          <p style="margin-bottom: 1.25rem; font-size: 1.05rem; line-height: 1.8;">
            Founded with a bold vision to bridge the global technical skills gap, <strong>JONIKWIRIA Limited</strong> has evolved from an elite coding lab into a world-class technology academy and enterprise software powerhouse.
          </p>
          <p style="margin-bottom: 1.25rem; font-size: 1.05rem; line-height: 1.8;">
            We believe that modern technology education should be <em>practical, immersive, and directly tied to industry demands</em>. We teach real-world architectural design, full-stack software development, cloud infrastructure, and artificial intelligence through hands-on capstone projects rather than passive lectures.
          </p>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
            <div style="background: var(--bg-app); padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
              <strong style="color: var(--primary); display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">🚀 Production-Grade Labs</strong>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Write code on live cloud sandboxes and CI/CD pipelines from day one.</span>
            </div>
            <div style="background: var(--bg-app); padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
              <strong style="color: var(--success); display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">🎓 1-on-1 Mentorship</strong>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Direct code reviews and career coaching from senior industry architects.</span>
            </div>
            <div style="background: var(--bg-app); padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
              <strong style="color: #6366f1; display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">🛡️ Verifiable Credentials</strong>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Tamper-proof digital certificates with unique cryptographic verification.</span>
            </div>
            <div style="background: var(--bg-app); padding: 1rem; border-radius: 10px; border: 1px solid var(--border);">
              <strong style="color: #f59e0b; display: block; margin-bottom: 0.25rem; font-size: 0.95rem;">💼 Placement Network</strong>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Exclusive career fairs, resume workshops, and direct hiring partner referrals.</span>
            </div>
          </div>
        `,
        image: '/media/general/slider_innovation.jpg',
        btnText: 'Explore Tech Tracks',
        btnUrl: '/courses'
      },

      // 3. Core Values Grid Section
      {
        id: 'sec_about_values',
        type: 'values_grid',
        badgeLabel: 'Culture & Principles',
        title: 'Our Core Operating Values',
        subtitle: 'The principles that guide how we educate, build software, and support our community.',
        cards: [
          {
            title: 'Learners First',
            desc: 'Every syllabus iteration and platform upgrade begins with our students’ employability and long-term career growth.',
            icon: 'heart',
            color: 0
          },
          {
            title: 'Continuous Curiosity & Innovation',
            desc: 'We constantly stay ahead of emerging tech curves—integrating Generative AI, cloud-native DevOps, and scalable architectures.',
            icon: 'cpu',
            color: 1
          },
          {
            title: 'Radical Inclusivity',
            desc: 'Democratizing world-class technology education for kids, university students, career changers, and corporate teams.',
            icon: 'users',
            color: 2
          },
          {
            title: 'Hands-On Pragmatism',
            desc: 'Zero fluff or pure theory. Every concept is tested, benchmarked, deployed, and proven in live production code.',
            icon: 'code',
            color: 3
          },
          {
            title: 'Measurable Outcomes',
            desc: 'We track student completion, portfolio quality, certification pass rates, and real-world employment placement.',
            icon: 'trending-up',
            color: 4
          },
          {
            title: 'Uncompromising Quality',
            desc: 'High pedagogical rigor, expert faculty selection, and enterprise-grade software standards across all deliverables.',
            icon: 'shield',
            color: 5
          }
        ]
      },

      // 4. Learning Ecosystem Cards
      {
        id: 'sec_about_ecosystem',
        type: 'cards',
        title: 'Our Comprehensive Tech Ecosystem',
        items: [
          {
            title: 'Software Engineering & Cloud Architecture',
            badge: 'Flagship Track',
            image: '/media/general/Developers_collaborating_on_codi____202608302332-1788129157807-805795075.jpeg',
            text: 'Master modern frontend & backend engineering with React, Node.js, Python, PostgreSQL, Docker, and AWS cloud deployment.',
            link: '/courses'
          },
          {
            title: 'Artificial Intelligence & Machine Learning',
            badge: 'Cutting-Edge',
            image: '/media/general/Researchers_interacting_with_hol____202608302337-1788129458601-720140529.jpeg',
            text: 'Deep dive into PyTorch, TensorFlow, LLM fine-tuning, computer vision, natural language processing, and MLOps deployment.',
            link: '/courses'
          },
          {
            title: 'Data Science & Enterprise Analytics',
            badge: 'High-Demand',
            image: '/media/general/Data_scientists_collaborating_in____202608302335-1788129336541-924583892.jpeg',
            text: 'Harness Python, SQL, BigQuery, data cleaning, statistical modeling, and interactive executive BI dashboard engineering.',
            link: '/courses'
          },
          {
            title: 'Young Innovators & Kids Tech Academy',
            badge: 'Ages 8-16',
            image: '/media/general/African_children_learning_progra____202606110337-1788030651626-148280090.jpeg',
            text: 'Inspiring foundational logic, Scratch visual programming, web design basics, and creative robotics for the leaders of tomorrow.',
            link: '/courses'
          },
          {
            title: 'Corporate Upskilling & Digital Bootcamps',
            badge: 'Enterprise',
            image: '/media/general/Professionals_attending_software____202608302339-1788129584537-800628375.jpeg',
            text: 'Custom accelerated engineering bootcamps designed to modernize corporate tech teams, banks, and government agencies.',
            link: '/contact'
          },
          {
            title: 'Custom Software & AI Solutions',
            badge: 'Engineering Hub',
            image: '/media/general/Software_engineers_collaborating____202608302345-1788129927316-773331725.jpeg',
            text: 'End-to-end bespoke software engineering, enterprise portal development, and automated workflow solutions for business.',
            link: '/contact'
          }
        ]
      },

      // 5. Frequently Asked Questions Accordion
      {
        id: 'sec_about_faq',
        type: 'accordion',
        title: 'Frequently Asked Questions About JONIKWIRIA',
        items: [
          {
            header: 'How do JONIKWIRIA programs differ from traditional university CS degrees?',
            content: 'Unlike multi-year theoretical programs, JONIKWIRIA focuses 100% on hands-on practical engineering, modern toolchains (Git, Docker, Cloud, AI), code reviews, and building a portfolio of live deployed applications that employers actively look for.'
          },
          {
            header: 'Are the certificates verified and recognized by tech employers?',
            content: 'Yes! Every certificate contains a unique cryptographic verification hash and scannable QR code that links directly to our verified registry, recognized by our partner network of over 120+ top-tier tech companies.'
          },
          {
            header: 'Do you offer flexible learning formats for working professionals?',
            content: 'We offer self-paced online curriculum, live evening and weekend masterclasses, and interactive hybrid physical labs at our innovation centers to accommodate busy working schedules.'
          },
          {
            header: 'Can our company book custom corporate engineering training?',
            content: 'Yes. We partner with enterprise organizations, financial institutions, and government ministries to deliver customized on-site and remote training programs tailored to your specific tech stack.'
          }
        ]
      },

      // 6. Action-Driven CTA Section
      {
        id: 'sec_about_cta',
        type: 'cta',
        title: 'Ready to Accelerate Your Technology Journey?',
        subtitle: 'Join over 73,000+ ambitious learners, developers, and corporate innovators building the future of software and AI.',
        btnText: 'Browse All Courses & Apply',
        btnUrl: '/courses',
        gradient: 'linear-gradient(135deg, #0b132b 0%, #0037b3 50%, #1e1b4b 100%)'
      }
    ];

    const [page, created] = await Page.findOrCreate({
      where: { slug: 'about-us' },
      defaults: {
        title: 'About Us',
        slug: 'about-us',
        pageType: 'standard',
        template: 'default',
        bannerImageUrl: '/media/general/JONIKWIRIA_corporate_banner_Pres____202606100640-1788030631215-799263200.jpeg',
        bannerTitle: 'About JONIKWIRIA Limited',
        bannerSubtitle: 'Pioneering practical technology education, enterprise software engineering, and AI-driven innovations worldwide.',
        metaTitle: 'About Us — JONIKWIRIA Technology Academy & Solutions',
        metaDescription: 'Learn about JONIKWIRIA — our mission, world-class faculty, hands-on curriculum, and how we empower learners worldwide in software engineering and AI.',
        status: 'published',
        publishedAt: new Date(),
        showInMenu: true,
        menuTitle: 'About Us',
        sections: aboutSections
      }
    });

    if (!created) {
      await page.update({
        title: 'About Us',
        bannerImageUrl: '/media/general/JONIKWIRIA_corporate_banner_Pres____202606100640-1788030631215-799263200.jpeg',
        bannerTitle: 'About JONIKWIRIA Limited',
        bannerSubtitle: 'Pioneering practical technology education, enterprise software engineering, and AI-driven innovations worldwide.',
        metaTitle: 'About Us — JONIKWIRIA Technology Academy & Solutions',
        metaDescription: 'Learn about JONIKWIRIA — our mission, world-class faculty, hands-on curriculum, and how we empower learners worldwide in software engineering and AI.',
        sections: aboutSections,
        status: 'published'
      });
      console.log('Updated existing About Us page with rich Udemy-style dynamic sections.');
    } else {
      console.log('Created About Us page with rich Udemy-style dynamic sections.');
    }
  } catch (error) {
    console.error('Error seeding About Us page:', error);
  } finally {
    process.exit(0);
  }
}

seedAboutUs();
