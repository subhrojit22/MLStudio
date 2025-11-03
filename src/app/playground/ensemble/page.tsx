'use client'

import BackButton from "@/components/BackButton"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Pause, RotateCcw, Users, Info, Zap, Target, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
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
      question: "Why do we need ensemble methods?",
      answer: "Ensemble methods combine multiple models to achieve better performance than any single model alone. They reduce overfitting, improve generalization, and provide more robust predictions by leveraging the wisdom of crowds principle in machine learning.",
      type: 'why'
    },
    {
      question: "What are ensemble methods?",
      answer: "Ensemble methods are techniques that combine multiple machine learning models to produce one optimal predictive model. They work by training multiple models and aggregating their predictions through voting, averaging, or weighted combinations.",
      type: 'what'
    },
    {
      question: "How do ensemble methods work?",
      answer: "Ensemble methods work by: 1) Training multiple base learners on different data subsets or with different algorithms, 2) Making individual predictions, 3) Combining predictions through voting (classification) or averaging (regression), 4) Often achieving better performance than individual models.",
      type: 'how'
    }
  ],
  'bagging': [
    {
      question: "Why does bagging reduce variance?",
      answer: "Bagging reduces variance by training multiple models on different bootstrap samples of the training data. Each model sees slightly different data, making their errors uncorrelated. When averaged, these errors cancel out, resulting in more stable and less overfit predictions.",
      type: 'why'
    },
    {
      question: "What is bagging?",
      answer: "Bagging (Bootstrap Aggregating) is an ensemble method that trains multiple models on different random subsets of the training data, sampled with replacement. Each model votes independently, and the final prediction is made by majority voting or averaging.",
      type: 'what'
    },
    {
      question: "How does bagging work step by step?",
      answer: "1) Create multiple bootstrap samples by sampling training data with replacement, 2) Train a base model on each bootstrap sample, 3) Make predictions with all models, 4) Combine predictions through voting (classification) or averaging (regression).",
      type: 'how'
    }
  ],
  'boosting': [
    {
      question: "Why does boosting improve weak learners?",
      answer: "Boosting converts weak learners into strong ones by sequentially training models that focus on mistakes made by previous models. Each new model gives more weight to misclassified examples, gradually improving overall performance and reducing bias.",
      type: 'why'
    },
    {
      question: "What is boosting?",
      answer: "Boosting is an ensemble method that trains models sequentially, where each new model focuses on correcting the errors of the previous ones. Models are weighted based on their performance, and the final prediction is a weighted combination of all models.",
      type: 'what'
    },
    {
      question: "How does boosting work?",
      answer: "1) Train a weak learner on the training data, 2) Identify misclassified examples, 3) Increase weights of misclassified examples, 4) Train next model focusing on hard examples, 5) Repeat for specified number of iterations, 6) Combine models with performance-based weights.",
      type: 'how'
    }
  ],
  'stacking': [
    {
      question: "Why does stacking often outperform other ensembles?",
      answer: "Stacking can outperform other ensembles because it learns how to best combine different types of models. The meta-learner can discover complex patterns in how different base models make errors, creating a more sophisticated combination than simple voting or averaging.",
      type: 'why'
    },
    {
      question: "What is stacking?",
      answer: "Stacking (Stacked Generalization) is an ensemble method that combines multiple base models using a meta-model. The meta-model learns to make final predictions based on the predictions of the base models, effectively learning how to best combine them.",
      type: 'what'
    },
    {
      question: "How does stacking work?",
      answer: "1) Split data into training and validation sets, 2) Train multiple base models on training data, 3) Make predictions on validation data with each base model, 4) Train meta-model on base model predictions, 5) For new data, get base model predictions and feed to meta-model.",
      type: 'how'
    }
  ]
}

interface DataPoint {
  x: number
  y: number
  label: number
  predicted?: number
  ensemblePredicted?: number
}

interface EnsembleModel {
  type: 'bagging' | 'boosting' | 'stacking'
  baseModels: any[]
  metaModel?: any
  predictions: number[][]
  weights: number[]
}

