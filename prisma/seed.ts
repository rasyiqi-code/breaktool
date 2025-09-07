import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default categories
  const categories = [
    {
      name: 'Productivity',
      slug: 'productivity',
      description: 'Tools to boost your productivity and efficiency',
      icon: 'zap',
      color: '#3b82f6'
    },
    {
      name: 'Development',
      slug: 'development',
      description: 'Developer tools and resources',
      icon: 'code',
      color: '#10b981'
    },
    {
      name: 'Design',
      slug: 'design',
      description: 'Design and creative tools',
      icon: 'palette',
      color: '#f59e0b'
    },
    {
      name: 'Marketing',
      slug: 'marketing',
      description: 'Marketing and growth tools',
      icon: 'trending-up',
      color: '#ef4444'
    },
    {
      name: 'Analytics',
      slug: 'analytics',
      description: 'Data analytics and insights tools',
      icon: 'bar-chart',
      color: '#8b5cf6'
    }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
