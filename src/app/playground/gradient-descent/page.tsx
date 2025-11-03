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
import { ArrowLeft, Play, Pause, RotateCcw, TrendingDown, Info, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface OptimizationPoint {
  x: number
  y: number
  iteration: number
}

interface LossFunction {
  name: string
  calculate: (x: number, y: number) => number
  gradient: (x: number, y: number) => { dx: number;
import BackButton from "@/components/BackButton" dy: number }
  globalMinima: { x: number; y: number }
  range: { x: [number, number]; y: [number, number] }
}

const lossFunctions: Record<string, LossFunction> = {
  quadratic: {
    name: 'Quadratic Bowl',
    calculate: (x: number, y: number) => x * x + y * y,
    gradient: (x: number, y: number) => ({ dx: 2 * x, dy: 2 * y }),
    globalMinima: { x: 0, y: 0 },
    range: { x: [-5, 5], y: [-5, 5] }
  },
  rosenbrock: {
    name: 'Rosenbrock Function',
    calculate: (x: number, y: number) => Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2),
    gradient: (x: number, y: number) => ({
      dx: -2 * (1 - x) - 400 * x * (y - x * x),
      dy: 200 * (y - x * x)
    }),
    globalMinima: { x: 1, y: 1 },
    range: { x: [-2, 2], y: [-1, 3] }
  },
  himmelblau: {
    name: 'Himmelblau\'s Function',
    calculate: (x: number, y: number) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
    gradient: (x: number, y: number) => ({
      dx: 4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
      dy: 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7)
    }),
    globalMinima: { x: 3, y: 2 },
    range: { x: [-5, 5], y: [-5, 5] }
  },
  saddle: {
    name: 'Saddle Point',
    calculate: (x: number, y: number) => x * x - y * y,
    gradient: (x: number, y: number) => ({ dx: 2 * x, dy: -2 * y }),
    globalMinima: { x: 0, y: 0 },
    range: { x: [-3, 3], y: [-3, 3] }
  }
}

