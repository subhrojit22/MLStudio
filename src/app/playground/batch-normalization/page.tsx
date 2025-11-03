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
import { ArrowLeft, Play, Pause, RotateCcw, BarChart3, Info, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface ActivationData {
  values: number[]
  normalized: number[]
  batchMean: number
  batchVar: number
  gamma: number
  beta: number
}

interface TrainingMetrics {
  epoch: number
  loss: number
  accuracy: number
  normalizedMean: number
  normalizedStd: number
}

export default function BatchNormalizationPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trainingCanvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [activations, setActivations] = useState<ActivationData>({
    values: [],
    normalized: [],
    batchMean: 0,
    batchVar: 0,
    gamma: 1,
    beta: 0
  })
  const [useBatchNorm, setUseBatchNorm] = useState(true)
  const [batchSize, setBatchSize] = useState(32)
  const [learningRate, setLearningRate] = useState(0.01)
  const [initialMean, setInitialMean] = useState(2)
  const [initialStd, setInitialStd] = useState(1.5)
  const [distributionType, setDistributionType] = useState('normal')
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([])
  const [showDistribution, setShowDistribution] = useState(true)
  const [showTraining, setShowTraining] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(100)
  const [gamma, setGamma] = useState(1)
  const [beta, setBeta] = useState(0)

  // Generate activation values
  const generateActivations = useCallback((size: number, mean: number, std: number, type: string): number[] => {
    const values: number[] = []
    
    for (let i = 0; i < size; i++) {
      let value = 0
      
      switch (type) {
        case 'normal':
          // Box-Muller transform for normal distribution
          const u1 = Math.random()
          const u2 = Math.random()
          value = mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
          break
        case 'uniform':
          value = mean + (Math.random() - 0.5) * 2 * std * Math.sqrt(3)
          break
        case 'exponential':
          value = mean - std * Math.log(1 - Math.random())
          break
        case 'bimodal':
          const mode = Math.random() > 0.5 ? 1 : -1
          value = mean + mode * std + (Math.random() - 0.5) * std * 0.5
          break
      }
      
      values.push(value)
    }
    
    return values
  }, [])

  // Apply batch normalization
  const applyBatchNorm = useCallback((values: number[], gamma: number, beta: number, epsilon: number = 1e-5): ActivationData => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const std = Math.sqrt(variance + epsilon)
    
    const normalized = values.map(val => (val - mean) / std * gamma + beta)
    
    return {
      values,
      normalized,
      batchMean: mean,
      batchVar: variance,
      gamma,
      beta
    }
  }, [])

  // Initialize activations
  const initializeActivations = useCallback(() => {
    const values = generateActivations(batchSize, initialMean, initialStd, distributionType)
    const normalized = useBatchNorm ? 
      applyBatchNorm(values, gamma, beta).normalized : 
      values
    
    setActivations({
      values,
      normalized,
      batchMean: 0,
      batchVar: 0,
      gamma,
      beta
    })
  }, [batchSize, initialMean, initialStd, distributionType, useBatchNorm, gamma, beta, generateActivations, applyBatchNorm])

  // Simulate training step
  const trainingStep = useCallback(() => {
    // Simulate internal covariate shift
    const shiftFactor = 0.1 * Math.sin(currentEpoch * 0.1)
    const scaleFactor = 1 + 0.2 * Math.cos(currentEpoch * 0.15)
    
    const currentMean = initialMean + shiftFactor
    const currentStd = initialStd * scaleFactor
    
    const values = generateActivations(batchSize, currentMean, currentStd, distributionType)
    const batchNormResult = applyBatchNorm(values, gamma, beta)
    
    setActivations(batchNormResult)
    
    // Simulate training metrics
    const baseLoss = 2.0 * Math.exp(-currentEpoch * 0.05)
    const noise = (Math.random() - 0.5) * 0.1
    const loss = useBatchNorm ? 
      baseLoss * (1 + noise * 0.5) : 
      baseLoss * (1 + noise * 1.5)
    
    const accuracy = useBatchNorm ? 
      Math.min(0.95, 0.5 + currentEpoch * 0.02 + (Math.random() - 0.5) * 0.02) :
      Math.min(0.85, 0.5 + currentEpoch * 0.015 + (Math.random() - 0.5) * 0.03)
    
    const normalizedMean = batchNormResult.normalized.reduce((sum, val) => sum + val, 0) / batchNormResult.normalized.length
    const normalizedStd = Math.sqrt(
      batchNormResult.normalized.reduce((sum, val) => sum + Math.pow(val - normalizedMean, 2), 0) / batchNormResult.normalized.length
    )
    
    const newMetrics: TrainingMetrics = {
      epoch: currentEpoch,
      loss,
      accuracy,
      normalizedMean,
      normalizedStd
    }
    
    setTrainingMetrics(prev => [...prev.slice(-49), newMetrics])
    setCurrentEpoch(prev => prev + 1)
  }, [currentEpoch, initialMean, initialStd, batchSize, distributionType, useBatchNorm, gamma, beta, generateActivations, applyBatchNorm])

  // Start/stop training
  const toggleTraining = async () => {
    setIsTraining(!isTraining)
  }

  // Reset training
  const resetTraining = () => {
    setIsTraining(false)
    setCurrentEpoch(0)
    setTrainingMetrics([])
    initializeActivations()
  }

  // Draw distribution comparison
  const drawDistribution = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (activations.values.length === 0) return
    
    // Create histograms
    const bins = 30
    const minValue = Math.min(...activations.values, ...activations.normalized)
    const maxValue = Math.max(...activations.values, ...activations.normalized)
    const binWidth = (maxValue - minValue) / bins
    
    const originalHist = new Array(bins).fill(0)
    const normalizedHist = new Array(bins).fill(0)
    
    // Count values in bins
    activations.values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - minValue) / binWidth), bins - 1)
      originalHist[binIndex]++
    })
    
    activations.normalized.forEach(val => {
      const binIndex = Math.min(Math.floor((val - minValue) / binWidth), bins - 1)
      normalizedHist[binIndex]++
    })
    
    // Find max count for scaling
    const maxCount = Math.max(...originalHist, ...normalizedHist)
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.moveTo(60, 20)
    ctx.lineTo(60, height - 40)
    ctx.stroke()
    
    // Draw histograms
    const barWidth = (width - 100) / bins
    
    // Original distribution
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'
    originalHist.forEach((count, i) => {
      const barHeight = (count / maxCount) * (height - 80)
      const x = 70 + i * barWidth
      const y = height - 40 - barHeight
      
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    })
    
    // Normalized distribution
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
    normalizedHist.forEach((count, i) => {
      const barHeight = (count / maxCount) * (height - 80)
      const x = 70 + i * barWidth
      const y = height - 40 - barHeight
      
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    })
    
    // Draw mean lines
    const originalMean = activations.values.reduce((sum, val) => sum + val, 0) / activations.values.length
    const normalizedMean = activations.normalized.reduce((sum, val) => sum + val, 0) / activations.normalized.length
    
    const originalMeanX = 70 + ((originalMean - minValue) / (maxValue - minValue)) * (width - 100)
    const normalizedMeanX = 70 + ((normalizedMean - minValue) / (maxValue - minValue)) * (width - 100)
    
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(originalMeanX, 20)
    ctx.lineTo(originalMeanX, height - 40)
    ctx.stroke()
    
    ctx.strokeStyle = '#3b82f6'
    ctx.beginPath()
    ctx.moveTo(normalizedMeanX, 20)
    ctx.lineTo(normalizedMeanX, height - 40)
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Activation Value', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(25, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Frequency', 0, 0)
    ctx.restore()
    
    // Legend
    const legendY = 30
    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'
    ctx.fillRect(width - 150, legendY, 15, 10)
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.fillText('Original', width - 130, legendY + 8)
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
    ctx.fillRect(width - 150, legendY + 20, 15, 10)
    ctx.fillText('Normalized', width - 130, legendY + 28)
    
    // Statistics
    const originalStd = Math.sqrt(
      activations.values.reduce((sum, val) => sum + Math.pow(val - originalMean, 2), 0) / activations.values.length
    )
    const normalizedStd = Math.sqrt(
      activations.normalized.reduce((sum, val) => sum + Math.pow(val - normalizedMean, 2), 0) / activations.normalized.length
    )
    
    ctx.fillStyle = '#666'
    ctx.font = '10px sans-serif'
    ctx.fillText(`μ=${originalMean.toFixed(2)}, σ=${originalStd.toFixed(2)}`, width - 130, legendY + 45)
    ctx.fillText(`μ=${normalizedMean.toFixed(2)}, σ=${normalizedStd.toFixed(2)}`, width - 130, legendY + 60)
  }, [activations])

  // Draw training progress
  const drawTrainingProgress = useCallback(() => {
    const canvas = trainingCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    if (trainingMetrics.length === 0) return
    
    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.moveTo(60, 20)
    ctx.lineTo(60, height - 40)
    ctx.stroke()
    
    // Draw loss curve
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    trainingMetrics.forEach((metric, index) => {
      const x = 60 + ((width - 80) / Math.max(trainingMetrics.length - 1, 1)) * index
      const y = height - 40 - ((height - 60) * (metric.loss / 2))
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
    
    // Draw accuracy curve
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    trainingMetrics.forEach((metric, index) => {
      const x = 60 + ((width - 80) / Math.max(trainingMetrics.length - 1, 1)) * index
      const y = height - 40 - ((height - 60) * metric.accuracy)
      
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
    ctx.fillText('Epoch', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(25, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Loss / Accuracy', 0, 0)
    ctx.restore()
    
    // Legend
    const legendY = 30
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(width - 150, legendY + 5)
    ctx.lineTo(width - 130, legendY + 5)
    ctx.stroke()
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.fillText('Loss', width - 120, legendY + 8)
    
    ctx.strokeStyle = '#10b981'
    ctx.beginPath()
    ctx.moveTo(width - 150, legendY + 20)
    ctx.lineTo(width - 130, legendY + 20)
    ctx.stroke()
    ctx.fillText('Accuracy', width - 120, legendY + 23)
  }, [trainingMetrics])

  // Draw comparison
  const drawComparison = useCallback(() => {
    const canvas = comparisonCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Title
    ctx.fillStyle = '#666'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Batch Normalization Benefits', width / 2, 30)
    
    // Benefits list
    const benefits = [
      'Reduces internal covariate shift',
      'Allows higher learning rates',
      'Acts as a form of regularization',
      'Improves gradient flow',
      'Reduces dependence on initialization'
    ]
    
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    benefits.forEach((benefit, index) => {
      const y = 60 + index * 25
      ctx.fillStyle = useBatchNorm ? '#10b987' : '#666'
      ctx.fillText(`✓ ${benefit}`, 40, y)
    })
    
    // Current status
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`Batch Norm: ${useBatchNorm ? 'Enabled' : 'Disabled'}`, width / 2, height - 40)
    ctx.fillText(`Epoch: ${currentEpoch}`, width / 2, height - 20)
  }, [useBatchNorm, currentEpoch])

  // Training loop
  useEffect(() => {
    if (isTraining) {
      const interval = setInterval(() => {
        trainingStep()
      }, animationSpeed)
      
      return () => clearInterval(interval)
    }
  }, [isTraining, trainingStep, animationSpeed])

  // Initialize
  useEffect(() => {
    initializeActivations()
  }, [initializeActivations])

  // Update visualizations
  useEffect(() => {
    drawDistribution()
  }, [drawDistribution])

  useEffect(() => {
    drawTrainingProgress()
  }, [drawTrainingProgress])

  useEffect(() => {
    drawComparison()
  }, [drawComparison])

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
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Batch Normalization Visualizer</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Understand normalization of intermediate activations during neural network training
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
              {/* Batch Norm Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="batchnorm"
                  checked={useBatchNorm}
                  onCheckedChange={setUseBatchNorm}
                />
                <Label htmlFor="batchnorm">Enable Batch Normalization</Label>
              </div>

              {/* Distribution Type */}
              <div>
                <Label htmlFor="distribution">Distribution Type</Label>
                <Select value={distributionType} onValueChange={setDistributionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="uniform">Uniform</SelectItem>
                    <SelectItem value="exponential">Exponential</SelectItem>
                    <SelectItem value="bimodal">Bimodal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Size */}
              <div>
                <Label>Batch Size: {batchSize}</Label>
                <Slider
                  value={[batchSize]}
                  onValueChange={(value) => setBatchSize(value[0])}
                  max={128}
                  min={8}
                  step={8}
                  className="mt-2"
                />
              </div>

              {/* Initial Mean */}
              <div>
                <Label>Initial Mean: {initialMean.toFixed(2)}</Label>
                <Slider
                  value={[initialMean]}
                  onValueChange={(value) => setInitialMean(value[0])}
                  max={5}
                  min={-5}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Initial Std */}
              <div>
                <Label>Initial Std: {initialStd.toFixed(2)}</Label>
                <Slider
                  value={[initialStd]}
                  onValueChange={(value) => setInitialStd(value[0])}
                  max={3}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Gamma (Scale) */}
              <div>
                <Label>Gamma (Scale): {gamma.toFixed(2)}</Label>
                <Slider
                  value={[gamma]}
                  onValueChange={(value) => setGamma(value[0])}
                  max={2}
                  min={0.1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Beta (Shift) */}
              <div>
                <Label>Beta (Shift): {beta.toFixed(2)}</Label>
                <Slider
                  value={[beta]}
                  onValueChange={(value) => setBeta(value[0])}
                  max={2}
                  min={-2}
                  step={0.1}
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
                  min={50}
                  step={50}
                  className="mt-2"
                />
              </div>

              {/* Training Controls */}
              <div className="space-y-2">
                <Button 
                  onClick={toggleTraining}
                  className="w-full"
                >
                  {isTraining ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Training
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Training
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetTraining}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Batch Norm Info */}
              {useBatchNorm && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Batch Norm Stats</h4>
                  <div className="text-sm space-y-1">
                    <p>Batch Mean: {activations.batchMean.toFixed(4)}</p>
                    <p>Batch Var: {activations.batchVar.toFixed(4)}</p>
                    <p>Gamma: {gamma.toFixed(3)}</p>
                    <p>Beta: {beta.toFixed(3)}</p>
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
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
              <TabsTrigger value="comparison">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activation Distribution</CardTitle>
                  <CardDescription>
                    Compare original vs. normalized activation distributions
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

            <TabsContent value="training" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Progress</CardTitle>
                  <CardDescription>
                    Monitor loss and accuracy during training
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={trainingCanvasRef}
                      width={600}
                      height={300}
                      className="border rounded-lg w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batch Normalization Benefits</CardTitle>
                  <CardDescription>
                    Understand the advantages of using batch normalization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={comparisonCanvasRef}
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