'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Network,
  Brain,
  Eye,
  Zap,
  Target,
  Layers,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Calculator,
  Cpu,
  Image
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Neural Network Simulator
const NeuralNetworkSimulator = () => {
  const [isTraining, setIsTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [learningRate, setLearningRate] = useState([0.1])
  const [activation, setActivation] = useState('relu')
  const [currentLayer, setCurrentLayer] = useState(0)
  const [showWeights, setShowWeights] = useState(true)
  const [showActivations, setShowActivations] = useState(true)

  // Network architecture
  const layers = [3, 4, 4, 2] // Input, Hidden1, Hidden2, Output
  
  // Initialize weights and activations
  const [weights, setWeights] = useState(() => {
    const w = []
    for (let i = 0; i < layers.length - 1; i++) {
      w.push(Array.from({ length: layers[i] * layers[i + 1] }, () => Math.random() * 2 - 1))
    }
    return w
  })

  const [activations, setActivations] = useState(() => {
    const a = []
    for (let i = 0; i < layers.length; i++) {
      a.push(Array.from({ length: layers[i] }, () => Math.random()))
    }
    return a
  })

  // Activation functions
  const activationFunctions = {
    relu: (x: number) => Math.max(0, x),
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    tanh: (x: number) => Math.tanh(x)
  }

  useEffect(() => {
    if (isTraining && epoch < 100) {
      const timer = setTimeout(() => {
        // Simulate forward pass
        const newActivations = [...activations]
        for (let layer = 1; layer < layers.length; layer++) {
          for (let neuron = 0; neuron < layers[layer]; neuron++) {
            let sum = 0
            for (let prev = 0; prev < layers[layer - 1]; prev++) {
              const weightIndex = prev * layers[layer] + neuron
              sum += activations[layer - 1][prev] * weights[layer - 1][weightIndex]
            }
            newActivations[layer][neuron] = activationFunctions[activation as keyof typeof activationFunctions](sum)
          }
        }
        setActivations(newActivations)
        
        // Simulate weight update
        const newWeights = weights.map((layerWeights, layerIndex) => 
          layerWeights.map(w => w + (Math.random() - 0.5) * learningRate[0] * 0.1)
        )
        setWeights(newWeights)
        
        setEpoch(epoch + 1)
        setCurrentLayer((currentLayer + 1) % layers.length)
      }, 100)
      return () => clearTimeout(timer)
    } else if (isTraining && epoch >= 100) {
      setIsTraining(false)
    }
  }, [isTraining, epoch, weights, activations, learningRate, activation, layers])

  const handleTrain = () => {
    setIsTraining(true)
    setEpoch(0)
  }

  const handleReset = () => {
    setIsTraining(false)
    setEpoch(0)
    setCurrentLayer(0)
    // Reinitialize weights and activations
    const newWeights = []
    for (let i = 0; i < layers.length - 1; i++) {
      newWeights.push(Array.from({ length: layers[i] * layers[i + 1] }, () => Math.random() * 2 - 1))
    }
    setWeights(newWeights)
    
    const newActivations = []
    for (let i = 0; i < layers.length; i++) {
      newActivations.push(Array.from({ length: layers[i] }, () => Math.random()))
    }
    setActivations(newActivations)
  }

  const getWeightColor = (weight: number) => {
    const intensity = Math.abs(weight)
    if (weight > 0) return `rgba(59, 130, 246, ${intensity})`
    return `rgba(239, 68, 68, ${intensity})`
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Neural Network Architecture
        </CardTitle>
        <CardDescription>
          Visualize forward pass and backpropagation in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleTrain} disabled={isTraining} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Train Network
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2">
            {['relu', 'sigmoid', 'tanh'].map((act) => (
              <Button
                key={act}
                variant={activation === act ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivation(act)}
                disabled={isTraining}
              >
                {act.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Learning Rate: {learningRate[0].toFixed(2)}</label>
            <Slider
              value={learningRate}
              onValueChange={setLearningRate}
              max={0.5}
              min={0.01}
              step={0.01}
              className="mt-2"
              disabled={isTraining}
            />
          </div>
          <div className="text-sm text-gray-600">
            Epoch: {epoch}
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Training Progress</span>
              <span className="text-sm text-gray-600">{epoch}/100 epochs</span>
            </div>
            <Progress value={(epoch / 100) * 100} className="h-2" />
          </div>
        )}

        {/* Network Visualization */}
        <div className="flex justify-center">
          <div className="w-full h-96 bg-gray-50 rounded-lg border-2 border-gray-200 relative overflow-hidden">
            <svg className="w-full h-full p-8">
              {/* Draw connections */}
              {showWeights && weights.map((layerWeights, layerIndex) => {
                const connections = []
                for (let prev = 0; prev < layers[layerIndex]; prev++) {
                  for (let curr = 0; curr < layers[layerIndex + 1]; curr++) {
                    const weightIndex = prev * layers[layerIndex + 1] + curr
                    const x1 = 100 + layerIndex * 150
                    const y1 = 50 + prev * (300 / layers[layerIndex])
                    const x2 = 100 + (layerIndex + 1) * 150
                    const y2 = 50 + curr * (300 / layers[layerIndex + 1])
                    
                    connections.push(
                      <motion.line
                        key={`${layerIndex}-${prev}-${curr}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={getWeightColor(layerWeights[weightIndex])}
                        strokeWidth={Math.abs(layerWeights[weightIndex]) * 3}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (layerIndex * 0.1) + (prev * 0.02) }}
                      />
                    )
                  }
                }
                return connections
              })}

              {/* Draw neurons */}
              {activations.map((layer, layerIndex) => {
                return layer.map((activation, neuronIndex) => (
                  <motion.g key={`${layerIndex}-${neuronIndex}`}>
                    <circle
                      cx={100 + layerIndex * 150}
                      cy={50 + neuronIndex * (300 / layers[layerIndex])}
                      r="20"
                      fill={showActivations ? `rgba(34, 197, 94, ${activation})` : '#e5e7eb'}
                      stroke={currentLayer === layerIndex ? '#f59e0b' : '#6b7280'}
                      strokeWidth={currentLayer === layerIndex ? 3 : 2}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: (layerIndex * 0.1) + (neuronIndex * 0.02) }}
                    />
                    <text
                      x={100 + layerIndex * 150}
                      y={50 + neuronIndex * (300 / layers[layerIndex]) + 5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {activation.toFixed(2)}
                    </text>
                  </motion.g>
                ))
              })}

              {/* Layer labels */}
              {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, i) => (
                <text
                  key={i}
                  x={100 + i * 150}
                  y="20"
                  textAnchor="middle"
                  fill="#374151"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {label}
                </text>
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute top-2 right-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Positive Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs">Negative Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs">Activation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Network Architecture</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Layers: {layers.length} (Input: {layers[0]}, Output: {layers[layers.length-1]})</p>
              <p>• Total Parameters: {weights.reduce((sum, layer) => sum + layer.length, 0)}</p>
              <p>• Activation: {activation.toUpperCase()}</p>
              <p>• Learning Rate: {learningRate[0]}</p>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Training Process</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Forward Pass: Calculate activations</p>
              <p>• Loss Calculation: Measure error</p>
              <p>• Backpropagation: Calculate gradients</p>
              <p>• Weight Update: Adjust parameters</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// CNN Simulator
const CNNSimulator = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [kernelSize, setKernelSize] = useState([3])
  const [stride, setStride] = useState([1])
  const [showFeatureMaps, setShowFeatureMaps] = useState(true)

  const steps = ['Input', 'Convolution', 'Activation', 'Pooling', 'Output']

  // Sample input image (5x5)
  const inputImage = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => Math.sin(i * j) * 0.5 + 0.5)
    )
  }, [])

  // Convolution kernel
  const kernel = useMemo(() => {
    const size = kernelSize[0]
    return Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => {
        if (i === 1 && j === 1) return 1
        if (i === 1 || j === 1) return -0.5
        return 0
      })
    )
  }, [kernelSize])

  // Convolution operation
  const convolve = (image: number[][], kernel: number[][]) => {
    const outputSize = Math.floor((image.length - kernel.length) / stride[0]) + 1
    const output = Array.from({ length: outputSize }, (_, i) =>
      Array.from({ length: outputSize }, (_, j) => {
        let sum = 0
        for (let ki = 0; ki < kernel.length; ki++) {
          for (let kj = 0; kj < kernel.length; kj++) {
            const ii = i * stride[0] + ki
            const jj = j * stride[0] + kj
            if (ii < image.length && jj < image[0].length) {
              sum += image[ii][jj] * kernel[ki][kj]
            }
          }
        }
        return Math.max(0, sum) // ReLU activation
      })
    )
    return output
  }

  const [featureMap, setFeatureMap] = useState<number[][]>([])

  useEffect(() => {
    if (isProcessing && currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep === 1) {
          const result = convolve(inputImage, kernel)
          setFeatureMap(result)
        }
        setCurrentStep(currentStep + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isProcessing && currentStep >= steps.length) {
      setIsProcessing(false)
    }
  }, [isProcessing, currentStep, inputImage, kernel, stride])

  const handleProcess = () => {
    setIsProcessing(true)
    setCurrentStep(0)
    setFeatureMap([])
  }

  const handleReset = () => {
    setIsProcessing(false)
    setCurrentStep(0)
    setFeatureMap([])
  }

  const renderMatrix = (matrix: number[][], title: string, size: number = 40) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-center">{title}</h4>
      <div className="inline-block bg-gray-50 p-2 rounded border">
        {matrix.map((row, i) => (
          <div key={i} className="flex">
            {row.map((val, j) => (
              <div
                key={j}
                className="flex items-center justify-center text-xs font-mono border"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: `rgba(59, 130, 246, ${val})`,
                  color: val > 0.5 ? 'white' : 'black'
                }}
              >
                {val.toFixed(1)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Convolutional Neural Network
        </CardTitle>
        <CardDescription>
          Visualize convolution, activation, and pooling operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleProcess} disabled={isProcessing} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Process Image
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Kernel: {kernelSize[0]}x{kernelSize[0]}</label>
              <Slider
                value={kernelSize}
                onValueChange={setKernelSize}
                max={5}
                min={3}
                step={2}
                className="mt-2 w-24"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stride: {stride[0]}</label>
              <Slider
                value={stride}
                onValueChange={setStride}
                max={2}
                min={1}
                step={1}
                className="mt-2 w-24"
                disabled={isProcessing}
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFeatureMaps}
              onChange={(e) => setShowFeatureMaps(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Feature Maps</span>
          </label>
        </div>

        {/* Current Step */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{steps[Math.min(currentStep, steps.length - 1)]}</h3>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Image */}
          <div className={currentStep >= 0 ? 'opacity-100' : 'opacity-30'}>
            {renderMatrix(inputImage, 'Input Image (5x5)')}
          </div>

          {/* Convolution Kernel */}
          <div className={currentStep >= 1 ? 'opacity-100' : 'opacity-30'}>
            {renderMatrix(kernel, `Kernel (${kernelSize[0]}x${kernelSize[0]})`, 60)}
          </div>

          {/* Feature Map */}
          <div className={currentStep >= 2 && showFeatureMaps ? 'opacity-100' : 'opacity-30'}>
            {featureMap.length > 0 ? (
              renderMatrix(featureMap, 'Feature Map')
            ) : (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-center">Feature Map</h4>
                <div className="w-32 h-32 bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CNN Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">CNN Operations</h4>
            <ol className="text-sm text-purple-700 space-y-1">
              <li>1. <strong>Convolution:</strong> Apply filters to detect features</li>
              <li>2. <strong>Activation:</strong> Introduce non-linearity (ReLU)</li>
              <li>3. <strong>Pooling:</strong> Reduce spatial dimensions</li>
              <li>4. <strong>Flatten:</strong> Convert to 1D vector</li>
              <li>5. <strong>Fully Connected:</strong> Classification layer</li>
            </ol>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Key Concepts</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• <strong>Local Receptive Fields:</strong> Each neuron sees local region</li>
              <li>• <strong>Parameter Sharing:</strong> Same filter across image</li>
              <li>• <strong>Hierarchy:</strong> Simple → Complex features</li>
              <li>• <strong>Translation Invariance:</strong> Detect features anywhere</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// RNN Simulator
const RNNSimulator = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTimestep, setCurrentTimestep] = useState(0)
  const [sequence, setSequence] = useState(['Hello', 'World', 'How', 'Are', 'You'])
  const [hiddenStates, setHiddenStates] = useState<number[][]>([])
  const [showHiddenState, setShowHiddenState] = useState(true)

  // RNN parameters
  const hiddenSize = 4
  const [weights, setWeights] = useState({
    inputToHidden: Array.from({ length: 3 * hiddenSize }, () => Math.random() * 2 - 1),
    hiddenToHidden: Array.from({ length: hiddenSize * hiddenSize }, () => Math.random() * 2 - 1)
  })

  useEffect(() => {
    if (isProcessing && currentTimestep < sequence.length) {
      const timer = setTimeout(() => {
        // Simulate RNN processing
        const newHiddenState = Array.from({ length: hiddenSize }, () => Math.random())
        setHiddenStates(prev => [...prev, newHiddenState])
        setCurrentTimestep(currentTimestep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isProcessing && currentTimestep >= sequence.length) {
      setIsProcessing(false)
    }
  }, [isProcessing, currentTimestep, sequence.length])

  const handleProcess = () => {
    setIsProcessing(true)
    setCurrentTimestep(0)
    setHiddenStates([])
  }

  const handleReset = () => {
    setIsProcessing(false)
    setCurrentTimestep(0)
    setHiddenStates([])
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Recurrent Neural Network
        </CardTitle>
        <CardDescription>
          Visualize how RNNs process sequential data step by step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleProcess} disabled={isProcessing} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Process Sequence
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showHiddenState}
              onChange={(e) => setShowHiddenState(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Hidden State</span>
          </label>
          <div className="text-sm text-gray-600">
            Timestep: {currentTimestep}/{sequence.length}
          </div>
        </div>

        {/* RNN Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold">Sequence Processing</h4>
          <div className="relative">
            {/* Timeline */}
            <div className="flex items-center gap-4 mb-8">
              {sequence.map((word, i) => (
                <div key={i} className="text-center">
                  <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center font-semibold ${
                    i < currentTimestep 
                      ? 'border-green-500 bg-green-50' 
                      : i === currentTimestep 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50'
                  }`}>
                    {word}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">t={i}</div>
                </div>
              ))}
            </div>

            {/* RNN Cells */}
            <div className="flex items-center gap-2">
              {sequence.map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-lg border-2 flex items-center justify-center ${
                    i < currentTimestep 
                      ? 'border-blue-500 bg-blue-100' 
                      : 'border-gray-300 bg-gray-100'
                  }`}>
                    <Brain className="w-8 h-8 text-blue-600" />
                  </div>
                  {showHiddenState && i < currentTimestep && hiddenStates[i] && (
                    <div className="mt-2 text-xs">
                      <div className="font-semibold">Hidden State:</div>
                      <div className="flex gap-1">
                        {hiddenStates[i].map((val, j) => (
                          <div
                            key={j}
                            className="w-4 h-4 bg-blue-200 rounded flex items-center justify-center text-xs"
                            style={{ backgroundColor: `rgba(59, 130, 246, ${val})` }}
                          >
                            {val.toFixed(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {i < sequence.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RNN Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How RNNs Work</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Input word at timestep t</li>
              <li>2. Combine with previous hidden state</li>
              <li>3. Generate new hidden state</li>
              <li>4. Pass to next timestep</li>
              <li>5. Maintain memory of sequence</li>
            </ol>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">RNN Variants</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>LSTM:</strong> Long Short-Term Memory</li>
              <li>• <strong>GRU:</strong> Gated Recurrent Unit</li>
              <li>• <strong>Bidirectional:</strong> Process both directions</li>
              <li>• <strong>Attention:</strong> Focus on important parts</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DeepLearningPage() {
  const [activeTab, setActiveTab] = useState('neural-networks')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Cpu className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Deep Learning & Neural Networks</h1>
              <p className="text-sm text-gray-600">Interactive visualizations of neural network architectures</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="neural-networks">Neural Networks</TabsTrigger>
            <TabsTrigger value="cnn">CNNs</TabsTrigger>
            <TabsTrigger value="rnn">RNNs</TabsTrigger>
            <TabsTrigger value="attention">Attention</TabsTrigger>
          </TabsList>

          <TabsContent value="neural-networks" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Neural Network Fundamentals</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch how neural networks learn through forward and backward propagation
              </p>
            </div>
            
            <NeuralNetworkSimulator />

            {/* Activation Functions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">ReLU</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-50 rounded border relative">
                      <svg className="w-full h-full p-2">
                        <path
                          d="M 10 120 L 10 40 L 140 40"
                          stroke="#10b981"
                          strokeWidth="2"
                          fill="none"
                        />
                        <line x1="10" y1="120" x2="140" y2="120" stroke="#6b7280" strokeWidth="1" />
                        <line x1="10" y1="10" x2="10" y2="120" stroke="#6b7280" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      f(x) = max(0, x)
                    </p>
                    <p className="text-xs text-gray-500">
                      Most popular, avoids vanishing gradients
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Sigmoid</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-50 rounded border relative">
                      <svg className="w-full h-full p-2">
                        <path
                          d="M 10 110 Q 75 60 140 10"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          fill="none"
                        />
                        <line x1="10" y1="120" x2="140" y2="120" stroke="#6b7280" strokeWidth="1" />
                        <line x1="10" y1="10" x2="10" y2="120" stroke="#6b7280" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      f(x) = 1/(1 + e^(-x))
                    </p>
                    <p className="text-xs text-gray-500">
                      Output in (0,1), good for binary classification
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Tanh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-50 rounded border relative">
                      <svg className="w-full h-full p-2">
                        <path
                          d="M 10 100 Q 75 20 140 100"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          fill="none"
                        />
                        <line x1="10" y1="120" x2="140" y2="120" stroke="#6b7280" strokeWidth="1" />
                        <line x1="75" y1="10" x2="75" y2="120" stroke="#6b7280" strokeWidth="1" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      f(x) = tanh(x)
                    </p>
                    <p className="text-xs text-gray-500">
                      Output in (-1,1), zero-centered
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cnn" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Convolutional Neural Networks</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understand how CNNs extract features from images through convolution and pooling
              </p>
            </div>
            
            <CNNSimulator />
          </TabsContent>

          <TabsContent value="rnn" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Recurrent Neural Networks</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Visualize how RNNs process sequential data and maintain memory
              </p>
            </div>
            
            <RNNSimulator />
          </TabsContent>

          <TabsContent value="attention" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Attention Mechanisms</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore how attention allows models to focus on relevant parts of input
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Self-Attention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Query-Key-Value Mechanism</h5>
                    <p className="text-sm text-purple-700">Each element attends to all others</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Query:</strong> What I'm looking for</p>
                    <p><strong>Key:</strong> What I can offer</p>
                    <p><strong>Value:</strong> What I actually communicate</p>
                    <p><strong>Attention:</strong> softmax(Q·K^T)·V</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Multi-Head Attention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">Parallel Attention Heads</h5>
                    <p className="text-sm text-blue-700">Multiple attention mechanisms simultaneously</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Different representation subspaces</li>
                    <li>• Capture various relationship types</li>
                    <li>• Concatenate and project outputs</li>
                    <li>• Foundation of Transformers</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Attention Visualization */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Attention Heatmap Example</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Sentence: "The cat sat on the mat"
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['The', 'cat', 'sat', 'on', 'the'].map((word1, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-center font-semibold text-sm">{word1}</div>
                      {['The', 'cat', 'sat', 'on', 'the'].map((word2, j) => (
                        <div
                          key={j}
                          className="w-12 h-12 rounded flex items-center justify-center text-xs font-mono"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${Math.abs(i - j) === 0 ? 0.8 : Math.abs(i - j) === 1 ? 0.4 : 0.1})`,
                            color: Math.abs(i - j) <= 1 ? 'white' : 'black'
                          }}
                        >
                          {Math.abs(i - j) === 0 ? '0.8' : Math.abs(i - j) === 1 ? '0.4' : '0.1'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Higher attention values (darker blue) indicate stronger relationships between words
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}