const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const dummyTestingTasks = [
  {
    id: 'task-001',
    toolId: 'tool-001',
    testerId: 'verified-tester-001',
    title: 'Test Notion Collaboration Features',
    description: 'Test the real-time collaboration features of Notion, including simultaneous editing, comments, and version history.',
    status: 'pending',
    priority: 'high',
    deadline: new Date('2024-12-31'),
    reward: 150,
    assignedAt: new Date(),
    startedAt: null,
    completedAt: null
  },
  {
    id: 'task-002',
    toolId: 'tool-002',
    testerId: 'verified-tester-002',
    title: 'Evaluate Figma Prototyping Capabilities',
    description: 'Comprehensive testing of Figma\'s prototyping features including animations, interactions, and user flow testing.',
    status: 'in_progress',
    priority: 'medium',
    deadline: new Date('2024-12-31'),
    reward: 200,
    assignedAt: new Date('2024-01-15'),
    startedAt: new Date('2024-01-16'),
    completedAt: null
  },
  {
    id: 'task-003',
    toolId: 'tool-003',
    testerId: 'verified-tester-003',
    title: 'Slack Integration Testing',
    description: 'Test Slack\'s integration capabilities with various third-party tools and services.',
    status: 'completed',
    priority: 'low',
    deadline: new Date('2024-12-31'),
    reward: 120,
    assignedAt: new Date('2024-01-10'),
    startedAt: new Date('2024-01-11'),
    completedAt: new Date('2024-01-14')
  },
  {
    id: 'task-004',
    toolId: 'tool-004',
    testerId: 'verified-tester-001',
    title: 'Zapier Workflow Automation Testing',
    description: 'Test Zapier\'s workflow automation capabilities with complex multi-step workflows.',
    status: 'pending',
    priority: 'medium',
    deadline: new Date('2024-12-31'),
    reward: 180,
    assignedAt: new Date(),
    startedAt: null,
    completedAt: null
  },
  {
    id: 'task-005',
    toolId: 'tool-005',
    testerId: 'verified-tester-002',
    title: 'Canva Template Quality Assessment',
    description: 'Evaluate the quality and variety of Canva\'s template library across different design categories.',
    status: 'pending',
    priority: 'low',
    deadline: new Date('2024-12-31'),
    reward: 100,
    assignedAt: new Date(),
    startedAt: null,
    completedAt: null
  }
];

async function addDummyTestingTasks() {
  try {
    console.log('🚀 Starting to add dummy testing tasks...');
    
    // Add dummy testing tasks
    for (const task of dummyTestingTasks) {
      await prisma.testingTask.upsert({
        where: { id: task.id },
        update: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          reward: task.reward,
          assignedAt: task.assignedAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          updatedAt: new Date()
        },
        create: {
          id: task.id,
          toolId: task.toolId,
          testerId: task.testerId,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          reward: task.reward,
          assignedAt: task.assignedAt,
          startedAt: task.startedAt,
          completedAt: task.completedAt,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log(`✅ Added testing task: ${task.title}`);
    }

    console.log('🎉 All dummy testing tasks have been added successfully!');
    
    // Display summary
    const totalTasks = await prisma.testingTask.count();
    const openTasks = await prisma.testingTask.count({ where: { status: 'open' } });
    const inProgressTasks = await prisma.testingTask.count({ where: { status: 'in_progress' } });
    const completedTasks = await prisma.testingTask.count({ where: { status: 'completed' } });
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total tasks: ${totalTasks}`);
    console.log(`- Open tasks: ${openTasks}`);
    console.log(`- In progress: ${inProgressTasks}`);
    console.log(`- Completed: ${completedTasks}`);
    
  } catch (error) {
    console.error('❌ Error adding dummy testing tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addDummyTestingTasks();
