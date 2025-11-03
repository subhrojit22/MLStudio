'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Type, 
  Brain, 
  PlayCircle,
  Hash,
  Grid3x3,
  Layers,
  Zap,
  Move3d,
  TreePine,
  TrendingDown,
  AlertTriangle,
  Shield,
  BarChart3,
  GitBranch,
  Settings,
  Calculator,
  Users
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"


const playgrounds = [
  {
    id: 'decision-tree',
    title: 'Decision Tree Playground',
    description: 'Visualize how decision trees learn to classify data through recursive splitting. See how decision boundaries are formed and understand tree structure.',
    icon: TreePine,
    href: '/playground/decision-tree',
    difficulty: 'Beginner',
    topics: ['Decision Trees', 'Classification', 'Splitting', 'Gini Impurity'],
    color: 'bg-green-500'
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent Visualizer',
    description: 'Watch how optimization algorithms navigate loss surfaces to find minima. See local minima, learning rate impacts, and convergence behavior.',
    icon: TrendingDown,
    href: '/playground/gradient-descent',
    difficulty: 'Intermediate',
    topics: ['Optimization', 'Loss Surfaces', 'Learning Rate', 'Convergence'],
    color: 'bg-blue-500'
  },
  {
    id: 'overfitting',
    title: 'Overfitting/Underfitting Explorer',
    description: 'Compare training and validation curves as model complexity changes. Illustrate bias-variance tradeoff with synthetic data.',
    icon: AlertTriangle,
    href: '/playground/overfitting',
    difficulty: 'Intermediate',
    topics: ['Bias-Variance', 'Model Complexity', 'Generalization', 'Regularization'],
    color: 'bg-orange-500'
  },
  {
    id: 'activation-functions',
    title: 'Activation Function Playground',
    description: 'Explore nonlinearities (ReLU, sigmoid, tanh, etc.), their output profiles and gradients. See how they affect neural network learning.',
    icon: Zap,
    href: '/playground/activation-functions',
    difficulty: 'Beginner',
    topics: ['Activations', 'Gradients', 'Nonlinearity', 'Neural Networks'],
    color: 'bg-purple-500'
  },
  {
    id: 'regularization',
    title: 'Regularization Effect Simulator',
    description: 'See how L1, L2, and dropout regularization shrink weights. Compare training vs. generalization error with clear visualizations.',
    icon: Shield,
    href: '/playground/regularization',
    difficulty: 'Intermediate',
    topics: ['L1/L2 Regularization', 'Dropout', 'Weight Decay', 'Generalization'],
    color: 'bg-indigo-500'
  },
  {
    id: 'batch-normalization',
    title: 'Batch Normalization Visualizer',
    description: 'Understand normalization of intermediate activations during training. See histogram and loss curve feedback in real-time.',
    icon: BarChart3,
    href: '/playground/batch-normalization',
    difficulty: 'Advanced',
    topics: ['Normalization', 'Training Dynamics', 'Internal Covariate Shift'],
    color: 'bg-cyan-500'
  },
  {
    id: 'clustering',
    title: 'Clustering Playground',
    description: 'View how clusters form, update, and merge/separate in real time with 2D data. Trace centroid movements and assignment changes.',
    icon: GitBranch,
    href: '/playground/clustering',
    difficulty: 'Intermediate',
    topics: ['K-Means', 'DBSCAN', 'Clustering', 'Unsupervised Learning'],
    color: 'bg-pink-500'
  },
  {
    id: 'tokenizer',
    title: 'Tokenizer Playground',
    description: 'Explore how text is converted into tokens that ML models can understand. See different tokenization methods and embedding visualizations.',
    icon: Type,
    href: '/playground/tokenizer',
    difficulty: 'Beginner',
    topics: ['Tokenization', 'Embeddings', 'Vocabulary'],
    color: 'bg-blue-500'
  },
  {
    id: 'attention',
    title: 'QKV Attention Simulator',
    description: 'Visualize how scaled dot-product attention works in transformer models. Watch the step-by-step calculation of attention weights.',
    icon: Brain,
    href: '/attention',
    difficulty: 'Intermediate',
    topics: ['Attention', 'Transformers', 'QKV Matrices'],
    color: 'bg-purple-500'
  },
  {
    id: 'cnn',
    title: 'CNN Visualizer',
    description: 'See how convolutions and pooling work on images. Watch filters detect features and build hierarchical representations.',
    icon: Grid3x3,
    href: '/playground/cnn',
    difficulty: 'Intermediate',
    topics: ['Convolutions', 'Pooling', 'Feature Maps'],
    color: 'bg-green-500'
  },
  {
    id: 'rnn',
    title: 'RNN Tracer',
    description: 'Follow hidden states through recurrent networks. Trace information flow across time steps and understand memory mechanisms.',
    icon: Layers,
    href: '/playground/rnn',
    difficulty: 'Advanced',
    topics: ['Hidden States', 'Sequences', 'Memory'],
    color: 'bg-orange-500'
  },
  {
    id: 'latent-space',
    title: 'Latent Space Explorer',
    description: 'Navigate through 2D latent space to generate unique AI images. Each coordinate represents different features and styles.',
    icon: Move3d,
    href: '/latent-space',
    difficulty: 'Intermediate',
    topics: ['Latent Space', 'Generation', 'Coordinates'],
    color: 'bg-indigo-500'
  },
  {
    id: 'vae',
    title: 'VAE Explorer',
    description: 'Explore latent spaces in variational autoencoders. Generate new data and understand the encoder-decoder architecture.',
    icon: Zap,
    href: '/playground/vae',
    difficulty: 'Advanced',
    topics: ['Latent Space', 'Generation', 'Autoencoders'],
    color: 'bg-pink-500'
  },
  {
    id: 'svm',
    title: 'SVM Playground',
    description: 'Visualize how Support Vector Machines find optimal decision boundaries and margins. Explore different kernels and parameters.',
    icon: Settings,
    href: '/playground/svm',
    difficulty: 'Intermediate',
    topics: ['Support Vector Machines', 'Kernels', 'Decision Boundaries', 'Margin'],
    color: 'bg-red-500'
  },
  {
    id: 'naive-bayes',
    title: 'Naive Bayes Visualizer',
    description: 'Explore probabilistic classification with Bayes theorem. See how different Naive Bayes variants handle various data distributions.',
    icon: Calculator,
    href: '/playground/naive-bayes',
    difficulty: 'Beginner',
    topics: ['Bayes Theorem', 'Probabilistic Classification', 'Independence Assumption'],
    color: 'bg-teal-500'
  },
  {
    id: 'ensemble',
    title: 'Ensemble Methods Playground',
    description: 'Discover how combining multiple models improves performance through bagging, boosting, and stacking techniques.',
    icon: Users,
    href: '/playground/ensemble',
    difficulty: 'Advanced',
    topics: ['Bagging', 'Boosting', 'Stacking', 'Model Combination'],
    color: 'bg-violet-500'
  },
  {
    id: 'dimensionality-reduction',
    title: 'Dimensionality Reduction Visualizer',
    description: 'Transform high-dimensional data into lower dimensions using PCA, t-SNE, and UMAP. Compare different reduction techniques.',
    icon: Move3d,
    href: '/playground/dimensionality-reduction',
    difficulty: 'Advanced',
    topics: ['PCA', 't-SNE', 'UMAP', 'Feature Extraction'],
    color: 'bg-emerald-500'
  }
]

export default function PlaygroundPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Interactive Playgrounds</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get hands-on experience with ML concepts through these interactive visualizations and simulators
        </p>
      </motion.div>

      {/* Playgrounds Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {playgrounds.map((playground, index) => (
          <motion.div
            key={playground.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${playground.color} bg-opacity-10`}>
                    <playground.icon className={`h-6 w-6 ${playground.color.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="outline">{playground.difficulty}</Badge>
                </div>
                <CardTitle className="text-xl mb-2">{playground.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {playground.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Topics */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Topics Covered:</h4>
                    <div className="flex flex-wrap gap-1">
                      {playground.topics.slice(0, 3).map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {playground.topics.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{playground.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full group-hover:bg-primary/90 transition-colors" asChild>
                    <Link href={playground.href}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Try Playground
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="h-5 w-5" />
              How to Use These Playgrounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Explore</h3>
                <p className="text-sm text-muted-foreground">
                  Interact with the visualizations and see how different parameters affect the output
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Learn</h3>
                <p className="text-sm text-muted-foreground">
                  Access comprehensive Q&A sections with Why, What, and How explanations for each concept
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Master</h3>
                <p className="text-sm text-muted-foreground">
                  Build intuition through hands-on experience and detailed animated simulations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}