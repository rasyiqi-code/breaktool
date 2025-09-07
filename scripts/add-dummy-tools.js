const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDummyTools() {
  try {
    console.log('Adding dummy tools for testing...');

    // Create categories if they don't exist
    const categories = [
      { name: 'Productivity', slug: 'productivity' },
      { name: 'Design', slug: 'design' },
      { name: 'Development', slug: 'development' },
      { name: 'Marketing', slug: 'marketing' }
    ];

    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData
      });
    }

    // Get category IDs
    const productivityCategory = await prisma.category.findUnique({
      where: { slug: 'productivity' }
    });
    const designCategory = await prisma.category.findUnique({
      where: { slug: 'design' }
    });

    // Add dummy tools
const dummyTools = [
  {
        name: 'Airtable',
        slug: 'airtable',
        description: 'Airtable is a cloud-based database platform that combines the simplicity of a spreadsheet with the power of a database.',
        website: 'https://airtable.com',
        categoryId: productivityCategory.id,
        submittedBy: 'John Doe',
        status: 'pending'
      },
      {
    name: 'Canva',
    slug: 'canva',
        description: 'Canva is a graphic design platform that allows users to create social media graphics, presentations, posters, and other visual content.',
    website: 'https://canva.com',
        categoryId: designCategory.id,
        submittedBy: 'Jane Smith',
        status: 'pending'
      },
      {
        name: 'Figma',
        slug: 'figma',
        description: 'Figma is a collaborative interface design tool that runs in the browser.',
        website: 'https://figma.com',
        categoryId: designCategory.id,
        submittedBy: 'Mike Johnson',
        status: 'approved'
      }
    ];

    for (const toolData of dummyTools) {
      await prisma.tool.upsert({
        where: { slug: toolData.slug },
        update: {},
        create: toolData
      });
    }

    console.log('✅ Dummy tools added successfully!');
    console.log('Tools added:');
    dummyTools.forEach(tool => {
      console.log(`- ${tool.name} (${tool.status})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding dummy tools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDummyTools();
