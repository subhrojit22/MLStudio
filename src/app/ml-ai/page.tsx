'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProgressTracker from "@/components/ProgressTracker"
import { 
  BookOpen, 
  Brain, 
  Target, 
  Zap, 
  BarChart3, 
  Network,
  Database,
  Settings,
  Play,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Lightbulb,
  Award,
  Users
} from "lucide-react"
import { motion } from "framer-motion"

interface Topic {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration: string
  icon: React.ReactNode
  progress: number
  topics: string[]
  animations: number
  prerequisites?: string[]
}

const mlTopics: Topic[] = [
  {
    id: 'foundations',
    title: 'Foundational Machine Learning',
    description: 'Core concepts that form the backbone of ML and AI',
    difficulty: 'beginner',
    duration: '8 hours',
    icon: <BookOpen className="h-6 w-6" />,
    progress: 0,
    topics: [
      'Data Preprocessing (Cleaning, Normalization, Imputation)',
      'Bias, Variance, and Overfitting/Underfitting',
      'Feature Engineering',
      'Evaluation Metrics (MSE, Accuracy, F1 score, ROC/AUC)',
      'Supervised vs. Unsupervised Learning'
    ],
    animations: 25
  },
  {
    id: 'intermediate',
    title: 'Intermediate ML & AI',
    description: 'Essential algorithms and techniques for practical ML',
    difficulty: 'intermediate',
    duration: '12 hours',
    icon: <BarChart3 className="h-6 w-6" />,
    progress: 0,
    topics: [
      'Clustering Algorithms (K-means, Hierarchical, DBSCAN)',
      'Dimensionality Reduction (PCA, t-SNE)',
      'Ensemble Methods (Bagging, Boosting, Stacking)',
      'Model Selection and Hyperparameter Tuning',
      'Natural Language Processing Basics'
    ],
    animations: 35,
    prerequisites: ['foundations']
  },
  {
    id: 'advanced',
    title: 'Advanced ML & Deep Learning',
    description: 'Sophisticated algorithms and neural network architectures',
    difficulty: 'advanced',
    duration: '16 hours',
    icon: <Brain className="h-6 w-6" />,
    progress: 0,
    topics: [
      'Decision Trees and Random Forests',
      'Support Vector Machines (SVMs)',
      'Gradient Descent Variants',
      'Unsupervised Topic Modeling (LDA, NMF)',
      'Deep Learning and Neural Networks'
    ],
    animations: 45,
    prerequisites: ['intermediate']
  },
  {
    id: 'llm',
    title: 'Large Language Models & AI Specializations',
    description: 'Cutting-edge AI models and specialized applications',
    difficulty: 'advanced',
    duration: '20 hours',
    icon: <Target className="h-6 w-6" />,
    progress: 0,
    topics: [
      'Transfer Learning and Efficient Fine-Tuning',
      'Multimodal Models (Images, Text, Audio)',
      'Continuous Learning & Model Deployment',
      'Explainability and Model Interpretability'
    ],
    animations: 40,
    prerequisites: ['advanced']
  },
  {
    id: 'expert',
    title: 'Expert Topics and Current Challenges',
    description: 'Advanced concepts and real-world AI challenges',
    difficulty: 'expert',
    duration: '24 hours',
    icon: <Award className="h-6 w-6" />,
    progress: 0,
    topics: [
      'Scalability and Big Data ML',
      'Model Robustness and Adversarial Attacks',
      'Regulatory, Ethical, and Societal Impacts'
    ],
    animations: 30,
    prerequisites: ['llm']
  }
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
    case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'expert': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return <CheckCircle className="h-4 w-4" />
    case 'intermediate': return <TrendingUp className="h-4 w-4" />
    case 'advanced': return <Zap className="h-4 w-4" />
    case 'expert': return <Star className="h-4 w-4" />
    default: return <BookOpen className="h-4 w-4" />
  }
}

