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
import { ArrowLeft, Play, Pause, RotateCcw, TreePine, Info } from "lucide-react"
import BackButton from "@/components/BackButton"
import { motion } from "framer-motion"

interface DataPoint {
  x: number
  y: number
  label: number
  color: string
}

interface TreeNode {
  id: string
  feature: string
  threshold: number
  left?: TreeNode
  right?: TreeNode
  isLeaf: boolean
  prediction?: number
  samples: number
  impurity: number
  x?: number
  y?: number
}

export default function DecisionTreePlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const treeCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [tree, setTree] = useState<TreeNode | null>(null)
  const [maxDepth, setMaxDepth] = useState(3)
  const [minSamplesSplit, setMinSamplesSplit] = useState(2)
  const [isTraining, setIsTraining] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showDecisionBoundary, setShowDecisionBoundary] = useState(true)
  const [showTree, setShowTree] = useState(true)
  const [datasetType, setDatasetType] = useState('xor')
  const [animationSpeed, setAnimationSpeed] = useState(1000)
  const [selectedFeature, setSelectedFeature] = useState('x')

  // Generate synthetic datasets
  const generateDataset = useCallback((type: string) => {
    const points: DataPoint[] = []
    
    switch (type) {
      case 'xor':
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * 10 - 5
          const y = Math.random() * 10 - 5
          const label = (x * y > 0) ? 1 : 0
          points.push({
            x, y, label,
            color: label === 1 ? '#3b82f6' : '#ef4444'
          })
        }
        break
      case 'circles':
        for (let i = 0; i < 100; i++) {
          const angle = Math.random() * 2 * Math.PI
          const radius = Math.random() * 4
          const x = radius * Math.cos(angle)
          const y = radius * Math.sin(angle)
          const label = radius < 2 ? 1 : 0
          points.push({
            x, y, label,
            color: label === 1 ? '#3b82f6' : '#ef4444'
          })
        }
        break
      case 'moons':
        for (let i = 0; i < 50; i++) {
          // Upper moon
          const angle1 = Math.random() * Math.PI
          const x1 = Math.cos(angle1) + Math.random() * 0.3
          const y1 = Math.sin(angle1) + Math.random() * 0.3 + 1
          points.push({ x: x1, y: y1, label: 1, color: '#3b82f6' })
          
          // Lower moon
          const angle2 = Math.random() * Math.PI
          const x2 = Math.cos(angle2) + Math.random() * 0.3 + 1
          const y2 = -Math.sin(angle2) + Math.random() * 0.3 - 1
          points.push({ x: x2, y: y2, label: 0, color: '#ef4444' })
        }
        break
      case 'linear':
        for (let i = 0; i < 100; i++) {
          const x = Math.random() * 10 - 5
          const y = Math.random() * 10 - 5
          const label = (x + y > 0) ? 1 : 0
          points.push({
            x, y, label,
            color: label === 1 ? '#3b82f6' : '#ef4444'
          })
        }
        break
    }
    
    setDataPoints(points)
    setTree(null)
    setCurrentStep(0)
  }, [])

  // Calculate Gini impurity
  const calculateGini = (labels: number[]): number => {
    if (labels.length === 0) return 0
    
    const counts = labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    let gini = 1
    for (const count of Object.values(counts)) {
      const prob = count / labels.length
      gini -= prob * prob
    }
    
    return gini
  }

  // Find best split
  const findBestSplit = (points: DataPoint[], feature: string): { threshold: number; gain: number } | null => {
    if (points.length < minSamplesSplit) return null
    
    let bestSplit = null
    let bestGain = -1
    
    const values = points.map(p => feature === 'x' ? p.x : p.y).sort((a, b) => a - b)
    
    for (let i = 1; i < values.length; i++) {
      const threshold = (values[i - 1] + values[i]) / 2
      
      const left = points.filter(p => (feature === 'x' ? p.x : p.y) <= threshold)
      const right = points.filter(p => (feature === 'x' ? p.x : p.y) > threshold)
      
      if (left.length === 0 || right.length === 0) continue
      
      const parentImpurity = calculateGini(points.map(p => p.label))
      const leftImpurity = calculateGini(left.map(p => p.label))
      const rightImpurity = calculateGini(right.map(p => p.label))
      
      const gain = parentImpurity - (left.length / points.length) * leftImpurity - 
                   (right.length / points.length) * rightImpurity
      
      if (gain > bestGain) {
        bestGain = gain
        bestSplit = { threshold, gain }
      }
    }
    
    return bestSplit
  }

  // Build decision tree
  const buildTree = (points: DataPoint[], depth: number = 0, nodeId: string = 'root'): TreeNode | null => {
    if (depth >= maxDepth || points.length < minSamplesSplit) {
      const labels = points.map(p => p.label)
      const prediction = labels.length > 0 ? (labels.filter(l => l === 1).length > labels.length / 2 ? 1 : 0) : 0
      return {
        id: nodeId,
        isLeaf: true,
        prediction,
        samples: points.length,
        impurity: calculateGini(labels)
      }
    }
    
    const xSplit = findBestSplit(points, 'x')
    const ySplit = findBestSplit(points, 'y')
    
    let bestSplit = xSplit
    let feature = 'x'
    
    if (ySplit && (!bestSplit || ySplit.gain > bestSplit.gain)) {
      bestSplit = ySplit
      feature = 'y'
    }
    
    if (!bestSplit || bestSplit.gain <= 0) {
      const labels = points.map(p => p.label)
      const prediction = labels.length > 0 ? (labels.filter(l => l === 1).length > labels.length / 2 ? 1 : 0) : 0
      return {
        id: nodeId,
        isLeaf: true,
        prediction,
        samples: points.length,
        impurity: calculateGini(labels)
      }
    }
    
    const left = points.filter(p => (feature === 'x' ? p.x : p.y) <= bestSplit.threshold)
    const right = points.filter(p => (feature === 'x' ? p.x : p.y) > bestSplit.threshold)
    
    const node: TreeNode = {
      id: nodeId,
      feature,
      threshold: bestSplit.threshold,
      samples: points.length,
      impurity: calculateGini(points.map(p => p.label)),
      isLeaf: false
    }
    
    node.left = buildTree(left, depth + 1, `${nodeId}-left`)
    node.right = buildTree(right, depth + 1, `${nodeId}-right`)
    
    return node
  }

  // Calculate tree node positions for visualization
  const calculateTreePositions = (node: TreeNode, x: number, y: number, spread: number): void => {
    node.x = x
    node.y = y
    
    if (!node.isLeaf) {
      if (node.left) calculateTreePositions(node.left, x - spread, y + 60, spread / 2)
      if (node.right) calculateTreePositions(node.right, x + spread, y + 60, spread / 2)
    }
  }

  // Draw decision boundary
  const drawDecisionBoundary = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !tree) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Draw decision boundary
    if (showDecisionBoundary) {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let px = 0; px < width; px += 2) {
        for (let py = 0; py < height; py += 2) {
          const x = (px / width) * 10 - 5
          const y = (py / height) * 10 - 5
          
          const prediction = predict(tree, x, y)
          const color = prediction === 1 ? [59, 130, 246, 30] : [239, 68, 68, 30]
          
          for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
              const idx = ((py + dy) * width + (px + dx)) * 4
              data[idx] = color[0]
              data[idx + 1] = color[1]
              data[idx + 2] = color[2]
              data[idx + 3] = color[3]
            }
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }
    
    // Draw data points
    dataPoints.forEach(point => {
      const px = ((point.x + 5) / 10) * width
      const py = ((point.y + 5) / 10) * height
      
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, 2 * Math.PI)
      ctx.fillStyle = point.color
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [dataPoints, tree, showDecisionBoundary])

  // Predict using the tree
  const predict = (node: TreeNode, x: number, y: number): number => {
    if (node.isLeaf) {
      return node.prediction || 0
    }
    
    const value = node.feature === 'x' ? x : y
    if (value <= node.threshold) {
      return node.left ? predict(node.left, x, y) : 0
    } else {
      return node.right ? predict(node.right, x, y) : 0
    }
  }

  // Draw tree visualization
  const drawTree = useCallback(() => {
    const canvas = treeCanvasRef.current
    if (!canvas || !tree) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Calculate positions
    calculateTreePositions(tree, width / 2, 30, width / 4)
    
    // Draw tree
    const drawNode = (node: TreeNode) => {
      if (!node.x || !node.y) return
      
      // Draw connections
      if (!node.isLeaf) {
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 2
        
        if (node.left && node.left.x && node.left.y) {
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(node.left.x, node.left.y)
          ctx.stroke()
        }
        
        if (node.right && node.right.x && node.right.y) {
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(node.right.x, node.right.y)
          ctx.stroke()
        }
      }
      
      // Draw node
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI)
      ctx.fillStyle = node.isLeaf ? '#10b981' : '#3b82f6'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
      
      // Draw text
      ctx.fillStyle = '#fff'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      if (node.isLeaf) {
        ctx.fillText(node.prediction?.toString() || '0', node.x, node.y)
      } else {
        ctx.fillText(node.feature, node.x, node.y - 5)
        ctx.fillText(node.threshold.toFixed(1), node.x, node.y + 5)
      }
      
      // Draw children
      if (!node.isLeaf) {
        if (node.left) drawNode(node.left)
        if (node.right) drawNode(node.right)
      }
    }
    
    drawNode(tree)
  }, [tree])

  // Train tree
  const trainTree = async () => {
    setIsTraining(true)
    setCurrentStep(0)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newTree = buildTree(dataPoints)
    setTree(newTree)
    
    setIsTraining(false)
  }

  // Initialize dataset
  useEffect(() => {
    generateDataset(datasetType)
  }, [datasetType, generateDataset])

  // Update visualizations
  useEffect(() => {
    drawDecisionBoundary()
  }, [drawDecisionBoundary])

  useEffect(() => {
    drawTree()
  }, [drawTree])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <BackButton />
        
        <div className="flex items-center gap-3 mb-2">
          <TreePine className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Decision Tree Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Visualize how decision trees learn to classify data through recursive splitting
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
                    <SelectItem value="xor">XOR Pattern</SelectItem>
                    <SelectItem value="circles">Concentric Circles</SelectItem>
                    <SelectItem value="moons">Two Moons</SelectItem>
                    <SelectItem value="linear">Linear Separable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tree Parameters */}
              <div>
                <Label>Max Depth: {maxDepth}</Label>
                <Slider
                  value={[maxDepth]}
                  onValueChange={(value) => setMaxDepth(value[0])}
                  max={6}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Min Samples Split: {minSamplesSplit}</Label>
                <Slider
                  value={[minSamplesSplit]}
                  onValueChange={(value) => setMinSamplesSplit(value[0])}
                  max={20}
                  min={2}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="boundary"
                    checked={showDecisionBoundary}
                    onCheckedChange={setShowDecisionBoundary}
                  />
                  <Label htmlFor="boundary">Show Decision Boundary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tree"
                    checked={showTree}
                    onCheckedChange={setShowTree}
                  />
                  <Label htmlFor="tree">Show Tree Structure</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={trainTree} 
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
                      <Play className="mr-2 h-4 w-4" />
                      Train Tree
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => generateDataset(datasetType)}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Data
                </Button>
              </div>

              {/* Tree Info */}
              {tree && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Tree Information</h4>
                  <div className="text-sm space-y-1">
                    <p>Depth: {maxDepth}</p>
                    <p>Total Samples: {dataPoints.length}</p>
                    <p>Root Impurity: {tree.impurity.toFixed(3)}</p>
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
          <Tabs defaultValue="boundary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="boundary">Decision Boundary</TabsTrigger>
              <TabsTrigger value="tree">Tree Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="boundary" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Decision Boundary Visualization</CardTitle>
                  <CardDescription>
                    See how the decision tree partitions the feature space
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border rounded-lg w-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs">Class 1</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs">Class 0</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tree" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tree Structure</CardTitle>
                  <CardDescription>
                    Interactive visualization of the decision tree hierarchy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={treeCanvasRef}
                      width={600}
                      height={400}
                      className="border rounded-lg w-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs">Decision Node</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Leaf Node</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}