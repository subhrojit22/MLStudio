'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Pause, RotateCcw, Settings, Info, Zap, Target, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface QA {
  question: string
  answer: string
  type: 'why' | 'what' | 'how'
}

interface SectionQA {
  [key: string]: QA[]
}

const qaData: SectionQA = {
  'overview': [
    {
      question: "Why do we need Support Vector Machines?",
      answer: "SVMs are powerful because they find the optimal decision boundary that maximizes the margin between classes. This makes them robust to overfitting and effective in high-dimensional spaces, especially when the number of dimensions exceeds the number of samples.",
      type: 'why'
    },
    {
      question: "What is a Support Vector Machine?",
      answer: "SVM is a supervised learning algorithm that finds the optimal hyperplane that best separates data points of different classes. It works by maximizing the margin - the distance between the hyperplane and the nearest data points from each class.",
      type: 'what'
    },
    {
      question: "How does SVM work?",
      answer: "SVM works by: 1) Finding data points that are closest to the decision boundary (support vectors), 2) Calculating the optimal hyperplane that maximizes the margin between these support vectors, 3) Using kernel functions to transform data for non-linear separation.",
      type: 'how'
    }
  ],
  'kernels': [
    {
      question: "Why do we need different kernels in SVM?",
      answer: "Different kernels allow SVM to handle various data patterns. Linear kernels work for linearly separable data, while RBF, polynomial, and sigmoid kernels can capture complex non-linear relationships by transforming data into higher-dimensional spaces.",
      type: 'why'
    },
    {
      question: "What are SVM kernels?",
      answer: "Kernels are functions that transform input data into a higher-dimensional space where it becomes linearly separable. Common kernels include linear, polynomial (RBF), and sigmoid, each suited for different types of data distributions.",
      type: 'what'
    },
    {
      question: "How do kernels transform data?",
      answer: "Kernels use the kernel trick to compute dot products in high-dimensional space without explicitly transforming the data. For example, RBF kernel creates infinite-dimensional space where similar points are close together, enabling complex decision boundaries.",
      type: 'how'
    }
  ],
  'parameters': [
    {
      question: "Why is the C parameter important in SVM?",
      answer: "The C parameter controls the trade-off between maximizing the margin and minimizing classification errors. A small C creates a wider margin but allows misclassifications (soft margin), while a large C creates a narrower margin but penalizes misclassifications heavily.",
      type: 'why'
    },
    {
      question: "What is the gamma parameter in RBF kernel?",
      answer: "Gamma defines how much influence a single training example has. A small gamma means far influence (smoother decision boundary), while a large gamma means close influence (more complex boundary that can overfit).",
      type: 'what'
    },
    {
      question: "How do you tune SVM parameters?",
      answer: "Use cross-validation to find optimal C and gamma values. Start with default values, then use grid search or random search. For C, try logarithmic scale (0.01, 0.1, 1, 10, 100). For gamma, try values like 0.001, 0.01, 0.1, 1.",
      type: 'how'
    }
  ],
  'applications': [
    {
      question: "Why are SVMs good for text classification?",
      answer: "SVMs excel in text classification because they work well in high-dimensional spaces (where each word is a dimension), are memory efficient, and can handle sparse data effectively. They're particularly good with bag-of-words and TF-IDF features.",
      type: 'why'
    },
    {
      question: "What are common applications of SVM?",
      answer: "SVMs are widely used in: text classification (spam detection, sentiment analysis), image recognition, bioinformatics (protein classification, cancer detection), handwriting recognition, and financial applications (credit scoring, fraud detection).",
      type: 'what'
    },
    {
      question: "How do SVMs compare to neural networks?",
      answer: "SVMs work better with smaller datasets and provide theoretical guarantees about optimality. Neural networks excel with large datasets and complex patterns. SVMs are easier to interpret and train, while neural networks can learn hierarchical features but require more data and tuning.",
      type: 'how'
    }
  ]
}

interface DataPoint {
  x: number
  y: number
  label: number
  isSupportVector?: boolean
}

interface SVMModel {
  weights: { x: number;
import BackButton from "@/components/BackButton" y: number }
  bias: number
  supportVectors: DataPoint[]
  kernel: string
  C: number
  gamma: number
}

