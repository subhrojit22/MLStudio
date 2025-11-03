const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define the chapters we need
const chapters = [
  {
    title: "Introduction to Machine Learning",
    description: "Fundamental concepts of machine learning, types of ML, and basic terminology",
    category: "ml-basics",
    order: 1,
    objectives: JSON.stringify([
      "Understand what machine learning is and how it differs from traditional programming",
      "Learn the main types of machine learning (supervised, unsupervised, reinforcement)",
      "Grasp basic ML terminology and concepts",
      "Understand the ML workflow and lifecycle"
    ]),
    quickRead: "Machine Learning is a branch of Artificial Intelligence that enables computers to learn from data without being explicitly programmed. Unlike traditional programming where rules are manually coded, ML systems discover patterns in data and make predictions or decisions. The three main types are supervised learning (learning from labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through trial and error). ML has revolutionized fields from healthcare to finance, enabling applications like spam detection, image recognition, and recommendation systems.",
    content: "# Introduction to Machine Learning\n\nMachine Learning represents a paradigm shift in how we approach problem-solving with computers. Instead of writing explicit rules, we design systems that can learn patterns from data and improve their performance over time.\n\n## What is Machine Learning?\n\nMachine Learning is a subset of Artificial Intelligence that focuses on developing algorithms that can learn from and make predictions or decisions based on data. The core idea is to enable computers to learn automatically without human intervention or explicit programming.\n\n## Types of Machine Learning\n\n### Supervised Learning\nSupervised learning algorithms learn from labeled training data, where each example has both input features and a known output. The goal is to learn a mapping function that can predict outputs for new, unseen inputs.\n\n### Unsupervised Learning\nUnsupervised learning deals with unlabeled data, seeking to find hidden patterns or intrinsic structures within the input data. Common tasks include clustering, dimensionality reduction, and association rule learning.\n\n### Reinforcement Learning\nReinforcement learning involves an agent that learns to make decisions by performing actions in an environment to maximize a cumulative reward. It's inspired by behavioral psychology and is particularly useful for sequential decision-making problems.\n\n## The Machine Learning Workflow\n\n1. **Data Collection**: Gathering relevant data for the problem\n2. **Data Preprocessing**: Cleaning and preparing the data\n3. **Feature Engineering**: Selecting and transforming relevant features\n4. **Model Selection**: Choosing appropriate algorithms\n5. **Training**: Teaching the model with the prepared data\n6. **Evaluation**: Assessing model performance\n7. **Deployment**: Making the model available for use\n8. **Monitoring**: Tracking performance and updating as needed\n\n## Key Concepts\n\n- **Training vs Testing**: Understanding the importance of splitting data\n- **Overfitting**: When a model learns the training data too well\n- **Cross-validation**: Techniques for reliable model evaluation\n- **Feature Engineering**: The art of creating meaningful features\n- **Model Evaluation**: Metrics for assessing performance",
    timeEstimate: 45,
    isPublished: true
  },
  {
    title: "Linear Regression & Gradient Descent",
    description: "Understanding linear regression, gradient descent optimization, and model evaluation",
    category: "ml-basics", 
    order: 2,
    objectives: JSON.stringify([
      "Master linear regression concepts and mathematics",
      "Understand gradient descent optimization algorithm",
      "Learn about cost functions and loss functions",
      "Grasp the bias-variance tradeoff",
      "Understand regularization techniques"
    ]),
    quickRead: "Linear Regression is one of the fundamental algorithms in machine learning, used for predicting continuous values. It models the relationship between input features and target variables using a linear equation. Gradient Descent is the optimization algorithm that finds the best parameters by minimizing the cost function. Together, they form the foundation for understanding more complex machine learning algorithms and optimization techniques used throughout the field.",
    content: "# Linear Regression & Gradient Descent\n\nLinear Regression and Gradient Descent form the foundation of many machine learning algorithms. Understanding these concepts is crucial for anyone entering the field of machine learning.\n\n## Linear Regression Fundamentals\n\nLinear Regression is a supervised learning algorithm used for predicting continuous numerical values. It assumes a linear relationship between input features and the target variable.\n\n### Mathematical Foundation\n\nThe linear regression equation is:\n\n$$y = \\beta_0 + \\beta_1x_1 + \\beta_2x_2 + ... + \\beta_nx_n + \\epsilon$$\n\nWhere:\n- $y$ is the target variable\n- $\\beta_0$ is the intercept\n- $\\beta_1, \\beta_2, ..., \\beta_n$ are the coefficients\n- $x_1, x_2, ..., x_n$ are the input features\n- $\\epsilon$ is the error term\n\n### Types of Linear Regression\n\n1. **Simple Linear Regression**: One input feature\n2. **Multiple Linear Regression**: Multiple input features\n3. **Polynomial Regression**: Non-linear relationships using polynomial features\n\n## Gradient Descent Optimization\n\nGradient Descent is an iterative optimization algorithm used to find the minimum of a function. In machine learning, it's used to minimize the cost function.\n\n### The Algorithm\n\n1. Initialize parameters randomly\n2. Compute the gradient of the cost function\n3. Update parameters in the opposite direction of the gradient\n4. Repeat until convergence\n\n### Learning Rate\n\nThe learning rate ($\\alpha$) controls how much we adjust the parameters in each iteration:\n- Too high: May overshoot the minimum\n- Too low: Slow convergence\n- Just right: Efficient convergence\n\n### Types of Gradient Descent\n\n1. **Batch Gradient Descent**: Uses entire dataset for each update\n2. **Stochastic Gradient Descent (SGD)**: Uses one example at a time\n3. **Mini-Batch Gradient Descent**: Uses small batches of data\n\n## Cost Functions and Evaluation\n\n### Mean Squared Error (MSE)\n\n$$MSE = \\frac{1}{n}\\sum_{i=1}^{n}(y_i - \\hat{y}_i)^2$$\n\n### R-squared (R²)\n\n$$R^2 = 1 - \\frac{SS_{res}}{SS_{tot}}$$\n\n## Common Challenges\n\n### Multicollinearity\nWhen independent variables are highly correlated, it can lead to unstable coefficient estimates.\n\n### Heteroscedasticity\nWhen the variance of errors is not constant across observations.\n\n### Overfitting\nWhen the model learns the training data too well and doesn't generalize to new data.",
    timeEstimate: 60,
    isPublished: true
  },
  {
    title: "Classification & Logistic Regression",
    description: "Classification algorithms, logistic regression, and evaluation metrics",
    category: "ml-basics",
    order: 3,
    objectives: JSON.stringify([
      "Understand classification vs regression problems",
      "Master logistic regression and the sigmoid function",
      "Learn evaluation metrics (accuracy, precision, recall, F1)",
      "Understand confusion matrices and ROC curves",
      "Learn about multi-class classification strategies"
    ]),
    quickRead: "Classification is a fundamental supervised learning task where we predict discrete categories. Logistic Regression, despite its name, is actually a classification algorithm that uses the sigmoid function to output probabilities. Understanding classification metrics like precision, recall, and F1-score is crucial for evaluating model performance, especially when dealing with imbalanced datasets. These concepts form the foundation for more advanced classification algorithms and real-world applications.",
    content: "# Classification & Logistic Regression\n\nClassification is one of the most common tasks in machine learning, where we predict discrete categories or labels. Logistic Regression is a fundamental classification algorithm that serves as a building block for understanding more complex classification models.\n\n## Understanding Classification\n\nClassification is a supervised learning task where the goal is to predict a discrete class label for given input data. Unlike regression, which predicts continuous values, classification assigns inputs to predefined categories.\n\n### Types of Classification\n\n1. **Binary Classification**: Two mutually exclusive classes (e.g., spam/not spam)\n2. **Multi-Class Classification**: More than two classes (e.g., cat/dog/bird)\n3. **Multi-Label Classification**: Each instance can belong to multiple classes\n\n## Logistic Regression\n\nDespite its name, Logistic Regression is a classification algorithm that predicts the probability that an instance belongs to a particular class.\n\n### The Sigmoid Function\n\nThe sigmoid function maps any real-valued number to a value between 0 and 1:\n\n$$\\sigma(x) = \\frac{1}{1 + e^{-x}}$$\n\n### Logistic Regression Equation\n\n$$P(y=1|x) = \\frac{1}{1 + e^{-(\\beta_0 + \\beta_1x_1 + ... + \\beta_nx_n)}}$$\n\n### Decision Boundary\n\nThe decision boundary is the threshold that separates classes. For binary classification, this is typically 0.5.\n\n## Model Evaluation Metrics\n\n### Confusion Matrix\n\nA confusion matrix provides a detailed breakdown of predictions:\n\n- **True Positives (TP)**: Correctly predicted positive instances\n- **True Negatives (TN)**: Correctly predicted negative instances\n- **False Positives (FP)**: Incorrectly predicted as positive\n- **False Negatives (FN)**: Incorrectly predicted as negative\n\n### Key Metrics\n\n**Accuracy**: $$\\frac{TP + TN}{TP + TN + FP + FN}$$\n\n**Precision**: $$\\frac{TP}{TP + FP}$$\n\n**Recall (Sensitivity)**: $$\\frac{TP}{TP + FN}$$\n\n**F1-Score**: $$2 \\times \\frac{Precision \\times Recall}{Precision + Recall}$$\n\n### ROC Curve and AUC\n\nThe ROC curve plots the true positive rate against the false positive rate at various threshold settings. AUC (Area Under the Curve) provides a single measure of model performance.\n\n## Multi-Class Classification\n\n### One-vs-Rest (OvR)\nTrain N binary classifiers, each distinguishing one class from all others.\n\n### One-vs-One (OvO)\nTrain N×(N-1)/2 binary classifiers, each distinguishing between pairs of classes.\n\n## Common Challenges\n\n### Class Imbalance\nWhen classes are not equally represented, accuracy can be misleading.\n\n### Overfitting\nWhen the model learns the training data too well and doesn't generalize.\n\n### Feature Scaling\nDifferent scales can affect model performance and convergence.",
    timeEstimate: 55,
    isPublished: true
  },
  {
    title: "Neural Networks Fundamentals",
    description: "Introduction to neural networks, activation functions, and backpropagation",
    category: "deep-learning",
    order: 4,
    objectives: JSON.stringify([
      "Understand the basic structure of neural networks",
      "Learn about different activation functions",
      "Master backpropagation algorithm",
      "Understand the vanishing/exploding gradient problems",
      "Learn about weight initialization and optimization"
    ]),
    quickRead: "Neural Networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers that process information. Key concepts include activation functions that introduce non-linearity, backpropagation for learning, and the challenges of training deep networks like vanishing gradients. Understanding these fundamentals is essential for working with modern deep learning architectures.",
    content: "# Neural Networks Fundamentals\n\nNeural Networks are powerful computational models inspired by the structure and function of biological neural networks in the human brain. They form the foundation of deep learning and have revolutionized fields from computer vision to natural language processing.\n\n## Basic Structure\n\nA neural network consists of layers of interconnected nodes (neurons):\n\n- **Input Layer**: Receives the raw data\n- **Hidden Layers**: Perform transformations and feature extraction\n- **Output Layer**: Produces the final prediction or classification\n\n## The Perceptron\n\nThe perceptron is the simplest neural network unit, consisting of:\n1. Input nodes with weights\n2. A summation function\n3. An activation function\n4. An output\n\nMathematically: $$y = f(\\sum_{i=1}^{n} w_i x_i + b)$$\n\n## Activation Functions\n\nActivation functions introduce non-linearity, enabling neural networks to learn complex patterns.\n\n### Common Activation Functions\n\n**Sigmoid**: $$\\sigma(x) = \\frac{1}{1 + e^{-x}}$$\n- Range: (0, 1)\n- Used in output layers for binary classification\n\n**Tanh**: $$\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}$$\n- Range: (-1, 1)\n- Zero-centered, often used in hidden layers\n\n**ReLU (Rectified Linear Unit)**: $$f(x) = \\max(0, x)$$\n- Range: [0, ∞)\n- Most popular for hidden layers\n- Helps with vanishing gradient problem\n\n**Softmax**: Used in output layer for multi-class classification\n- Converts logits to probabilities\n- Outputs sum to 1\n\n## Backpropagation\n\nBackpropagation is the algorithm used to train neural networks:\n\n1. **Forward Pass**: Compute predictions\n2. **Calculate Loss**: Compare predictions with actual values\n3. **Backward Pass**: Compute gradients using chain rule\n4. **Update Weights**: Adjust weights to minimize loss\n\n## Training Challenges\n\n### Vanishing Gradients\nGradients become extremely small as they propagate backward through many layers, making it difficult to train deep networks.\n\n### Exploding Gradients\nGradients become extremely large, causing unstable updates and numerical overflow.\n\n### Solutions\n- **ReLU Activation**: Helps prevent vanishing gradients\n- **Gradient Clipping**: Prevents exploding gradients\n- **Batch Normalization**: Normalizes activations\n- **Skip Connections**: As in ResNet architecture\n- **Proper Weight Initialization**: Xavier/He initialization\n\n## Universal Approximation Theorem\n\nA feedforward neural network with a single hidden layer can approximate any continuous function on compact subsets of $\\mathbb{R}^n$, given sufficient neurons.\n\n## Optimization Algorithms\n\nWhile Gradient Descent is fundamental, modern deep learning uses more sophisticated optimizers:\n- **Adam**: Adaptive moment estimation\n- **RMSprop**: Root mean square propagation\n- **AdaGrad**: Adaptive gradient algorithm\n- **SGD with Momentum**: Accelerates convergence",
    timeEstimate: 70,
    isPublished: true
  },
  {
    title: "Convolutional Neural Networks",
    description: "CNN architecture, convolution operations, pooling, and computer vision applications",
    category: "deep-learning",
    order: 5,
    objectives: JSON.stringify([
      "Understand convolution operations and filters",
      "Learn about pooling layers and their purpose",
      "Master CNN architecture patterns",
      "Understand padding, stride, and parameter sharing",
      "Learn about famous CNN architectures (AlexNet, VGG, ResNet)"
    ]),
    quickRead: "Convolutional Neural Networks are specialized neural networks designed for processing grid-like data, particularly images. They use convolution operations to detect features like edges and textures, pooling to reduce dimensionality, and parameter sharing to efficiently process spatial data. CNNs have revolutionized computer vision and are the foundation for modern image recognition, object detection, and many other vision tasks.",
    content: "# Convolutional Neural Networks\n\nConvolutional Neural Networks (CNNs) are a specialized class of neural networks designed for processing grid-like data, particularly images. They have revolutionized computer vision and achieved state-of-the-art performance in various visual recognition tasks.\n\n## Core Concepts\n\n### Convolution Operation\n\nThe convolution operation applies a filter (kernel) across the input image to extract features:\n\n1. Position the filter over a region of the input\n2. Perform element-wise multiplication\n3. Sum the products to get a single output value\n4. Slide the filter across the entire input\n\n### Key Components\n\n**Filters/Kernels**: Small matrices that detect specific features (edges, textures, patterns)\n\n**Feature Maps**: Output of convolution operations, representing detected features\n\n**Parameter Sharing**: Same filter applied across all spatial locations\n\n**Local Connectivity**: Each neuron connected to only a small region of input\n\n## Pooling Layers\n\nPooling reduces spatial dimensions and provides translation invariance:\n\n### Max Pooling\n- Takes the maximum value from each window\n- Most commonly used\n- Preserves the strongest features\n\n### Average Pooling\n- Computes the average of values in each window\n- Provides smoother downsampling\n\n### Benefits of Pooling\n- Reduces computational requirements\n- Provides translation invariance\n- Helps prevent overfitting\n- Extracts dominant features\n\n## CNN Architecture\n\n### Typical CNN Architecture\n1. **Convolutional Layers**: Feature extraction\n2. **Activation Functions**: Non-linearity (usually ReLU)\n3. **Pooling Layers**: Downsampling\n4. **Fully Connected Layers**: Classification\n5. **Output Layer**: Final predictions\n\n### Important Parameters\n\n**Padding**: Adding pixels around borders to control output size\n- Valid Padding: No padding, smaller output\n- Same Padding: Padding to maintain same spatial size\n\n**Stride**: Step size for filter movement\n- Stride 1: Detailed feature extraction\n- Stride 2+: Downsampling\n\n## Famous CNN Architectures\n\n### LeNet-5 (1998)\n- One of the earliest successful CNNs\n- Handwritten digit recognition\n- Established basic CNN pattern\n\n### AlexNet (2012)\n- Won ImageNet competition\n- Popularized deep CNNs\n- Introduced ReLU and dropout\n- Used GPU training\n\n### VGG (2014)\n- Demonstrated importance of depth\n- Consistent 3×3 filters\n- Simple, elegant architecture\n\n### GoogLeNet/Inception (2014)\n- Inception modules with parallel convolutions\n- More efficient parameter usage\n- Multi-scale feature extraction\n\n### ResNet (2015)\n- Introduced skip connections\n- Enabled training of very deep networks (100+ layers)\n- Solved vanishing gradient problem\n\n### Modern Architectures\n- **MobileNet**: Efficient for mobile devices\n- **EfficientNet**: Balanced performance and efficiency\n- **Vision Transformer**: Attention-based vision models\n\n## Applications\n\n- **Image Classification**: Categorizing images\n- **Object Detection**: Locating and classifying objects\n- **Semantic Segmentation**: Pixel-level classification\n- **Face Recognition**: Identifying individuals\n- **Medical Imaging**: Disease detection and diagnosis\n- **Autonomous Vehicles**: Scene understanding",
    timeEstimate: 80,
    isPublished: true
  },
  {
    title: "Recurrent Neural Networks",
    description: "RNN architecture, LSTM, GRU, and sequential data processing",
    category: "deep-learning",
    order: 6,
    objectives: JSON.stringify([
      "Understand sequential data and RNN architecture",
      "Master Backpropagation Through Time (BPTT)",
      "Learn about LSTM and GRU architectures",
      "Understand bidirectional RNNs",
      "Explore NLP applications of RNNs"
    ]),
    quickRead: "Recurrent Neural Networks are designed for sequential data processing, maintaining an internal memory of past inputs. They excel at tasks involving temporal dependencies like language modeling and time series prediction. LSTM and GRU architectures address the vanishing gradient problem, enabling learning of long-term dependencies. RNNs form the foundation for many NLP applications and sequential modeling tasks.",
    content: "# Recurrent Neural Networks\n\nRecurrent Neural Networks (RNNs) are a class of neural networks designed for processing sequential data, where the output from previous steps influences the current step. They maintain an internal memory that captures information about past inputs, making them ideal for tasks involving temporal dependencies.\n\n## Sequential Data and RNNs\n\n### Why RNNs?\n\nTraditional neural networks assume independent inputs, but many real-world problems involve sequences:\n- Natural language (words depend on previous words)\n- Time series (stock prices, weather)\n- Video (frames depend on previous frames)\n- Speech (audio samples have temporal structure)\n\n### RNN Architecture\n\nKey characteristics:\n- **Loops**: Allow information to persist\n- **Shared Parameters**: Same weights applied at each time step\n- **Internal State**: Memory of previous inputs\n- **Variable Length**: Can handle sequences of different lengths\n\n## Backpropagation Through Time (BPTT)\n\nBPTT is the algorithm for training RNNs:\n\n1. **Unroll**: Treat each time step as a layer\n2. **Forward Pass**: Compute outputs for all time steps\n3. **Backward Pass**: Propagate errors through time\n4. **Update Weights**: Adjust parameters using accumulated gradients\n\n### Challenges with BPTT\n\n**Vanishing Gradients**: Gradients become extremely small over long sequences\n**Exploding Gradients**: Gradients become extremely large\n**Computational Cost**: Unrolling can be memory intensive\n\n## Long Short-Term Memory (LSTM)\n\nLSTMs address the vanishing gradient problem with a more sophisticated architecture:\n\n### Components\n\n**Cell State**: Long-term memory highway\n**Forget Gate**: Decides what information to discard\n**Input Gate**: Decides what new information to store\n**Output Gate**: Decides what information to output\n\n### LSTM Equations\n\n**Forget Gate**: $$f_t = \\sigma(W_f \\cdot [h_{t-1}, x_t] + b_f)$$\n\n**Input Gate**: $$i_t = \\sigma(W_i \\cdot [h_{t-1}, x_t] + b_i)$$\n\n**Candidate Values**: $$\\tilde{C}_t = \\tanh(W_C \\cdot [h_{t-1}, x_t] + b_C)$$\n\n**Cell State Update**: $$C_t = f_t \\circ C_{t-1} + i_t \\circ \\tilde{C}_t$$\n\n**Output Gate**: $$o_t = \\sigma(W_o \\cdot [h_{t-1}, x_t] + b_o)$$\n\n**Hidden State**: $$h_t = o_t \\circ \\tanh(C_t)$$\n\n## Gated Recurrent Unit (GRU)\n\nGRU is a simplified version of LSTM with fewer parameters:\n\n### Components\n\n**Reset Gate**: Decides how much past information to forget\n**Update Gate**: Combines forget and input gates from LSTM\n\n### Advantages\n- Fewer parameters than LSTM\n- Faster training\n- Often comparable performance\n\n## Bidirectional RNNs\n\nProcess sequences in both directions:\n\n- **Forward RNN**: Past to future\n- **Backward RNN**: Future to past\n- **Combined Output**: Information from both directions\n\n### Applications\n- Named Entity Recognition\n- Machine Translation\n- Sentiment Analysis\n\n## Applications in NLP\n\n### Language Modeling\nPredicting the next word in a sequence\n\n### Machine Translation\nConverting text from one language to another\n\n### Sentiment Analysis\nDetermining emotional tone of text\n\n### Text Generation\nCreating coherent text based on input\n\n### Speech Recognition\nConverting spoken language to text\n\n## Modern Alternatives\n\nWhile RNNs were revolutionary, modern NLP often uses:\n- **Transformers**: Attention-based models\n- **BERT**: Bidirectional encoder representations\n- **GPT**: Generative pre-trained transformers\n\nHowever, RNNs remain important for:\n- Resource-constrained environments\n- Streaming applications\n- Certain time series tasks\n- Educational purposes",
    timeEstimate: 75,
    isPublished: true
  }
];

async function createChapters() {
  console.log('Creating ML chapters...');
  
  for (const chapter of chapters) {
    try {
      // First try to find existing chapter by title and order
      const existingChapter = await prisma.chapter.findFirst({
        where: {
          title: chapter.title
        }
      });
      
      let result;
      if (existingChapter) {
        // Update existing chapter
        result = await prisma.chapter.update({
          where: { id: existingChapter.id },
          data: chapter
        });
        console.log(`✅ Updated chapter: ${result.title}`);
      } else {
        // Create new chapter
        result = await prisma.chapter.create({
          data: chapter
        });
        console.log(`✅ Created chapter: ${result.title}`);
      }
    } catch (error) {
      console.error(`❌ Error creating chapter ${chapter.title}:`, error);
    }
  }
}

async function main() {
  try {
    await createChapters();
    console.log('✅ All chapters created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();