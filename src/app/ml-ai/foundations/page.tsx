'use client'

import { useState, useEffect } from 'react'
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
  Database,
  TrendingUp,
  Target,
  BarChart3,
  Calculator,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Data Preprocessing Component
const DataPreprocessingSimulator = () => {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [missingData, setMissingData] = useState([1, 2, null, 4, 5, null, 7, 8, 9, 10])
  const [cleanData, setCleanData] = useState<number[]>([])
  const [normalizedData, setNormalizedData] = useState<number[]>([])

  const steps = [
    { title: "Original Data", description: "Dataset with missing values" },
    { title: "Missing Value Detection", description: "Identifying null/empty values" },
    { title: "Imputation", description: "Filling missing values with mean" },
    { title: "Normalization", description: "Scaling values to [0,1] range" },
    { title: "Clean Dataset", description: "Ready for ML processing" }
  ]

  useEffect(() => {
    if (isPlaying && step < steps.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), 2000)
      return () => clearTimeout(timer)
    } else if (isPlaying && step >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, step])

  useEffect(() => {
    // Process data based on current step
    if (step >= 2) {
      // Imputation: fill missing values with mean
      const validValues = missingData.filter(v => v !== null) as number[]
      const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length
      const imputed = missingData.map(v => v !== null ? v : mean)
      setCleanData(imputed)
    }

    if (step >= 3) {
      // Normalization
      const min = Math.min(...cleanData)
      const max = Math.max(...cleanData)
      const normalized = cleanData.map(v => (v - min) / (max - min))
      setNormalizedData(normalized)
    }
  }, [step, missingData, cleanData])

  const getCurrentData = () => {
    switch (step) {
      case 0:
      case 1:
        return missingData
      case 2:
        return cleanData.length > 0 ? cleanData : missingData
      case 3:
        return normalizedData.length > 0 ? normalizedData : cleanData
      case 4:
        return normalizedData.length > 0 ? normalizedData : cleanData
      default:
        return missingData
    }
  }

  const handlePlay = () => {
    setStep(0)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setStep(0)
    setIsPlaying(false)
    setCleanData([])
    setNormalizedData([])
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Preprocessing Pipeline
        </CardTitle>
        <CardDescription>
          Watch how raw data is transformed into clean, ML-ready format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handlePlay} disabled={isPlaying} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Play Animation
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex-1">
            <Progress value={(step / (steps.length - 1)) * 100} className="h-2" />
          </div>
          <span className="text-sm text-gray-600">
            Step {step + 1}/{steps.length}
          </span>
        </div>

        {/* Current Step Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{steps[step].title}</h3>
          <p className="text-gray-600">{steps[step].description}</p>
        </div>

        {/* Data Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              {getCurrentData().map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-sm font-mono
                    ${value === null ? 'bg-red-100 text-red-600 border-2 border-red-300' : 
                      step >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                  `}
                >
                  {value === null ? 'NaN' : value.toFixed(2)}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Step-specific visualizations */}
          <AnimatePresence>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-red-50 rounded-lg border-2 border-red-200"
              >
                <h4 className="font-semibold text-red-800 mb-2">Missing Values Detected</h4>
                <p className="text-sm text-red-700">
                  Found 2 missing values at positions 2 and 5. These need to be filled before processing.
                </p>
              </motion.div>
            )}

            {step === 2 && cleanData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200"
              >
                <h4 className="font-semibold text-yellow-800 mb-2">Mean Imputation Applied</h4>
                <p className="text-sm text-yellow-700">
                  Missing values filled with mean: {cleanData[2]?.toFixed(2)}
                </p>
              </motion.div>
            )}

            {step === 3 && normalizedData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-2">Min-Max Normalization</h4>
                <p className="text-sm text-blue-700">
                  Values scaled to [0,1] range using: (value - min) / (max - min)
                </p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-green-50 rounded-lg border-2 border-green-200"
              >
                <h4 className="font-semibold text-green-800 mb-2">Data Ready for ML!</h4>
                <p className="text-sm text-green-700">
                  Dataset is now clean, normalized, and ready for machine learning algorithms.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

// Bias-Variance Tradeoff Component
const BiasVarianceSimulator = () => {
  const [modelComplexity, setModelComplexity] = useState([50])
  const [showBias, setShowBias] = useState(true)
  const [showVariance, setShowVariance] = useState(true)
  const [showTotalError, setShowTotalError] = useState(true)

  // Generate synthetic data points
  const trueFunction = (x: number) => Math.sin(x * 2) * 0.5 + 0.5
  const dataPoints = Array.from({ length: 20 }, (_, i) => {
    const x = i / 19
    const y = trueFunction(x) + (Math.random() - 0.5) * 0.3
    return { x, y }
  })

  // Calculate bias and variance based on complexity
  const complexity = modelComplexity[0] / 100
  const bias = 1 - complexity
  const variance = complexity
  const totalError = bias + variance

  // Generate model prediction
  const modelPrediction = (x: number) => {
    if (complexity < 0.3) {
      // Underfit (high bias)
      return 0.5
    } else if (complexity > 0.7) {
      // Overfit (high variance)
      return trueFunction(x) + Math.sin(x * 10) * 0.2 * complexity
    } else {
      // Good fit
      return trueFunction(x) + Math.sin(x * 5) * 0.1
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Bias-Variance Tradeoff
        </CardTitle>
        <CardDescription>
          Explore the balance between underfitting and overfitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Model Complexity: {modelComplexity[0]}%</label>
            <Slider
              value={modelComplexity}
              onValueChange={setModelComplexity}
              max={100}
              min={0}
              step={1}
              className="mt-2"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBias}
                onChange={(e) => setShowBias(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Bias</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showVariance}
                onChange={(e) => setShowVariance(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Variance</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTotalError}
                onChange={(e) => setShowTotalError(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Total Error</span>
            </label>
          </div>
        </div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Function Plot */}
          <div className="space-y-3">
            <h4 className="font-semibold">Model Fit Visualization</h4>
            <div className="h-64 bg-gray-50 rounded-lg p-4 relative">
              <svg className="w-full h-full">
                {/* True function */}
                <path
                  d={`M ${dataPoints.map(p => `${p.x * 240 + 10},${(1 - trueFunction(p.x)) * 240 + 10}`).join(' L ')}`}
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                />
                
                {/* Model prediction */}
                <path
                  d={`M ${dataPoints.map(p => `${p.x * 240 + 10},${(1 - modelPrediction(p.x)) * 240 + 10}`).join(' L ')}`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                />
                
                {/* Data points */}
                {dataPoints.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x * 240 + 10}
                    cy={(1 - point.y) * 240 + 10}
                    r="4"
                    fill="#ef4444"
                  />
                ))}
              </svg>
              
              {/* Legend */}
              <div className="absolute top-2 right-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-green-500"></div>
                  <span className="text-xs">True Function</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-blue-500"></div>
                  <span className="text-xs">Model</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs">Data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Components */}
          <div className="space-y-3">
            <h4 className="font-semibold">Error Components</h4>
            <div className="space-y-3">
              {showBias && (
                <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-800">Bias²</span>
                    <span className="text-red-600">{(bias * bias).toFixed(3)}</span>
                  </div>
                  <Progress value={bias * bias * 100} className="h-2" />
                  <p className="text-xs text-red-700 mt-1">
                    {complexity < 0.3 ? "High bias: Model too simple" : 
                     complexity > 0.7 ? "Low bias: Model complex enough" : 
                     "Good bias: Appropriate complexity"}
                  </p>
                </div>
              )}

              {showVariance && (
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-800">Variance</span>
                    <span className="text-blue-600">{variance.toFixed(3)}</span>
                  </div>
                  <Progress value={variance * 100} className="h-2" />
                  <p className="text-xs text-blue-700 mt-1">
                    {complexity > 0.7 ? "High variance: Overfitting" : 
                     complexity < 0.3 ? "Low variance: Underfitting" : 
                     "Good variance: Balanced fit"}
                  </p>
                </div>
              )}

              {showTotalError && (
                <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-800">Total Error</span>
                    <span className="text-purple-600">{totalError.toFixed(3)}</span>
                  </div>
                  <Progress value={totalError * 50} className="h-2" />
                  <p className="text-xs text-purple-700 mt-1">
                    Optimal around 50% complexity
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Model Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {complexity < 0.3 ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : complexity > 0.7 ? (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>
                {complexity < 0.3 ? "Underfitting" : 
                 complexity > 0.7 ? "Overfitting" : "Good Fit"}
              </span>
            </div>
            <div>
              <span className="font-medium">Recommendation: </span>
              {complexity < 0.3 ? "Increase model complexity" : 
               complexity > 0.7 ? "Add regularization or simplify" : 
               "Current complexity is optimal"}
            </div>
            <div>
              <span className="font-medium">Best Practice: </span>
              Cross-validation to find optimal complexity
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Feature Engineering Component
const FeatureEngineeringSimulator = () => {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['age', 'income'])
  const [createdFeatures, setCreatedFeatures] = useState<string[]>([])
  const [showTransformation, setShowTransformation] = useState(false)

  const originalFeatures = [
    { name: 'age', type: 'numerical', description: 'Customer age in years' },
    { name: 'income', type: 'numerical', description: 'Annual income in USD' },
    { name: 'gender', type: 'categorical', description: 'Customer gender' },
    { name: 'education', type: 'categorical', description: 'Education level' },
    { name: 'purchase_date', type: 'datetime', description: 'Last purchase date' }
  ]

  const featureTransformations = [
    {
      input: ['age'],
      output: 'age_group',
      description: 'Bin age into groups (young, adult, senior)',
      type: 'binning'
    },
    {
      input: ['income'],
      output: 'log_income',
      description: 'Apply log transformation to reduce skew',
      type: 'transformation'
    },
    {
      input: ['age', 'income'],
      output: 'income_per_age',
      description: 'Create interaction feature',
      type: 'interaction'
    },
    {
      input: ['purchase_date'],
      output: 'days_since_purchase',
      description: 'Extract time-based feature',
      type: 'extraction'
    },
    {
      input: ['gender', 'education'],
      output: 'gender_education',
      description: 'Combine categorical features',
      type: 'combination'
    }
  ]

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const applyTransformation = (transformation: any) => {
    if (!createdFeatures.includes(transformation.output)) {
      setCreatedFeatures(prev => [...prev, transformation.output])
      setShowTransformation(true)
      setTimeout(() => setShowTransformation(false), 3000)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Feature Engineering Workshop
        </CardTitle>
        <CardDescription>
          Transform raw features into powerful predictive signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Original Features */}
        <div className="space-y-3">
          <h4 className="font-semibold">Original Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {originalFeatures.map((feature) => (
              <div
                key={feature.name}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFeatures.includes(feature.name)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleFeatureToggle(feature.name)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{feature.name}</span>
                  <Badge variant={feature.type === 'numerical' ? 'default' : 'secondary'}>
                    {feature.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Transformations */}
        <div className="space-y-3">
          <h4 className="font-semibold">Available Transformations</h4>
          <div className="grid gap-3">
            {featureTransformations.map((transformation, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{transformation.input.join(' + ')} → {transformation.output}</span>
                    <Badge variant="outline" className="ml-2">
                      {transformation.type}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => applyTransformation(transformation)}
                    disabled={createdFeatures.includes(transformation.output)}
                  >
                    {createdFeatures.includes(transformation.output) ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{transformation.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Created Features */}
        {createdFeatures.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Engineered Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {createdFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-green-50 border-2 border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">{feature}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Transformation Animation */}
        <AnimatePresence>
          {showTransformation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
            >
              <h4 className="font-semibold text-blue-800 mb-2">Feature Transformation Applied!</h4>
              <p className="text-sm text-blue-700">
                New feature has been created and added to your dataset. This can improve model performance by capturing important patterns.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Best Practices */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Feature Engineering Best Practices</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Domain knowledge helps create meaningful features</li>
            <li>• Avoid data leakage when creating time-based features</li>
            <li>• Scale features after transformation for better model performance</li>
            <li>• Test feature importance to keep only valuable features</li>
            <li>• Consider polynomial features for non-linear relationships</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FoundationsPage() {
  const [activeTab, setActiveTab] = useState('preprocessing')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Foundational Machine Learning</h1>
              <p className="text-sm text-gray-600">Core concepts with interactive visualizations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preprocessing">Data Preprocessing</TabsTrigger>
            <TabsTrigger value="bias-variance">Bias-Variance</TabsTrigger>
            <TabsTrigger value="feature-engineering">Feature Engineering</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="preprocessing" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Data Preprocessing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Learn how to clean, transform, and prepare data for machine learning models
              </p>
            </div>
            
            <DataPreprocessingSimulator />

            {/* Additional Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Types of Missing Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <h5 className="font-semibold text-red-800">MCAR (Missing Completely At Random)</h5>
                    <p className="text-sm text-red-700">Missingness has no relationship with any values</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <h5 className="font-semibold text-yellow-800">MAR (Missing At Random)</h5>
                    <p className="text-sm text-yellow-700">Missingness relates to observed data</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">MNAR (Missing Not At Random)</h5>
                    <p className="text-sm text-blue-700">Missingness relates to unobserved data</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Normalization Techniques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800">Min-Max Scaling</h5>
                    <p className="text-sm text-green-700">Scales to [0,1] range</p>
                    <code className="text-xs bg-white p-1 rounded">(x - min) / (max - min)</code>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Standardization</h5>
                    <p className="text-sm text-purple-700">Mean=0, Std=1</p>
                    <code className="text-xs bg-white p-1 rounded">(x - μ) / σ</code>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">Robust Scaling</h5>
                    <p className="text-sm text-orange-700">Uses median and IQR</p>
                    <code className="text-xs bg-white p-1 rounded">(x - median) / IQR</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bias-variance" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Bias-Variance Tradeoff</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understanding the fundamental tradeoff in machine learning model performance
              </p>
            </div>
            
            <BiasVarianceSimulator />

            {/* Additional Concepts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-800">Underfitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-4xl text-center">😟</div>
                    <ul className="text-sm space-y-1">
                      <li>• High bias, low variance</li>
                      <li>• Model too simple</li>
                      <li>• Poor training performance</li>
                      <li>• Poor test performance</li>
                    </ul>
                    <div className="p-2 bg-red-50 rounded">
                      <p className="text-xs font-semibold">Solution: Increase complexity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Good Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-4xl text-center">😊</div>
                    <ul className="text-sm space-y-1">
                      <li>• Balanced bias-variance</li>
                      <li>• Appropriate complexity</li>
                      <li>• Good training performance</li>
                      <li>• Good test performance</li>
                    </ul>
                    <div className="p-2 bg-green-50 rounded">
                      <p className="text-xs font-semibold">Goal: Optimal balance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-800">Overfitting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-4xl text-center">🤯</div>
                    <ul className="text-sm space-y-1">
                      <li>• Low bias, high variance</li>
                      <li>• Model too complex</li>
                      <li>• Excellent training performance</li>
                      <li>• Poor test performance</li>
                    </ul>
                    <div className="p-2 bg-orange-50 rounded">
                      <p className="text-xs font-semibold">Solution: Regularization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feature-engineering" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Feature Engineering</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Transform raw data into powerful predictive features
              </p>
            </div>
            
            <FeatureEngineeringSimulator />
          </TabsContent>

          <TabsContent value="evaluation" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Evaluation Metrics</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understanding how to measure model performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Regression Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">Mean Squared Error (MSE)</h5>
                    <p className="text-sm text-blue-700 mb-2">Average of squared differences</p>
                    <code className="text-xs bg-white p-2 rounded block">MSE = (1/n) Σ(yᵢ - ŷᵢ)²</code>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800">R² Score</h5>
                    <p className="text-sm text-green-700 mb-2">Proportion of variance explained</p>
                    <code className="text-xs bg-white p-2 rounded block">R² = 1 - SSE/SST</code>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">MAE</h5>
                    <p className="text-sm text-purple-700 mb-2">Mean absolute error</p>
                    <code className="text-xs bg-white p-2 rounded block">MAE = (1/n) Σ|yᵢ - ŷᵢ|</code>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Classification Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                    <h5 className="font-semibold text-red-800">Confusion Matrix</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="bg-green-100 p-2 text-center">TP</div>
                      <div className="bg-red-100 p-2 text-center">FP</div>
                      <div className="bg-orange-100 p-2 text-center">FN</div>
                      <div className="bg-blue-100 p-2 text-center">TN</div>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <h5 className="font-semibold text-yellow-800">F1 Score</h5>
                    <p className="text-sm text-yellow-700 mb-2">Harmonic mean of precision and recall</p>
                    <code className="text-xs bg-white p-2 rounded block">F1 = 2PR/(P+R)</code>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <h5 className="font-semibold text-indigo-800">AUC-ROC</h5>
                    <p className="text-sm text-indigo-700 mb-2">Area under ROC curve</p>
                    <code className="text-xs bg-white p-2 rounded block">Range: 0.5 to 1.0</code>
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