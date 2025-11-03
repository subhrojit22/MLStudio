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
  Target,
  BarChart3,
  Network,
  Zap,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Scatter,
  Layers
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// K-Means Clustering Simulator
const KMeansClusteringSimulator = () => {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [numClusters, setNumClusters] = useState([3])
  const [dataPoints, setDataPoints] = useState(() => 
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 10,
      y: Math.random() * 10,
      cluster: -1
    }))
  )
  const [centroids, setCentroids] = useState<Array<{x: number, y: number}>>([])
  const [iterations, setIterations] = useState(0)

  const steps = [
    { title: "Initialize Centroids", description: "Randomly place cluster centers" },
    { title: "Assign Points", description: "Assign each point to nearest centroid" },
    { title: "Update Centroids", description: "Move centroids to cluster means" },
    { title: "Check Convergence", description: "Repeat until stable" }
  ]

  useEffect(() => {
    // Initialize centroids
    if (centroids.length === 0) {
      const newCentroids = Array.from({ length: numClusters[0] }, () => ({
        x: Math.random() * 10,
        y: Math.random() * 10
      }))
      setCentroids(newCentroids)
    }
  }, [numClusters])

  useEffect(() => {
    if (isPlaying && step < steps.length - 1) {
      const timer = setTimeout(() => {
        if (step === 1) {
          // Assign points to nearest centroid
          const newPoints = dataPoints.map(point => {
            let minDist = Infinity
            let nearestCluster = 0
            centroids.forEach((centroid, i) => {
              const dist = Math.sqrt((point.x - centroid.x) ** 2 + (point.y - centroid.y) ** 2)
              if (dist < minDist) {
                minDist = dist
                nearestCluster = i
              }
            })
            return { ...point, cluster: nearestCluster }
          })
          setDataPoints(newPoints)
        } else if (step === 2) {
          // Update centroids
          const newCentroids = centroids.map((_, i) => {
            const clusterPoints = dataPoints.filter(p => p.cluster === i)
            if (clusterPoints.length === 0) return centroids[i]
            const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0)
            const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0)
            return {
              x: sumX / clusterPoints.length,
              y: sumY / clusterPoints.length
            }
          })
          setCentroids(newCentroids)
          setIterations(iterations + 1)
        }
        setStep((step + 1) % steps.length)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, step, dataPoints, centroids])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handleReset = () => {
    setStep(0)
    setIsPlaying(false)
    setIterations(0)
    setDataPoints(Array.from({ length: 50 }, () => ({
      x: Math.random() * 10,
      y: Math.random() * 10,
      cluster: -1
    })))
    setCentroids([])
  }

  const clusterColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          K-Means Clustering Algorithm
        </CardTitle>
        <CardDescription>
          Watch how k-means groups data points into clusters iteratively
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handlePlay} disabled={isPlaying} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Clustering
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex-1">
            <label className="text-sm font-medium">Clusters: {numClusters[0]}</label>
            <Slider
              value={numClusters}
              onValueChange={setNumClusters}
              max={6}
              min={2}
              step={1}
              className="mt-2"
              disabled={isPlaying}
            />
          </div>
          <div className="text-sm text-gray-600">
            Iteration: {iterations}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{steps[step].title}</h3>
          <p className="text-gray-600">{steps[step].description}</p>
        </div>

        {/* Visualization */}
        <div className="flex justify-center">
          <div className="relative w-96 h-96 bg-gray-50 rounded-lg border-2 border-gray-200">
            <svg className="w-full h-full">
              {/* Draw cluster regions */}
              {step >= 1 && centroids.map((centroid, i) => (
                <circle
                  key={`region-${i}`}
                  cx={centroid.x * 38.4 + 10}
                  cy={centroid.y * 38.4 + 10}
                  r="60"
                  fill={clusterColors[i]}
                  fillOpacity="0.1"
                  stroke={clusterColors[i]}
                  strokeOpacity="0.3"
                />
              ))}
              
              {/* Draw data points */}
              {dataPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x * 38.4 + 10}
                  cy={point.y * 38.4 + 10}
                  r="6"
                  fill={point.cluster >= 0 ? clusterColors[point.cluster] : '#6b7280'}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              ))}
              
              {/* Draw centroids */}
              {centroids.map((centroid, i) => (
                <g key={i}>
                  <circle
                    cx={centroid.x * 38.4 + 10}
                    cy={centroid.y * 38.4 + 10}
                    r="10"
                    fill={clusterColors[i]}
                    stroke="white"
                    strokeWidth="3"
                    className="transition-all duration-500"
                  />
                  <text
                    x={centroid.x * 38.4 + 10}
                    y={centroid.y * 38.4 + 15}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {i + 1}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Algorithm Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Algorithm Steps</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Initialize k centroids randomly</li>
              <li>2. Assign each point to nearest centroid</li>
              <li>3. Recalculate centroids as cluster means</li>
              <li>4. Repeat until convergence</li>
            </ol>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Key Properties</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Guaranteed to converge</li>
              <li>• May find local optimum</li>
              <li>• Sensitive to initialization</li>
              <li>• Works best with spherical clusters</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// PCA Dimensionality Reduction Simulator
const PCASimulator = () => {
  const [numComponents, setNumComponents] = useState([2])
  const [showOriginal, setShowOriginal] = useState(true)
  const [showTransformed, setShowTransformed] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)

  // Generate 3D data
  const originalData = useMemo(() => {
    return Array.from({ length: 30 }, () => {
      const x = Math.random() * 4 - 2
      const y = x * 0.8 + (Math.random() - 0.5) * 0.5
      const z = x * 0.6 + y * 0.4 + (Math.random() - 0.5) * 0.3
      return { x, y, z }
    })
  }, [])

  // Simulate PCA transformation (simplified)
  const transformedData = useMemo(() => {
    return originalData.map(point => ({
      pc1: point.x * 0.7 + point.y * 0.5 + point.z * 0.3,
      pc2: -point.x * 0.3 + point.y * 0.8 - point.z * 0.4,
      pc3: point.x * 0.4 - point.y * 0.2 + point.z * 0.8
    }))
  }, [originalData])

  const explainedVariance = [0.72, 0.21, 0.07]

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scatter className="h-5 w-5" />
          PCA Dimensionality Reduction
        </CardTitle>
        <CardDescription>
          Visualize how Principal Component Analysis reduces dimensions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Components: {numComponents[0]}</label>
            <Slider
              value={numComponents}
              onValueChange={setNumComponents}
              max={3}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Original</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTransformed}
                onChange={(e) => setShowTransformed(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Transformed</span>
            </label>
          </div>
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original 3D Data */}
          {showOriginal && (
            <div className="space-y-3">
              <h4 className="font-semibold">Original 3D Data</h4>
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simulate 3D projection */}
                    {originalData.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: 1,
                          x: (point.x + 2) * 40,
                          y: (point.y + 2) * 40,
                          z: point.z * 20
                        }}
                        transition={{ delay: i * 0.02 }}
                        className="absolute w-2 h-2 bg-blue-500 rounded-full"
                        style={{
                          transform: `translate(${(point.x + 2) * 40}px, ${(point.y + 2) * 40}px)`,
                          opacity: 0.7 + point.z * 0.3
                        }}
                      />
                    ))}
                    {/* Axes */}
                    <div className="absolute w-full h-0.5 bg-gray-400 top-1/2 left-0"></div>
                    <div className="absolute h-full w-0.5 bg-gray-400 left-1/2 top-0"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-600">
                  Dimensions: 3
                </div>
              </div>
            </div>
          )}

          {/* Transformed 2D Data */}
          {showTransformed && (
            <div className="space-y-3">
              <h4 className="font-semibold">Principal Components</h4>
              <div className="h-64 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {transformedData.slice(0, numComponents[0] === 1 ? 30 : -1).map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: 1,
                          x: (point.pc1 + 3) * 40,
                          y: numComponents[0] >= 2 ? (point.pc2 + 3) * 40 : 96
                        }}
                        transition={{ delay: i * 0.02 }}
                        className="absolute w-2 h-2 bg-green-500 rounded-full"
                        style={{
                          transform: `translate(${(point.pc1 + 3) * 40}px, ${numComponents[0] >= 2 ? (point.pc2 + 3) * 40 : 96}px)`
                        }}
                      />
                    ))}
                    {/* PC axes */}
                    <div className="absolute w-full h-0.5 bg-green-400 top-1/2 left-0"></div>
                    {numComponents[0] >= 2 && (
                      <div className="absolute h-full w-0.5 bg-green-400 left-1/2 top-0"></div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-600">
                  Dimensions: {numComponents[0]}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explained Variance */}
        <div className="space-y-3">
          <h4 className="font-semibold">Explained Variance Ratio</h4>
          <div className="space-y-2">
            {explainedVariance.slice(0, numComponents[0]).map((variance, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-medium w-20">PC{i + 1}</span>
                <Progress value={variance * 100} className="flex-1" />
                <span className="text-sm text-gray-600 w-12">{(variance * 100).toFixed(0)}%</span>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-20">Total</span>
                <Progress 
                  value={explainedVariance.slice(0, numComponents[0]).reduce((a, b) => a + b, 0) * 100} 
                  className="flex-1" 
                />
                <span className="text-sm text-gray-600 w-12">
                  {(explainedVariance.slice(0, numComponents[0]).reduce((a, b) => a + b, 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PCA Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">How PCA Works</h4>
            <ol className="text-sm text-purple-700 space-y-1">
              <li>1. Center the data (subtract mean)</li>
              <li>2. Calculate covariance matrix</li>
              <li>3. Find eigenvalues and eigenvectors</li>
              <li>4. Sort by eigenvalue (variance)</li>
              <li>5. Project onto top components</li>
            </ol>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Benefits & Use Cases</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Reduces computational complexity</li>
              <li>• Removes multicollinearity</li>
              <li>• Helps with visualization</li>
              <li>• Noise reduction</li>
              <li>• Feature extraction for ML</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Ensemble Methods Simulator
const EnsembleMethodsSimulator = () => {
  const [selectedMethod, setSelectedMethod] = useState('bagging')
  const [numModels, setNumModels] = useState([5])
  const [showIndividual, setShowIndividual] = useState(true)
  const [showEnsemble, setShowEnsemble] = useState(true)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingStep, setTrainingStep] = useState(0)

  const ensembleMethods = {
    bagging: {
      name: 'Bagging (Bootstrap Aggregating)',
      description: 'Train models on different bootstrap samples',
      color: '#3b82f6'
    },
    boosting: {
      name: 'Boosting (AdaBoost)',
      description: 'Train models sequentially, focusing on errors',
      color: '#10b981'
    },
    stacking: {
      name: 'Stacking',
      description: 'Combine predictions using a meta-model',
      color: '#f59e0b'
    }
  }

  // Generate synthetic data
  const dataPoints = Array.from({ length: 20 }, (_, i) => ({
    x: i / 19,
    y: Math.sin(i / 19 * Math.PI * 2) * 0.5 + 0.5 + (Math.random() - 0.5) * 0.2,
    true: Math.sin(i / 19 * Math.PI * 2) * 0.5 + 0.5
  }))

  // Generate individual model predictions
  const modelPredictions = Array.from({ length: numModels[0] }, (_, modelIndex) => {
    return dataPoints.map((point, i) => {
      const noise = (Math.random() - 0.5) * 0.3
      const bias = selectedMethod === 'boosting' ? modelIndex * 0.05 : 0
      return point.true + noise + bias
    })
  })

  // Calculate ensemble prediction
  const ensemblePrediction = dataPoints.map((_, i) => {
    if (selectedMethod === 'bagging') {
      // Average of all models
      return modelPredictions.reduce((sum, preds) => sum + preds[i], 0) / numModels[0]
    } else if (selectedMethod === 'boosting') {
      // Weighted average (simplified)
      const weights = Array.from({ length: numModels[0] }, (_, i) => 1 + i * 0.2)
      const weightedSum = modelPredictions.reduce((sum, preds, j) => sum + preds[i] * weights[j], 0)
      return weightedSum / weights.reduce((a, b) => a + b, 0)
    } else {
      // Simple average for stacking
      return modelPredictions.reduce((sum, preds) => sum + preds[i], 0) / numModels[0]
    }
  })

  useEffect(() => {
    if (isTraining && trainingStep < numModels[0]) {
      const timer = setTimeout(() => {
        setTrainingStep(trainingStep + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else if (isTraining && trainingStep >= numModels[0]) {
      setIsTraining(false)
    }
  }, [isTraining, trainingStep, numModels])

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
          <Layers className="h-5 w-5" />
          Ensemble Methods
        </CardTitle>
        <CardDescription>
          Combine multiple models to create stronger predictors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(ensembleMethods).map(([key, method]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === key
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedMethod(key)}
            >
              <h4 className="font-semibold mb-1">{method.name}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleTrain} disabled={isTraining} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Train Ensemble
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex-1">
            <label className="text-sm font-medium">Models: {numModels[0]}</label>
            <Slider
              value={numModels}
              onValueChange={setNumModels}
              max={10}
              min={2}
              step={1}
              className="mt-2"
              disabled={isTraining}
            />
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showIndividual}
                onChange={(e) => setShowIndividual(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Individual</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showEnsemble}
                onChange={(e) => setShowEnsemble(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Ensemble</span>
            </label>
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Training Progress</span>
              <span className="text-sm text-gray-600">
                Model {trainingStep + 1}/{numModels[0]}
              </span>
            </div>
            <Progress value={(trainingStep / numModels[0]) * 100} className="h-2" />
          </div>
        )}

        {/* Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold">Model Predictions</h4>
          <div className="h-64 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
            <svg className="w-full h-full p-4">
              {/* True function */}
              <path
                d={`M ${dataPoints.map(p => `${p.x * 240 + 20},${(1 - p.true) * 240 + 20}`).join(' L ')}`}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                strokeDasharray="5,5"
              />
              
              {/* Individual model predictions */}
              {showIndividual && modelPredictions.slice(0, trainingStep || numModels[0]).map((preds, modelIndex) => (
                <path
                  key={modelIndex}
                  d={`M ${dataPoints.map((p, i) => `${p.x * 240 + 20},${(1 - preds[i]) * 240 + 20}`).join(' L ')}`}
                  stroke={ensembleMethods[selectedMethod as keyof typeof ensembleMethods].color}
                  strokeWidth="1"
                  fill="none"
                  opacity="0.3"
                />
              ))}
              
              {/* Ensemble prediction */}
              {showEnsemble && (trainingStep === numModels[0] || !isTraining) && (
                <path
                  d={`M ${dataPoints.map((p, i) => `${p.x * 240 + 20},${(1 - ensemblePrediction[i]) * 240 + 20}`).join(' L ')}`}
                  stroke="#ef4444"
                  strokeWidth="3"
                  fill="none"
                />
              )}
              
              {/* Data points */}
              {dataPoints.map((point, i) => (
                <circle
                  key={i}
                  cx={point.x * 240 + 20}
                  cy={(1 - point.y) * 240 + 20}
                  r="3"
                  fill="#6b7280"
                />
              ))}
            </svg>
            
            {/* Legend */}
            <div className="absolute top-2 right-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500"></div>
                <span className="text-xs">True Function</span>
              </div>
              {showIndividual && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: ensembleMethods[selectedMethod as keyof typeof ensembleMethods].color }}></div>
                  <span className="text-xs">Individual Models</span>
                </div>
              )}
              {showEnsemble && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span className="text-xs">Ensemble</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Method Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">
              {ensembleMethods[selectedMethod as keyof typeof ensembleMethods].name}
            </h4>
            <div className="text-sm text-blue-700 space-y-2">
              {selectedMethod === 'bagging' && (
                <>
                  <p>• Creates bootstrap samples (sampling with replacement)</p>
                  <p>• Trains independent models on each sample</p>
                  <p>• Reduces variance, prevents overfitting</p>
                  <p>• Example: Random Forest</p>
                </>
              )}
              {selectedMethod === 'boosting' && (
                <>
                  <p>• Trains models sequentially</p>
                  <p>• Each model focuses on previous errors</p>
                  <p>• Reduces bias, builds strong learners</p>
                  <p>• Example: AdaBoost, Gradient Boosting</p>
                </>
              )}
              {selectedMethod === 'stacking' && (
                <>
                  <p>• Combines different model types</p>
                  <p>• Meta-model learns optimal weights</p>
                  <p>• Leverages diverse model strengths</p>
                  <p>• Example: Super Learner</p>
                </>
              )}
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Ensemble Benefits</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Improved accuracy and stability</li>
              <li>• Reduced overfitting risk</li>
              <li>• Better generalization</li>
              <li>• Robust to noise and outliers</li>
              <li>• Can combine different algorithms</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function IntermediatePage() {
  const [activeTab, setActiveTab] = useState('clustering')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Intermediate ML & AI</h1>
              <p className="text-sm text-gray-600">Essential algorithms with interactive visualizations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clustering">Clustering</TabsTrigger>
            <TabsTrigger value="pca">PCA</TabsTrigger>
            <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
            <TabsTrigger value="nlp">NLP Basics</TabsTrigger>
          </TabsList>

          <TabsContent value="clustering" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Clustering Algorithms</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover hidden patterns and group similar data points
              </p>
            </div>
            
            <KMeansClusteringSimulator />

            {/* Other Clustering Algorithms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Hierarchical Clustering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Dendrogram Visualization</h5>
                    <p className="text-sm text-purple-700">Build tree of nested clusters</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• No need to specify k</li>
                    <li>• Agglomerative (bottom-up)</li>
                    <li>• Divisive (top-down)</li>
                    <li>• Linkage criteria: single, complete, average</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">DBSCAN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">Density-Based Clustering</h5>
                    <p className="text-sm text-orange-700">Find arbitrarily shaped clusters</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• No need to specify cluster count</li>
                    <li>• Handles noise and outliers</li>
                    <li>• Parameters: ε (epsilon), MinPts</li>
                    <li>• Core, border, and noise points</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pca" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Dimensionality Reduction</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Reduce complexity while preserving important information
              </p>
            </div>
            
            <PCASimulator />

            {/* Other Dimensionality Reduction Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">t-SNE</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <h5 className="font-semibold text-red-800">t-Distributed Stochastic Neighbor Embedding</h5>
                    <p className="text-sm text-red-700">Excellent for visualization</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Preserves local structure</li>
                    <li>• Non-linear dimensionality reduction</li>
                    <li>• Great for high-dimensional data</li>
                    <li>• Perplexity parameter controls focus</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">UMAP</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <h5 className="font-semibold text-indigo-800">Uniform Manifold Approximation</h5>
                    <p className="text-sm text-indigo-700">Faster than t-SNE</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Preserves both local and global</li>
                    <li>• Faster computation</li>
                    <li>• Better for large datasets</li>
                    <li>• More interpretable results</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ensemble" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Ensemble Methods</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Combine multiple models for better performance
              </p>
            </div>
            
            <EnsembleMethodsSimulator />
          </TabsContent>

          <TabsContent value="nlp" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Natural Language Processing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understanding and processing human language
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Tokenization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">Text Segmentation</h5>
                    <p className="text-sm text-blue-700">Break text into meaningful units</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Input:</strong> "Hello world! How are you?"
                    </div>
                    <div className="text-sm">
                      <strong>Tokens:</strong> ["Hello", "world", "!", "How", "are", "you", "?"]
                    </div>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Word tokenization</li>
                    <li>• Subword tokenization</li>
                    <li>• Character tokenization</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Vectorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800">Text to Numbers</h5>
                    <p className="text-sm text-green-700">Convert text to numerical representations</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Bag of Words (BoW)</li>
                    <li>• TF-IDF</li>
                    <li>• Word Embeddings (Word2Vec)</li>
                    <li>• Contextual Embeddings (BERT)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Stemming & Lemmatization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Word Normalization</h5>
                    <p className="text-sm text-purple-700">Reduce words to root forms</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Stemming:</strong> "running" → "runn"</div>
                    <div><strong>Lemmatization:</strong> "running" → "run"</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">NLP Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">Processing Steps</h5>
                    <p className="text-sm text-orange-700">Complete text processing workflow</p>
                  </div>
                  <ol className="text-sm space-y-1">
                    <li>1. Text Cleaning</li>
                    <li>2. Tokenization</li>
                    <li>3. Stop Word Removal</li>
                    <li>4. Stemming/Lemmatization</li>
                    <li>5. Vectorization</li>
                    <li>6. Model Application</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}