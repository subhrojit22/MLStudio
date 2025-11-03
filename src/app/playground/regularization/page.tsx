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
import { ArrowLeft, Play, RotateCcw, Shield, Info, TrendingDown } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface DataPoint {
  x: number
  y: number
  isTrain: boolean
}

interface ModelWeights {
  coefficients: number[]
  regularization: number
}

interface RegularizationMetrics {
  trainLoss: number
  valLoss: number
  weightNorm: number
  effectiveComplexity: number
}

export default function RegularizationPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const weightsCanvasRef = useRef<HTMLCanvasElement>(null)
  const metricsCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [modelType, setModelType] = useState('linear')
  const [regularizationType, setRegularizationType] = useState('l2')
  const [regularizationStrength, setRegularizationStrength] = useState(0.1)
  const [polynomialDegree, setPolynomialDegree] = useState(3)
  const [noiseLevel, setNoiseLevel] = useState(0.2)
  const [trainSize, setTrainSize] = useState(20)
  const [showTrainData, setShowTrainData] = useState(true)
  const [showValData, setShowValData] = useState(true)
  const [showModel, setShowModel] = useState(true)
  const [showWeights, setShowWeights] = useState(true)
  const [dropoutRate, setDropoutRate] = useState(0)
  const [metrics, setMetrics] = useState<RegularizationMetrics>({
    trainLoss: 0,
    valLoss: 0,
    weightNorm: 0,
    effectiveComplexity: 0
  })
  const [metricsHistory, setMetricsHistory] = useState<RegularizationMetrics[]>([])

  // Generate synthetic datasets
  const generateDataset = useCallback(() => {
    const points: DataPoint[] = []
    
    // Generate data with underlying pattern + noise
    for (let i = 0; i < trainSize + 10; i++) {
      const x = (i / (trainSize + 10)) * 6 - 3
      let trueY = 0
      
      switch (modelType) {
        case 'linear':
          trueY = 2 * x + 1
          break
        case 'polynomial':
          trueY = 0.5 * Math.pow(x, 3) - 2 * Math.pow(x, 2) + x + 2
          break
        case 'sine':
          trueY = Math.sin(x) + 0.5 * Math.cos(2 * x)
          break
      }
      
      const noise = (Math.random() - 0.5) * 2 * noiseLevel
      const y = trueY + noise
      
      points.push({
        x, y,
        isTrain: i < trainSize
      })
    }
    
    setDataPoints(points)
  }, [modelType, trainSize, noiseLevel])

  // Regularized regression
  const fitRegularizedModel = useCallback((points: DataPoint[], degree: number, lambda: number, type: string): ModelWeights => {
    const trainPoints = points.filter(p => p.isTrain)
    
    if (trainPoints.length === 0) return { coefficients: [], regularization: lambda }
    
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
    
    const n = X.length
    const m = degree + 1
    
    // Compute X^T * X
    const XtX: number[][] = []
    for (let i = 0; i < m; i++) {
      XtX[i] = []
      for (let j = 0; j < m; j++) {
        let sum = 0
        for (let k = 0; k < n; k++) {
          sum += X[k][i] * X[k][j]
        }
        XtX[i][j] = sum
      }
    }
    
    // Add regularization
    for (let i = 0; i < m; i++) {
      if (type === 'l2') {
        XtX[i][i] += lambda
      } else if (type === 'l1') {
        // L1 regularization approximated
        XtX[i][i] += lambda * 0.01
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
    
    // Solve for coefficients
    const coefficients = solveLinearSystem(XtX, Xty)
    
    return { coefficients, regularization: lambda }
  }, [])

  // Solve linear system
  const solveLinearSystem = (A: number[][], b: number[]): number[] => {
    const n = A.length
    const augmented = A.map((row, i) => [...row, b[i]])
    
    // Forward elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k
        }
      }
      
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]]
      
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

  // Calculate metrics
  const calculateMetrics = useCallback((points: DataPoint[], model: ModelWeights): RegularizationMetrics => {
    const trainPoints = points.filter(p => p.isTrain)
    const valPoints = points.filter(p => !p.isTrain)
    
    // Calculate predictions
    const trainPredictions = trainPoints.map(p => 
      model.coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(p.x, i), 0)
    )
    const valPredictions = valPoints.map(p => 
      model.coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(p.x, i), 0)
    )
    
    // Calculate losses
    const trainLoss = calculateMSE(trainPoints.map(p => p.y), trainPredictions)
    const valLoss = calculateMSE(valPoints.map(p => p.y), valPredictions)
    
    // Calculate weight norm
    const weightNorm = Math.sqrt(model.coefficients.reduce((sum, w) => sum + w * w, 0))
    
    // Calculate effective complexity
    const effectiveComplexity = model.coefficients.reduce((sum, w) => sum + Math.abs(w), 0)
    
    return {
      trainLoss,
      valLoss,
      weightNorm,
      effectiveComplexity
    }
  }, [])

  // Calculate MSE
  const calculateMSE = (trueValues: number[], predictions: number[]): number => {
    if (trueValues.length === 0) return 0
    const sum = trueValues.reduce((acc, val, i) => acc + Math.pow(val - predictions[i], 2), 0)
    return sum / trueValues.length
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
    
    // Helper functions
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
      const model = fitRegularizedModel(dataPoints, polynomialDegree, regularizationStrength, regularizationType)
      
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let px = 40; px <= width - 20; px += 2) {
        const x = xMin + ((px - 40) / (width - 60)) * (xMax - xMin)
        const y = model.coefficients.reduce((sum, coeff, i) => sum + coeff * Math.pow(x, i), 0)
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
  }, [dataPoints, polynomialDegree, regularizationStrength, regularizationType, showTrainData, showValData, showModel, fitRegularizedModel])

  // Draw weights visualization
  const drawWeights = useCallback(() => {
    const canvas = weightsCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (dataPoints.length === 0) return
    
    const model = fitRegularizedModel(dataPoints, polynomialDegree, regularizationStrength, regularizationType)
    
    // Draw weight bars
    const barWidth = (width - 80) / model.coefficients.length
    const maxWeight = Math.max(...model.coefficients.map(Math.abs))
    
    model.coefficients.forEach((weight, index) => {
      const x = 40 + index * barWidth
      const barHeight = Math.abs(weight) / (maxWeight || 1) * (height - 60)
      const y = height / 2 - (weight > 0 ? barHeight : 0)
      
      // Color based on regularization effect
      const intensity = Math.abs(weight) / (maxWeight || 1)
      ctx.fillStyle = weight > 0 ? 
        `rgba(59, 130, 246, ${intensity})` : 
        `rgba(239, 68, 68, ${intensity})`
      
      ctx.fillRect(x, y, barWidth - 4, barHeight)
      
      // Draw zero line
      ctx.strokeStyle = '#666'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, height / 2)
      ctx.lineTo(width - 40, height / 2)
      ctx.stroke()
      
      // Labels
      ctx.fillStyle = '#666'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`w${index}`, x + barWidth / 2, height - 10)
      ctx.fillText(weight.toFixed(3), x + barWidth / 2, y - 5)
    })
    
    // Title
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Model Weights', width / 2, 20)
  }, [dataPoints, polynomialDegree, regularizationStrength, regularizationType, fitRegularizedModel])

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
    
    // Draw metrics bars
    const metrics = [
      { name: 'Train Loss', value: metrics.trainLoss, color: '#10b987' },
      { name: 'Val Loss', value: metrics.valLoss, color: '#f59e0b' },
      { name: 'Weight Norm', value: metrics.weightNorm, color: '#3b82f6' },
      { name: 'Complexity', value: metrics.effectiveComplexity, color: '#8b5cf6' }
    ]
    
    const maxValue = Math.max(...metrics.map(m => m.value), 1)
    const barWidth = (width - 100) / metrics.length
    
    metrics.forEach((metric, index) => {
      const x = 70 + index * barWidth
      const barHeight = (metric.value / maxValue) * (height - 80)
      const y = height - 40 - barHeight
      
      ctx.fillStyle = metric.color
      ctx.fillRect(x, y, barWidth - 10, barHeight)
      
      // Labels
      ctx.fillStyle = '#666'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(metric.name, x + barWidth / 2, height - 25)
      ctx.fillText(metric.value.toFixed(3), x + barWidth / 2, y - 5)
    })
    
    // Y-axis label
    ctx.save()
    ctx.translate(25, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Value', 0, 0)
    ctx.restore()
  }, [metrics])

  // Update metrics
  const updateMetrics = useCallback(() => {
    if (dataPoints.length === 0) return
    
    const model = fitRegularizedModel(dataPoints, polynomialDegree, regularizationStrength, regularizationType)
    const newMetrics = calculateMetrics(dataPoints, model)
    setMetrics(newMetrics)
    
    setMetricsHistory(prev => [...prev.slice(-19), newMetrics])
  }, [dataPoints, polynomialDegree, regularizationStrength, regularizationType, calculateMetrics, fitRegularizedModel])

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
    drawWeights()
  }, [drawWeights])

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
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Regularization Effect Simulator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          See how L1, L2, and dropout regularization affect model weights and generalization
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
              {/* Model Type */}
              <div>
                <Label htmlFor="model">Model Type</Label>
                <Select value={modelType} onValueChange={setModelType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="polynomial">Polynomial</SelectItem>
                    <SelectItem value="sine">Sine Wave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Regularization Type */}
              <div>
                <Label htmlFor="regularization">Regularization Type</Label>
                <Select value={regularizationType} onValueChange={setRegularizationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="l1">L1 (Lasso)</SelectItem>
                    <SelectItem value="l2">L2 (Ridge)</SelectItem>
                    <SelectItem value="elastic">Elastic Net</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Regularization Strength */}
              <div>
                <Label>Regularization Strength: {regularizationStrength.toFixed(3)}</Label>
                <Slider
                  value={[regularizationStrength]}
                  onValueChange={(value) => setRegularizationStrength(value[0])}
                  max={1}
                  min={0}
                  step={0.001}
                  className="mt-2"
                />
              </div>

              {/* Polynomial Degree */}
              <div>
                <Label>Polynomial Degree: {polynomialDegree}</Label>
                <Slider
                  value={[polynomialDegree]}
                  onValueChange={(value) => setPolynomialDegree(value[0])}
                  max={8}
                  min={1}
                  step={1}
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
                <div className="flex items-center space-x-2">
                  <Switch
                    id="weights"
                    checked={showWeights}
                    onCheckedChange={setShowWeights}
                  />
                  <Label htmlFor="weights">Show Weights</Label>
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

              {/* Regularization Info */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Regularization Info</h4>
                <div className="text-sm space-y-1">
                  <p>Type: {regularizationType.toUpperCase()}</p>
                  <p>Strength: {regularizationStrength.toFixed(3)}</p>
                  <p>Weight Norm: {metrics.weightNorm.toFixed(4)}</p>
                  <p>Complexity: {metrics.effectiveComplexity.toFixed(4)}</p>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visualization">Model Fit</TabsTrigger>
              <TabsTrigger value="weights">Weights</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regularization Effect on Model Fit</CardTitle>
                  <CardDescription>
                    See how regularization affects the model's ability to fit data
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

            <TabsContent value="weights" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Weights</CardTitle>
                  <CardDescription>
                    Visualize how regularization shrinks model weights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={weightsCanvasRef}
                      width={600}
                      height={300}
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
                      <h4 className="font-semibold mb-2">Regularization Effect</h4>
                      <div className="text-sm">
                        {regularizationStrength > 0.1 ? (
                          <p className="text-blue-600">Strong regularization</p>
                        ) : regularizationStrength > 0.01 ? (
                          <p className="text-yellow-600">Moderate regularization</p>
                        ) : (
                          <p className="text-red-600">Weak regularization</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Generalization Gap</h4>
                      <div className="text-sm">
                        <p>Gap: {(metrics.valLoss - metrics.trainLoss).toFixed(4)}</p>
                        {metrics.valLoss - metrics.trainLoss > 0.1 ? (
                          <p className="text-red-600">Overfitting risk</p>
                        ) : (
                          <p className="text-green-600">Good generalization</p>
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