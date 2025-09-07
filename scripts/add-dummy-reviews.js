const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dummyReviews = [
  // Notion Reviews
  {
    toolId: 'tool-001',
    userId: 'admin-user-001',
    type: 'admin',
    title: 'Excellent All-in-One Workspace',
    content: 'Notion has revolutionized how our team collaborates. The flexibility of creating databases, kanban boards, and wikis in one place is incredible. The learning curve is worth it.',
    overallScore: 4.7,
    valueScore: 4.5,
    usageScore: 4.8,
    integrationScore: 4.6,
    pros: ['Extremely flexible', 'Great collaboration features', 'Rich templates', 'Cross-platform sync'],
    cons: ['Steep learning curve', 'Can be overwhelming', 'Mobile app could be better'],
    recommendation: 'keep',
    useCase: 'Team collaboration and project management',
    companySize: '10-50 employees',
    industry: 'Technology',
    usageDuration: '2+ years',
    helpfulVotes: 45,
    totalVotes: 52,
    status: 'active',
    featured: true
  },
  {
    toolId: 'tool-001',
    userId: 'verified-tester-001',
    type: 'verified_tester',
    title: 'Perfect for Personal Knowledge Management',
    content: 'I use Notion for my personal knowledge management and it\'s fantastic. The ability to create linked databases and build a second brain is unmatched.',
    overallScore: 4.8,
    valueScore: 4.7,
    usageScore: 4.9,
    integrationScore: 4.7,
    pros: ['Great for knowledge management', 'Excellent templates', 'Fast search', 'Good mobile app'],
    cons: ['Offline mode limited', 'Export options could be better'],
    recommendation: 'keep',
    useCase: 'Personal knowledge management',
    companySize: 'Individual',
    industry: 'Consulting',
    usageDuration: '1+ years',
    helpfulVotes: 32,
    totalVotes: 38,
    status: 'active',
    featured: false
  },

  // Figma Reviews
  {
    toolId: 'tool-002',
    userId: 'admin-user-002',
    type: 'admin',
    title: 'Industry Standard for UI/UX Design',
    content: 'Figma has become the industry standard for UI/UX design. The real-time collaboration features are game-changing for design teams. The browser-based approach makes it accessible to everyone.',
    overallScore: 4.8,
    valueScore: 4.7,
    usageScore: 4.9,
    integrationScore: 4.8,
    pros: ['Real-time collaboration', 'Browser-based', 'Excellent prototyping', 'Great community'],
    cons: ['Performance issues with large files', 'Limited offline capabilities'],
    recommendation: 'keep',
    useCase: 'UI/UX design and prototyping',
    companySize: '50-200 employees',
    industry: 'Design Agency',
    usageDuration: '3+ years',
    helpfulVotes: 38,
    totalVotes: 42,
    status: 'active',
    featured: true
  },

  // Slack Reviews
  {
    toolId: 'tool-003',
    userId: 'verified-tester-002',
    type: 'verified_tester',
    title: 'Essential for Remote Team Communication',
    content: 'Slack is essential for our remote team. The channel organization, integrations, and search capabilities make it easy to stay connected and find information quickly.',
    overallScore: 4.6,
    valueScore: 4.4,
    usageScore: 4.7,
    integrationScore: 4.8,
    pros: ['Great integrations', 'Excellent search', 'Good mobile app', 'Easy to organize'],
    cons: ['Can be distracting', 'Message retention limits on free plan'],
    recommendation: 'keep',
    useCase: 'Team communication and collaboration',
    companySize: '20-100 employees',
    industry: 'Software Development',
    usageDuration: '2+ years',
    helpfulVotes: 28,
    totalVotes: 35,
    status: 'active',
    featured: false
  },

  // Zapier Reviews
  {
    toolId: 'tool-004',
    userId: 'admin-user-003',
    type: 'admin',
    title: 'Powerful Automation Platform',
    content: 'Zapier is incredibly powerful for automating workflows between different apps. The ease of creating zaps without coding makes it accessible to non-technical users.',
    overallScore: 4.5,
    valueScore: 4.3,
    usageScore: 4.6,
    integrationScore: 4.9,
    pros: ['Easy to use', 'Hundreds of integrations', 'No coding required', 'Reliable'],
    cons: ['Can be expensive', 'Limited customization', 'Some delays in execution'],
    recommendation: 'try',
    useCase: 'Workflow automation between apps',
    companySize: '5-25 employees',
    industry: 'Marketing',
    usageDuration: '1+ years',
    helpfulVotes: 22,
    totalVotes: 28,
    status: 'active',
    featured: false
  },

  // Canva Reviews
  {
    toolId: 'tool-005',
    userId: 'verified-tester-003',
    type: 'verified_tester',
    title: 'Perfect for Non-Designers',
    content: 'Canva makes graphic design accessible to everyone. The templates are professional and the drag-and-drop interface is intuitive. Great for social media graphics and presentations.',
    overallScore: 4.7,
    valueScore: 4.8,
    usageScore: 4.6,
    integrationScore: 4.5,
    pros: ['Easy to use', 'Great templates', 'Affordable', 'Good collaboration'],
    cons: ['Limited advanced features', 'Some templates look generic'],
    recommendation: 'keep',
    useCase: 'Social media graphics and presentations',
    companySize: 'Individual',
    industry: 'Content Creation',
    usageDuration: '1+ years',
    helpfulVotes: 35,
    totalVotes: 41,
    status: 'active',
    featured: false
  }
];

