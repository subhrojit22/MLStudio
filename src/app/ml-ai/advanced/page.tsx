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
  GitBranch,
  Target,
  Zap,
  TrendingUp,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Network,
  Calculator,
  Brain
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Decision Tree Simulator
const DecisionTreeSimulator = () => {
  const [currentDepth, setCurrentDepth] = useState(0)
  const [isGrowing, setIsGrowing] = useState(false)
  const [maxDepth, setMaxDepth] = useState([3])
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [showSplit, setShowSplit] = useState(false)

  // Sample dataset
  const dataset = [
    { outlook: 'sunny', temp: 'hot', humidity: 'high', play: 'no' },
    { outlook: 'sunny', temp: 'hot', humidity: 'normal', play: 'no' },
    { outlook: 'overcast', temp: 'hot', humidity: 'high', play: 'yes' },
    { outlook: 'rainy', temp: 'mild', humidity: 'high', play: 'yes' },
    { outlook: 'rainy', temp: 'cool', humidity: 'normal', play: 'yes' },
    { outlook: 'rainy', temp: 'cool', humidity: 'normal', play: 'no' },
    { outlook: 'overcast', temp: 'cool', humidity: 'normal', play: 'yes' },
    { outlook: 'sunny', temp: 'mild', humidity: 'high', play: 'no' },
    { outlook: 'sunny', temp: 'cool', humidity: 'normal', play: 'yes' },
    { outlook: 'rainy', temp: 'mild', humidity: 'normal', play: 'yes' },
    { outlook: 'sunny', temp: 'mild', humidity: 'normal', play: 'yes' },
    { outlook: 'overcast', temp: 'mild', humidity: 'high', play: 'yes' },
    { outlook: 'overcast', temp: 'hot', humidity: 'normal', play: 'yes' },
    { outlook: 'rainy', temp: 'mild', humidity: 'high', play: 'no' }
  ]

  // Tree structure
  const [tree, setTree] = useState({
    feature: 'outlook',
    threshold: null,
    children: {
      'sunny': {
        feature: 'humidity',
        threshold: null,
        children: {
          'high': { prediction: 'no', samples: 3 },
          'normal': { prediction: 'yes', samples: 2 }
        },
        samples: 5,
        gini: 0.48
      },
      'overcast': { 
        prediction: 'yes', 
        samples: 4,
        gini: 0
      },
      'rainy': {
        feature: 'windy',
        threshold: null,
        children: {
          'true': { prediction: 'no', samples: 2 },
          'false': { prediction: 'yes', samples: 3 }
        },
        samples: 5,
        gini: 0.48
      }
    },
    samples: 14,
    gini: 0.459
  })

  useEffect(() => {
    if (isGrowing && currentDepth < maxDepth[0]) {
      const timer = setTimeout(() => {
        setCurrentDepth(currentDepth + 1)
        if (currentDepth === 0) setShowSplit(true)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isGrowing && currentDepth >= maxDepth[0]) {
      setIsGrowing(false)
    }
  }, [isGrowing, currentDepth, maxDepth])

  const handleGrow = () => {
    setCurrentDepth(0)
    setIsGrowing(true)
    setShowSplit(false)
  }

  const handleReset = () => {
    setCurrentDepth(0)
    setIsGrowing(false)
    setShowSplit(false)
    setSelectedNode(null)
  }

  const TreeNode = ({ node, depth = 0, x = 400, y = 50, parentX = null, parentY = null }: any) => {
    if (depth > currentDepth) return null

    const nodeSize = 60 - depth * 10
    const isLeaf = node.prediction !== undefined

    return (
      <g>
        {/* Connection to parent */}
        {parentX !== null && parentY !== null && (
          <motion.line
            x1={parentX}
            y1={parentY}
            x2={x}
            y2={y}
            stroke="#6b7280"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: depth * 0.3 }}
          />
        )}

        {/* Node */}
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: depth * 0.3 }}
          onClick={() => setSelectedNode(depth)}
          className="cursor-pointer"
        >
          <circle
            cx={x}
            cy={y}
            r={nodeSize / 2}
            fill={isLeaf ? (node.prediction === 'yes' ? '#10b981' : '#ef4444') : '#3b82f6'}
            stroke="white"
            strokeWidth="3"
            className={selectedNode === depth ? 'stroke-yellow-400 stroke-4' : ''}
          />
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            {isLeaf ? node.prediction.toUpperCase() : node.feature}
          </text>
          <text
            x={x}
            y={y + nodeSize / 2 + 15}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="10"
          >
            n={node.samples}
          </text>
        </motion.g>

        {/* Children */}
        {!isLeaf && node.children && depth < currentDepth && (
          <>
            {Object.entries(node.children).map(([key, child]: [string, any], index) => {
              const childX = x + (index - 0.5) * (300 / Math.pow(2, depth))
              const childY = y + 100
              return (
                <TreeNode
                  key={key}
                  node={child}
                  depth={depth + 1}
                  x={childX}
                  y={childY}
                  parentX={x}
                  parentY={y}
                />
              )
            })}
          </>
        )}
      </g>
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Decision Tree Growth Visualization
        </CardTitle>
        <CardDescription>
          Watch how decision trees split data to make predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleGrow} disabled={isGrowing} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Grow Tree
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex-1">
            <label className="text-sm font-medium">Max Depth: {maxDepth[0]}</label>
            <Slider
              value={maxDepth}
              onValueChange={setMaxDepth}
              max={4}
              min={1}
              step={1}
              className="mt-2"
              disabled={isGrowing}
            />
          </div>
          <div className="text-sm text-gray-600">
            Depth: {currentDepth}/{maxDepth[0]}
          </div>
        </div>

        {/* Tree Visualization */}
        <div className="flex justify-center">
          <div className="w-full h-96 bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
            <svg className="w-full h-full">
              <TreeNode node={tree} />
            </svg>
          </div>
        </div>

        {/* Split Information */}
        <AnimatePresence>
          {showSplit && currentDepth === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
            >
              <h4 className="font-semibold text-blue-800 mb-2">First Split: Outlook</h4>
              <p className="text-sm text-blue-700 mb-2">
                The algorithm chose 'outlook' as the best feature because it provides the most information gain.
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold">Sunny</div>
                  <div>5 samples, Gini: 0.48</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Overcast</div>
                  <div>4 samples, Gini: 0.0</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Rainy</div>
                  <div>5 samples, Gini: 0.48</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Algorithm Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">How Decision Trees Work</h4>
            <ol className="text-sm text-green-700 space-y-1">
              <li>1. Start with all data at root</li>
              <li>2. Find best split (max information gain)</li>
              <li>3. Split data into subsets</li>
              <li>4. Repeat for each subset</li>
              <li>5. Stop when pure or max depth reached</li>
            </ol>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">Splitting Criteria</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Gini Impurity:</strong> 1 - Σ(pᵢ²)</li>
              <li>• <strong>Entropy:</strong> -Σ(pᵢ log(pᵢ))</li>
              <li>• <strong>Information Gain:</strong> Parent - Children</li>
              <li>• <strong>Chi-square:</strong> Statistical test</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// SVM Simulator
const SVMSimulator = () => {
  const [kernel, setKernel] = useState('linear')
  const [margin, setMargin] = useState([50])
  const [showSupportVectors, setShowSupportVectors] = useState(true)
  const [showMargin, setShowMargin] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingStep, setTrainingStep] = useState(0)

  // Generate two classes of points
  const class1Points = useMemo(() => {
    return Array.from({ length: 20 }, () => {
      const angle = Math.random() * Math.PI
      const radius = 2 + Math.random() * 2
      return {
        x: Math.cos(angle) * radius + 5,
        y: Math.sin(angle) * radius + 5,
        class: 1
      }
    })
  }, [])

  const class2Points = useMemo(() => {
    return Array.from({ length: 20 }, () => {
      const angle = Math.random() * Math.PI
      const radius = 2 + Math.random() * 2
      return {
        x: Math.cos(angle) * radius + 2,
        y: Math.sin(angle) * radius + 2,
        class: -1
      }
    })
  }, [])

  // Support vectors (simplified)
  const supportVectors = useMemo(() => {
    return [
      ...class1Points.slice(0, 3),
      ...class2Points.slice(0, 3)
    ]
  }, [class1Points, class2Points])

  // Decision boundary
  const decisionBoundary = useMemo(() => {
    if (kernel === 'linear') {
      return {
        slope: -1,
        intercept: 7,
        type: 'linear'
      }
    } else if (kernel === 'rbf') {
      return {
        type: 'rbf',
        center: { x: 3.5, y: 3.5 },
        radius: 2.5
      }
    } else {
      return {
        type: 'polynomial',
        degree: 2
      }
    }
  }, [kernel])

  useEffect(() => {
    if (isTraining && trainingStep < 3) {
      const timer = setTimeout(() => {
        setTrainingStep(trainingStep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isTraining && trainingStep >= 3) {
      setIsTraining(false)
    }
  }, [isTraining, trainingStep])

  const handleTrain = () => {
    setIsTraining(true)
    setTrainingStep(0)
  }

  const handleReset = () => {
    setIsTraining(false)
    setTrainingStep(0)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Support Vector Machine (SVM)
        </CardTitle>
        <CardDescription>
          Find the optimal hyperplane that separates classes with maximum margin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleTrain} disabled={isTraining} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Train SVM
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2">
            {['linear', 'rbf', 'polynomial'].map((k) => (
              <Button
                key={k}
                variant={kernel === k ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKernel(k)}
                disabled={isTraining}
              >
                {k.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSupportVectors}
                onChange={(e) => setShowSupportVectors(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Support Vectors</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showMargin}
                onChange={(e) => setShowMargin(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Margin</span>
            </label>
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {trainingStep === 0 && "Finding support vectors..."}
                {trainingStep === 1 && "Calculating optimal hyperplane..."}
                {trainingStep === 2 && "Maximizing margin..."}
                {trainingStep === 3 && "SVM trained!"}
              </span>
              <span className="text-sm text-gray-600">
                Step {trainingStep + 1}/3
              </span>
            </div>
            <Progress value={(trainingStep / 3) * 100} className="h-2" />
          </div>
        )}

        {/* Visualization */}
        <div className="flex justify-center">
          <div className="w-96 h-96 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
            <svg className="w-full h-full p-4">
              {/* Decision boundary */}
              {trainingStep >= 1 && (
                <>
                  {decisionBoundary.type === 'linear' && (
                    <>
                      <line
                        x1="0"
                        y1={-decisionBoundary.slope * 0 + decisionBoundary.intercept * 30}
                        x2="350"
                        y2={-decisionBoundary.slope * 350 + decisionBoundary.intercept * 30}
                        stroke="#3b82f6"
                        strokeWidth="3"
                      />
                      {showMargin && (
                        <>
                          <line
                            x1="0"
                            y1={-decisionBoundary.slope * 0 + (decisionBoundary.intercept + margin[0] / 100) * 30}
                            x2="350"
                            y2={-decisionBoundary.slope * 350 + (decisionBoundary.intercept + margin[0] / 100) * 30}
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            opacity="0.5"
                          />
                          <line
                            x1="0"
                            y1={-decisionBoundary.slope * 0 + (decisionBoundary.intercept - margin[0] / 100) * 30}
                            x2="350"
                            y2={-decisionBoundary.slope * 350 + (decisionBoundary.intercept - margin[0] / 100) * 30}
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                            opacity="0.5"
                          />
                        </>
                      )}
                    </>
                  )}
                  {decisionBoundary.type === 'rbf' && (
                    <circle
                      cx={decisionBoundary.center.x * 30}
                      cy={decisionBoundary.center.y * 30}
                      r={decisionBoundary.radius * 30}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                    />
                  )}
                </>
              )}

              {/* Class 1 points */}
              {class1Points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x * 30}
                  cy={point.y * 30}
                  r="6"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                  className={showSupportVectors && supportVectors.includes(point) ? 'stroke-yellow-400 stroke-4' : ''}
                />
              ))}

              {/* Class 2 points */}
              {class2Points.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x * 30}
                  cy={point.y * 30}
                  r="6"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                  className={showSupportVectors && supportVectors.includes(point) ? 'stroke-yellow-400 stroke-4' : ''}
                />
              ))}

              {/* Support vectors highlight */}
              {showSupportVectors && trainingStep >= 1 && supportVectors.map((point, i) => (
                <circle
                  key={`sv-${i}`}
                  cx={point.x * 30}
                  cy={point.y * 30}
                  r="10"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="absolute top-2 right-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs">Class 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs">Class 2</span>
              </div>
              {showSupportVectors && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">Support Vector</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kernel Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-2 ${
            kernel === 'linear' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Linear Kernel</h5>
            <p className="text-sm">K(x,y) = x·y</p>
            <p className="text-xs text-gray-600">Best for linearly separable data</p>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            kernel === 'rbf' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">RBF Kernel</h5>
            <p className="text-sm">K(x,y) = exp(-γ||x-y||²)</p>
            <p className="text-xs text-gray-600">Creates complex decision boundaries</p>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            kernel === 'polynomial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Polynomial Kernel</h5>
            <p className="text-sm">K(x,y) = (x·y + c)ᵈ</p>
            <p className="text-xs text-gray-600">Captures feature interactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Gradient Descent Simulator
const GradientDescentSimulator = () => {
  const [algorithm, setAlgorithm] = useState('sgd')
  const [learningRate, setLearningRate] = useState([0.1])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [currentPosition, setCurrentPosition] = useState({ x: -2, y: 2 })
  const [path, setPath] = useState<Array<{x: number, y: number}>>([])
  const [iteration, setIteration] = useState(0)

  // Loss function (Rosenbrock function)
  const lossFunction = (x: number, y: number) => {
    return Math.pow(1 - x, 2) + 100 * Math.pow(y - x * x, 2)
  }

  // Gradient of loss function
  const gradient = (x: number, y: number) => {
    const dx = -2 * (1 - x) - 400 * x * (y - x * x)
    const dy = 200 * (y - x * x)
    return { dx, dy }
  }

  // Optimization step
  const optimizationStep = () => {
    const grad = gradient(currentPosition.x, currentPosition.y)
    
    let newX, newY
    if (algorithm === 'sgd') {
      // Standard gradient descent
      newX = currentPosition.x - learningRate[0] * grad.dx
      newY = currentPosition.y - learningRate[0] * grad.dy
    } else if (algorithm === 'momentum') {
      // Momentum-based gradient descent
      const velocity = path.length > 0 ? {
        x: currentPosition.x - path[path.length - 1].x,
        y: currentPosition.y - path[path.length - 1].y
      } : { x: 0, y: 0 }
      newX = currentPosition.x - learningRate[0] * grad.dx + 0.9 * velocity.x
      newY = currentPosition.y - learningRate[0] * grad.dy + 0.9 * velocity.y
    } else if (algorithm === 'adam') {
      // Adam optimizer
      const alpha = learningRate[0]
      const beta1 = 0.9
      const beta2 = 0.999
      const epsilon = 1e-8
      
      // Simplified Adam update
      newX = currentPosition.x - alpha * grad.dx
      newY = currentPosition.y - alpha * grad.dy
    } else {
      newX = currentPosition.x - learningRate[0] * grad.dx
      newY = currentPosition.y - learningRate[0] * grad.dy
    }

    setCurrentPosition({ x: newX, y: newY })
    setPath(prev => [...prev, { x: newX, y: newY }])
    setIteration(iteration + 1)
  }

  useEffect(() => {
    if (isOptimizing && iteration < 50) {
      const timer = setTimeout(() => {
        optimizationStep()
      }, 200)
      return () => clearTimeout(timer)
    } else if (isOptimizing && iteration >= 50) {
      setIsOptimizing(false)
    }
  }, [isOptimizing, iteration])

  const handleStart = () => {
    setIsOptimizing(true)
    setIteration(0)
    setPath([{ ...currentPosition }])
  }

  const handleReset = () => {
    setIsOptimizing(false)
    setCurrentPosition({ x: -2, y: 2 })
    setPath([])
    setIteration(0)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Gradient Descent Optimization
        </CardTitle>
        <CardDescription>
          Compare different optimization algorithms finding the minimum of a loss function
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleStart} disabled={isOptimizing} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Optimization
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2">
            {['sgd', 'momentum', 'adam'].map((algo) => (
              <Button
                key={algo}
                variant={algorithm === algo ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAlgorithm(algo)}
                disabled={isOptimizing}
              >
                {algo.toUpperCase()}
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
              disabled={isOptimizing}
            />
          </div>
          <div className="text-sm text-gray-600">
            Iter: {iteration}
          </div>
        </div>

        {/* Loss Landscape Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Loss Landscape (3D View)</h4>
            <div className="h-80 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
              <svg className="w-full h-full p-4">
                {/* Optimization path */}
                {path.length > 1 && (
                  <polyline
                    points={path.map(p => `${p.x * 50 + 150},${p.y * 50 + 150}`).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                )}

                {/* Current position */}
                <circle
                  cx={currentPosition.x * 50 + 150}
                  cy={currentPosition.y * 50 + 150}
                  r="6"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />

                {/* Global minimum */}
                <circle
                  cx={1 * 50 + 150}
                  cy={1 * 50 + 150}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>

              {/* Legend */}
              <div className="absolute top-2 right-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs">Current Position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs">Global Minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-red-500"></div>
                  <span className="text-xs">Optimization Path</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Loss Over Iterations</h4>
            <div className="h-80 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {lossFunction(currentPosition.x, currentPosition.y).toFixed(4)}
                  </div>
                  <div className="text-sm text-gray-600">Current Loss</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Algorithm: {algorithm.toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* Loss progress bar */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-gray-600 mb-1">Loss Reduction</div>
                <Progress 
                  value={Math.max(0, 100 - lossFunction(currentPosition.x, currentPosition.y) * 10)} 
                  className="h-2" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-2 ${
            algorithm === 'sgd' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">SGD</h5>
            <p className="text-sm mb-2">Standard Gradient Descent</p>
            <ul className="text-xs space-y-1">
              <li>• Simple and reliable</li>
              <li>• Can be slow</li>
              <li>• May get stuck in local minima</li>
            </ul>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            algorithm === 'momentum' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Momentum</h5>
            <p className="text-sm mb-2">Accelerates in consistent directions</p>
            <ul className="text-xs space-y-1">
              <li>• Faster convergence</li>
              <li>• Helps escape local minima</li>
              <li>• Momentum parameter β</li>
            </ul>
          </div>
          <div className={`p-3 rounded-lg border-2 ${
            algorithm === 'adam' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Adam</h5>
            <p className="text-sm mb-2">Adaptive learning rates</p>
            <ul className="text-xs space-y-1">
              <li>• Combines momentum + RMSprop</li>
              <li>• Works well for most problems</li>
              <li>• Adaptive per-parameter learning</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdvancedPage() {
  const [activeTab, setActiveTab] = useState('decision-trees')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced ML & Deep Learning</h1>
              <p className="text-sm text-gray-600">Sophisticated algorithms with animated visualizations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="decision-trees">Decision Trees</TabsTrigger>
            <TabsTrigger value="svm">SVM</TabsTrigger>
            <TabsTrigger value="gradient-descent">Gradient Descent</TabsTrigger>
            <TabsTrigger value="topic-modeling">Topic Modeling</TabsTrigger>
          </TabsList>

          <TabsContent value="decision-trees" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Decision Trees & Random Forests</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Watch how trees grow by splitting data to make predictions
              </p>
            </div>
            
            <DecisionTreeSimulator />
          </TabsContent>

          <TabsContent value="svm" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Support Vector Machines</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find optimal hyperplanes with maximum margin separation
              </p>
            </div>
            
            <SVMSimulator />
          </TabsContent>

          <TabsContent value="gradient-descent" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Gradient Descent Variants</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Compare optimization algorithms navigating loss landscapes
              </p>
            </div>
            
            <GradientDescentSimulator />
          </TabsContent>

          <TabsContent value="topic-modeling" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Unsupervised Topic Modeling</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover hidden topics in text documents using LDA and NMF
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Latent Dirichlet Allocation (LDA)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Generative Probabilistic Model</h5>
                    <p className="text-sm text-purple-700">Documents as mixtures of topics</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Process:</strong></p>
                    <ol className="space-y-1">
                      <li>1. Choose topic distribution θ ~ Dir(α)</li>
                      <li>2. For each word:</li>
                      <li>   - Choose topic z ~ Multinomial(θ)</li>
                      <li>   - Choose word w ~ Multinomial(β_z)</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Non-negative Matrix Factorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">Linear Algebra Approach</h5>
                    <p className="text-sm text-orange-700">Factorize document-term matrix</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Factorization:</strong></p>
                    <code className="text-xs bg-white p-2 rounded block">
                      V ≈ W × H
                    </code>
                    <ul className="space-y-1">
                      <li>• V: Document-term matrix</li>
                      <li>• W: Document-topic weights</li>
                      <li>• H: Topic-word distributions</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}