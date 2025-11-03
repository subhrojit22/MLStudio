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
import { ArrowLeft, Play, Pause, RotateCcw, Calculator, Info, Zap, Target, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
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
      question: "Why do we need Naive Bayes?",
      answer: "Naive Bayes is valuable because it's simple, fast, and works surprisingly well in practice despite its naive independence assumption. It's excellent for text classification, spam detection, and situations where you need quick probabilistic predictions with limited computational resources.",
      type: 'why'
    },
    {
      question: "What is Naive Bayes?",
      answer: "Naive Bayes is a probabilistic classifier based on Bayes' theorem with a strong independence assumption between features. It calculates the probability of each class given the input features and selects the class with the highest probability.",
      type: 'what'
    },
    {
      question: "How does Naive Bayes work?",
      answer: "Naive Bayes works by: 1) Calculating prior probabilities for each class, 2) Computing likelihood probabilities for each feature given each class, 3) Applying Bayes' theorem to get posterior probabilities, 4) Selecting the class with the highest posterior probability.",
      type: 'how'
    }
  ],
  'bayes-theorem': [
    {
      question: "Why is Bayes' theorem fundamental to Naive Bayes?",
      answer: "Bayes' theorem provides the mathematical foundation for updating our beliefs about class probabilities given observed features. It allows us to invert conditional probabilities, making it possible to calculate P(class|features) from P(features|class) and P(class).",
      type: 'why'
    },
    {
      question: "What is Bayes' theorem?",
      answer: "Bayes' theorem states that P(A|B) = [P(B|A) × P(A)] / P(B). In classification, this becomes P(class|features) = [P(features|class) × P(class)] / P(features), where we calculate the probability of a class given observed features.",
      type: 'what'
    },
    {
      question: "How do we apply Bayes' theorem in classification?",
      answer: "For each class, we calculate: 1) Prior probability P(class) from training data, 2) Likelihood P(features|class) assuming feature independence, 3) Posterior P(class|features) using Bayes' theorem, 4) Select the class with maximum posterior probability.",
      type: 'how'
    }
  ],
  'types': [
    {
      question: "Why are there different types of Naive Bayes?",
      answer: "Different types handle different data distributions. Gaussian Naive Bayes works with continuous features, Multinomial with discrete counts, and Bernoulli with binary features. Choosing the right type improves performance by matching the underlying data distribution.",
      type: 'why'
    },
    {
      question: "What are the main types of Naive Bayes?",
      answer: "The main types are: Gaussian (for continuous features assuming normal distribution), Multinomial (for count data like word frequencies), Bernoulli (for binary features), and Complement (for imbalanced datasets). Each handles different feature types optimally.",
      type: 'what'
    },
    {
      question: "How do different Naive Bayes types work?",
      answer: "Gaussian uses mean and variance for continuous features, Multinomial uses frequency counts for discrete features, Bernoulli uses presence/absence for binary features, and Complement Naive Bayes modifies the calculation to handle class imbalance better.",
      type: 'how'
    }
  ],
  'applications': [
    {
      question: "Why is Naive Bayes popular for text classification?",
      answer: "Naive Bayes excels at text classification because: 1) Text data has high dimensionality where independence assumption works reasonably well, 2) It's fast to train and predict, 3) It handles sparse data efficiently, 4) It provides good baseline performance for many NLP tasks.",
      type: 'why'
    },
    {
      question: "What are common applications of Naive Bayes?",
      answer: "Common applications include: spam filtering, document categorization, sentiment analysis, medical diagnosis, credit scoring, weather prediction, and recommendation systems. It's particularly effective where features are conditionally independent given the class.",
      type: 'what'
    },
    {
      question: "How does Naive Bayes compare to other classifiers?",
      answer: "Naive Bayes is faster and simpler than neural networks or SVMs, but may be less accurate. It works well with small datasets, unlike deep learning. It's more interpretable than complex models but makes strong independence assumptions that might not hold in reality.",
      type: 'how'
    }
  ]
}

interface DataPoint {
  features: number[]
  label: number
  predicted?: number
  probabilities?: number[]
}

interface NaiveBayesModel {
  type: 'gaussian' | 'multinomial' | 'bernoulli'
  priors: number[]
  parameters: {
    mean?: number[][]
    variance?: number[][]
    probabilities?: number[][][]
  }
  classes: number[]
}