export default function MLEducationPlatform() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const totalProgress = mlTopics.reduce((acc, topic) => acc + topic.progress, 0) / mlTopics.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ML/AI Education Platform</h1>
                <p className="text-sm text-gray-600">Interactive visualizations and animated tutorials</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Overall Progress</p>
                <p className="text-xs text-gray-600">{Math.round(totalProgress)}% Complete</p>
              </div>
              <Progress value={totalProgress} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 py-12"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Master Machine Learning & AI with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Interactive Visualizations
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn complex ML concepts through animated simulations, interactive diagrams, 
                and step-by-step visual tutorials designed to make advanced topics accessible.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning
                </Button>
                <Button variant="outline" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Topics
                </Button>
              </div>
            </motion.div>

            {/* Learning Path */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {mlTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/ml-ai/${topic.id === 'foundations' ? 'foundations' : topic.id === 'intermediate' ? 'intermediate' : topic.id === 'advanced' ? 'advanced' : topic.id === 'llm' ? 'llm' : 'expert'}`}>
                    <Card className={`h-full border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer ${
                      selectedTopic === topic.id ? 'border-primary' : 'border-transparent'
                    }`}>
                      <CardHeader className="text-center pb-3">
                        <div className={`mx-auto p-3 rounded-full ${getDifficultyColor(topic.difficulty)}`}>
                          {topic.icon}
                        </div>
                        <CardTitle className="text-lg">{topic.title}</CardTitle>
                        <div className="flex items-center justify-center gap-2">
                          {getDifficultyIcon(topic.difficulty)}
                          <Badge variant="secondary" className={getDifficultyColor(topic.difficulty)}>
                            {topic.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <CardDescription className="text-sm">
                          {topic.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{topic.duration}</span>
                          <Network className="h-3 w-3 ml-2" />
                          <span>{topic.animations} animations</span>
                        </div>
                        <Progress value={topic.progress} className="h-2" />
                        <p className="text-xs text-gray-500 text-center">
                          {topic.progress}% complete
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center">
                  <div className="mx-auto p-2 bg-blue-500 rounded-lg">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Animated Simulations</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    175+ interactive animations bringing complex concepts to life
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader className="text-center">
                  <div className="mx-auto p-2 bg-green-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Step-by-Step Learning</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Progressive difficulty with prerequisites and clear learning paths
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader className="text-center">
                  <div className="mx-auto p-2 bg-purple-500 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Visual Explanations</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Complex algorithms broken down into intuitive visual diagrams
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-orange-50/50">
                <CardHeader className="text-center">
                  <div className="mx-auto p-2 bg-orange-500 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">Practical Examples</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">
                    Real-world applications and hands-on exercises
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics" className="space-y-8">
            <div className="grid gap-8">
              {mlTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${getDifficultyColor(topic.difficulty)}`}>
                            {topic.icon}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{topic.title}</CardTitle>
                            <CardDescription className="text-base mt-1">
                              {topic.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(topic.difficulty)}>
                            {getDifficultyIcon(topic.difficulty)}
                            {topic.difficulty}
                          </Badge>
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Topics Covered:</h4>
                          <ul className="space-y-1">
                            {topic.topics.map((subtopic, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {subtopic}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Learning Details:</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>Duration: {topic.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Network className="h-4 w-4 text-gray-500" />
                              <span>{topic.animations} Interactive Animations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Database className="h-4 w-4 text-gray-500" />
                              <span>Hands-on Exercises</span>
                            </div>
                            {topic.prerequisites && (
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-500" />
                                <span>Prerequisites: {topic.prerequisites.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm text-gray-600">{topic.progress}% Complete</span>
                        </div>
                        <Progress value={topic.progress} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-8">
            <ProgressTracker items={mlTopics.map(topic => ({
              id: topic.id,
              title: topic.title,
              description: topic.description,
              progress: topic.progress,
              timeSpent: Math.floor(topic.progress * parseInt(topic.duration) / 100),
              totalTopics: topic.topics.length,
              completedTopics: topic.topics.slice(0, Math.floor(topic.progress * topic.topics.length / 100)),
              estimatedTime: topic.duration,
              difficulty: topic.difficulty
            }))} />
          </TabsContent>

          <TabsContent value="resources" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    FreeCodeCamp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Essential ML concepts with step-by-step animations
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Visit Resource
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Neptune.ai
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Neural network visualization techniques
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Visit Resource
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    YouTube Channels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Narrated animated walkthroughs for all levels
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Visit Resource
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}