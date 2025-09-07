const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dummySubmissions = [
  {
    id: 'sub-001',
    name: 'TaskFlow Pro',
    website: 'https://taskflowpro.com',
    description: 'Advanced project management tool with AI-powered task prioritization',
    categoryId: 'cat-productivity',
    logoUrl: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=TF',
    submittedBy: 'vendor-user-001',
    submitterRelationship: 'Founder',
    additionalInfo: 'Our tool uses machine learning to automatically prioritize tasks based on deadlines, team capacity, and project importance.',
    status: 'pending'
  },
  {
    id: 'sub-002',
    name: 'DesignHub',
    website: 'https://designhub.app',
    description: 'Collaborative design platform for creative teams',
    categoryId: 'cat-design',
    logoUrl: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=DH',
    submittedBy: 'vendor-user-002',
    submitterRelationship: 'Product Manager',
    additionalInfo: 'DesignHub streamlines the design process from concept to final delivery, with built-in version control and client feedback tools.',
    status: 'pending'
  },
  {
    id: 'sub-003',
    name: 'CommSync',
    website: 'https://commsync.io',
    description: 'Unified communication platform for remote teams',
    categoryId: 'cat-communication',
    logoUrl: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=CS',
    submittedBy: 'vendor-user-003',
    submitterRelationship: 'CEO',
    additionalInfo: 'CommSync combines chat, video calls, file sharing, and project management in one seamless platform.',
    status: 'pending'
  },
  {
    id: 'sub-004',
    name: 'AutoFlow',
    website: 'https://autoflow.tech',
    description: 'No-code workflow automation platform',
    categoryId: 'cat-automation',
    logoUrl: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=AF',
    submittedBy: 'vendor-user-004',
    submitterRelationship: 'CTO',
    additionalInfo: 'AutoFlow enables businesses to automate complex workflows without coding, with drag-and-drop interface and 100+ integrations.',
    status: 'pending'
  },
  {
    id: 'sub-005',
    name: 'WriteAI',
    website: 'https://writeai.com',
    description: 'AI-powered writing assistant for content creators',
    categoryId: 'cat-writing',
    logoUrl: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=WA',
    submittedBy: 'vendor-user-005',
    submitterRelationship: 'Founder',
    additionalInfo: 'WriteAI helps content creators write better, faster content with AI-powered suggestions, grammar checking, and style optimization.',
    status: 'pending'
  }
];

async function addDummySubmissions() {
  try {
    console.log('🚀 Starting to add dummy tool submissions...');
    
    // First, let's create some dummy vendor users if they don't exist
    const dummyVendors = [
      {
        id: 'vendor-user-001',
        email: 'vendor1@breaktool.com',
        name: 'Vendor User 1',
        role: 'vendor',
        isVerifiedTester: false,
        verificationStatus: 'pending',
        vendorStatus: 'approved'
      },
      {
        id: 'vendor-user-002',
        email: 'vendor2@breaktool.com',
        name: 'Vendor User 2',
        role: 'vendor',
        isVerifiedTester: false,
        verificationStatus: 'pending',
        vendorStatus: 'approved'
      },
      {
        id: 'vendor-user-003',
        email: 'vendor3@breaktool.com',
        name: 'Vendor User 3',
        role: 'vendor',
        isVerifiedTester: false,
        verificationStatus: 'pending',
        vendorStatus: 'approved'
      },
      {
        id: 'vendor-user-004',
        email: 'vendor4@breaktool.com',
        name: 'Vendor User 4',
        role: 'vendor',
        isVerifiedTester: false,
        verificationStatus: 'pending',
        vendorStatus: 'approved'
      },
      {
        id: 'vendor-user-005',
        email: 'vendor5@breaktool.com',
        name: 'Vendor User 5',
        role: 'vendor',
        isVerifiedTester: false,
        verificationStatus: 'pending',
        vendorStatus: 'approved'
      }
    ];

    for (const vendor of dummyVendors) {
      await prisma.user.upsert({
        where: { id: vendor.id },
        update: {},
        create: {
          id: vendor.id,
          email: vendor.email,
          name: vendor.name,
          role: vendor.role,
          isVerifiedTester: vendor.isVerifiedTester,
          verificationStatus: vendor.verificationStatus,
          vendorStatus: vendor.vendorStatus,
          trustScore: 75,
          badges: ['vendor'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
    console.log('✅ Dummy vendor users created/updated');

    // Add dummy tool submissions
    for (const submission of dummySubmissions) {
      await prisma.toolSubmission.upsert({
        where: { id: submission.id },
        update: {
          name: submission.name,
          website: submission.website,
          description: submission.description,
          categoryId: submission.categoryId,
          logoUrl: submission.logoUrl,
          submittedBy: submission.submittedBy,
          submitterRelationship: submission.submitterRelationship,
          additionalInfo: submission.additionalInfo,
          status: submission.status,
          updatedAt: new Date()
        },
        create: {
          id: submission.id,
          name: submission.name,
          website: submission.website,
          description: submission.description,
          categoryId: submission.categoryId,
          logoUrl: submission.logoUrl,
          submittedBy: submission.submittedBy,
          submitterRelationship: submission.submitterRelationship,
          additionalInfo: submission.additionalInfo,
          status: submission.status,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ Added submission: ${submission.name}`);
    }

    console.log('🎉 All dummy tool submissions have been added successfully!');
    
    // Display summary
    const totalSubmissions = await prisma.toolSubmission.count();
    const totalVendors = await prisma.user.count({ where: { role: 'vendor' } });
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total submissions: ${totalSubmissions}`);
    console.log(`- Total vendors: ${totalVendors}`);
    
  } catch (error) {
    console.error('❌ Error adding dummy submissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDummySubmissions();