export default function EnsemblePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [model, setModel] = useState<EnsembleModel | null>(null)
  const [ensembleType, setEnsembleType] = useState<'bagging' | 'boosting' | 'stacking'>('bagging')
  const [datasetType, setDatasetType] = useState('complex')
  const [numPoints, setNumPoints] = useState(100)
  const [numBaseModels, setNumBaseModels] = useState(5)
  const [showBaseModels, setShowBaseModels] = useState(true)
  const [showEnsemble, setShowEnsemble] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  
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
      case 'complex':
        // Complex decision boundary
        for (let i = 0; i < numPoints; i++) {
          const x = Math.random() * 10 - 5
          const y = Math.random() * 10 - 5
          const label = (Math.sin(x) * Math.cos(y) > 0) ? 1 : 0
          points.push({ x, y, label })
        }
        break
        
      case 'noisy':
        // Noisy XOR pattern
        for (let i = 0; i < numPoints / 2; i++) {
          const x = (Math.random() - 0.5) * 4
          const y = (Math.random() - 0.5) * 4
          const label = (x * y > 0) ? 1 : 0
          // Add noise
          if (Math.random() < 0.2) label = 1 - label
          points.push({ x, y, label })
        }
        for (let i = 0; i < numPoints / 2; i++) {
          const x = (Math.random() - 0.5) * 4
          const y = (Math.random() - 0.5) * 4
          const label = (x * y <= 0) ? 1 : 0
          // Add noise
          if (Math.random() < 0.2) label = 1 - label
          points.push({ x, y, label })
        }
        break
        
      case 'imbalanced':
        // Imbalanced dataset
        for (let i = 0; i < numPoints * 0.8; i++) {
          const x = Math.random() * 6 - 3
          const y = Math.random() * 6 - 3
          points.push({ x, y, label: 0 })
        }
        for (let i = 0; i < numPoints * 0.2; i++) {
          const x = Math.random() * 4 - 2
          const y = Math.random() * 4 - 2
          points.push({ x, y, label: 1 })
        }
        break
    }
    
    return points
  }, [])

  // Simple decision tree stump for base models
  class DecisionStump {
    feature: number
    threshold: number
    prediction: number
    
    constructor(data: DataPoint[]) {
      // Find best split
      let bestGain = 0
      this.feature = 0
      this.threshold = 0
      this.prediction = 0
      
      for (let f = 0; f < 2; f++) {
        const values = data.map(p => f === 0 ? p.x : p.y).sort((a, b) => a - b)
        
        for (let i = 1; i < values.length; i++) {
          const threshold = (values[i] + values[i-1]) / 2
          const gain = this.calculateGain(data, f, threshold)
          
          if (gain > bestGain) {
            bestGain = gain
            this.feature = f
            this.threshold = threshold
          }
        }
      }
      
      // Set prediction based on majority class
      const left = data.filter(p => 
        (this.feature === 0 ? p.x : p.y) <= this.threshold
      )
      const right = data.filter(p => 
        (this.feature === 0 ? p.x : p.y) > this.threshold
      )
      
      this.prediction = left.length > right.length ? 
        left[0]?.label || 0 : right[0]?.label || 0
    }
    
    calculateGain(data: DataPoint[], feature: number, threshold: number): number {
      const left = data.filter(p => 
        (feature === 0 ? p.x : p.y) <= threshold
      )
      const right = data.filter(p => 
        (feature === 0 ? p.x : p.y) > threshold
      )
      
      if (left.length === 0 || right.length === 0) return 0
      
      const leftPurity = this.calculatePurity(left)
      const rightPurity = this.calculatePurity(right)
      const totalPurity = this.calculatePurity(data)
      
      return totalPurity - (left.length/data.length) * leftPurity - 
             (right.length/data.length) * rightPurity
    }
    
    calculatePurity(data: DataPoint[]): number {
      if (data.length === 0) return 0
      const positive = data.filter(p => p.label === 1).length
      const negative = data.length - positive
      return (positive * negative) / (data.length * data.length)
    }
    
    predict(point: DataPoint): number {
      const value = this.feature === 0 ? point.x : point.y
      return value <= this.threshold ? this.prediction : 1 - this.prediction
    }
  }

  // Train ensemble model
  const trainEnsemble = useCallback(async () => {
    setIsTraining(true)
    setCurrentIteration(0)
    
    const baseModels: any[] = []
    const predictions: number[][] = []
    const weights: number[] = []
    
    if (ensembleType === 'bagging') {
      // Bagging: bootstrap samples
      for (let i = 0; i < numBaseModels; i++) {
        // Create bootstrap sample
        const bootstrap: DataPoint[] = []
        for (let j = 0; j < dataPoints.length; j++) {
          const index = Math.floor(Math.random() * dataPoints.length)
          bootstrap.push(dataPoints[index])
        }
        
        // Train base model
        const model = new DecisionStump(bootstrap)
        baseModels.push(model)
        weights.push(1.0) // Equal weights for bagging
        
        // Make predictions
        const modelPredictions = dataPoints.map(p => model.predict(p))
        predictions.push(modelPredictions)
        
        setCurrentIteration(i + 1)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } else if (ensembleType === 'boosting') {
      // Boosting: sequential training with error weighting
      let sampleWeights = new Array(dataPoints.length).fill(1 / dataPoints.length)
      
      for (let i = 0; i < numBaseModels; i++) {
        // Sample based on weights
        const weightedSample: DataPoint[] = []
        for (let j = 0; j < dataPoints.length; j++) {
          const random = Math.random()
          let cumulative = 0
          for (let k = 0; k < dataPoints.length; k++) {
            cumulative += sampleWeights[k]
            if (random <= cumulative) {
              weightedSample.push(dataPoints[k])
              break
            }
          }
        }
        
        // Train base model
        const model = new DecisionStump(weightedSample)
        baseModels.push(model)
        
        // Calculate error and weight
        const modelPredictions = dataPoints.map(p => model.predict(p))
        predictions.push(modelPredictions)
        
        let error = 0
        for (let j = 0; j < dataPoints.length; j++) {
          if (modelPredictions[j] !== dataPoints[j].label) {
            error += sampleWeights[j]
          }
        }
        
        const modelWeight = Math.log((1 - error) / (error + 1e-10)) / 2
        weights.push(modelWeight)
        
        // Update sample weights
        for (let j = 0; j < dataPoints.length; j++) {
          const factor = modelPredictions[j] === dataPoints[j].label ? 
            Math.exp(-modelWeight) : Math.exp(modelWeight)
          sampleWeights[j] *= factor
        }
        
        // Normalize weights
        const sum = sampleWeights.reduce((a, b) => a + b, 0)
        sampleWeights = sampleWeights.map(w => w / sum)
        
        setCurrentIteration(i + 1)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } else if (ensembleType === 'stacking') {
      // Stacking: train base models and meta-model
      for (let i = 0; i < numBaseModels; i++) {
        // Train base model on subset of data
        const subset = dataPoints.slice(0, Math.floor(dataPoints.length * 0.8))
        const model = new DecisionStump(subset)
        baseModels.push(model)
        weights.push(1.0)
        
        const modelPredictions = dataPoints.map(p => model.predict(p))
        predictions.push(modelPredictions)
        
        setCurrentIteration(i + 1)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Simple meta-model: weighted average based on validation performance
      const validationSize = Math.floor(dataPoints.length * 0.2)
      const validationData = dataPoints.slice(-validationSize)
      
      for (let i = 0; i < numBaseModels; i++) {
        let correct = 0
        for (const point of validationData) {
          if (predictions[i][dataPoints.indexOf(point)] === point.label) {
            correct++
          }
        }
        weights[i] = correct / validationData.length
      }
    }
    
    // Make ensemble predictions
    const ensemblePredictions = dataPoints.map((_, i) => {
      const votes = predictions.map((pred, j) => pred[i])
      const weightedVotes = votes.map((vote, j) => vote * weights[j])
      const sum = weightedVotes.reduce((a, b) => a + b, 0)
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      return sum / totalWeight > 0.5 ? 1 : 0
    })
    
    const updatedPoints = dataPoints.map((point, i) => ({
      ...point,
      ensemblePredicted: ensemblePredictions[i]
    }))
    
    setDataPoints(updatedPoints)
    
    const newModel: EnsembleModel = {
      type: ensembleType,
      baseModels,
      predictions,
      weights
    }
    
    setModel(newModel)
    setIsTraining(false)
  }, [dataPoints, ensembleType, numBaseModels])

  // Draw visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (dataPoints.length === 0) return
    
    const xValues = dataPoints.map(p => p.x)
    const yValues = dataPoints.map(p => p.y)
    const xMin = Math.min(...xValues) - 1
    const xMax = Math.max(...xValues) + 1
    const yMin = Math.min(...yValues) - 1
    const yMax = Math.max(...yValues) + 1
    
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
    
    // Draw decision boundaries for base models
    if (model && showBaseModels) {
      model.baseModels.forEach((baseModel, index) => {
        ctx.strokeStyle = `hsla(${index * 360 / model.baseModels.length}, 70%, 50%, 0.3)`
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        
        const threshold = baseModel.threshold
        const feature = baseModel.feature
        
        ctx.beginPath()
        if (feature === 0) {
          // Vertical line
          const x = toCanvasX(threshold)
          ctx.moveTo(x, 30)
          ctx.lineTo(x, height - 30)
        } else {
          // Horizontal line
          const y = toCanvasY(threshold)
          ctx.moveTo(40, y)
          ctx.lineTo(width - 20, y)
        }
        ctx.stroke()
      })
      ctx.setLineDash([])
    }
    
    // Draw ensemble decision boundary
    if (model && showEnsemble) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      
      // Create a simple ensemble boundary visualization
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let px = 0; px < width; px += 3) {
        for (let py = 0; py < height; py += 3) {
          const x = (px - 40) / (width - 60) * (xMax - xMin) + xMin
          const y = (height - py - 30) / (height - 60) * (yMax - yMin) + yMin
          
          const testPoint: DataPoint = { x, y, label: 0 }
          const votes = model.baseModels.map(m => m.predict(testPoint))
          const weightedVotes = votes.map((vote, j) => vote * model.weights[j])
          const sum = weightedVotes.reduce((a, b) => a + b, 0)
          const totalWeight = model.weights.reduce((a, b) => a + b, 0)
          const prediction = sum / totalWeight > 0.5 ? 1 : 0
          
          const color = prediction === 1 ? [59, 130, 246] : [239, 68, 68]
          const alpha = 0.2
          
          for (let dx = 0; dx < 3; dx++) {
            for (let dy = 0; dy < 3; dy++) {
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
    dataPoints.forEach(point => {
      const px = toCanvasX(point.x)
      const py = toCanvasY(point.y)
      
      ctx.beginPath()
      ctx.arc(px, py, 6, 0, 2 * Math.PI)
      
      // Color based on true label
      ctx.fillStyle = point.label === 1 ? '#3b82f6' : '#ef4444'
      ctx.fill()
      
      // Border based on prediction
      if (point.ensemblePredicted !== undefined) {
        ctx.strokeStyle = point.ensemblePredicted === point.label ? '#22c55e' : '#fbbf24'
        ctx.lineWidth = point.ensemblePredicted === point.label ? 2 : 3
      } else {
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
      }
      ctx.stroke()
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
  }, [dataPoints, model, showBaseModels, showEnsemble])

  // Initialize dataset
  useEffect(() => {
    const points = generateDataset(datasetType, numPoints)
    setDataPoints(points)
    setModel(null)
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
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Ensemble Methods Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore how combining multiple models improves prediction accuracy through bagging, boosting, and stacking
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
                    <SelectItem value="complex">Complex Boundary</SelectItem>
                    <SelectItem value="noisy">Noisy XOR</SelectItem>
                    <SelectItem value="imbalanced">Imbalanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ensemble Type */}
              <div>
                <Label htmlFor="ensemble-type">Ensemble Method</Label>
                <Select value={ensembleType} onValueChange={(value: any) => setEnsembleType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bagging">Bagging</SelectItem>
                    <SelectItem value="boosting">Boosting</SelectItem>
                    <SelectItem value="stacking">Stacking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Base Models: {numBaseModels}</Label>
                <Slider
                  value={[numBaseModels]}
                  onValueChange={(value) => setNumBaseModels(value[0])}
                  max={20}
                  min={2}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Number of Points: {numPoints}</Label>
                <Slider
                  value={[numPoints]}
                  onValueChange={(value) => setNumPoints(value[0])}
                  max={300}
                  min={50}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="base-models"
                    checked={showBaseModels}
                    onCheckedChange={setShowBaseModels}
                  />
                  <Label htmlFor="base-models">Show Base Models</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ensemble"
                    checked={showEnsemble}
                    onCheckedChange={setShowEnsemble}
                  />
                  <Label htmlFor="ensemble">Show Ensemble</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={trainEnsemble}
                  disabled={isTraining || dataPoints.length === 0}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Training ({currentIteration}/{numBaseModels})
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Train Ensemble
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
                  <h4 className="font-semibold mb-2">Ensemble Info</h4>
                  <div className="text-sm space-y-1">
                    <p>Type: {model.type}</p>
                    <p>Base Models: {model.baseModels.length}</p>
                    <p>Avg Weight: {(model.weights.reduce((a, b) => a + b, 0) / model.weights.length).toFixed(3)}</p>
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {model && dataPoints.some(p => p.ensemblePredicted !== undefined) && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Performance</h4>
                  <div className="text-sm space-y-1">
                    {(() => {
                      const correct = dataPoints.filter(p => p.ensemblePredicted === p.label).length
                      const accuracy = (correct / dataPoints.length * 100).toFixed(1)
                      return <p>Ensemble Accuracy: {accuracy}%</p>
                    })()}
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
              <CardTitle>Ensemble Visualization</CardTitle>
              <CardDescription>
                See how multiple models combine to create better predictions
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
                    <span>Class 0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
                    <span>Correct</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-yellow-400"></div>
                    <span>Wrong</span>
                  </div>
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
              Learn Ensemble Methods
            </CardTitle>
            <CardDescription>
              Master the fundamentals of combining multiple models for better performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bagging">Bagging</TabsTrigger>
                <TabsTrigger value="boosting">Boosting</TabsTrigger>
                <TabsTrigger value="stacking">Stacking</TabsTrigger>
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

              <TabsContent value="bagging" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('bagging') && (
                    <div className="space-y-4">
                      {qaData['bagging']?.map((qa, index) => (
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

              <TabsContent value="boosting" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('boosting') && (
                    <div className="space-y-4">
                      {qaData['boosting']?.map((qa, index) => (
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

              <TabsContent value="stacking" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('stacking') && (
                    <div className="space-y-4">
                      {qaData['stacking']?.map((qa, index) => (
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