export default function NaiveBayesPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [model, setModel] = useState<NaiveBayesModel | null>(null)
  const [modelType, setModelType] = useState<'gaussian' | 'multinomial' | 'bernoulli'>('gaussian')
  const [datasetType, setDatasetType] = useState('iris-like')
  const [numPoints, setNumPoints] = useState(100)
  const [showProbabilities, setShowProbabilities] = useState(true)
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null)
  
  // QA state
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('overview')

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
      case 'iris-like':
        // 3 classes with 2 features, similar to iris dataset
        for (let i = 0;
import BackButton from "@/components/BackButton" i < numPoints / 3; i++) {
          points.push({
            features: [
              Math.random() * 2 + 4,  // Sepal length
              Math.random() * 1 + 3   // Sepal width
            ],
            label: 0
          })
        }
        for (let i = 0; i < numPoints / 3; i++) {
          points.push({
            features: [
              Math.random() * 1.5 + 5,
              Math.random() * 1.5 + 2
            ],
            label: 1
          })
        }
        for (let i = 0; i < numPoints / 3; i++) {
          points.push({
            features: [
              Math.random() * 1 + 6,
              Math.random() * 0.8 + 3
            ],
            label: 2
          })
        }
        break
        
      case 'spam-like':
        // Binary classification for spam detection simulation
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            features: [
              Math.random() * 5 + 10,  // Number of spam-like words
              Math.random() * 3 + 2,   // Number of exclamation marks
              Math.random() * 2        // Number of capital letters
            ],
            label: 1 // Spam
          })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            features: [
              Math.random() * 3 + 1,   // Fewer spam-like words
              Math.random() * 1,       // Fewer exclamation marks
              Math.random() * 1        // Fewer capital letters
            ],
            label: 0 // Not spam
          })
        }
        break
        
      case 'medical-like':
        // Medical diagnosis simulation
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            features: [
              Math.random() * 20 + 60,  // Age
              Math.random() * 30 + 120, // Blood pressure
              Math.random() * 50 + 150  // Cholesterol
            ],
            label: 1 // Disease present
          })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          points.push({
            features: [
              Math.random() * 20 + 25,  // Younger age
              Math.random() * 20 + 100, // Lower blood pressure
              Math.random() * 30 + 180  // Higher cholesterol
            ],
            label: 0 // No disease
          })
        }
        break
    }
    
    return points
  }, [])

  // Train Naive Bayes model
  const trainNaiveBayes = useCallback(async () => {
    setIsTraining(true)
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const classes = Array.from(new Set(dataPoints.map(p => p.label)))
    const numFeatures = dataPoints[0]?.features.length || 2
    
    // Calculate priors
    const priors = classes.map(cls => 
      dataPoints.filter(p => p.label === cls).length / dataPoints.length
    )
    
    let parameters: any = {}
    
    if (modelType === 'gaussian') {
      // Calculate mean and variance for each class and feature
      const mean: number[][] = []
      const variance: number[][] = []
      
      classes.forEach((cls, clsIndex) => {
        const classPoints = dataPoints.filter(p => p.label === cls)
        const classMean: number[] = []
        const classVariance: number[] = []
        
        for (let feature = 0; feature < numFeatures; feature++) {
          const values = classPoints.map(p => p.features[feature])
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length
          const varVal = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
          
          classMean.push(avg)
          classVariance.push(varVal)
        }
        
        mean.push(classMean)
        variance.push(classVariance)
      })
      
      parameters = { mean, variance }
    } else if (modelType === 'multinomial') {
      // Calculate feature probabilities for each class
      const probabilities: number[][][] = []
      
      classes.forEach((cls, clsIndex) => {
        const classPoints = dataPoints.filter(p => p.label === cls)
        const classProbs: number[][] = []
        
        for (let feature = 0; feature < numFeatures; feature++) {
          const values = classPoints.map(p => p.features[feature])
          const total = values.reduce((sum, val) => sum + val, 0)
          const featureProbs: number[] = []
          
          // Discretize continuous values for multinomial
          const bins = 5
          for (let bin = 0; bin < bins; bin++) {
            const count = values.filter(v => Math.floor(v * bins / 10) === bin).length
            featureProbs.push((count + 1) / (classPoints.length + bins)) // Laplace smoothing
          }
          
          classProbs.push(featureProbs)
        }
        
        probabilities.push(classProbs)
      })
      
      parameters = { probabilities }
    } else if (modelType === 'bernoulli') {
      // Calculate binary feature probabilities for each class
      const probabilities: number[][][] = []
      
      classes.forEach((cls, clsIndex) => {
        const classPoints = dataPoints.filter(p => p.label === cls)
        const classProbs: number[][] = []
        
        for (let feature = 0; feature < numFeatures; feature++) {
          const values = classPoints.map(p => p.features[feature])
          const threshold = values.reduce((sum, val) => sum + val, 0) / values.length
          const present = values.filter(v => v > threshold).length
          const absent = values.filter(v => v <= threshold).length
          
          classProbs.push([
            (absent + 1) / (classPoints.length + 2), // P(feature=0|class)
            (present + 1) / (classPoints.length + 2)  // P(feature=1|class)
          ])
        }
        
        probabilities.push(classProbs)
      })
      
      parameters = { probabilities }
    }
    
    const newModel: NaiveBayesModel = {
      type: modelType,
      priors,
      parameters,
      classes
    }
    
    setModel(newModel)
    
    // Make predictions
    const predictions = dataPoints.map(point => {
      const probs = predict(newModel, point.features)
      const maxProbIndex = probs.indexOf(Math.max(...probs))
      return {
        ...point,
        predicted: classes[maxProbIndex],
        probabilities: probs
      }
    })
    
    setDataPoints(predictions)
    setIsTraining(false)
  }, [dataPoints, modelType])

  // Predict function
  const predict = (model: NaiveBayesModel, features: number[]): number[] => {
    const posteriors: number[] = []
    
    model.classes.forEach((cls, clsIndex) => {
      let posterior = Math.log(model.priors[clsIndex])
      
      if (model.type === 'gaussian') {
        features.forEach((feature, featureIndex) => {
          const mean = model.parameters.mean![clsIndex][featureIndex]
          const variance = model.parameters.variance![clsIndex][featureIndex]
          const exponent = -Math.pow(feature - mean, 2) / (2 * variance)
          const likelihood = (1 / Math.sqrt(2 * Math.PI * variance)) * Math.exp(exponent)
          posterior += Math.log(likelihood + 1e-10) // Add small value to avoid log(0)
        })
      } else if (model.type === 'multinomial') {
        features.forEach((feature, featureIndex) => {
          const bin = Math.floor(feature * 5 / 10)
          const prob = model.parameters.probabilities![clsIndex][featureIndex][bin] || 1e-10
          posterior += Math.log(prob)
        })
      } else if (model.type === 'bernoulli') {
        features.forEach((feature, featureIndex) => {
          const threshold = 5 // Simplified threshold
          const isPresent = feature > threshold ? 1 : 0
          const prob = model.parameters.probabilities![clsIndex][featureIndex][isPresent]
          posterior += Math.log(prob)
        })
      }
      
      posteriors.push(posterior)
    })
    
    // Convert from log space to probabilities
    const maxLog = Math.max(...posteriors)
    const expProbs = posteriors.map(p => Math.exp(p - maxLog))
    const sum = expProbs.reduce((a, b) => a + b, 0)
    
    return expProbs.map(p => p / sum)
  }

  // Draw visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Only draw 2D visualization for first two features
    if (dataPoints.length === 0 || dataPoints[0].features.length < 2) return
    
    const xValues = dataPoints.map(p => p.features[0])
    const yValues = dataPoints.map(p => p.features[1])
    const xMin = Math.min(...xValues) - 1
    const xMax = Math.max(...xValues) + 1
    const yMin = Math.min(...yValues) - 1
    const yMax = Math.max(...yValues) + 1
    
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
    
    // Draw decision boundary
    if (model && showDecisionBoundary) {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let px = 0; px < width; px += 2) {
        for (let py = 0; py < height; py += 2) {
          const x = (px - 40) / (width - 60) * (xMax - xMin) + xMin
          const y = (height - py - 30) / (height - 60) * (yMax - yMin) + yMin
          
          const probs = predict(model, [x, y])
          const maxProbIndex = probs.indexOf(Math.max(...probs))
          
          const colors = [
            [59, 130, 246], // Blue
            [239, 68, 68],  // Red
            [34, 197, 94]   // Green
          ]
          
          const color = colors[maxProbIndex] || [128, 128, 128]
          const alpha = Math.max(...probs) * 0.3
          
          for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
              const index = ((py + dy) * width + (px + dx)) * 4
              data[index] = color[0]
              data[index + 1] = color[1]
              data[index + 2] = color[2]
              data[index + 3] = alpha * 255
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }
    
    // Draw data points
    const colors = ['#3b82f6', '#ef4444', '#22c55e']
    
    dataPoints.forEach(point => {
      const px = toCanvasX(point.features[0])
      const py = toCanvasY(point.features[1])
      
      ctx.beginPath()
      ctx.arc(px, py, 6, 0, 2 * Math.PI)
      
      // Use predicted color if available, otherwise true color
      const colorIndex = point.predicted !== undefined ? point.predicted : point.label
      ctx.fillStyle = colors[colorIndex] || '#666'
      ctx.fill()
      
      // Draw border
      ctx.strokeStyle = point.predicted !== point.label ? '#fbbf24' : '#000'
      ctx.lineWidth = point.predicted !== point.label ? 3 : 1
      ctx.stroke()
      
      // Highlight selected point
      if (selectedPoint === point) {
        ctx.strokeStyle = '#8b5cf6'
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
    ctx.fillText('Feature 1', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Feature 2', 0, 0)
    ctx.restore()
  }, [dataPoints, model, showDecisionBoundary, selectedPoint])

  // Initialize dataset
  useEffect(() => {
    const points = generateDataset(datasetType, numPoints)
    setDataPoints(points)
    setModel(null)
    setSelectedPoint(null)
  }, [datasetType, numPoints, generateDataset])

  // Update visualization
  useEffect(() => {
    drawVisualization()
  }, [drawVisualization])

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
          <Calculator className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Naive Bayes Visualizer</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore probabilistic classification with Bayes' theorem and independence assumptions
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
                    <SelectItem value="iris-like">Iris-like</SelectItem>
                    <SelectItem value="spam-like">Spam Detection</SelectItem>
                    <SelectItem value="medical-like">Medical Diagnosis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Type */}
              <div>
                <Label htmlFor="model-type">Naive Bayes Type</Label>
                <Select value={modelType} onValueChange={(value: any) => setModelType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaussian">Gaussian</SelectItem>
                    <SelectItem value="multinomial">Multinomial</SelectItem>
                    <SelectItem value="bernoulli">Bernoulli</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Points: {numPoints}</Label>
                <Slider
                  value={[numPoints]}
                  onValueChange={(value) => setNumPoints(value[0])}
                  max={300}
                  min={30}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="decision-boundary"
                    checked={showDecisionBoundary}
                    onCheckedChange={setShowDecisionBoundary}
                  />
                  <Label htmlFor="decision-boundary">Show Decision Boundary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="probabilities"
                    checked={showProbabilities}
                    onCheckedChange={setShowProbabilities}
                  />
                  <Label htmlFor="probabilities">Show Probabilities</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={trainNaiveBayes}
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
                      Train Model
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setModel(null)
                    const points = generateDataset(datasetType, numPoints)
                    setDataPoints(points)
                    setSelectedPoint(null)
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
                    <p>Type: {model.type}</p>
                    <p>Classes: {model.classes.length}</p>
                    <p>Features: {dataPoints[0]?.features.length || 0}</p>
                  </div>
                </div>
              )}

              {/* Point Details */}
              {selectedPoint && model && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Point</h4>
                  <div className="text-sm space-y-1">
                    <p>True Class: {selectedPoint.label}</p>
                    <p>Predicted: {selectedPoint.predicted}</p>
                    {showProbabilities && selectedPoint.probabilities && (
                      <div>
                        <p>Probabilities:</p>
                        {selectedPoint.probabilities.map((prob, i) => (
                          <p key={i} className="ml-2">
                            Class {i}: {(prob * 100).toFixed(1)}%
                          </p>
                        ))}
                      </div>
                    )}
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
              <CardTitle>Naive Bayes Visualization</CardTitle>
              <CardDescription>
                Click on points to see detailed probabilities and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={500}
                  className="border rounded-lg w-full cursor-crosshair"
                  onClick={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect()
                    if (!rect) return
                    
                    const x = e.clientX - rect.left
                    const y = e.clientY - rect.top
                    
                    // Find closest point
                    const xValues = dataPoints.map(p => p.features[0])
                    const yValues = dataPoints.map(p => p.features[1])
                    const xMin = Math.min(...xValues) - 1
                    const xMax = Math.max(...xValues) + 1
                    const yMin = Math.min(...yValues) - 1
                    const yMax = Math.max(...yValues) + 1
                    
                    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (600 - 60) + 40
                    const toCanvasY = (y: number) => 500 - ((y - yMin) / (yMax - yMin)) * (500 - 60) - 30
                    
                    let closestPoint = null
                    let minDistance = Infinity
                    
                    dataPoints.forEach(point => {
                      const px = toCanvasX(point.features[0])
                      const py = toCanvasY(point.features[1])
                      const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2))
                      
                      if (distance < minDistance && distance < 20) {
                        minDistance = distance
                        closestPoint = point
                      }
                    })
                    
                    setSelectedPoint(closestPoint)
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2 text-xs">
                  {model && Array.from(new Set(dataPoints.map(p => p.label))).map((label, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ['#3b82f6', '#ef4444', '#22c55e'][i] }}
                      ></div>
                      <span>Class {label}</span>
                    </div>
                  ))}
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
              Learn Naive Bayes Concepts
            </CardTitle>
            <CardDescription>
              Master the fundamentals of probabilistic classification with Bayes' theorem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bayes-theorem">Bayes' Theorem</TabsTrigger>
                <TabsTrigger value="types">Types</TabsTrigger>
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

              <TabsContent value="bayes-theorem" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('bayes-theorem') && (
                    <div className="space-y-4">
                      {qaData['bayes-theorem']?.map((qa, index) => (
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

              <TabsContent value="types" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('types') && (
                    <div className="space-y-4">
                      {qaData['types']?.map((qa, index) => (
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