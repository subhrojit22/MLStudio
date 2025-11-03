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
import { ArrowLeft, Play, RotateCcw, TrendingUp, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DataPoint {
  x: number
  y: number
  isTrain: boolean
}

interface ModelMetrics {
  trainLoss: number
  valLoss: number
  trainR2: number
  valR2: number
}

export default function OverfittingExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const metricsCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [polynomialDegree, setPolynomialDegree] = useState(1)
  const [noiseLevel, setNoiseLevel] = useState(0.1)
  const [trainSize, setTrainSize] = useState(20)
  const [regularizationStrength, setRegularizationStrength] = useState(0)
  const [showTrainData, setShowTrainData] = useState(true)
  const [showValData, setShowValData] = useState(true)
  const [showModel, setShowModel] = useState(true)
  const [datasetType, setDatasetType] = useState('polynomial')
  const [metrics, setMetrics] = useState<ModelMetrics>({
    trainLoss: 0,
    valLoss: 0,
    trainR2: 0,
    valR2: 0
  })
  const [metricsHistory, setMetricsHistory] = useState<ModelMetrics[]>([])

  // Generate synthetic datasets
  const generateDataset = useCallback(() => {
    const points: DataPoint[] = []
    
    switch (datasetType) {
      case 'polynomial':
        // Generate polynomial data: y = 0.5x^3 - 2x^2 + x + 2
        for (let i = 0;
import BackButton from "@/components/BackButton" i < trainSize + 10; i++) {
          const x = (i / (trainSize + 10)) * 6 - 3
          const trueY = 0.5 * Math.pow(x, 3) - 2 * Math.pow(x, 2) + x + 2
          const noise = (Math.random() - 0.5) * 2 * noiseLevel
          const y = trueY + noise
          
          points.push({
            x, y,
            isTrain: i < trainSize
          })
        }
        break
      case 'sine':
        // Generate sine wave data
        for (let i = 0; i < trainSize + 10; i++) {
          const x = (i / (trainSize + 10)) * 4 * Math.PI
          const trueY = Math.sin(x) + 0.5 * Math.cos(2 * x)
          const noise = (Math.random() - 0.5) * 2 * noiseLevel
          const y = trueY + noise
          
          points.push({
            x, y,
            isTrain: i < trainSize
          })
        }
        break
      case 'linear':
        // Generate linear data with noise
        for (let i = 0; i < trainSize + 10; i++) {
          const x = (i / (trainSize + 10)) * 6 - 3
          const trueY = 2 * x + 1
          const noise = (Math.random() - 0.5) * 2 * noiseLevel
          const y = trueY + noise
          
          points.push({
            x, y,
            isTrain: i < trainSize
          })
        }
        break
    }
    
    setDataPoints(points)
  }, [datasetType, trainSize, noiseLevel])

  // Polynomial regression
  const fitPolynomial = useCallback((points: DataPoint[], degree: number, lambda: number = 0) => {
    const trainPoints = points.filter(p => p.isTrain)
    const valPoints = points.filter(p => !p.isTrain)
    
    if (trainPoints.length === 0) return { coefficients: [], trainLoss: 0, valLoss: 0, trainR2: 0, valR2: 0 }
    
    // Create design matrix
    const X: number[][] = []
    const y: number[] = []
    
    trainPoints.forEach(point => {
      const row: number[] = []
      for (let i = 0; i <= degree; i++) {
        row.push(Math.pow(point.x, i))
      }
      X.push(row)
      y.push(point.y)
    })
    
    // Add regularization
    const n = X.length
    const m = degree + 1
    
    // Compute X^T * X + λ*I
    const XtX: number[][] = []
    for (let i = 0; i < m; i++) {
      XtX[i] = []
      for (let j = 0; j < m; j++) {
        let sum = 0
        for (let k = 0; k < n; k++) {
          sum += X[k][i] * X[k][j]
        }
        XtX[i][j] = sum + (i === j ? lambda : 0)
      }
    }
    
    // Compute X^T * y
    const Xty: number[] = []
    for (let i = 0; i < m; i++) {
      let sum = 0
      for (let k = 0; k < n; k++) {
        sum += X[k][i] * y[k]
      }
      Xty[i] = sum
    }
    
    // Solve for coefficients using Gaussian elimination
    const coefficients = solveLinearSystem(XtX, Xty)
    
    // Calculate predictions and losses
    const trainPredictions = trainPoints.map(p => 
      coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(p.x, i), 0)
    )
    const valPredictions = valPoints.map(p => 
      coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(p.x, i), 0)
    )
    
    const trainLoss = calculateMSE(trainPoints.map(p => p.y), trainPredictions)
    const valLoss = calculateMSE(valPoints.map(p => p.y), valPredictions)
    
    const trainR2 = calculateR2(trainPoints.map(p => p.y), trainPredictions)
    const valR2 = calculateR2(valPoints.map(p => p.y), valPredictions)
    
    return { coefficients, trainLoss, valLoss, trainR2, valR2 }
  }, [])

  // Solve linear system using Gaussian elimination
  const solveLinearSystem = (A: number[][], b: number[]): number[] => {
    const n = A.length
    const augmented = A.map((row, i) => [...row, b[i]])
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]
      
      // Eliminate column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i]
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j]
        }
      }
    }
    
    // Back substitution
    const x = new Array(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n]
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j]
      }
      x[i] /= augmented[i][i]
    }
    
    return x
  }

  // Calculate Mean Squared Error
  const calculateMSE = (trueValues: number[], predictions: number[]): number => {
    if (trueValues.length === 0) return 0
    const sum = trueValues.reduce((acc, val, i) => acc + Math.pow(val - predictions[i], 2), 0)
    return sum / trueValues.length
  }

  // Calculate R-squared
  const calculateR2 = (trueValues: number[], predictions: number[]): number => {
    if (trueValues.length === 0) return 0
    const mean = trueValues.reduce((acc, val) => acc + val, 0) / trueValues.length
    const totalSS = trueValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0)
    const residualSS = trueValues.reduce((acc, val, i) => acc + Math.pow(val - predictions[i], 2), 0)
    return 1 - (residualSS / totalSS)
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
    
    // Find data bounds
    const xValues = dataPoints.map(p => p.x)
    const yValues = dataPoints.map(p => p.y)
    const xMin = Math.min(...xValues) - 0.5
    const xMax = Math.max(...xValues) + 0.5
    const yMin = Math.min(...yValues) - 0.5
    const yMax = Math.max(...yValues) + 0.5
    
    // Helper function to convert coordinates
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * (width - 60) + 40
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * (height - 60) - 30
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 30)
    ctx.lineTo(width - 20, height - 30)
    ctx.moveTo(40, 20)
    ctx.lineTo(40, height - 30)
    ctx.stroke()
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const x = 40 + ((width - 60) / 10) * i
      const y = 30 + ((height - 60) / 10) * i
      
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, height - 30)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }
    
    // Draw model curve
    if (showModel && dataPoints.length > 0) {
      const result = fitPolynomial(dataPoints, polynomialDegree, regularizationStrength)
      
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let px = 40; px <= width - 20; px += 2) {
        const x = xMin + ((px - 40) / (width - 60)) * (xMax - xMin)
        const y = result.coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0)
        const py = toCanvasY(y)
        
        if (px === 40) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      
      ctx.stroke()
    }
    
    // Draw data points
    dataPoints.forEach(point => {
      const px = toCanvasX(point.x)
      const py = toCanvasY(point.y)
      
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, 2 * Math.PI)
      ctx.fillStyle = point.isTrain ? '#10b981' : '#f59e0b'
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.stroke()
    })
    
    // Legend
    const legendY = 30
    if (showTrainData) {
      ctx.beginPath()
      ctx.arc(width - 150, legendY, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#10b987'
      ctx.fill()
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.fillText('Training Data', width - 140, legendY + 4)
    }
    
    if (showValData) {
      ctx.beginPath()
      ctx.arc(width - 150, legendY + 20, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#f59e0b'
      ctx.fill()
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.fillText('Validation Data', width - 140, legendY + 24)
    }
    
    if (showModel) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(width - 160, legendY + 40)
      ctx.lineTo(width - 140, legendY + 40)
      ctx.stroke()
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.fillText('Model', width - 130, legendY + 44)
    }
  }, [dataPoints, polynomialDegree, regularizationStrength, showTrainData, showValData, showModel, fitPolynomial])

  // Draw metrics comparison
  const drawMetricsComparison = useCallback(() => {
    const canvas = metricsCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.moveTo(60, 20)
    ctx.lineTo(60, height - 40)
    ctx.stroke()
    
    // Draw current metrics
    const maxLoss = Math.max(metrics.trainLoss, metrics.valLoss, 1)
    const trainLossY = height - 40 - ((height - 60) * (metrics.trainLoss / maxLoss))
    const valLossY = height - 40 - ((height - 60) * (metrics.valLoss / maxLoss))
    
    // Training loss bar
    ctx.fillStyle = '#10b987'
    ctx.fillRect(100, trainLossY, 60, height - 40 - trainLossY)
    
    // Validation loss bar
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(200, valLossY, 60, height - 40 - valLossY)
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Train', 130, height - 25)
    ctx.fillText('Validation', 230, height - 25)
    
    // Values
    ctx.fillText(metrics.trainLoss.toFixed(3), 130, trainLossY - 5)
    ctx.fillText(metrics.valLoss.toFixed(3), 230, valLossY - 5)
    
    // Y-axis label
    ctx.save()
    ctx.translate(25, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Loss', 0, 0)
    ctx.restore()
    
    // Overfitting indicator
    const gap = metrics.valLoss - metrics.trainLoss
    if (gap > 0.1) {
      ctx.fillStyle = '#ef4444'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⚠ Overfitting', width / 2, 20)
    } else if (gap < -0.1) {
      ctx.fillStyle = '#3b82f6'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✓ Underfitting', width / 2, 20)
    } else {
      ctx.fillStyle = '#10b987'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✓ Good Fit', width / 2, 20)
    }
  }, [metrics])

  // Update metrics
  const updateMetrics = useCallback(() => {
    if (dataPoints.length === 0) return
    
    const result = fitPolynomial(dataPoints, polynomialDegree, regularizationStrength)
    setMetrics({
      trainLoss: result.trainLoss,
      valLoss: result.valLoss,
      trainR2: result.trainR2,
      valR2: result.valR2
    })
    
    setMetricsHistory(prev => [...prev.slice(-19), {
      trainLoss: result.trainLoss,
      valLoss: result.valLoss,
      trainR2: result.trainR2,
      valR2: result.valR2
    }])
  }, [dataPoints, polynomialDegree, regularizationStrength, fitPolynomial])

  // Initialize dataset
  useEffect(() => {
    generateDataset()
  }, [generateDataset])

  // Update metrics when parameters change
  useEffect(() => {
    updateMetrics()
  }, [updateMetrics])

  // Update visualizations
  useEffect(() => {
    drawVisualization()
  }, [drawVisualization])

  useEffect(() => {
    drawMetricsComparison()
  }, [drawMetricsComparison])

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
          <AlertTriangle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Overfitting/Underfitting Explorer</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore the bias-variance tradeoff and understand model complexity effects
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
                    <SelectItem value="polynomial">Polynomial</SelectItem>
                    <SelectItem value="sine">Sine Wave</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Complexity */}
              <div>
                <Label>Polynomial Degree: {polynomialDegree}</Label>
                <Slider
                  value={[polynomialDegree]}
                  onValueChange={(value) => setPolynomialDegree(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Regularization */}
              <div>
                <Label>Regularization Strength: {regularizationStrength.toFixed(3)}</Label>
                <Slider
                  value={[regularizationStrength]}
                  onValueChange={(value) => setRegularizationStrength(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              {/* Noise Level */}
              <div>
                <Label>Noise Level: {noiseLevel.toFixed(2)}</Label>
                <Slider
                  value={[noiseLevel]}
                  onValueChange={(value) => setNoiseLevel(value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="mt-2"
                />
              </div>

              {/* Training Size */}
              <div>
                <Label>Training Size: {trainSize}</Label>
                <Slider
                  value={[trainSize]}
                  onValueChange={(value) => setTrainSize(value[0])}
                  max={50}
                  min={5}
                  step={1}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="train"
                    checked={showTrainData}
                    onCheckedChange={setShowTrainData}
                  />
                  <Label htmlFor="train">Show Training Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="val"
                    checked={showValData}
                    onCheckedChange={setShowValData}
                  />
                  <Label htmlFor="val">Show Validation Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="model"
                    checked={showModel}
                    onCheckedChange={setShowModel}
                  />
                  <Label htmlFor="model">Show Model</Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={generateDataset}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Generate New Data
                </Button>
              </div>

              {/* Model Info */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Model Performance</h4>
                <div className="text-sm space-y-1">
                  <p>Train Loss: {metrics.trainLoss.toFixed(4)}</p>
                  <p>Val Loss: {metrics.valLoss.toFixed(4)}</p>
                  <p>Train R²: {metrics.trainR2.toFixed(4)}</p>
                  <p>Val R²: {metrics.valR2.toFixed(4)}</p>
                  <p>Gap: {(metrics.valLoss - metrics.trainLoss).toFixed(4)}</p>
                </div>
              </div>
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
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visualization">Model Fit</TabsTrigger>
              <TabsTrigger value="metrics">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Fit Visualization</CardTitle>
                  <CardDescription>
                    See how the model fits training and validation data
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Compare training and validation performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={metricsCanvasRef}
                      width={600}
                      height={300}
                      className="border rounded-lg w-full"
                    />
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Model Complexity</h4>
                      <div className="text-sm space-y-1">
                        <p>Degree: {polynomialDegree}</p>
                        <p>Parameters: {polynomialDegree + 1}</p>
                        <p>Regularization: {regularizationStrength.toFixed(3)}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Fit Status</h4>
                      <div className="text-sm">
                        {metrics.valLoss - metrics.trainLoss > 0.1 ? (
                          <p className="text-red-600">Overfitting detected</p>
                        ) : metrics.valLoss - metrics.trainLoss < -0.1 ? (
                          <p className="text-blue-600">Underfitting detected</p>
                        ) : (
                          <p className="text-green-600">Good fit achieved</p>
                        )}
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