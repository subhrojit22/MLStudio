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
import { ArrowLeft, Play, Pause, RotateCcw, Move3d, Info, Zap, Target, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
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
      question: "Why do we need dimensionality reduction?",
      answer: "Dimensionality reduction is essential for handling high-dimensional data, reducing computational complexity, removing noise, and enabling visualization. It helps prevent the curse of dimensionality, improves model performance, and makes complex data more interpretable.",
      type: 'why'
    },
    {
      question: "What is dimensionality reduction?",
      answer: "Dimensionality reduction is the process of reducing the number of random variables under consideration by obtaining a set of principal variables. It transforms high-dimensional data into a lower-dimensional space while preserving important information.",
      type: 'what'
    },
    {
      question: "How does dimensionality reduction work?",
      answer: "Dimensionality reduction works by: 1) Identifying patterns and structure in high-dimensional data, 2) Finding optimal lower-dimensional representations, 3) Preserving relationships between data points, 4) Removing redundant or noisy features while maintaining essential information.",
      type: 'how'
    }
  ],
  'pca': [
    {
      question: "Why is PCA so widely used?",
      answer: "PCA is popular because it's simple, fast, and provides optimal linear dimensionality reduction. It preserves maximum variance, creates uncorrelated features, and has clear mathematical interpretations. It's also computationally efficient and works well with many datasets.",
      type: 'why'
    },
    {
      question: "What is Principal Component Analysis?",
      answer: "PCA is a linear dimensionality reduction technique that transforms data into a new coordinate system where the greatest variance lies on the first coordinate (first principal component), the second greatest variance on the second coordinate, and so on.",
      type: 'what'
    },
    {
      question: "How does PCA work step by step?",
      answer: "1) Center the data by subtracting the mean, 2) Calculate the covariance matrix, 3) Compute eigenvalues and eigenvectors, 4) Sort eigenvectors by eigenvalues in descending order, 5) Project data onto top k eigenvectors to reduce dimensions.",
      type: 'how'
    }
  ],
  'tsne': [
    {
      question: "Why do we need t-SNE for visualization?",
      answer: "t-SNE excels at visualizing high-dimensional data because it preserves local structure and reveals clusters that linear methods like PCA miss. It's particularly effective for complex datasets where non-linear relationships are important.",
      type: 'why'
    },
    {
      question: "What is t-SNE?",
      answer: "t-SNE (t-Distributed Stochastic Neighbor Embedding) is a non-linear dimensionality reduction technique particularly well-suited for visualizing high-dimensional datasets. It converts similarities between data points to joint probabilities and minimizes the Kullback-Leibler divergence.",
      type: 'what'
    },
    {
      question: "How does t-SNE work?",
      answer: "1) Calculate pairwise similarities in high-dimensional space using Gaussian distribution, 2) Calculate similarities in low-dimensional space using t-distribution, 3) Minimize KL divergence between high and low dimensional distributions using gradient descent, 4) Iteratively adjust low-dimensional positions.",
      type: 'how'
    }
  ],
  'umap': [
    {
      question: "Why is UMAP gaining popularity over t-SNE?",
      answer: "UMAP is gaining popularity because it's faster than t-SNE, preserves more global structure, has better mathematical foundations, and provides meaningful parameters. It can also be used for general dimensionality reduction, not just visualization.",
      type: 'why'
    },
    {
      question: "What is UMAP?",
      answer: "UMAP (Uniform Manifold Approximation and Projection) is a dimensionality reduction technique that works by constructing a topological representation of the data and optimizing a low-dimensional representation to have a similar topological structure.",
      type: 'what'
    },
    {
      question: "How does UMAP work?",
      answer: "1) Build a weighted k-NN graph in high-dimensional space, 2) Optimize this graph to represent the underlying manifold, 3) Initialize low-dimensional embedding, 4) Optimize embedding using stochastic gradient descent to preserve topological structure.",
      type: 'how'
    }
  ]
}

interface DataPoint {
  id: number
  features: number[]
  label: number
  reduced?: number[]
}

interface ReductionResult {
  type: 'pca' | 'tsne' | 'umap'
  reduced: number[][]
  explainedVariance?: number[]
  perplexity?: number
  nNeighbors?: number
}

export default function DimensionalityReductionPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const originalCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [result, setResult] = useState<ReductionResult | null>(null)
  const [method, setMethod] = useState<'pca' | 'tsne' | 'umap'>('pca')
  const [datasetType, setDatasetType] = useState('swiss-roll')
  const [numPoints, setNumPoints] = useState(200)
  const [numDimensions, setNumDimensions] = useState(10)
  const [targetDimensions, setTargetDimensions] = useState(2)
  const [showOriginal, setShowOriginal] = useState(true)
  const [showReduced, setShowReduced] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [perplexity, setPerplexity] = useState(30)
  const [nNeighbors, setNNeighbors] = useState(15)
  
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
  const generateDataset = useCallback((type: string, numPoints: number, dimensions: number): DataPoint[] => {
    const points: DataPoint[] = []
    
    switch (type) {
      case 'swiss-roll':
        // Swiss roll in 3D, then add extra dimensions
        for (let i = 0;
import BackButton from "@/components/BackButton" i < numPoints; i++) {
          const t = (i / numPoints) * 4 * Math.PI
          const noise = (Math.random() - 0.5) * 0.5
          
          const features: number[] = [
            t * Math.cos(t) + noise,
            t * Math.sin(t) + noise,
            (Math.random() - 0.5) * 10 + noise
          ]
          
          // Add extra dimensions
          for (let d = 3; d < dimensions; d++) {
            features.push((Math.random() - 0.5) * 2)
          }
          
          points.push({
            id: i,
            features,
            label: Math.floor(t / Math.PI) % 3
          })
        }
        break
        
      case 'digits-like':
        // Simulated high-dimensional data like digits
        for (let i = 0; i < numPoints; i++) {
          const digitClass = Math.floor(Math.random() * 10)
          const features: number[] = []
          
          // Create features that cluster by digit class
          for (let d = 0; d < dimensions; d++) {
            const base = digitClass * 2 + Math.sin(digitClass + d * 0.5)
            features.push(base + (Math.random() - 0.5) * 3)
          }
          
          points.push({
            id: i,
            features,
            label: digitClass
          })
        }
        break
        
      case 'clusters':
        // Multiple clusters in high dimensions
        const numClusters = 5
        for (let i = 0; i < numPoints; i++) {
          const cluster = Math.floor(Math.random() * numClusters)
          const features: number[] = []
          
          for (let d = 0; d < dimensions; d++) {
            const center = cluster * 3 + Math.sin(cluster + d)
            features.push(center + (Math.random() - 0.5) * 2)
          }
          
          points.push({
            id: i,
            features,
            label: cluster
          })
        }
        break
    }
    
    return points
  }, [])

  // PCA implementation
  const performPCA = (data: number[][], targetDim: number): { reduced: number[][], explainedVariance: number[] } => {
    // Center the data
    const means = data[0].map((_, colIndex) => 
      data.reduce((sum, row) => sum + row[colIndex], 0) / data.length
    )
    
    const centered = data.map(row => 
      row.map((val, i) => val - means[i])
    )
    
    // Calculate covariance matrix
    const covariance: number[][] = []
    const numFeatures = data[0].length
    
    for (let i = 0; i < numFeatures; i++) {
      covariance[i] = []
      for (let j = 0; j < numFeatures; j++) {
        let sum = 0
        for (let k = 0; k < centered.length; k++) {
          sum += centered[k][i] * centered[k][j]
        }
        covariance[i][j] = sum / (centered.length - 1)
      }
    }
    
    // Simple power iteration for eigenvectors (simplified)
    const eigenvectors: number[][] = []
    const eigenvalues: number[] = []
    
    for (let i = 0; i < targetDim; i++) {
      let vector = new Array(numFeatures).fill(0).map(() => Math.random() - 0.5)
      
      // Power iteration
      for (let iter = 0; iter < 50; iter++) {
        const newVector = new Array(numFeatures).fill(0)
        for (let j = 0; j < numFeatures; j++) {
          for (let k = 0; k < numFeatures; k++) {
            newVector[j] += covariance[j][k] * vector[k]
          }
        }
        
        // Normalize
        const norm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0))
        vector = newVector.map(val => val / norm)
      }
      
      // Calculate eigenvalue
      let eigenvalue = 0
      for (let j = 0; j < numFeatures; j++) {
        let sum = 0
        for (let k = 0; k < numFeatures; k++) {
          sum += covariance[j][k] * vector[k]
        }
        eigenvalue += vector[j] * sum
      }
      
      eigenvectors.push(vector)
      eigenvalues.push(eigenvalue)
      
      // Deflate matrix (simplified)
      for (let j = 0; j < numFeatures; j++) {
        for (let k = 0; k < numFeatures; k++) {
          covariance[j][k] -= eigenvalue * vector[j] * vector[k]
        }
      }
    }
    
    // Project data
    const reduced = centered.map(point => 
      eigenvectors.map(eigenvector => 
        point.reduce((sum, val, i) => sum + val * eigenvector[i], 0)
      )
    )
    
    // Calculate explained variance
    const totalVariance = eigenvalues.reduce((sum, val) => sum + val, 0)
    const explainedVariance = eigenvalues.map(val => val / totalVariance)
    
    return { reduced, explainedVariance }
  }

  // Simplified t-SNE implementation
  const performTSNE = (data: number[][], targetDim: number, perplexity: number): number[][] => {
    const n = data.length
    const momentum = 0.5
    const learningRate = 200
    const maxIter = 100
    
    // Initialize random positions
    let positions = data.map(() => 
      new Array(targetDim).fill(0).map(() => (Math.random() - 0.5) * 0.01)
    )
    
    // Calculate pairwise similarities in high-dimensional space
    const similarities: number[][] = []
    for (let i = 0; i < n; i++) {
      similarities[i] = []
      for (let j = 0; j < n; j++) {
        if (i === j) {
          similarities[i][j] = 0
        } else {
          const dist = Math.sqrt(
            data[i].reduce((sum, val, k) => sum + Math.pow(val - data[j][k], 2), 0)
          )
          similarities[i][j] = Math.exp(-dist * dist / 2)
        }
      }
      
      // Normalize to match perplexity
      const sum = similarities[i].reduce((a, b) => a + b, 0)
      similarities[i] = similarities[i].map(val => val / sum)
    }
    
    // Gradient descent iterations
    for (let iter = 0; iter < maxIter; iter++) {
      const gradients = positions.map(() => new Array(targetDim).fill(0))
      
      // Calculate low-dimensional similarities
      const lowDimSimilarities: number[][] = []
      for (let i = 0; i < n; i++) {
        lowDimSimilarities[i] = []
        for (let j = 0; j < n; j++) {
          if (i === j) {
            lowDimSimilarities[i][j] = 0
          } else {
            const dist = Math.sqrt(
              positions[i].reduce((sum, val, k) => sum + Math.pow(val - positions[j][k], 2), 0)
            )
            lowDimSimilarities[i][j] = 1 / (1 + dist * dist)
          }
        }
      }
      
      // Normalize low-dimensional similarities
      for (let i = 0; i < n; i++) {
        const sum = lowDimSimilarities[i].reduce((a, b) => a + b, 0)
        lowDimSimilarities[i] = lowDimSimilarities[i].map(val => val / sum)
      }
      
      // Calculate gradients
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            const diff = positions[i].map((val, k) => val - positions[j][k])
            const pij = similarities[i][j]
            const qij = lowDimSimilarities[i][j]
            const factor = 4 * (pij - qij) / (1 + Math.pow(
              positions[i].reduce((sum, val, k) => sum + Math.pow(val - positions[j][k], 2), 0), 2
            ))
            
            for (let k = 0; k < targetDim; k++) {
              gradients[i][k] += factor * diff[k]
            }
          }
        }
      }
      
      // Update positions
      positions = positions.map((pos, i) => 
        pos.map((val, k) => val - learningRate * gradients[i][k])
      )
    }
    
    return positions
  }

  // Simplified UMAP implementation
  const performUMAP = (data: number[][], targetDim: number, nNeighbors: number): number[][] => {
    // This is a very simplified version of UMAP
    // Real UMAP is much more complex
    
    const n = data.length
    
    // Build k-NN graph
    const knnGraph: number[][] = []
    for (let i = 0; i < n; i++) {
      const distances = data.map((point, j) => ({
        index: j,
        distance: Math.sqrt(
          point.reduce((sum, val, k) => sum + Math.pow(val - data[i][k], 2), 0)
        )
      }))
      
      distances.sort((a, b) => a.distance - b.distance)
      knnGraph[i] = distances.slice(1, nNeighbors + 1).map(d => d.index)
    }
    
    // Initialize random positions
    const positions = data.map(() => 
      new Array(targetDim).fill(0).map(() => (Math.random() - 0.5))
    )
    
    // Simple force-directed layout
    for (let iter = 0; iter < 50; iter++) {
      const forces = positions.map(() => new Array(targetDim).fill(0))
      
      // Attractive forces for neighbors
      for (let i = 0; i < n; i++) {
        for (const neighbor of knnGraph[i]) {
          const diff = positions[i].map((val, k) => positions[neighbor][k] - val)
          const dist = Math.sqrt(diff.reduce((sum, val) => sum + val * val, 0))
          
          if (dist > 0) {
            const force = 0.1 * (dist - 1)
            for (let k = 0; k < targetDim; k++) {
              forces[i][k] += force * diff[k] / dist
            }
          }
        }
      }
      
      // Repulsive forces for non-neighbors
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (!knnGraph[i].includes(j) && !knnGraph[j].includes(i)) {
            const diff = positions[i].map((val, k) => val - positions[j][k])
            const dist = Math.sqrt(diff.reduce((sum, val) => sum + val * val, 0))
            
            if (dist > 0 && dist < 2) {
              const force = 0.05 / (dist * dist)
              for (let k = 0; k < targetDim; k++) {
                forces[i][k] += force * diff[k] / dist
                forces[j][k] -= force * diff[k] / dist
              }
            }
          }
        }
      }
      
      // Update positions
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < targetDim; k++) {
          positions[i][k] += forces[i][k]
        }
      }
    }
    
    return positions
  }

  // Perform dimensionality reduction
  const performReduction = useCallback(async () => {
    setIsProcessing(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const features = dataPoints.map(p => p.features)
    let reduced: number[][]
    let explainedVariance: number[] | undefined
    
    switch (method) {
      case 'pca':
        const pcaResult = performPCA(features, targetDimensions)
        reduced = pcaResult.reduced
        explainedVariance = pcaResult.explainedVariance
        break
        
      case 'tsne':
        reduced = performTSNE(features, targetDimensions, perplexity)
        break
        
      case 'umap':
        reduced = performUMAP(features, targetDimensions, nNeighbors)
        break
    }
    
    const newResult: ReductionResult = {
      type: method,
      reduced,
      explainedVariance,
      perplexity: method === 'tsne' ? perplexity : undefined,
      nNeighbors: method === 'umap' ? nNeighbors : undefined
    }
    
    setResult(newResult)
    
    // Update data points with reduced coordinates
    const updatedPoints = dataPoints.map((point, i) => ({
      ...point,
      reduced: reduced[i]
    }))
    
    setDataPoints(updatedPoints)
    setIsProcessing(false)
  }, [dataPoints, method, targetDimensions, perplexity, nNeighbors])

  // Draw visualization
  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current
    const originalCanvas = originalCanvasRef.current
    
    if (!canvas || !originalCanvas) return
    
    const ctx = canvas.getContext('2d')
    const originalCtx = originalCanvas.getContext('2d')
    
    if (!ctx || !originalCtx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvases
    ctx.clearRect(0, 0, width, height)
    originalCtx.clearRect(0, 0, width, height)
    
    if (dataPoints.length === 0) return
    
    // Colors for different classes
    const colors = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
    ]
    
    // Draw original data (first two dimensions)
    if (showOriginal && dataPoints[0].features.length >= 2) {
      const xValues = dataPoints.map(p => p.features[0])
      const yValues = dataPoints.map(p => p.features[1])
      const xMin = Math.min(...xValues)
      const xMax = Math.max(...xValues)
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)
      
      const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
      const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
      
      // Draw points
      dataPoints.forEach(point => {
        const px = toCanvasX(point.features[0])
        const py = toCanvasY(point.features[1])
        
        originalCtx.beginPath()
        originalCtx.arc(px, py, 4, 0, 2 * Math.PI)
        originalCtx.fillStyle = colors[point.label % colors.length]
        originalCtx.fill()
        originalCtx.strokeStyle = '#000'
        originalCtx.lineWidth = 1
        originalCtx.stroke()
      })
      
      // Draw axes
      originalCtx.strokeStyle = '#666'
      originalCtx.lineWidth = 1
      originalCtx.beginPath()
      originalCtx.moveTo(40, height - 30)
      originalCtx.lineTo(width - 20, height - 30)
      originalCtx.moveTo(40, 30)
      originalCtx.lineTo(40, height - 30)
      originalCtx.stroke()
      
      // Labels
      originalCtx.fillStyle = '#666'
      originalCtx.font = '12px sans-serif'
      originalCtx.textAlign = 'center'
      originalCtx.fillText('Dim 1', width / 2, height - 5)
      
      originalCtx.save()
      originalCtx.translate(15, height / 2)
      originalCtx.rotate(-Math.PI / 2)
      originalCtx.fillText('Dim 2', 0, 0)
      originalCtx.restore()
    }
    
    // Draw reduced data
    if (showReduced && result && dataPoints[0].reduced) {
      const xValues = dataPoints.map(p => p.reduced![0])
      const yValues = dataPoints.map(p => p.reduced![1])
      const xMin = Math.min(...xValues)
      const xMax = Math.max(...xValues)
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)
      
      const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
      const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
      
      // Draw points
      dataPoints.forEach(point => {
        const px = toCanvasX(point.reduced![0])
        const py = toCanvasY(point.reduced![1])
        
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, 2 * Math.PI)
        ctx.fillStyle = colors[point.label % colors.length]
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
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
      ctx.fillText('Component 1', width / 2, height - 5)
      
      ctx.save()
      ctx.translate(15, height / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Component 2', 0, 0)
      ctx.restore()
    }
  }, [dataPoints, result, showOriginal, showReduced])

  // Initialize dataset
  useEffect(() => {
    const points = generateDataset(datasetType, numPoints, numDimensions)
    setDataPoints(points)
    setResult(null)
  }, [datasetType, numPoints, numDimensions, generateDataset])

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
          <Move3d className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dimensionality Reduction Visualizer</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore how PCA, t-SNE, and UMAP transform high-dimensional data into lower dimensions
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
                    <SelectItem value="swiss-roll">Swiss Roll</SelectItem>
                    <SelectItem value="digits-like">Digits-like</SelectItem>
                    <SelectItem value="clusters">Clusters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Method Selection */}
              <div>
                <Label htmlFor="method">Reduction Method</Label>
                <Select value={method} onValueChange={(value: any) => setMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pca">PCA</SelectItem>
                    <SelectItem value="tsne">t-SNE</SelectItem>
                    <SelectItem value="umap">UMAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Original Dimensions: {numDimensions}</Label>
                <Slider
                  value={[numDimensions]}
                  onValueChange={(value) => setNumDimensions(value[0])}
                  max={50}
                  min={3}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Target Dimensions: {targetDimensions}</Label>
                <Slider
                  value={[targetDimensions]}
                  onValueChange={(value) => setTargetDimensions(value[0])}
                  max={3}
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
                  max={500}
                  min={50}
                  step={50}
                  className="mt-2"
                />
              </div>

              {/* Method-specific parameters */}
              {method === 'tsne' && (
                <div>
                  <Label>Perplexity: {perplexity}</Label>
                  <Slider
                    value={[perplexity]}
                    onValueChange={(value) => setPerplexity(value[0])}
                    max={100}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}

              {method === 'umap' && (
                <div>
                  <Label>n_neighbors: {nNeighbors}</Label>
                  <Slider
                    value={[nNeighbors]}
                    onValueChange={(value) => setNNeighbors(value[0])}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-original"
                    checked={showOriginal}
                    onCheckedChange={setShowOriginal}
                  />
                  <Label htmlFor="show-original">Show Original</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-reduced"
                    checked={showReduced}
                    onCheckedChange={setShowReduced}
                  />
                  <Label htmlFor="show-reduced">Show Reduced</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={performReduction}
                  disabled={isProcessing || dataPoints.length === 0}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Reduce Dimensions
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResult(null)
                    const points = generateDataset(datasetType, numPoints, numDimensions)
                    setDataPoints(points)
                  }}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Result Info */}
              {result && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result Info</h4>
                  <div className="text-sm space-y-1">
                    <p>Method: {result.type.toUpperCase()}</p>
                    <p>Original: {numDimensions}D</p>
                    <p>Reduced: {targetDimensions}D</p>
                    {result.explainedVariance && (
                      <p>Explained Variance: {(result.explainedVariance[0] * 100).toFixed(1)}%</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Data */}
            <Card>
              <CardHeader>
                <CardTitle>Original Data</CardTitle>
                <CardDescription>
                  First two dimensions of high-dimensional data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={originalCanvasRef}
                    width={280}
                    height={250}
                    className="border rounded-lg w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reduced Data */}
            <Card>
              <CardHeader>
                <CardTitle>Reduced Data</CardTitle>
                <CardDescription>
                  {method.toUpperCase()} projection to {targetDimensions}D
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={250}
                    className="border rounded-lg w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
              Learn Dimensionality Reduction
            </CardTitle>
            <CardDescription>
              Master the fundamentals of reducing high-dimensional data for visualization and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pca">PCA</TabsTrigger>
                <TabsTrigger value="tsne">t-SNE</TabsTrigger>
                <TabsTrigger value="umap">UMAP</TabsTrigger>
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

              <TabsContent value="pca" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('pca') && (
                    <div className="space-y-4">
                      {qaData['pca']?.map((qa, index) => (
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

              <TabsContent value="tsne" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('tsne') && (
                    <div className="space-y-4">
                      {qaData['tsne']?.map((qa, index) => (
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

              <TabsContent value="umap" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('umap') && (
                    <div className="space-y-4">
                      {qaData['umap']?.map((qa, index) => (
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