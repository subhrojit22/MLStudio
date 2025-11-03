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
import { ArrowLeft, Play, Pause, RotateCcw, GitBranch, Info, Zap, Target, Lightbulb, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
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
      question: "Why do we need clustering in machine learning?",
      answer: "Clustering is essential for unsupervised learning where we don't have labeled data. It helps discover natural groupings in data, identify patterns, and gain insights without predefined categories. It's widely used for customer segmentation, anomaly detection, and data exploration.",
      type: 'why'
    },
    {
      question: "What is clustering?",
      answer: "Clustering is the task of grouping similar data points together based on their characteristics or features. The goal is to create clusters where points within the same cluster are similar to each other, while points in different clusters are dissimilar.",
      type: 'what'
    },
    {
      question: "How does clustering work?",
      answer: "Clustering algorithms work by measuring distances or similarities between data points. They use different strategies like centroid-based (K-Means), density-based (DBSCAN), or hierarchical approaches to group points that are close or similar according to a defined metric.",
      type: 'how'
    }
  ],
  'kmeans': [
    {
      question: "Why is K-Means so popular?",
      answer: "K-Means is popular because it's simple, fast, and scalable to large datasets. It's easy to understand and implement, works well for spherical clusters, and has a time complexity of O(nkt), making it efficient for practical applications.",
      type: 'why'
    },
    {
      question: "What is K-Means clustering?",
      answer: "K-Means is a centroid-based clustering algorithm that partitions data into K clusters. It works by iteratively assigning points to the nearest centroid and updating centroids based on the mean of assigned points until convergence.",
      type: 'what'
    },
    {
      question: "How does K-Means work step by step?",
      answer: "1. Initialize K centroids randomly, 2. Assign each point to its nearest centroid, 3. Recalculate centroids as the mean of assigned points, 4. Repeat steps 2-3 until centroids don't change significantly or max iterations reached.",
      type: 'how'
    }
  ],
  'dbscan': [
    {
      question: "Why do we need DBSCAN?",
      answer: "DBSCAN is needed because K-Means struggles with non-spherical clusters and requires specifying the number of clusters beforehand. DBSCAN can find arbitrarily shaped clusters, handle noise, and automatically determine the number of clusters based on data density.",
      type: 'why'
    },
    {
      question: "What is DBSCAN?",
      answer: "DBSCAN (Density-Based Spatial Clustering of Applications with Noise) is a density-based clustering algorithm that groups together points that are closely packed together, marking as outliers points that lie alone in low-density regions.",
      type: 'what'
    },
    {
      question: "How does DBSCAN work?",
      answer: "DBSCAN works by defining clusters as dense regions separated by regions of lower density. It uses two parameters: epsilon (ε) for neighborhood radius and minPts for minimum points to form a dense region. It expands clusters from core points that have enough neighbors.",
      type: 'how'
    }
  ],
  'evaluation': [
    {
      question: "Why do we need clustering evaluation metrics?",
      answer: "Evaluation metrics are needed to assess the quality of clustering results objectively. Since clustering is unsupervised, we need ways to measure how good the clusters are, compare different algorithms, and tune parameters for optimal performance.",
      type: 'why'
    },
    {
      question: "What are clustering evaluation metrics?",
      answer: "Common metrics include Silhouette Score (measures cohesion and separation), Davies-Bouldin Index (ratio of within-cluster to between-cluster scatter), Calinski-Harabasz Index (ratio of between-cluster to within-cluster dispersion), and for labeled data, Adjusted Rand Index or Mutual Information.",
      type: 'what'
    },
    {
      question: "How do we interpret clustering metrics?",
      answer: "Higher Silhouette Score (close to 1) indicates well-separated clusters. Lower Davies-Bouldin Index suggests better clustering. Higher Calinski-Harabasz Index indicates dense, well-separated clusters. For convergence plots, look for the algorithm reaching a stable state with minimal changes.",
      type: 'how'
    }
  ]
}

interface DataPoint {
  x: number
  y: number
  cluster: number
  color: string
}

interface Cluster {
  id: number
  centroid: { x: number; y: number }
  points: DataPoint[]
  color: string
}

interface DBSCANPoint extends DataPoint {
  visited: boolean
  noise: boolean
  clusterId: number
}

