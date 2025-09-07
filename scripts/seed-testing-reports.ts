import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestingReports() {
  console.log('🌱 Seeding testing reports...');

  try {
    // Ambil beberapa tools yang sudah ada
    const tools = await prisma.tool.findMany({
      take: 5,
      where: {
        status: 'active'
      }
    });

    if (tools.length === 0) {
      console.log('❌ No tools found. Please seed tools first.');
      return;
    }

    // Ambil users dengan role verified_tester, admin, atau super_admin
    const testers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'verified_tester' },
          { role: 'admin' },
          { role: 'super_admin' }
        ]
      },
      take: 3
    });

    if (testers.length === 0) {
      console.log('❌ No testers found. Creating demo tester...');
      
      // Buat demo tester jika tidak ada
      const demoTester = await prisma.user.create({
        data: {
          id: 'demo-tester-1',
          email: 'demo.tester@example.com',
          name: 'Demo Tester',
          role: 'verified_tester',
          isVerifiedTester: true,
          verificationStatus: 'approved',
          verifiedAt: new Date(),
          trustScore: 85,
          expertise: ['Web Development', 'API Testing', 'UI/UX']
        }
      });
      testers.push(demoTester);
    }

    // Demo data untuk testing reports
    const demoReports = [
      {
        title: 'Comprehensive Testing Report for ' + tools[0]?.name,
        summary: 'Detailed analysis of functionality, performance, and user experience. The tool shows excellent performance in core features with minor areas for improvement.',
        detailedAnalysis: `After extensive testing over 2 weeks, I found this tool to be highly effective for its intended purpose. The interface is intuitive and the core functionality works as expected. Performance is generally good, though there are some minor delays during peak usage times.

Key findings:
- Setup process is straightforward and well-documented
- Core features work reliably
- Integration capabilities are robust
- Customer support is responsive
- Documentation could be more comprehensive`,
        overallScore: 4.2,
        valueScore: 4.0,
        usageScore: 4.5,
        integrationScore: 4.0,
        pros: [
          'Intuitive user interface',
          'Reliable core functionality',
          'Good integration options',
          'Responsive customer support',
          'Regular updates and improvements'
        ],
        cons: [
          'Limited advanced customization options',
          'Occasional performance slowdowns',
          'Documentation could be more detailed',
          'Pricing could be more competitive'
        ],
        recommendations: 'Recommended for small to medium businesses looking for a reliable solution. Consider upgrading documentation and adding more customization options.',
        useCases: [
          'Small business automation',
          'Team collaboration',
          'Project management',
          'Data analysis'
        ],
        setupTime: '30 minutes',
        learningCurve: 'Easy - can be productive within a day',
        supportQuality: 'Excellent - responsive and helpful',
        documentation: 'Good but could be more comprehensive',
        performance: 'Good with occasional slowdowns',
        security: 'Strong security measures implemented',
        scalability: 'Scales well for medium-sized teams',
        costEffectiveness: 'Good value for money',
        verdict: 'recommended',
        status: 'published',
        isApproved: true,
        approvedAt: new Date()
      },
      {
        title: 'In-depth Analysis of ' + tools[1]?.name,
        summary: 'Thorough evaluation reveals a powerful tool with excellent features but steep learning curve. Best suited for advanced users.',
        detailedAnalysis: `This tool offers advanced capabilities that can significantly improve workflow efficiency. However, it requires substantial time investment to master all features. The interface is feature-rich but can be overwhelming for new users.

Testing methodology:
- 3-week evaluation period
- Tested with real-world scenarios
- Compared with 3 similar tools
- Gathered feedback from 5 team members`,
        overallScore: 3.8,
        valueScore: 4.2,
        usageScore: 3.5,
        integrationScore: 4.5,
        pros: [
          'Powerful advanced features',
          'Excellent integration capabilities',
          'Highly customizable',
          'Strong API support',
          'Active community'
        ],
        cons: [
          'Steep learning curve',
          'Complex interface',
          'Higher price point',
          'Requires technical expertise'
        ],
        recommendations: 'Best for teams with technical expertise. Consider providing better onboarding materials for new users.',
        useCases: [
          'Enterprise-level automation',
          'Complex data processing',
          'Advanced analytics',
          'Custom integrations'
        ],
        setupTime: '2-3 hours',
        learningCurve: 'Steep - requires 1-2 weeks to become proficient',
        supportQuality: 'Good - knowledgeable but response time varies',
        documentation: 'Comprehensive but technical',
        performance: 'Excellent for complex tasks',
        security: 'Enterprise-grade security',
        scalability: 'Excellent scalability options',
        costEffectiveness: 'Good for large teams, expensive for small teams',
        verdict: 'recommended',
        status: 'published',
        isApproved: true,
        approvedAt: new Date()
      },
      {
        title: 'Quick Review: ' + tools[2]?.name,
        summary: 'Simple and effective tool for basic needs. Limited advanced features but excellent for beginners.',
        detailedAnalysis: `A straightforward tool that does exactly what it promises. Perfect for users who need basic functionality without complexity. The interface is clean and the learning curve is minimal.

Testing highlights:
- Easy setup and configuration
- Reliable basic features
- Good for small teams
- Limited customization options`,
        overallScore: 3.5,
        valueScore: 4.0,
        usageScore: 4.2,
        integrationScore: 3.0,
        pros: [
          'Very easy to use',
          'Quick setup',
          'Affordable pricing',
          'Good for beginners',
          'Reliable basic features'
        ],
        cons: [
          'Limited advanced features',
          'Basic integration options',
          'Not suitable for large teams',
          'Limited customization'
        ],
        recommendations: 'Perfect for small teams or individuals who need basic functionality. Not recommended for complex use cases.',
        useCases: [
          'Personal productivity',
          'Small team collaboration',
          'Basic project tracking',
          'Simple task management'
        ],
        setupTime: '15 minutes',
        learningCurve: 'Very easy - productive immediately',
        supportQuality: 'Good - friendly and helpful',
        documentation: 'Clear and concise',
        performance: 'Good for basic tasks',
        security: 'Standard security measures',
        scalability: 'Limited scalability',
        costEffectiveness: 'Excellent value for basic needs',
        verdict: 'recommended',
        status: 'published',
        isApproved: true,
        approvedAt: new Date()
      }
    ];

    // Buat testing tasks dan reports
    for (let i = 0; i < Math.min(demoReports.length, tools.length); i++) {
      const tool = tools[i];
      const tester = testers[i % testers.length];
      const reportData = demoReports[i];

      // Buat testing task terlebih dahulu
      const task = await prisma.testingTask.create({
        data: {
          toolId: tool.id,
          testerId: tester.id,
          title: `Test ${tool.name}`,
          description: `Comprehensive testing of ${tool.name} including functionality, performance, and usability evaluation.`,
          status: 'completed',
          priority: 'high',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          reward: 500,
          startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        }
      });

      // Buat testing report
      await prisma.testingReport.create({
        data: {
          taskId: task.id,
          toolId: tool.id,
          testerId: tester.id,
          approvedBy: testers[0].id, // First tester as approver
          ...reportData
        }
      });

      console.log(`✅ Created testing report for ${tool.name}`);
    }

    console.log('🎉 Testing reports seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding testing reports:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedTestingReports()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedTestingReports;