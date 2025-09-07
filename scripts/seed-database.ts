import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const categories = [
    {
      name: 'Productivity',
      slug: 'productivity',
      description: 'Tools to boost your productivity and workflow',
      icon: '⚡',
      color: '#3B82F6'
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'Design tools for creatives and designers',
      icon: '🎨',
      color: '#EC4899'
    },
    {
      name: 'Development',
      slug: 'development',
      description: 'Development tools and utilities',
      icon: '💻',
      color: '#10B981'
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      description: 'Marketing and growth tools',
      icon: '📈',
      color: '#F59E0B'
    },
    {
      name: 'Communication',
      slug: 'communication',
      description: 'Communication and collaboration tools',
      icon: '💬',
      color: '#8B5CF6'
    }
  ]

  console.log('📂 Creating categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  // Create sample tools
  const tools = [
    {
      name: 'Notion',
      slug: 'notion',
      description: 'All-in-one workspace for notes, docs, and collaboration',
      longDescription: 'Notion is a versatile workspace that combines notes, docs, project management, and databases in one platform.',
      website: 'https://notion.so',
      logoUrl: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=N',
      categoryId: (await prisma.category.findUnique({ where: { slug: 'productivity' } }))?.id,
      pricingModel: 'freemium',
      startingPrice: 0,
      featured: true,
      status: 'active',
      tags: ['notes', 'collaboration', 'database', 'project-management']
    },
    {
      name: 'Figma',
      slug: 'figma',
      description: 'Collaborative interface design tool',
      longDescription: 'Figma is a cloud-based design tool that enables teams to collaborate on interface design in real-time.',
      website: 'https://figma.com',
      logoUrl: 'https://via.placeholder.com/150x150/EC4899/FFFFFF?text=F',
      categoryId: (await prisma.category.findUnique({ where: { slug: 'design' } }))?.id,
      pricingModel: 'freemium',
      startingPrice: 0,
      featured: true,
      status: 'active',
      tags: ['design', 'ui', 'ux', 'prototyping', 'collaboration']
    },
    {
      name: 'VS Code',
      slug: 'vs-code',
      description: 'Free source code editor with powerful extensions',
      longDescription: 'Visual Studio Code is a lightweight but powerful source code editor with support for many programming languages.',
      website: 'https://code.visualstudio.com',
      logoUrl: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=VS',
      categoryId: (await prisma.category.findUnique({ where: { slug: 'development' } }))?.id,
      pricingModel: 'free',
      startingPrice: 0,
      featured: true,
      status: 'active',
      tags: ['code-editor', 'development', 'extensions', 'free']
    }
  ]

  console.log('🛠️ Creating tools...')
  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool
    })
  }

  // Create sample users
  const users = [
    {
      id: 'user-1',
      email: 'admin@breaktool.com',
      name: 'Admin User',
      role: 'admin',
      trustScore: 100,
      isVerifiedTester: true,
      verificationStatus: 'approved'
    },
    {
      id: 'user-2',
      email: 'tester@breaktool.com',
      name: 'Verified Tester',
      role: 'verified_tester',
      trustScore: 85,
      isVerifiedTester: true,
      verificationStatus: 'approved',
      expertise: ['productivity', 'design']
    },
    {
      id: 'user-3',
      email: 'user@breaktool.com',
      name: 'Regular User',
      role: 'user',
      trustScore: 25,
      isVerifiedTester: false,
      verificationStatus: 'pending'
    }
  ]

  console.log('👥 Creating users...')
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: user
    })
  }

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