export default function ClusteringPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const convergenceCanvasRef = useRef<HTMLCanvasElement>(null)
  const isRunningRef = useRef(false)
  const isPausedRef = useRef(false)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [algorithm, setAlgorithm] = useState('kmeans')
  const [numClusters, setNumClusters] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [maxIterations, setMaxIterations] = useState(50)
  const [datasetType, setDatasetType] = useState('blobs')
  const [numPoints, setNumPoints] = useState(150)
  const [noiseLevel, setNoiseLevel] = useState(0.1)
  const [showCentroids, setShowCentroids] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [convergenceHistory, setConvergenceHistory] = useState<number[]>([])
  
  // DBSCAN parameters
  const [eps, setEps] = useState(0.5)
  const [minPts, setMinPts] = useState(5)
  
  // QA state
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('clustering')

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
  const generateDataset = useCallback((type: string, numPoints: number, noise: number): DataPoint[] => {
    const points: DataPoint[] = []
    
    switch (type) {
      case 'blobs':
        const blobCenters = [
          { x: -2, y: -2 },
          { x: 2, y: -2 },
          { x: 0, y: 2 }
        ]
        
        for (let i = 0; i < numPoints; i++) {
          const centerIndex = Math.floor(Math.random() * blobCenters.length)
          const center = blobCenters[centerIndex]
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() * 1.5 + noise
          
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
            cluster: 0,
            color: '#666'
          })
        }
        break
        
      case 'circles':
        const numCircles = 2
        const pointsPerCircle = Math.floor(numPoints / numCircles)
        
        for (let circle = 0; circle < numCircles; circle++) {
          const radius = 1 + circle * 1.5
          for (let i = 0; i < pointsPerCircle; i++) {
            const angle = (i / pointsPerCircle) * 2 * Math.PI
            const r = radius + (Math.random() - 0.5) * noise
            
            points.push({
              x: r * Math.cos(angle),
              y: r * Math.sin(angle),
              cluster: 0,
              color: '#666'
            })
          }
        }
        break
        
      case 'moons':
        const pointsPerMoon = Math.floor(numPoints / 2)
        
        for (let i = 0; i < pointsPerMoon; i++) {
          const angle = (i / pointsPerMoon) * Math.PI
          const x = Math.cos(angle) + (Math.random() - 0.5) * noise
          const y = Math.sin(angle) + (Math.random() - 0.5) * noise + 1
          
          points.push({
            x, y,
            cluster: 0,
            color: '#666'
          })
        }
        
        for (let i = 0; i < pointsPerMoon; i++) {
          const angle = (i / pointsPerMoon) * Math.PI
          const x = Math.cos(angle) + (Math.random() - 0.5) * noise + 1
          const y = -Math.sin(angle) + (Math.random() - 0.5) * noise - 1
          
          points.push({
            x, y,
            cluster: 0,
            color: '#666'
          })
        }
        break
        
      case 'anisotropic':
        for (let i = 0; i < numPoints; i++) {
          const t = (i / numPoints) * 4 * Math.PI
          const x = Math.cos(t) + (Math.random() - 0.5) * noise
          const y = Math.sin(t) * 0.5 + (Math.random() - 0.5) * noise
          
          points.push({
            x: x * 2,
            y: y * 2,
            cluster: 0,
            color: '#666'
          })
        }
        break
        
      case 'varied':
        const variedCenters = [
          { x: 0, y: 0, std: 0.5 },
          { x: 3, y: 0, std: 1 },
          { x: 0, y: 3, std: 0.3 }
        ]
        
        for (let i = 0; i < numPoints; i++) {
          const centerIndex = Math.floor(Math.random() * variedCenters.length)
          const center = variedCenters[centerIndex]
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() * center.std
          
          points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle),
            cluster: 0,
            color: '#666'
          })
        }
        break
    }
    
    return points
  }, [])

  // K-means clustering - modified for step-by-step animation
  const kMeansClustering = useCallback((points: DataPoint[], k: number, iteration: number = 0): Cluster[] => {
    if (points.length === 0) return []
    
    // Initialize centroids on first iteration
    let centroids: { x: number; y: number }[] = []
    if (iteration === 0 || clusters.length === 0) {
      const usedIndices = new Set<number>()
      
      while (centroids.length < k) {
        const index = Math.floor(Math.random() * points.length)
        if (!usedIndices.has(index)) {
          usedIndices.add(index)
          centroids.push({ ...points[index] })
        }
      }
    } else {
      // Use existing centroids
      centroids = clusters.map(c => ({ ...c.centroid }))
    }
    
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    
    // Assign points to nearest centroid
    const newClusters: Cluster[] = centroids.map((centroid, index) => ({
      id: index,
      centroid: { ...centroid },
      points: [],
      color: colors[index % colors.length]
    }))
    
    points.forEach(point => {
      let minDistance = Infinity
      let nearestCluster = 0
      
      centroids.forEach((centroid, index) => {
        const distance = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + 
          Math.pow(point.y - centroid.y, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          nearestCluster = index
        }
      })
      
      newClusters[nearestCluster].points.push({
        ...point,
        cluster: nearestCluster,
        color: newClusters[nearestCluster].color
      })
    })
    
    // Update centroids
    newClusters.forEach(cluster => {
      if (cluster.points.length > 0) {
        cluster.centroid.x = cluster.points.reduce((sum, p) => sum + p.x, 0) / cluster.points.length
        cluster.centroid.y = cluster.points.reduce((sum, p) => sum + p.y, 0) / cluster.points.length
      }
    })
    
    return newClusters
  }, [clusters])

  // DBSCAN clustering
  const dbscanClustering = useCallback((points: DataPoint[], eps: number, minPts: number): Cluster[] => {
    if (points.length === 0) return []
    
    const dbscanPoints: DBSCANPoint[] = points.map(p => ({
      ...p,
      visited: false,
      noise: false,
      clusterId: -1
    }))
    
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    let clusterId = 0
    
    const getNeighbors = (point: DBSCANPoint): DBSCANPoint[] => {
      return dbscanPoints.filter(other => {
        if (point === other) return false
        const distance = Math.sqrt(
          Math.pow(point.x - other.x, 2) + 
          Math.pow(point.y - other.y, 2)
        )
        return distance <= eps
      })
    }
    
    const expandCluster = (point: DBSCANPoint, neighbors: DBSCANPoint[], clusterId: number) => {
      point.clusterId = clusterId
      point.visited = true
      
      let i = 0
      while (i < neighbors.length) {
        const neighbor = neighbors[i]
        
        if (!neighbor.visited) {
          neighbor.visited = true
          const neighborNeighbors = getNeighbors(neighbor)
          
          if (neighborNeighbors.length >= minPts) {
            neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n)))
          }
        }
        
        if (neighbor.clusterId === -1) {
          neighbor.clusterId = clusterId
        }
        
        i++
      }
    }
    
    dbscanPoints.forEach(point => {
      if (point.visited) return
      
      point.visited = true
      const neighbors = getNeighbors(point)
      
      if (neighbors.length < minPts) {
        point.noise = true
      } else {
        expandCluster(point, neighbors, clusterId)
        clusterId++
      }
    })
    
    // Create clusters
    const clusterMap = new Map<number, DataPoint[]>()
    
    dbscanPoints.forEach(point => {
      if (!point.noise && point.clusterId !== -1) {
        if (!clusterMap.has(point.clusterId)) {
          clusterMap.set(point.clusterId, [])
        }
        clusterMap.get(point.clusterId)!.push({
          x: point.x,
          y: point.y,
          cluster: point.clusterId,
          color: colors[point.clusterId % colors.length]
        })
      }
    })
    
    const clusters: Cluster[] = []
    clusterMap.forEach((points, id) => {
      const centroid = {
        x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length
      }
      
      clusters.push({
        id,
        centroid,
        points,
        color: colors[id % colors.length]
      })
    })
    
    // Add noise points as separate cluster
    const noisePoints = dbscanPoints.filter(p => p.noise)
    if (noisePoints.length > 0) {
      clusters.push({
        id: -1,
        centroid: { x: 0, y: 0 }, // No centroid for noise
        points: noisePoints.map(p => ({
          x: p.x,
          y: p.y,
          cluster: -1,
          color: '#9ca3af' // Gray color for noise
        })),
        color: '#9ca3af'
      })
    }
    
    return clusters
  }, [eps, minPts])

  // Run clustering
  const runClustering = useCallback(() => {
    let newClusters: Cluster[] = []
    
    if (algorithm === 'kmeans') {
      newClusters = kMeansClustering(dataPoints, numClusters, currentIteration)
    } else if (algorithm === 'dbscan') {
      newClusters = dbscanClustering(dataPoints, eps, minPts)
    }
    
    setClusters(newClusters)
    
    // Calculate convergence metric
    const totalDistance = newClusters.reduce((sum, cluster) => {
      return sum + cluster.points.reduce((clusterSum, point) => {
        return clusterSum + Math.sqrt(
          Math.pow(point.x - cluster.centroid.x, 2) + 
          Math.pow(point.y - cluster.centroid.y, 2)
        )
      }, 0)
    }, 0)
    
    setConvergenceHistory(prev => [...prev.slice(-19), totalDistance])
  }, [algorithm, dataPoints, numClusters, eps, minPts, kMeansClustering, dbscanClustering, currentIteration])

  // Start clustering animation
  const startClustering = async () => {
    setIsRunning(true)
    setIsPaused(false)
    isRunningRef.current = true
    isPausedRef.current = false
    setCurrentIteration(0)
    setConvergenceHistory([])
    
    let iteration = 0
    while (iteration < maxIterations && isRunningRef.current && !isPausedRef.current) {
      runClustering()
      iteration++
      setCurrentIteration(iteration)
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed))
    }
    
    setIsRunning(false)
    isRunningRef.current = false
  }

  // Reset clustering
  const resetClustering = () => {
    setIsRunning(false)
    setIsPaused(false)
    isRunningRef.current = false
    isPausedRef.current = false
    setCurrentIteration(0)
    setClusters([])
    setConvergenceHistory([])
    setDataPoints(points => points.map(p => ({ ...p, cluster: 0, color: '#666' })))
  }

  // Draw clustering visualization
  const drawClustering = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Find data bounds
    const allPoints = dataPoints.length > 0 ? dataPoints : []
    const xValues = allPoints.map(p => p.x)
    const yValues = allPoints.map(p => p.y)
    const xMin = Math.min(...xValues, -3) - 0.5
    const xMax = Math.max(...xValues, 3) + 0.5
    const yMin = Math.min(...yValues, -3) - 0.5
    const yMax = Math.max(...yValues, 3) + 0.5
    
    // Helper functions
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const x = 40 + ((width - 60) / 10) * i
      const y = 30 + ((height - 60) / 10) * i
      
      ctx.beginPath()
      ctx.moveTo(x, 30)
      ctx.lineTo(x, height - 30)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.moveTo(40, 30)
    ctx.lineTo(40, height - 30)
    ctx.stroke()
    
    // Draw clusters
    clusters.forEach(cluster => {
      // Draw points
      cluster.points.forEach(point => {
        const px = toCanvasX(point.x)
        const py = toCanvasY(point.y)
        
        ctx.beginPath()
        ctx.arc(px, py, point.cluster === -1 ? 3 : 4, 0, 2 * Math.PI) // Smaller for noise
        ctx.fillStyle = point.color
        ctx.fill()
        ctx.strokeStyle = point.cluster === -1 ? '#666' : '#000' // Different border for noise
        ctx.lineWidth = point.cluster === -1 ? 0.5 : 1
        ctx.stroke()
      })
      
      // Draw centroid (not for noise cluster)
      if (showCentroids && cluster.id !== -1) {
        const cx = toCanvasX(cluster.centroid.x)
        const cy = toCanvasY(cluster.centroid.y)
        
        ctx.beginPath()
        ctx.arc(cx, cy, 8, 0, 2 * Math.PI)
        ctx.fillStyle = cluster.color
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw cross
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx - 4, cy)
        ctx.lineTo(cx + 4, cy)
        ctx.moveTo(cx, cy - 4)
        ctx.lineTo(cx, cy + 4)
        ctx.stroke()
      }
    })
    
    // Draw unclustered points (only if no clustering has been done)
    if (clusters.length === 0) {
      const unclusteredPoints = dataPoints.filter(p => p.cluster === 0)
      unclusteredPoints.forEach(point => {
        const px = toCanvasX(point.x)
        const py = toCanvasY(point.y)
        
        ctx.beginPath()
        ctx.arc(px, py, 4, 0, 2 * Math.PI)
        ctx.fillStyle = '#666'
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }
    
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
  }, [dataPoints, clusters, showCentroids])

  // Draw convergence plot
  const drawConvergence = useCallback(() => {
    const canvas = convergenceCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (convergenceHistory.length === 0) return
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.moveTo(60, 20)
    ctx.lineTo(60, height - 40)
    ctx.stroke()
    
    // Draw convergence curve
    const maxValue = Math.max(...convergenceHistory)
    const minValue = Math.min(...convergenceHistory)
    const valueRange = maxValue - minValue || 1
    
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    convergenceHistory.forEach((value, index) => {
      const x = 60 + ((width - 80) / Math.max(convergenceHistory.length - 1, 1)) * index
      const y = height - 40 - ((height - 60) * ((value - minValue) / valueRange))
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Iteration', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(25, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Total Distance', 0, 0)
    ctx.restore()
  }, [convergenceHistory])

  // Initialize dataset
  useEffect(() => {
    const points = generateDataset(datasetType, numPoints, noiseLevel)
    setDataPoints(points)
  }, [datasetType, numPoints, noiseLevel, generateDataset])

  // Update visualizations
  useEffect(() => {
    drawClustering()
  }, [drawClustering])

  useEffect(() => {
    drawConvergence()
  }, [drawConvergence])

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
          <GitBranch className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Clustering Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          View how clusters form, update, and merge/separate in real time with synthetic 2D data
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
              {/* Algorithm Selection */}
              <div>
                <Label htmlFor="algorithm">Clustering Algorithm</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kmeans">K-Means</SelectItem>
                    <SelectItem value="dbscan">DBSCAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dataset Selection */}
              <div>
                <Label htmlFor="dataset">Dataset Type</Label>
                <Select value={datasetType} onValueChange={setDatasetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blobs">Blobs</SelectItem>
                    <SelectItem value="circles">Circles</SelectItem>
                    <SelectItem value="moons">Two Moons</SelectItem>
                    <SelectItem value="anisotropic">Anisotropic</SelectItem>
                    <SelectItem value="varied">Varied Density</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Algorithm-specific parameters */}
              {algorithm === 'kmeans' ? (
                <div>
                  <Label>Number of Clusters: {numClusters}</Label>
                  <Slider
                    value={[numClusters]}
                    onValueChange={(value) => setNumClusters(value[0])}
                    max={8}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label>Epsilon (ε): {eps.toFixed(2)}</Label>
                    <Slider
                      value={[eps]}
                      onValueChange={(value) => setEps(value[0])}
                      max={2}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Min Points: {minPts}</Label>
                    <Slider
                      value={[minPts]}
                      onValueChange={(value) => setMinPts(value[0])}
                      max={20}
                      min={2}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              {/* General parameters */}
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

              <div>
                <Label>Noise Level: {noiseLevel.toFixed(2)}</Label>
                <Slider
                  value={[noiseLevel]}
                  onValueChange={(value) => setNoiseLevel(value[0])}
                  max={1}
                  min={0}
                  step={0.05}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Animation Speed: {animationSpeed}ms</Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={2000}
                  min={100}
                  step={100}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="centroids"
                    checked={showCentroids}
                    onCheckedChange={setShowCentroids}
                  />
                  <Label htmlFor="centroids">Show Centroids</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="labels"
                    checked={showLabels}
                    onCheckedChange={setShowLabels}
                  />
                  <Label htmlFor="labels">Show Labels</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={startClustering}
                  disabled={isRunning}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      {isPaused ? 'Resume' : 'Running...'}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Clustering
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetClustering}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Clustering Info */}
              {clusters.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Clustering Results</h4>
                  <div className="text-sm space-y-1">
                    <p>Algorithm: {algorithm === 'kmeans' ? 'K-Means' : 'DBSCAN'}</p>
                    <p>Clusters Found: {clusters.filter(c => c.id !== -1).length}</p>
                    <p>Iteration: {currentIteration}</p>
                    {algorithm === 'kmeans' && (
                      <p>Max Iterations: {maxIterations}</p>
                    )}
                    {algorithm === 'dbscan' && (
                      <p>Noise Points: {clusters.find(c => c.id === -1)?.points.length || 0}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Visualizations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="clustering" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="clustering">Clustering</TabsTrigger>
              <TabsTrigger value="convergence">Convergence</TabsTrigger>
            </TabsList>

            <TabsContent value="clustering" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clustering Visualization</CardTitle>
                  <CardDescription>
                    Watch how clusters form and evolve in real-time
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
                      {clusters.map((cluster, index) => (
                        <div key={cluster.id} className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cluster.color }}
                          ></div>
                          <span>
                            {cluster.id === -1 ? 'Noise' : `Cluster ${cluster.id + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="convergence" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Convergence Plot</CardTitle>
                  <CardDescription>
                    Track how the clustering algorithm converges over iterations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={convergenceCanvasRef}
                      width={600}
                      height={300}
                      className="border rounded-lg w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
              Learn Clustering Concepts
            </CardTitle>
            <CardDescription>
              Master the fundamentals of clustering with comprehensive explanations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kmeans">K-Means</TabsTrigger>
                <TabsTrigger value="dbscan">DBSCAN</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
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

              <TabsContent value="kmeans" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('kmeans') && (
                    <div className="space-y-4">
                      {qaData['kmeans']?.map((qa, index) => (
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

              <TabsContent value="dbscan" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('dbscan') && (
                    <div className="space-y-4">
                      {qaData['dbscan']?.map((qa, index) => (
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

              <TabsContent value="evaluation" className="mt-6">
                <div className="space-y-4">
                  
                  
                  {expandedQA.has('evaluation') && (
                    <div className="space-y-4">
                      {qaData['evaluation']?.map((qa, index) => (
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