async function addDummyReviews() {
  try {
    console.log('🚀 Starting to add dummy reviews...');
    
    // First, let's create some dummy users if they don't exist
    const dummyUsers = [
      {
        id: 'admin-user-001',
        email: 'admin1@breaktool.com',
        name: 'Admin User 1',
        role: 'admin',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      },
      {
        id: 'admin-user-002',
        email: 'admin2@breaktool.com',
        name: 'Admin User 2',
        role: 'admin',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      },
      {
        id: 'admin-user-003',
        email: 'admin3@breaktool.com',
        name: 'Admin User 3',
        role: 'admin',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      },
      {
        id: 'verified-tester-001',
        email: 'tester1@breaktool.com',
        name: 'Verified Tester 1',
        role: 'verified_tester',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      },
      {
        id: 'verified-tester-002',
        email: 'tester2@breaktool.com',
        name: 'Verified Tester 2',
        role: 'verified_tester',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      },
      {
        id: 'verified-tester-003',
        email: 'tester3@breaktool.com',
        name: 'Verified Tester 3',
        role: 'verified_tester',
        isVerifiedTester: true,
        verificationStatus: 'approved'
      }
    ];

    for (const user of dummyUsers) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerifiedTester: user.isVerifiedTester,
          verificationStatus: user.verificationStatus,
          trustScore: 85,
          badges: ['verified_tester'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    console.log('✅ Dummy users created/updated');

    // Add dummy reviews
    for (const review of dummyReviews) {
      const reviewId = `review-${review.toolId}-${review.userId}`;
      await prisma.review.upsert({
        where: { 
          id: reviewId
        },
        update: {
          title: review.title,
          content: review.content,
          overallScore: review.overallScore,
          valueScore: review.valueScore,
          usageScore: review.usageScore,
          integrationScore: review.integrationScore,
          pros: review.pros,
          cons: review.cons,
          recommendation: review.recommendation,
          useCase: review.useCase,
          companySize: review.companySize,
          industry: review.industry,
          usageDuration: review.usageDuration,
          helpfulVotes: review.helpfulVotes,
          totalVotes: review.totalVotes,
          status: review.status,
          featured: review.featured,
          updatedAt: new Date()
        },
        create: {
          id: `review-${review.toolId}-${review.userId}`,
          toolId: review.toolId,
          userId: review.userId,
          type: review.type,
          title: review.title,
          content: review.content,
          overallScore: review.overallScore,
          valueScore: review.valueScore,
          usageScore: review.usageScore,
          integrationScore: review.integrationScore,
          pros: review.pros,
          cons: review.cons,
          recommendation: review.recommendation,
          useCase: review.useCase,
          companySize: review.companySize,
          industry: review.industry,
          usageDuration: review.usageDuration,
          helpfulVotes: review.helpfulVotes,
          totalVotes: review.totalVotes,
          status: review.status,
          featured: review.featured,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ Added review: ${review.title}`);
    }

    console.log('🎉 All dummy reviews have been added successfully!');
    
    // Display summary
    const totalReviews = await prisma.review.count();
    const totalUsers = await prisma.user.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total reviews: ${totalReviews}`);
    console.log(`- Total users: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error adding dummy reviews:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDummyReviews();
