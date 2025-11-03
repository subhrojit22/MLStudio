import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const sampleChapters = [
  {
    title: "Introduction to Machine Learning",
    description: "Learn the fundamental concepts of machine learning, including types of ML, supervised vs unsupervised learning, and the ML workflow.",
    category: "ml-basics",
    objectives: JSON.stringify([
      "Understand the difference between supervised, unsupervised, and reinforcement learning",
      "Identify common ML problems and their appropriate solutions",
      "Explain the machine learning workflow from data to deployment",
      "Recognize key terminology and concepts in ML"
    ]),
    quickRead: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. In this introduction, you'll discover the three main types of machine learning: supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error). We'll explore real-world applications and understand when to use each approach.",
    content: "<h2>What is Machine Learning?</h2><p>Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention.</p><h2>Types of Machine Learning</h2><p>There are three main types of machine learning:</p><ul><li><strong>Supervised Learning:</strong> Learning from labeled data</li><li><strong>Unsupervised Learning:</strong> Finding patterns in unlabeled data</li><li><strong>Reinforcement Learning:</strong> Learning through trial and error</li></ul>",
    notebookUrl: "https://colab.research.google.com/drive/1sample",
    timeEstimate: 45,
    order: 1,
    isPublished: true
  },
  {
    title: "Linear Regression & Gradient Descent",
    description: "Master linear regression, one of the fundamental algorithms in machine learning, and understand how gradient descent optimizes model parameters.",
    category: "ml-basics",
    objectives: JSON.stringify([
      "Implement linear regression from scratch using NumPy",
      "Understand the role of gradient descent in optimization",
      "Calculate and interpret regression metrics like MSE and R²",
      "Apply feature scaling and regularization techniques"
    ]),
    quickRead: "Linear regression is the foundation of many machine learning algorithms. You'll learn how to model relationships between variables using linear equations, understand the concept of cost functions, and implement gradient descent to find optimal parameters. This chapter provides the mathematical intuition and practical skills needed for more complex algorithms.",
    content: "<h2>Linear Regression</h2><p>Linear regression is a linear approach to modeling the relationship between a dependent variable and one or more independent variables.</p><h2>Gradient Descent</h2><p>Gradient descent is an optimization algorithm used to minimize the cost function in machine learning models.</p>",
    notebookUrl: "https://colab.research.google.com/drive/2sample",
    timeEstimate: 60,
    order: 2,
    isPublished: true
  },
  {
    title: "Classification & Logistic Regression",
    description: "Learn classification techniques and implement logistic regression for binary and multi-class classification problems.",
    category: "ml-basics",
    objectives: JSON.stringify([
      "Differentiate between regression and classification problems",
      "Implement logistic regression with sigmoid activation",
      "Understand decision boundaries and classification metrics",
      "Handle multi-class classification using one-vs-all approach"
    ]),
    quickRead: "While linear regression predicts continuous values, classification problems require discrete outputs. Logistic regression extends linear regression to classification tasks using the sigmoid function. You'll learn about probability thresholds, decision boundaries, and evaluation metrics like accuracy, precision, and recall.",
    content: "<h2>Classification vs Regression</h2><p>Classification problems involve predicting discrete categories, while regression predicts continuous values.</p><h2>Logistic Regression</h2><p>Logistic regression uses the sigmoid function to model probability of belonging to a particular class.</p>",
    notebookUrl: "https://colab.research.google.com/drive/3sample",
    timeEstimate: 55,
    order: 3,
    isPublished: true
  },
  {
    title: "Neural Networks Fundamentals",
    description: "Dive into the world of neural networks, understanding perceptrons, activation functions, and backpropagation.",
    category: "deep-learning",
    objectives: JSON.stringify([
      "Build a simple perceptron from scratch",
      "Understand different activation functions and their use cases",
      "Implement forward and backward propagation",
      "Explain how neural networks learn through gradient descent"
    ]),
    quickRead: "Neural networks are inspired by the human brain and consist of interconnected layers of nodes. You'll start with the basic building block - the perceptron - and gradually build up to multi-layer networks. Understanding backpropagation is crucial as it's how neural networks learn from errors and improve their predictions.",
    content: "<h2>From Perceptrons to Neural Networks</h2><p>A perceptron is the simplest neural network, consisting of a single layer of weights and an activation function.</p><h2>Backpropagation</h2><p>Backpropagation is the algorithm used to train neural networks by adjusting weights based on the error gradient.</p>",
    notebookUrl: "https://colab.research.google.com/drive/4sample",
    timeEstimate: 70,
    order: 4,
    isPublished: true
  },
  {
    title: "Convolutional Neural Networks",
    description: "Master CNNs for image recognition, understanding convolutions, pooling layers, and feature hierarchies.",
    category: "deep-learning",
    objectives: JSON.stringify([
      "Implement convolution operations from scratch",
      "Understand the role of pooling layers in downsampling",
      "Build a CNN architecture for image classification",
      "Visualize feature maps and understand what CNNs learn"
    ]),
    quickRead: "Convolutional Neural Networks revolutionized computer vision by automatically learning hierarchical features from images. You'll understand how convolution operations detect patterns, pooling reduces spatial dimensions, and multiple layers create increasingly abstract representations. This chapter covers both the intuition and implementation of CNNs.",
    content: "<h2>Convolutions</h2><p>Convolution operations apply filters to input images to detect features like edges, textures, and shapes.</p><h2>Pooling Layers</h2><p>Pooling layers reduce spatial dimensions while preserving important features.</p>",
    notebookUrl: "https://colab.research.google.com/drive/5sample",
    timeEstimate: 80,
    order: 5,
    isPublished: true
  },
  {
    title: "Recurrent Neural Networks",
    description: "Explore RNNs for sequential data, understanding hidden states, vanishing gradients, and LSTMs.",
    category: "deep-learning",
    objectives: JSON.stringify([
      "Implement basic RNN cells for sequence processing",
      "Understand the problem of vanishing/exploding gradients",
      "Build LSTM and GRU networks for long sequences",
      "Apply RNNs to text generation and time series prediction"
    ]),
    quickRead: "Recurrent Neural Networks are designed to handle sequential data by maintaining hidden states that capture information from previous time steps. You'll learn about the challenges of training RNNs, including vanishing gradients, and how advanced architectures like LSTMs and GRUs overcome these limitations.",
    content: "<h2>Sequential Data Processing</h2><p>RNNs process sequences by maintaining a hidden state that captures information from previous time steps.</p><h2>LSTMs and GRUs</h2><p>Long Short-Term Memory networks use gates to control information flow and mitigate vanishing gradients.</p>",
    notebookUrl: "https://colab.research.google.com/drive/6sample",
    timeEstimate: 75,
    order: 6,
    isPublished: true
  }
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.fAQ.deleteMany({})
  await prisma.chapter.deleteMany()
  console.log('Cleared existing chapters and FAQs')

  // Insert sample chapters
  await prisma.chapter.createMany({
    data: sampleChapters
  })
  console.log('Sample chapters created successfully!')

  // Seed FAQs from faqs.json
  const faqData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'faqs.json'), 'utf-8'));

  const chapters = await prisma.chapter.findMany({
    select: { id: true, title: true }
  })
  if (chapters.length === 0) {
    console.log('No chapters found to associate FAQs with.')
    return
  }

  let totalFAQs = 0
  for (const chapterData of faqData) {
    const chapter = chapters.find(c => c.title === chapterData.chapterTitle)
    if (!chapter) {
      console.log(`Chapter not found: ${chapterData.chapterTitle}`)
      continue
    }
    for (const faq of chapterData.faqs) {
      await prisma.fAQ.create({
        data: {
          chapterId: chapter.id,
          question: faq.question,
          easyAnswer: faq.easyAnswer,
          detailedAnswer: faq.detailedAnswer,
          category: faq.category,
          difficulty: faq.difficulty,
          tags: JSON.stringify(faq.tags),
          order: totalFAQs + 1
        }
      })
      totalFAQs++
    }
  }
  console.log(`Successfully seeded ${totalFAQs} FAQs`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })