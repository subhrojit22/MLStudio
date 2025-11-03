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
import { ArrowLeft, RotateCcw, Zap, Info, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import BackButton from "@/components/BackButton"

interface ActivationFunction {
  name: string
  fn: (x: number) => number
  derivative: (x: number) => number
  description: string
  properties: string[]
}

const activationFunctions: Record<string, ActivationFunction> = {
  sigmoid: {
    name: 'Sigmoid',
    fn: (x: number) => 1 / (1 + Math.exp(-x)),
    derivative: (x: number) => {
      const s = 1 / (1 + Math.exp(-x))
      return s * (1 - s)
    },
    description: 'S-shaped curve that outputs values between 0 and 1',
    properties: ['Bounded', 'Smooth', 'Non-zero centered', 'Saturates']
  },
  tanh: {
    name: 'Tanh',
    fn: (x: number) => Math.tanh(x),
    derivative: (x: number) => 1 - Math.pow(Math.tanh(x), 2),
    description: 'S-shaped curve that outputs values between -1 and 1',
    properties: ['Bounded', 'Smooth', 'Zero-centered', 'Saturates']
  },
  relu: {
    name: 'ReLU',
    fn: (x: number) => Math.max(0, x),
    derivative: (x: number) => x > 0 ? 1 : 0,
    description: 'Outputs the input if positive, otherwise 0',
    properties: ['Unbounded', 'Non-saturating', 'Sparse', 'Fast']
  },
  leaky_relu: {
    name: 'Leaky ReLU',
    fn: (x: number) => x > 0 ? x : 0.01 * x,
    derivative: (x: number) => x > 0 ? 1 : 0.01,
    description: 'ReLU variant that allows small negative values',
    properties: ['Unbounded', 'Non-saturating', 'No dead neurons', 'Fast']
  },
  elu: {
    name: 'ELU',
    fn: (x: number) => x > 0 ? x : Math.exp(x) - 1,
    derivative: (x: number) => x > 0 ? 1 : Math.exp(x),
    description: 'Exponential Linear Unit with smooth negative region',
    properties: ['Unbounded', 'Smooth', 'Non-zero centered', 'Computationally expensive']
  },
  swish: {
    name: 'Swish',
    fn: (x: number) => x / (1 + Math.exp(-x)),
    derivative: (x: number) => {
      const sig = 1 / (1 + Math.exp(-x))
      return sig + x * sig * (1 - sig)
    },
    description: 'Self-gated activation function',
    properties: ['Unbounded', 'Smooth', 'Non-monotonic', 'Self-gated']
  },
  gelu: {
    name: 'GELU',
    fn: (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    derivative: (x: number) => {
      const tanh_arg = Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3))
      const tanh_val = Math.tanh(tanh_arg)
      const sech_sq = 1 - Math.pow(tanh_val, 2)
      return 0.5 * (1 + tanh_val) + 0.5 * x * sech_sq * Math.sqrt(2 / Math.PI) * (1 + 0.134145 * Math.pow(x, 2))
    },
    description: 'Gaussian Error Linear Unit used in transformers',
    properties: ['Unbounded', 'Smooth', 'Probabilistic', 'State-of-the-art']
  },
  softmax: {
    name: 'Softmax',
    fn: (x: number) => Math.exp(x),
    derivative: (x: number) => Math.exp(x),
    description: 'Exponential function for multi-class classification',
    properties: ['Bounded', 'Smooth', 'Probabilistic', 'Multi-class']
  }
}

export default function ActivationFunctionPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradientCanvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [selectedFunction, setSelectedFunction] = useState('relu')
  const [inputRange, setInputRange] = useState(5)
  const [showDerivative, setShowDerivative] = useState(true)
  const [showGradient, setShowGradient] = useState(true)
  const [comparisonFunctions, setComparisonFunctions] = useState(['relu', 'sigmoid', 'tanh'])
  const [inputValue, setInputValue] = useState(0)
  const [learningRate, setLearningRate] = useState(0.1)
  const [showSaturation, setShowSaturation] = useState(true)

  const currentFunction = activationFunctions[selectedFunction]

  // Draw activation function
  const drawActivationFunction = useCallback(() => {
    const canvas = canvasRef.current
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
    ctx.moveTo(40, height / 2)
    ctx.lineTo(width - 20, height / 2)
    ctx.moveTo(width / 2, 20)
    ctx.lineTo(width / 2, height - 20)
    ctx.stroke()
    
    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) {
      const x = 40 + ((width - 60) / 10) * i
      const y = 20 + ((height - 40) / 10) * i
      
      ctx.beginPath()
      ctx.moveTo(x, 20)
      ctx.lineTo(x, height - 20)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(40, y)
      ctx.lineTo(width - 20, y)
      ctx.stroke()
    }
    
    // Draw activation function
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    for (let px = 40; px <= width - 20; px += 2) {
      const x = ((px - 40) / (width - 60)) * 2 * inputRange - inputRange
      const y = currentFunction.fn(x)
      const py = height / 2 - (y / 2) * (height - 40)
      
      if (px === 40) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    
    ctx.stroke()
    
    // Draw derivative if enabled
    if (showDerivative) {
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let px = 40; px <= width - 20; px += 2) {
        const x = ((px - 40) / (width - 60)) * 2 * inputRange - inputRange
        const y = currentFunction.derivative(x)
        const py = height / 2 - (y / 2) * (height - 40)
        
        if (px === 40) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      
      ctx.stroke()
    }
    
    // Draw current input point
    const currentX = width / 2 + (inputValue / inputRange) * ((width - 60) / 2)
    const currentY = height / 2 - (currentFunction.fn(inputValue) / 2) * (height - 40)
    
    ctx.beginPath()
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI)
    ctx.fillStyle = '#10b981'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Input', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Output', 0, 0)
    ctx.restore()
    
    // Legend
    const legendY = 30
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(width - 150, legendY, 15, 3)
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.fillText(currentFunction.name, width - 130, legendY + 4)
    
    if (showDerivative) {
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(width - 150, legendY + 20, 15, 3)
      ctx.fillStyle = '#666'
      ctx.fillText('Derivative', width - 130, legendY + 24)
    }
    
    // Current value
    ctx.fillStyle = '#10b987'
    ctx.beginPath()
    ctx.arc(width - 150, legendY + 40, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = '#666'
    ctx.fillText(`f(${inputValue.toFixed(2)}) = ${currentFunction.fn(inputValue).toFixed(4)}`, width - 130, legendY + 44)
  }, [currentFunction, inputRange, showDerivative, inputValue])

  // Draw gradient flow visualization
  const drawGradientFlow = useCallback(() => {
    const canvas = gradientCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    ctx.clearRect(0, 0, width, height)
    
    // Simulate gradient flow through layers
    const layers = 5
    const neuronsPerLayer = 8
    const layerSpacing = (width - 100) / (layers - 1)
    
    // Draw layers
    for (let layer = 0; layer < layers; layer++) {
      const x = 50 + layer * layerSpacing
      
      for (let neuron = 0; neuron < neuronsPerLayer; neuron++) {
        const y = 40 + neuron * ((height - 80) / (neuronsPerLayer - 1))
        
        // Calculate activation based on layer and position
        const input = (neuron - neuronsPerLayer / 2) / 2
        const activation = currentFunction.fn(input)
        
        // Color based on activation strength
        const intensity = Math.abs(activation)
        const color = activation > 0 ? 
          `rgba(59, 130, 246, ${intensity})` : 
          `rgba(239, 68, 68, ${intensity})`
        
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, 2 * Math.PI)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1
        ctx.stroke()
        
        // Draw connections to next layer
        if (layer < layers - 1) {
          const nextX = x + layerSpacing
          for (let nextNeuron = 0; nextNeuron < neuronsPerLayer; nextNeuron++) {
            const nextY = 40 + nextNeuron * ((height - 80) / (neuronsPerLayer - 1))
            
            // Connection strength based on gradient
            const gradient = currentFunction.derivative(input) * learningRate
            const opacity = Math.abs(gradient) * 0.3
            
            ctx.strokeStyle = `rgba(107, 114, 128, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(x + 8, y)
            ctx.lineTo(nextX - 8, nextY)
            ctx.stroke()
          }
        }
      }
    }
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    for (let i = 0; i < layers; i++) {
      const x = 50 + i * layerSpacing
      ctx.fillText(`Layer ${i}`, x, height - 10)
    }
  }, [currentFunction, learningRate])

  // Draw comparison chart
  const drawComparison = useCallback(() => {
    const canvas = comparisonCanvasRef.current
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
    ctx.moveTo(40, height / 2)
    ctx.lineTo(width - 20, height / 2)
    ctx.moveTo(width / 2, 20)
    ctx.lineTo(width / 2, height - 20)
    ctx.stroke()
    
    // Colors for different functions
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    
    // Draw comparison functions
    comparisonFunctions.forEach((funcName, index) => {
      const func = activationFunctions[funcName]
      if (!func) return
      
      ctx.strokeStyle = colors[index % colors.length]
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let px = 40; px <= width - 20; px += 2) {
        const x = ((px - 40) / (width - 60)) * 2 * inputRange - inputRange
        const y = func.fn(x)
        const py = height / 2 - (y / 2) * (height - 40)
        
        if (px === 40) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      
      ctx.stroke()
    })
    
    // Legend
    const legendY = 30
    comparisonFunctions.forEach((funcName, index) => {
      const func = activationFunctions[funcName]
      if (!func) return
      
      ctx.fillStyle = colors[index % colors.length]
      ctx.fillRect(20, legendY + index * 20, 15, 3)
      ctx.fillStyle = '#666'
      ctx.font = '12px sans-serif'
      ctx.fillText(func.name, 40, legendY + index * 20 + 4)
    })
    
    // Labels
    ctx.fillStyle = '#666'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Input', width / 2, height - 5)
    
    ctx.save()
    ctx.translate(15, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('Output', 0, 0)
    ctx.restore()
  }, [comparisonFunctions, inputRange])

  // Update visualizations
  useEffect(() => {
    drawActivationFunction()
  }, [drawActivationFunction])

  useEffect(() => {
    drawGradientFlow()
  }, [drawGradientFlow])

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
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Activation Function Playground</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore nonlinearities and their impact on neural network learning dynamics
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
              {/* Function Selection */}
              <div>
                <Label htmlFor="function">Activation Function</Label>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activationFunctions).map(([key, func]) => (
                      <SelectItem key={key} value={key}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Input Range */}
              <div>
                <Label>Input Range: ±{inputRange}</Label>
                <Slider
                  value={[inputRange]}
                  onValueChange={(value) => setInputRange(value[0])}
                  max={10}
                  min={1}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              {/* Input Value */}
              <div>
                <Label>Input Value: {inputValue.toFixed(2)}</Label>
                <Slider
                  value={[inputValue]}
                  onValueChange={(value) => setInputValue(value[0])}
                  max={inputRange}
                  min={-inputRange}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              {/* Learning Rate */}
              <div>
                <Label>Learning Rate: {learningRate.toFixed(3)}</Label>
                <Slider
                  value={[learningRate]}
                  onValueChange={(value) => setLearningRate(value[0])}
                  max={1}
                  min={0.001}
                  step={0.001}
                  className="mt-2"
                />
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="derivative"
                    checked={showDerivative}
                    onCheckedChange={setShowDerivative}
                  />
                  <Label htmlFor="derivative">Show Derivative</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gradient"
                    checked={showGradient}
                    onCheckedChange={setShowGradient}
                  />
                  <Label htmlFor="gradient">Show Gradient Flow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="saturation"
                    checked={showSaturation}
                    onCheckedChange={setShowSaturation}
                  />
                  <Label htmlFor="saturation">Show Saturation</Label>
                </div>
              </div>

              {/* Function Info */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{currentFunction.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentFunction.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentFunction.properties.map((prop, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {prop}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Current Values */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Current Values</h4>
                <div className="text-sm space-y-1">
                  <p>f({inputValue.toFixed(2)}) = {currentFunction.fn(inputValue).toFixed(4)}</p>
                  <p>f'({inputValue.toFixed(2)}) = {currentFunction.derivative(inputValue).toFixed(4)}</p>
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
          <Tabs defaultValue="function" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="function">Function Plot</TabsTrigger>
              <TabsTrigger value="gradient">Gradient Flow</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="function" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activation Function</CardTitle>
                  <CardDescription>
                    Visualize the function and its derivative
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

            <TabsContent value="gradient" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gradient Flow Visualization</CardTitle>
                  <CardDescription>
                    See how activations flow through neural network layers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <canvas
                      ref={gradientCanvasRef}
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
                  <CardTitle>Function Comparison</CardTitle>
                  <CardDescription>
                    Compare multiple activation functions side by side
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <canvas
                      ref={comparisonCanvasRef}
                      width={600}
                      height={400}
                      className="border rounded-lg w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Compare Functions:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(activationFunctions).map((funcName) => (
                        <div key={funcName} className="flex items-center space-x-2">
                          <Switch
                            id={funcName}
                            checked={comparisonFunctions.includes(funcName)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setComparisonFunctions(prev => [...prev.slice(-4), funcName])
                              } else {
                                setComparisonFunctions(prev => prev.filter(f => f !== funcName))
                              }
                            }}
                          />
                          <Label htmlFor={funcName} className="text-sm">
                            {activationFunctions[funcName].name}
                          </Label>
                        </div>
                      ))}
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