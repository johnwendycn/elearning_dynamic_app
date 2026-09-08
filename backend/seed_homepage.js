const { CarouselSlide } = require('./src/models');

async function seed() {
  try {
    await CarouselSlide.destroy({ where: { carouselId: 1 } });
    await CarouselSlide.bulkCreate([
      { carouselId: 1, title: 'Technology Starts Here', subtitle: 'Learn. Build. Innovate.', description: 'Practical technology training and solutions for kids, adults, professionals and organizations.', buttonText: 'Learn More', buttonUrl: '/p/about-us', displayOrder: 1, status: 'active' },
      { carouselId: 1, title: 'Coding for Kids', subtitle: 'Build Young Innovators', description: 'Fun, practical coding and technology skills designed for children.', buttonText: 'Explore Kids Training', buttonUrl: '/p/software-development', displayOrder: 2, status: 'active' },
      { carouselId: 1, title: 'Software Development', subtitle: 'Learn to Build Software', description: 'Master modern programming and build real-world web, mobile and desktop applications.', buttonText: 'Start Learning', buttonUrl: '/p/software-development', displayOrder: 3, status: 'active' },
      { carouselId: 1, title: 'Data Science', subtitle: 'Turn Data Into Insights', description: 'Learn data analysis, visualization, statistics and machine learning.', buttonText: 'Learn Data Science', buttonUrl: '/p/data-science', displayOrder: 4, status: 'active' },
      { carouselId: 1, title: 'Artificial Intelligence', subtitle: 'Build Intelligent Solutions', description: 'Learn how to build, train and apply AI and machine learning models.', buttonText: 'Explore AI Training', buttonUrl: '/p/artificial-intelligence', displayOrder: 5, status: 'active' },
      { carouselId: 1, title: 'IT Capacity Building', subtitle: 'Upgrade Your Team', description: 'Practical IT training designed for schools, businesses and institutions.', buttonText: 'Train Your Team', buttonUrl: '/p/about-us', displayOrder: 6, status: 'active' },
      { carouselId: 1, title: 'Custom Software', subtitle: "Have an Idea? Let's Build It.", description: 'We design and develop software solutions tailored to your needs.', buttonText: 'Build With Us', buttonUrl: '/p/software-development', displayOrder: 7, status: 'active' },
      { carouselId: 1, title: 'AI & Data Solutions', subtitle: 'Technology for Better Decisions', description: 'We develop AI, data and automation solutions that solve real-world problems.', buttonText: 'Explore Solutions', buttonUrl: '/p/artificial-intelligence', displayOrder: 8, status: 'active' },
      { carouselId: 1, title: 'Learn. Build. Grow.', subtitle: 'Your Technology Journey Starts Here.', description: "Whether you're a beginner, professional or organization, JONIKWIRIA can help you grow.", buttonText: 'Get Started', buttonUrl: '/p/about-us', displayOrder: 9, status: 'active' },
      { carouselId: 1, title: 'JONIKWIRIA', subtitle: "Let's Build the Future", description: 'Technology Training • Software Development • AI Solutions\nLearn with us. Build with us. Grow with us.', buttonText: 'Contact Us', buttonUrl: '/p/about-us', displayOrder: 10, status: 'active' }
    ]);
    console.log('✅ 10 carousel slides inserted.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}
seed();
