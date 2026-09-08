const { sequelize, Department, Course, CourseModule, Unit, UnitFile, News, Event } = require('./models');

async function seedData() {
  try {
    console.log('Seeding academic and content data for Jonikwiria...');

    // 1. Departments
    const deptsData = [
      {
        name: 'Software Engineering & Web Technologies',
        slug: 'software-engineering',
        description: 'Master full-stack development, modern JavaScript frameworks, backend architecture, cloud deployment, and system design.',
        imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Artificial Intelligence & Data Science',
        slug: 'ai-data-science',
        description: 'Explore neural networks, computer vision, natural language processing, LLMs, data analytics, and predictive modeling.',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Cybersecurity & Cloud Infrastructure',
        slug: 'cybersecurity-cloud',
        description: 'Protect digital assets, configure robust security firewalls, master ethical hacking, AWS/Azure cloud, and DevOps pipelines.',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
        status: 'active'
      },
      {
        name: 'Digital Innovation & Robotics for Youth',
        slug: 'youth-robotics-innovation',
        description: 'Inspiring the next generation through hands-on coding, micro-controllers, game design, IoT, and creative problem solving.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        status: 'active'
      }
    ];

    const departments = [];
    for (const d of deptsData) {
      let [dept] = await Department.findOrCreate({
        where: { slug: d.slug },
        defaults: d
      });
      departments.push(dept);
    }

    // 2. Courses
    const coursesData = [
      {
        departmentId: departments[0].id,
        title: 'Full-Stack Web Development Bootcamp (React, Node.js & Next.js)',
        slug: 'full-stack-web-development-bootcamp',
        description: 'A comprehensive, industry-aligned training programme taking you from absolute basics to advanced full-stack enterprise web development. Build real-world portfolio projects, deploy cloud applications, and master microservices.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        duration: '12 Weeks',
        level: 'intermediate',
        status: 'active',
        modules: [
          {
            title: 'Module 1: Modern JavaScript & Frontend Fundamentals',
            description: 'Deep dive into ES6+, Async/Await, DOM manipulation, responsive CSS, and state management.',
            imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
            order: 1,
            units: [
              {
                title: 'Unit 1.1: JavaScript Engine Mechanics & Scope',
                description: 'Understand closures, lexical scoping, call stacks, and execution contexts in modern V8 engines.',
                imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Understanding JavaScript Execution Contexts

JavaScript is a single-threaded, non-blocking asynchronous language. In this lesson, we break down how the Call Stack and Event Loop interact.

### Key Concepts:
1. **Creation Phase**: Memory is allocated for variables and functions (hoisting).
2. **Execution Phase**: Code is executed line by line.
3. **Closures**: Functions bundle together with references to their surrounding state (the lexical environment).

\`\`\`javascript
function createCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

### Practical Exercise:
Build a memoization utility function using closures to cache expensive computation results!`,
                videoUrl: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
                order: 1,
                files: [
                  { fileName: 'JavaScript_Engine_Deep_Dive.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 1024000 },
                  { fileName: 'Module_1_Lecture_Slides.pptx', fileUrl: 'https://example.com/slides.pptx', fileType: 'slide', fileSize: 4500000 }
                ]
              },
              {
                title: 'Unit 1.2: Asynchronous Programming with Promises & Async/Await',
                description: 'Master asynchronous flow, error handling with try-catch, and parallel promise execution.',
                imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Mastering Async/Await and Promise Combinators

Modern JavaScript applications rely on API integration and asynchronous I/O.

### Promise Combinators:
- \`Promise.all()\`: Fails fast if any promise rejects.
- \`Promise.allSettled()\`: Waits for all promises regardless of outcome.
- \`Promise.race()\`: Returns the first settled promise.

\`\`\`javascript
async function fetchUserDashboard(userId) {
  try {
    const [profile, courses, notifications] = await Promise.all([
      fetchProfile(userId),
      fetchCourses(userId),
      fetchNotifications(userId)
    ]);
    return { profile, courses, notifications };
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    throw error;
  }
}
\`\`\``,
                videoUrl: 'https://www.youtube.com/watch?v=vn3tm0quoqE',
                order: 2,
                files: [
                  { fileName: 'Async_JavaScript_Cheatsheet.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 850000 }
                ]
              }
            ]
          },
          {
            title: 'Module 2: React 18, Component Architecture & Hooks',
            description: 'Building blazing-fast reactive web applications with Custom Hooks, Context, and Performance Optimization.',
            imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
            order: 2,
            units: [
              {
                title: 'Unit 2.1: Custom Hooks & State Encapsulation',
                description: 'Extract reusable component logic into custom React hooks with clean lifecycle management.',
                imageUrl: 'https://images.unsplash.com/photo-1581291518655-9523c932deb4?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Crafting Clean Custom React Hooks

Custom hooks allow you to extract component logic into reusable functions.

### Example: \`useDebounce\` Hook
\`\`\`jsx
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
\`\`\``,
                videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
                order: 1,
                files: [
                  { fileName: 'React_Hooks_Architecture.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 1200000 },
                  { fileName: 'Project_Starter_Kit.zip', fileUrl: 'https://example.com/starter.zip', fileType: 'other', fileSize: 6200000 }
                ]
              }
            ]
          },
          {
            title: 'Module 3: Node.js, Express & Database Engineering',
            description: 'Designing high-throughput REST APIs, JWT authentication, and relational data modeling with Sequelize.',
            imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            order: 3,
            units: [
              {
                title: 'Unit 3.1: RESTful Architecture & Security Best Practices',
                description: 'Rate limiting, input validation, role-based access control, and sanitization for production APIs.',
                imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Production REST API Security Checklist

When building APIs in Express, always implement defense-in-depth:
1. **Rate Limiting**: Protect against brute-force attacks.
2. **Helmet**: Set security HTTP headers.
3. **CORS Configuration**: Restrict origin access.
4. **Input Sanitization**: Guard against SQL injection and XSS.`,
                videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
                order: 1,
                files: [
                  { fileName: 'API_Security_Guidelines.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 980000 }
                ]
              }
            ]
          }
        ]
      },
      {
        departmentId: departments[1].id,
        title: 'Artificial Intelligence, Machine Learning & Generative AI',
        slug: 'ai-machine-learning-generative-ai',
        description: 'Comprehensive AI certification covering Python, Pandas, Scikit-Learn, PyTorch, Deep Learning, Large Language Models (LLMs), RAG architectures, and autonomous AI agents.',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
        duration: '10 Weeks',
        level: 'advanced',
        status: 'active',
        modules: [
          {
            title: 'Module 1: Python for Data Science & Statistical Analysis',
            description: 'NumPy, Pandas, Exploratory Data Analysis (EDA), and data cleaning pipelines.',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            order: 1,
            units: [
              {
                title: 'Unit 1.1: Vectorized Computations with NumPy & Pandas',
                description: 'Fast numerical operations, matrix transformations, and dataframe slicing.',
                imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## High-Performance Data Processing

Vectorization replaces slow Python loops with optimized C-level batch operations.

\`\`\`python
import numpy as np
import pandas as pd

# Creating high-dimensional tensors
data = np.random.randn(1000, 5)
df = pd.DataFrame(data, columns=['Feature_A', 'Feature_B', 'Feature_C', 'Feature_D', 'Feature_E'])

# Vectorized normalization
df_normalized = (df - df.mean()) / df.std()
print(df_normalized.head())
\`\`\``,
                videoUrl: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
                order: 1,
                files: [
                  { fileName: 'Data_Science_Dataset.xlsx', fileUrl: 'https://example.com/dataset.xlsx', fileType: 'excel', fileSize: 3400000 },
                  { fileName: 'NumPy_Handbook.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 1500000 }
                ]
              }
            ]
          },
          {
            title: 'Module 2: Deep Learning, PyTorch & Transformers',
            description: 'Building neural networks, backpropagation, Attention mechanisms, and fine-tuning Transformer models.',
            imageUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80',
            order: 2,
            units: [
              {
                title: 'Unit 2.1: Self-Attention & Transformer Architecture',
                description: 'Mathematical intuition behind Multi-Head Attention and Query-Key-Value vectors.',
                imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Self-Attention Mechanism Explained

The Attention formula:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

This allows each token in a sentence to attend to all other tokens and capture rich semantic relationships.`,
                videoUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
                order: 1,
                files: [
                  { fileName: 'Attention_Is_All_You_Need_Summary.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 2100000 }
                ]
              }
            ]
          }
        ]
      },
      {
        departmentId: departments[2].id,
        title: 'Cybersecurity Analyst & Cloud Defense Engineering',
        slug: 'cybersecurity-analyst-cloud-defense',
        description: 'Hands-on practical cyber defense training: penetration testing, vulnerability assessment, SIEM threat monitoring, network forensics, and AWS security architecture.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
        duration: '8 Weeks',
        level: 'beginner',
        status: 'active',
        modules: [
          {
            title: 'Module 1: Network Protocols & Threat Modeling',
            description: 'TCP/IP layers, packet sniffing with Wireshark, port scanning, and perimeter security.',
            imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
            order: 1,
            units: [
              {
                title: 'Unit 1.1: Packet Analysis & Intrusion Detection',
                description: 'Analyzing PCAP files, identifying malicious payloads, and configuring Snort IDS rules.',
                imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Network Traffic Forensics with Wireshark

Learn how to filter network traffic and detect suspicious patterns such as SYN flood attacks, ARP spoofing, and unencrypted credentials.`,
                videoUrl: 'https://www.youtube.com/watch?v=lb1Dw0elw0Q',
                order: 1,
                files: [
                  { fileName: 'Wireshark_Analysis_Lab_Guide.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 1800000 }
                ]
              }
            ]
          }
        ]
      },
      {
        departmentId: departments[3].id,
        title: 'Coding, Game Development & Robotics for Young Innovators',
        slug: 'coding-robotics-for-kids-youth',
        description: 'An exciting, project-centered programme for kids and teenagers: Scratch, Python gaming with Pygame, micro:bit microcontrollers, and LEGO robotics fundamentals.',
        imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&auto=format&fit=crop&q=80',
        duration: '6 Weeks',
        level: 'beginner',
        status: 'active',
        modules: [
          {
            title: 'Module 1: Creative Coding with Python & Pygame',
            description: 'Sprites, animation loops, collision detection, and score tracking.',
            imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
            order: 1,
            units: [
              {
                title: 'Unit 1.1: Building Your First 2D Arcade Game',
                description: 'Creating interactive player movement, enemy spawning, and sound effects.',
                imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
                tutorialText: `## Building a Retro Space Arcade Game!

Step-by-step tutorial on building an interactive game using Python Pygame. Control your starship, dodge obstacles, and collect points!`,
                videoUrl: 'https://www.youtube.com/watch?v=FfWpgLFMI7w',
                order: 1,
                files: [
                  { fileName: 'Kids_Python_Game_Code_Assets.pdf', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf', fileSize: 950000 }
                ]
              }
            ]
          }
        ]
      }
    ];

    for (const cData of coursesData) {
      const { modules, ...cFields } = cData;
      let [course] = await Course.findOrCreate({
        where: { slug: cFields.slug },
        defaults: cFields
      });

      if (modules && modules.length > 0) {
        for (const mData of modules) {
          const { units, ...mFields } = mData;
          let [mod] = await CourseModule.findOrCreate({
            where: { courseId: course.id, title: mFields.title },
            defaults: { ...mFields, courseId: course.id }
          });

          if (units && units.length > 0) {
            for (const uData of units) {
              const { files, ...uFields } = uData;
              let [unit] = await Unit.findOrCreate({
                where: { moduleId: mod.id, title: uFields.title },
                defaults: { ...uFields, moduleId: mod.id }
              });

              if (files && files.length > 0) {
                for (const fData of files) {
                  await UnitFile.findOrCreate({
                    where: { unitId: unit.id, fileName: fData.fileName },
                    defaults: { ...fData, unitId: unit.id }
                  });
                }
              }
            }
          }
        }
      }
    }

    // 3. News Articles
    const newsData = [
      {
        title: 'JONIKWIRIA Launches Next-Gen AI & Robotics Learning Lab in Nigeria',
        slug: 'jonikwiria-launches-next-gen-ai-robotics-lab',
        excerpt: 'State-of-the-art facility equipped with GPU computing clusters, IoT prototyping kits, and interactive smart boards designed to train over 5,000 students annually.',
        content: `### Empowering Tomorrow's Innovators Today

JONIKWIRIA Limited has officially commissioned its flagship Technology & Innovation Hub, expanding access to world-class software engineering, artificial intelligence, and robotics education.

The new facility features:
- High-performance workstations for machine learning and 3D simulation.
- Hardware makerspace for robotics, IoT sensors, and embedded systems.
- Collaborative project pods for student team incubation and hackathons.

Speaking at the launch ceremony, the leadership team reaffirmed JONIKWIRIA's core mission: **"Building People. Building Technology."**

*"We believe that the future belongs to those who create technology, not just consume it. This facility is built to nurture creators, problem solvers, and visionary builders."*`,
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
        author: 'Editorial Board',
        category: 'Press Release',
        tags: ['AI', 'Robotics', 'Innovation', 'Education', 'Technology'],
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'published'
      },
      {
        title: 'How Generative AI is Reshaping Modern Software Engineering in 2026',
        slug: 'how-generative-ai-reshapes-software-engineering',
        excerpt: 'An insightful analysis into automated code synthesis, AI pair programming, synthetic testing, and how developers can stay ahead of the curve.',
        content: `### The Evolution of the 10x Engineer

From predictive code completions to autonomous debugging agents, generative artificial intelligence has fundamentally altered the software development lifecycle.

Key Takeaways for Engineers:
1. **Architectural Thinking over Boilerplate**: Routine code generation is commoditized; architectural design, data modeling, and security verification are paramount.
2. **Context Engineering**: Mastering prompts, RAG architectures, and domain-specific knowledge injection.
3. **Continuous Learning**: Adopting modern AI tooling to multiply productivity.`,
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        author: 'Dr. David Adeleke',
        category: 'Industry Insights',
        tags: ['Generative AI', 'Software Development', 'Future of Work', 'Tech Trends'],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'published'
      },
      {
        title: 'JONIKWIRIA Tech Scholarship Award 2026: Applications Now Open for 500 Students',
        slug: 'jonikwiria-tech-scholarship-award-2026',
        excerpt: 'Full and partial tuition scholarships awarded to outstanding candidates in Web Development, Cybersecurity, and Data Science.',
        content: `### Bridging the Digital Skills Gap

In partnership with philanthropic and corporate foundations, JONIKWIRIA is proud to announce the **2026 Tech Talent Scholarship Initiative**.

Scholarship packages include:
- 100% Tuition coverage for selected bootcamp programmes.
- 1-on-1 mentorship with senior industry engineers.
- Internship placement support upon graduation.

Eligible candidates are invited to apply before the deadline.`,
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
        author: 'Scholarship Committee',
        category: 'Scholarships',
        tags: ['Scholarships', 'Opportunity', 'Youth Empowerment', 'Coding'],
        publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        status: 'published'
      }
    ];

    for (const n of newsData) {
      await News.findOrCreate({
        where: { slug: n.slug },
        defaults: n
      });
    }

    // 4. Events
    const eventsData = [
      {
        title: 'West Africa AI & Deep Learning Summit 2026',
        slug: 'west-africa-ai-deep-learning-summit-2026',
        description: 'A 2-day premier gathering of AI researchers, software architects, startup founders, and students exploring practical applications of artificial intelligence in Africa.',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        location: 'Main Auditorium, JONIKWIRIA Innovation Campus & Online Live Stream',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        registrationUrl: 'https://forms.google.com',
        category: 'Conference',
        status: 'upcoming'
      },
      {
        title: 'Hands-On Cybersecurity Hackathon & CTF Challenge',
        slug: 'cybersecurity-hackathon-ctf-2026',
        description: 'Compete with top ethical hackers and security enthusiasts in solving reverse engineering, web exploitation, cryptography, and digital forensics challenges.',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        location: 'Virtual Arena (Discord & CTFd Platform)',
        startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        registrationUrl: 'https://forms.google.com',
        category: 'Hackathon',
        status: 'upcoming'
      },
      {
        title: 'Young Inventors Robotics & Game Showcase',
        slug: 'young-inventors-robotics-showcase',
        description: 'Watch inspiring young minds aged 8-16 demonstrate their working autonomous robots, smart home gadgets, and interactive Python video games.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
        location: 'JONIKWIRIA Tech Park, Exhibition Hall B',
        startDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        registrationUrl: 'https://forms.google.com',
        category: 'Exhibition',
        status: 'upcoming'
      }
    ];

    for (const ev of eventsData) {
      await Event.findOrCreate({
        where: { slug: ev.slug },
        defaults: ev
      });
    }

    console.log('✅ Academic and content data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