export default function SVMPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [model, setModel] = useState<SVMModel | null>(null)
  const [kernel, setKernel] = useState('linear')
  const [C, setC] = useState(1.0)
  const [gamma, setGamma] = useState(0.5)
  const [datasetType, setDatasetType] = useState('linear')
  const [numPoints, setNumPoints] = useState(50)
  const [showMargin, setShowMargin] = useState(true)
  const [showSupportVectors, setShowSupportVectors] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [decisionBoundary, setDecisionBoundary] = useState<ImageData | null>(null)
  
  // QA state
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('svm')

  // Helper function
  const toggleQA = (qaKey: string) => {
    setExpandedQA(prev => {
      const newSet = new Set(prev)
      if (newSet.has(qaKey)) {
        newSet.delete(qaKey)
      } else {
        newSet.add(qaKey)
      }
      return newSet
    })
  }

  // Generate synthetic datasets
  const generateDataset = useCallback((type: string, numPoints: number): DataPoint[] => {
    const points: DataPoint[] = []
    
    switch (type) {
      case 'linear':
        // Linearly separable data
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            x: Math.random() * 4 - 2,
            y: Math.random() * 2 - 1,
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            x: Math.random() * 4 - 2,
            y: Math.random() * 2 - 3,
            label: -1
          })
        }
        break
        
      case 'xor':
        // XOR pattern - requires non-linear kernel
        for (let i = 0; i < numPoints / 4; i++) {
          points.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 4; i++) {
          points.push({
            x: Math.random() * 2 + 1,
            y: Math.random() * 2 + 1,
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 4; i++) {
          points.push({
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 + 1,
            label: -1
          })
        }
        for (let i = 0; i < numPoints / 4; i++) {
          points.push({
            x: Math.random() * 2 + 1,
            y: Math.random() * 2 - 1,
            label: -1
          })
        }
        break
        
      case 'circles':
        // Concentric circles
        for (let i = 0; i < numPoints / 2; i++) {
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() * 1.5
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          const angle = Math.random() * 2 * Math.PI
          const radius = 2 + Math.random() * 1
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle),
            label: -1
          })
        }
        break
        
      case 'moons':
        // Two moons pattern
        for (let i = 0; i < numPoints / 2; i++) {
          const angle = (i / (numPoints / 2)) * Math.PI
          points.push({
            x: Math.cos(angle) + (Math.random() - 0.5) * 0.2,
            y: Math.sin(angle) + (Math.random() - 0.5) * 0.2,
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          const angle = (i / (numPoints / 2)) * Math.PI
          points.push({
            x: -Math.cos(angle) - 1 + (Math.random() - 0.5) * 0.2,
            y: -Math.sin(angle) + (Math.random() - 0.5) * 0.2,
            label: -1
          })
        }
        break
    }
    
    return points
  }, [])

  // Simplified SVM training (for visualization purposes)
  const trainSVM = useCallback(async () => {
    setIsTraining(true)
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simplified SVM implementation for visualization
    // In practice, you'd use a proper SVM library
    const weights = { x: 0, y: 0 }
    const bias = 0
    
    // Find support vectors (simplified)
    const supportVectors = dataPoints.filter((point, index) => {
      // Simplified logic - in real SVM, this would be based on optimization
      return index % 3 === 0 // Just for visualization
    })
    
    // Calculate weights based on support vectors
    supportVectors.forEach(sv => {
      weights.x += sv.label * sv.x
      weights.y += sv.label * sv.y
    })
    
    // Normalize weights
    const magnitude = Math.sqrt(weights.x * weights.x + weights.y * weights.y)
    if (magnitude > 0) {
      weights.x /= magnitude
      weights.y /= magnitude
    }
    
    // Calculate bias (simplified)
    bias = -weights.x * 0 - weights.y * 0
    
    const newModel: SVMModel = {
      weights,
      bias,
      supportVectors,
      kernel,
      C,
      gamma
    }
    
    setModel(newModel)
    setIsTraining(false)
  }, [dataPoints, kernel, C, gamma])

  // Draw SVM visualization
  const drawSVM = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Find data bounds
    const xValues = dataPoints.map(p => p.x)
    const yValues = dataPoints.map(p => p.y)
    const xMin = Math.min(...xValues, -3) - 0.5
    const xMax = Math.max(...xValues, 3) + 0.5
    const yMin = Math.min(...yValues, -3) - 0.5
    const yMax = Math.max(...yValues, 3) + 0.5
    
    // Helper functions
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
    
    // Draw decision boundary and margin
    if (model && showMargin) {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
          const x = (px - 40) / (width - 60) * (xMax - xMin) + xMin
          const y = (height - py - 30) / (height - 60) * (yMax - yMin) + yMin
          
          const decision = model.weights.x * x + model.weights.y * y + model.bias
          const index = (py * width + px) * 4
          
          if (Math.abs(decision) < 0.2) {
            // Margin region
            data[index] = 200
            data[index + 1] = 200
            data[index + 2] = 200
            data[index + 3] = 50
          } else if (decision > 0) {
            // Positive region
            data[index] = 59
            data[index + 1] = 130
            data[index + 2] = 246
            data[index + 3] = 30
          } else {
            // Negative region
            data[index] = 239
            data[index + 1] = 68
            data[index + 2] = 68
            data[index + 3] = 30
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }
    
    // Draw decision boundary line
    if (model) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      // Calculate line endpoints
      const x1 = xMin
      const y1 = -(model.weights.x * x1 + model.bias) / model.weights.y
      const x2 = xMax
      const y2 = -(model.weights.x * x2 + model.bias) / model.weights.y
      
      ctx.moveTo(toCanvasX(x1), toCanvasY(y1))
      ctx.lineTo(toCanvasX(x2), toCanvasY(y2))
      ctx.stroke()
      
      // Draw margin lines
      if (showMargin) {
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        const margin = 1 / Math.sqrt(model.weights.x * model.weights.x + model.weights.y * model.weights.y)
        
        // Upper margin
        ctx.beginPath()
        const y1_upper = -(model.weights.x * x1 + model.bias - margin) / model.weights.y
        const y2_upper = -(model.weights.x * x2 + model.bias - margin) / model.weights.y
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1_upper))
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2_upper))
        ctx.stroke()
        
        // Lower margin
        ctx.beginPath()
        const y1_lower = -(model.weights.x * x1 + model.bias + margin) / model.weights.y
        const y2_lower = -(model.weights.x * x2 + model.bias + margin) / model.weights.y
        ctx.moveTo(toCanvasX(x1), toCanvasY(y1_lower))
        ctx.lineTo(toCanvasX(x2), toCanvasY(y2_lower))
        ctx.stroke()
        
        ctx.setLineDash([])
      }
    }
    
    // Draw data points
    dataPoints.forEach(point => {
      const px = toCanvasX(point.x)
      const py = toCanvasY(point.y)
      
      ctx.beginPath()
      ctx.arc(px, py, showSupportVectors && model?.supportVectors.includes(point) ? 8 : 6, 0, 2 * Math.PI)
      ctx.fillStyle = point.label === 1 ? '#3b82f6' : '#ef4444'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Highlight support vectors
      if (showSupportVectors && model?.supportVectors.includes(point)) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.stroke()
      }
    })
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.moveTo(40, 30)
    ctx.lineTo(40, height - 30)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('X', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Y', 0, 0)
    ctx.restore()
  }, [dataPoints, model, showMargin, showSupportVectors])

  // Initialize dataset
  useEffect(() => {
    const points = generateDataset(datasetType, numPoints)
    setDataPoints(points)
    setModel(null)
  }, [datasetType, numPoints, generateDataset])

  // Update visualization
  useEffect(() => {
    drawSVM()
  }, [drawSVM])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        
        
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">SVM Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Visualize how Support Vector Machines find optimal decision boundaries and margins
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dataset Selection */}
              <div>
                <Label htmlFor="dataset">Dataset Type</Label>
                <Select value={datasetType} onValueChange={setDatasetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="xor">XOR Pattern</SelectItem>
                    <SelectItem value="circles">Concentric Circles</SelectItem>
                    <SelectItem value="moons">Two Moons</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Kernel Selection */}
              <div>
                <Label htmlFor="kernel">Kernel Function</Label>
                <Select value={kernel} onValueChange={setKernel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="rbf">RBF (Gaussian)</SelectItem>
                    <SelectItem value="polynomial">Polynomial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SVM Parameters */}
              <div>
                <Label>C Parameter: {C.toFixed(2)}</Label>
                <Slider
                  value={[C]}
                  onValueChange={(value) => setC(value[0])}
                  max={10}
                  min={0.01}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {kernel === 'rbf' && (
                <div>
                  <Label>Gamma: {gamma.toFixed(2)}</Label>
                  <Slider
                    value={[gamma]}
                    onValueChange={(value) => setGamma(value[0])}
                    max={2}
                    min={0.01}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label>Number of Points: {numPoints}</Label>
                <Slider
                  value={[numPoints]}
                  onValueChange={(value) => setNumPoints(value[0])}
                  max={200}
                  min={20}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="margin"
                    checked={showMargin}
                    onCheckedChange={setShowMargin}
                  />
                  <Label htmlFor="margin">Show Margin</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="support-vectors"
                    checked={showSupportVectors}
                    onCheckedChange={setShowSupportVectors}
                  />
                  <Label htmlFor="support-vectors">Highlight Support Vectors</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={trainSVM}
                  disabled={isTraining || dataPoints.length === 0}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Train SVM
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setModel(null)
                    const points = generateDataset(datasetType, numPoints)
                    setDataPoints(points)
                  }}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Model Info */}
              {model && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Model Info</h4>
                  <div className="text-sm space-y-1">
                    <p>Kernel: {model.kernel}</p>
                    <p>C: {model.C.toFixed(2)}</p>
                    {model.kernel === 'rbf' && <p>Gamma: {model.gamma.toFixed(2)}</p>}
                    <p>Support Vectors: {model.supportVectors.length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>SVM Visualization</CardTitle>
              <CardDescription>
                See how the SVM finds the optimal decision boundary and margin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={500}
                  className="border rounded-lg w-full"
                />
                <div className="absolute top-2 right-2 flex gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Class 1</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Class -1</span>
                  </div>
                  {model && showSupportVectors && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border-2 border-yellow-400"></div>
                      <span>Support Vector</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Learning Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Learn SVM Concepts
            </CardTitle>
            <CardDescription>
              Master the fundamentals of Support Vector Machines with comprehensive explanations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kernels">Kernels</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('overview') && (
                    <div className="space-y-4">
                      {qaData['overview']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="kernels" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('kernels') && (
                    <div className="space-y-4">
                      {qaData['kernels']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="parameters" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('parameters') && (
                    <div className="space-y-4">
                      {qaData['parameters']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="applications" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('applications') && (
                    <div className="space-y-4">
                      {qaData['applications']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}