export default function GradientDescentPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lossCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [selectedFunction, setSelectedFunction] = useState('quadratic')
  const [learningRate, setLearningRate] = useState(0.1)
  const [currentPosition, setCurrentPosition] = useState({ x: 3, y: 3 })
  const [optimizationPath, setOptimizationPath] = useState<OptimizationPoint[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [maxIterations, setMaxIterations] = useState(100)
  const [showContour, setShowContour] = useState(true)
  const [showPath, setShowPath] = useState(true)
  const [showGradient, setShowGradient] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(100)
  const [optimizer, setOptimizer] = useState('gd') // gd, momentum, adam
  const [lossHistory, setLossHistory] = useState<number[]>([])

  const currentLossFunction = lossFunctions[selectedFunction]

  // Calculate loss at current position
  const calculateLoss = useCallback((x: number, y: number) => {
    return currentLossFunction.calculate(x, y)
  }, [currentLossFunction])

  // Draw contour plot
  const drawContourPlot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    const { range } = currentLossFunction
    
    ctx.clearRect(0, 0, width, height)
    
    // Create contour data
    const resolution = 50
    const contourData: number[][] = []
    
    for (let i = 0; i < resolution; i++) {
      contourData[i] = []
      for (let j = 0; j < resolution; j++) {
        const x = range.x[0] + (range.x[1] - range.x[0]) * (i / resolution)
        const y = range.y[0] + (range.y[1] - range.y[0]) * (j / resolution)
        contourData[i][j] = calculateLoss(x, y)
      }
    }
    
    // Find min and max for normalization
    let minLoss = Infinity
    let maxLoss = -Infinity
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        minLoss = Math.min(minLoss, contourData[i][j])
        maxLoss = Math.max(maxLoss, contourData[i][j])
      }
    }
    
    // Draw contour
    if (showContour) {
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let px = 0; px < width; px++) {
        for (let py = 0; py < height; py++) {
          const i = Math.floor((px / width) * resolution)
          const j = Math.floor((py / height) * resolution)
          
          const normalizedValue = (contourData[i][j] - minLoss) / (maxLoss - minLoss)
          const intensity = Math.floor((1 - normalizedValue) * 255)
          
          const idx = (py * width + px) * 4
          data[idx] = intensity
          data[idx + 1] = intensity
          data[idx + 2] = intensity
          data[idx + 3] = 255
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }
    
    // Draw optimization path
    if (showPath && optimizationPath.length > 0) {
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      optimizationPath.forEach((point, index) => {
        const px = ((point.x - range.x[0]) / (range.x[1] - range.x[0])) * width
        const py = ((point.y - range.y[0]) / (range.y[1] - range.y[0])) * height
        
        if (index === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      })
      
      ctx.stroke()
      
      // Draw points
      optimizationPath.forEach((point, index) => {
        const px = ((point.x - range.x[0]) / (range.x[1] - range.x[0])) * width
        const py = ((point.y - range.y[0]) / (range.y[1] - range.y[0])) * height
        
        ctx.beginPath()
        ctx.arc(px, py, 3, 0, 2 * Math.PI)
        ctx.fillStyle = index === optimizationPath.length - 1 ? '#10b981' : '#ef4444'
        ctx.fill()
      })
    }
    
    // Draw current position
    const px = ((currentPosition.x - range.x[0]) / (range.x[1] - range.x[0])) * width
    const py = ((currentPosition.y - range.y[0]) / (range.y[1] - range.y[0])) * height
    
    ctx.beginPath()
    ctx.arc(px, py, 6, 0, 2 * Math.PI)
    ctx.fillStyle = '#3b82f6'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw gradient vector
    if (showGradient) {
      const gradient = currentLossFunction.gradient(currentPosition.x, currentPosition.y)
      const magnitude = Math.sqrt(gradient.dx * gradient.dx + gradient.dy * gradient.dy)
      const scale = 50 / Math.max(magnitude, 1)
      
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px - gradient.dx * scale, py - gradient.dy * scale)
      ctx.stroke()
      
      // Arrow head
      const angle = Math.atan2(-gradient.dy, -gradient.dx)
      ctx.beginPath()
      ctx.moveTo(px - gradient.dx * scale, py - gradient.dy * scale)
      ctx.lineTo(
        px - gradient.dx * scale + 5 * Math.cos(angle - Math.PI / 6),
        py - gradient.dy * scale + 5 * Math.sin(angle - Math.PI / 6)
      )
      ctx.moveTo(px - gradient.dx * scale, py - gradient.dy * scale)
      ctx.lineTo(
        px - gradient.dx * scale + 5 * Math.cos(angle + Math.PI / 6),
        py - gradient.dy * scale + 5 * Math.sin(angle + Math.PI / 6)
      )
      ctx.stroke()
    }
    
    // Draw global minimum
    const minPx = ((currentLossFunction.globalMinima.x - range.x[0]) / (range.x[1] - range.x[0])) * width
    const minPy = ((currentLossFunction.globalMinima.y - range.y[0]) / (range.y[1] - range.y[0])) * height
    
    ctx.beginPath()
    ctx.arc(minPx, minPy, 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#10b981'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [currentPosition, optimizationPath, currentLossFunction, showContour, showPath, showGradient, calculateLoss])

  // Draw loss history
  const drawLossHistory = useCallback(() => {
    const canvas = lossCanvasRef.current
    if (!canvas || lossHistory.length === 0) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.moveTo(40, 20)
    ctx.lineTo(40, height - 30)
    ctx.stroke()
    
    // Draw loss curve
    const maxLoss = Math.max(...lossHistory)
    const minLoss = Math.min(...lossHistory)
    const lossRange = maxLoss - minLoss || 1
    
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    lossHistory.forEach((loss, index) => {
      const x = 40 + ((width - 60) / (lossHistory.length - 1)) * index
      const y = height - 30 - ((height - 50) * ((loss - minLoss) / lossRange))
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Draw current point
    if (lossHistory.length > 0) {
      const lastLoss = lossHistory[lossHistory.length - 1]
      const x = 40 + ((width - 60) / (lossHistory.length - 1)) * (lossHistory.length - 1)
      const y = height - 30 - ((height - 50) * ((lastLoss - minLoss) / lossRange))
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
    }
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Iteration', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Loss', 0, 0)
    ctx.restore()
  }, [lossHistory])

  // Gradient descent step
  const gradientDescentStep = useCallback(() => {
    const gradient = currentLossFunction.gradient(currentPosition.x, currentPosition.y)
    
    let newX = currentPosition.x
    let newY = currentPosition.y
    
    switch (optimizer) {
      case 'gd':
        newX = currentPosition.x - learningRate * gradient.dx
        newY = currentPosition.y - learningRate * gradient.dy
        break
      case 'momentum':
        // Simplified momentum
        const momentum = 0.9
        if (optimizationPath.length > 0) {
          const prevPoint = optimizationPath[optimizationPath.length - 1]
          const prevGradient = currentLossFunction.gradient(prevPoint.x, prevPoint.y)
          newX = currentPosition.x - learningRate * gradient.dx - momentum * learningRate * prevGradient.dx
          newY = currentPosition.y - learningRate * gradient.dy - momentum * learningRate * prevGradient.dy
        } else {
          newX = currentPosition.x - learningRate * gradient.dx
          newY = currentPosition.y - learningRate * gradient.dy
        }
        break
      case 'adam':
        // Simplified Adam
        const beta1 = 0.9
        const beta2 = 0.999
        const epsilon = 1e-8
        newX = currentPosition.x - learningRate * gradient.dx
        newY = currentPosition.y - learningRate * gradient.dy
        break
    }
    
    const newPosition = { x: newX, y: newY }
    setCurrentPosition(newPosition)
    
    const newPoint: OptimizationPoint = {
      x: newX,
      y: newY,
      iteration: currentIteration
    }
    
    setOptimizationPath(prev => [...prev, newPoint])
    setLossHistory(prev => [...prev, calculateLoss(newX, newY)])
    setCurrentIteration(prev => prev + 1)
  }, [currentPosition, currentLossFunction, learningRate, optimizer, optimizationPath, currentIteration, calculateLoss])

  // Start optimization
  const startOptimization = async () => {
    setIsOptimizing(true)
    setIsPaused(false)
    
    while (currentIteration < maxIterations && isOptimizing && !isPaused) {
      gradientDescentStep()
      await new Promise(resolve => setTimeout(resolve, animationSpeed))
    }
    
    setIsOptimizing(false)
  }

  // Reset optimization
  const resetOptimization = () => {
    setIsOptimizing(false)
    setIsPaused(false)
    setCurrentIteration(0)
    setOptimizationPath([])
    setLossHistory([])
    setCurrentPosition({ x: 3, y: 3 })
  }

  // Update visualizations
  useEffect(() => {
    drawContourPlot()
  }, [drawContourPlot])

  useEffect(() => {
    drawLossHistory()
  }, [drawLossHistory])

  // Initialize position
  useEffect(() => {
    resetOptimization()
  }, [selectedFunction])

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
          <TrendingDown className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gradient Descent Visualizer</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Watch how optimization algorithms navigate loss surfaces to find minima
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
              {/* Loss Function Selection */}
              <div>
                <Label htmlFor="function">Loss Function</Label>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(lossFunctions).map(([key, func]) => (
                      <SelectItem key={key} value={key}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Optimizer Selection */}
              <div>
                <Label htmlFor="optimizer">Optimizer</Label>
                <Select value={optimizer} onValueChange={setOptimizer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gd">Gradient Descent</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="adam">Adam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Rate */}
              <div>
                <Label>Learning Rate: {learningRate.toFixed(3)}</Label>
                <Slider
                  value={[learningRate]}
                  onValueChange={(value) => setLearningRate(value[0])}
                  max={0.5}
                  min={0.001}
                  step={0.001}
                  className="mt-2"
                />
              </div>

              {/* Max Iterations */}
              <div>
                <Label>Max Iterations: {maxIterations}</Label>
                <Slider
                  value={[maxIterations]}
                  onValueChange={(value) => setMaxIterations(value[0])}
                  max={500}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Animation Speed */}
              <div>
                <Label>Animation Speed: {animationSpeed}ms</Label>
                <Slider
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={1000}
                  min={10}
                  step={10}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="contour"
                    checked={showContour}
                    onCheckedChange={setShowContour}
                  />
                  <Label htmlFor="contour">Show Contour</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="path"
                    checked={showPath}
                    onCheckedChange={setShowPath}
                  />
                  <Label htmlFor="path">Show Path</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gradient"
                    checked={showGradient}
                    onCheckedChange={setShowGradient}
                  />
                  <Label htmlFor="gradient">Show Gradient</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={startOptimization} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      {isPaused ? 'Resume' : 'Optimizing...'}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Start Optimization
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetOptimization}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Optimization Info */}
              {optimizationPath.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Optimization Info</h4>
                  <div className="text-sm space-y-1">
                    <p>Iteration: {currentIteration}</p>
                    <p>Current Loss: {calculateLoss(currentPosition.x, currentPosition.y).toFixed(4)}</p>
                    <p>Position: ({currentPosition.x.toFixed(3)}, {currentPosition.y.toFixed(3)})</p>
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
          <Tabs defaultValue="contour" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contour">Contour Plot</TabsTrigger>
              <TabsTrigger value="loss">Loss History</TabsTrigger>
            </TabsList>

            <TabsContent value="contour" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loss Surface Contour</CardTitle>
                  <CardDescription>
                    Visualize the optimization path on the loss surface
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
                    <div className="absolute top-2 right-2 flex gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Current Position</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Global Minimum</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Optimization Path</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loss" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loss History</CardTitle>
                  <CardDescription>
                    Track how the loss decreases over iterations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={lossCanvasRef}
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
    </div>
  )
}