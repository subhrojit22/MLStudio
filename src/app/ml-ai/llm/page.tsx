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
  Brain,
  Target,
  Zap,
  Layers,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Calculator,
  Cpu,
  Image,
  Music,
  FileText,
  Settings,
  Eye,
  Globe
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Transfer Learning Simulator
const TransferLearningSimulator = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [modelSize, setModelSize] = useState([7]) // Billion parameters
  const [fineTuneData, setFineTuneData] = useState([1000]) // Samples
  const [showProgress, setShowProgress] = useState(true)

  const steps = [
    { title: "Pre-trained Model", description: "Large model trained on massive dataset" },
    { title: "Task Adaptation", description: "Add task-specific layers" },
    { title: "Fine-tuning", description: "Train on smaller domain-specific data" },
    { title: "Specialized Model", description: "Ready for specific task" }
  ]

  useEffect(() => {
    if (isTraining && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (isTraining && currentStep >= steps.length) {
      setIsTraining(false)
    }
  }, [isTraining, currentStep])

  const handleStart = () => {
    setCurrentStep(0)
    setIsTraining(true)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsTraining(false)
  }

  const getModelComplexity = () => {
    if (modelSize[0] < 3) return "Small"
    if (modelSize[0] < 7) return "Medium"
    if (modelSize[0] < 13) return "Large"
    return "Huge"
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Transfer Learning & Fine-Tuning
        </CardTitle>
        <CardDescription>
          Adapt pre-trained models to specific tasks with minimal data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleStart} disabled={isTraining} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Transfer Learning
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Model: {modelSize[0]}B params</label>
              <Slider
                value={modelSize}
                onValueChange={setModelSize}
                max={70}
                min={1}
                step={1}
                className="mt-2 w-32"
                disabled={isTraining}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data: {fineTuneData[0]} samples</label>
              <Slider
                value={fineTuneData}
                onValueChange={setFineTuneData}
                max={10000}
                min={100}
                step={100}
                className="mt-2 w-32"
                disabled={isTraining}
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showProgress}
              onChange={(e) => setShowProgress(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Progress</span>
          </label>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{steps[Math.min(currentStep, steps.length - 1)].title}</span>
              <span className="text-sm text-gray-600">
                Step {currentStep + 1}/{steps.length}
              </span>
            </div>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
            <p className="text-sm text-gray-600">{steps[Math.min(currentStep, steps.length - 1)].description}</p>
          </div>
        )}

        {/* Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model Architecture */}
          <div className="space-y-3">
            <h4 className="font-semibold">Model Architecture</h4>
            <div className="space-y-2">
              {/* Pre-trained layers */}
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-800">Pre-trained Layers</span>
                  <Badge variant="secondary">{modelSize[0]}B parameters</Badge>
                </div>
                <div className="space-y-1">
                  {Array.from({ length: Math.min(modelSize[0], 12) }, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-full h-2 bg-blue-200 rounded">
                        <motion.div
                          className="h-2 bg-blue-500 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ delay: i * 0.1 }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">Layer {i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task-specific layers */}
              <div className={`p-3 rounded-lg border-2 ${
                currentStep >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-800">Task Layers</span>
                  <Badge variant="secondary">Adapted</Badge>
                </div>
                <div className="space-y-1">
                  {['Classification', 'Task-specific', 'Output'].map((layer, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-full h-2 rounded ${
                        currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {currentStep > 1 && (
                          <motion.div
                            className="h-2 bg-green-600 rounded"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ delay: 0.5 + i * 0.2 }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{layer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          <div className="space-y-3">
            <h4 className="font-semibold">Training Progress</h4>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pre-training</span>
                  <span className="text-sm text-gray-600">Complete</span>
                </div>
                <Progress value={100} className="h-2" />
                <p className="text-xs text-gray-600">Trained on {modelSize[0] * 1000}B tokens</p>
              </div>

              <div className={`p-3 rounded-lg border ${
                currentStep >= 2 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Fine-tuning</span>
                  <span className="text-sm text-gray-600">
                    {currentStep >= 2 ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <Progress 
                  value={currentStep >= 2 ? (currentStep === 2 ? 50 : 100) : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-gray-600">
                  Training on {fineTuneData[0]} domain-specific samples
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border">
                <h5 className="font-semibold text-sm mb-2">Efficiency Gains</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium">Data Reduction:</span>
                    <div className="text-green-600">99.9% less data</div>
                  </div>
                  <div>
                    <span className="font-medium">Time Savings:</span>
                    <div className="text-green-600">95% faster</div>
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span>
                    <div className="text-green-600">90% lower</div>
                  </div>
                  <div>
                    <span className="font-medium">Performance:</span>
                    <div className="text-blue-600">State-of-the-art</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h5 className="font-semibold text-purple-800 mb-1">LoRA (Low-Rank Adaptation)</h5>
            <p className="text-sm text-purple-700">Freeze base model, train small adapter matrices</p>
            <p className="text-xs text-purple-600 mt-1">Only 0.1% of parameters trainable</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-1">Prompt Tuning</h5>
            <p className="text-sm text-blue-700">Learn soft prompts to guide model behavior</p>
            <p className="text-xs text-blue-600 mt-1">No model weights modified</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
            <h5 className="font-semibold text-green-800 mb-1">Adapter Layers</h5>
            <p className="text-sm text-green-700">Insert small bottleneck layers</p>
            <p className="text-xs text-green-600 mt-1">Modular and composable</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Multimodal Models Simulator
const MultimodalSimulator = () => {
  const [selectedModalities, setSelectedModalities] = useState(['text', 'image'])
  const [isProcessing, setIsProcessing] = useState(false)
  const [fusionStep, setFusionStep] = useState(0)
  const [showEmbeddings, setShowEmbeddings] = useState(true)

  const modalities = [
    { id: 'text', name: 'Text', icon: <FileText className="h-4 w-4" />, color: 'blue' },
    { id: 'image', name: 'Image', icon: <Image className="h-4 w-4" />, color: 'green' },
    { id: 'audio', name: 'Audio', icon: <Music className="h-4 w-4" />, color: 'purple' },
    { id: 'video', name: 'Video', icon: <Eye className="h-4 w-4" />, color: 'orange' }
  ]

  const fusionSteps = [
    { title: "Input Processing", description: "Encode each modality separately" },
    { title: "Feature Extraction", description: "Extract meaningful representations" },
    { title: "Cross-Modal Attention", description: "Model relationships between modalities" },
    { title: "Fusion", description: "Combine multimodal representations" },
    { title: "Output Generation", description: "Produce unified output" }
  ]

  useEffect(() => {
    if (isProcessing && fusionStep < fusionSteps.length) {
      const timer = setTimeout(() => {
        setFusionStep(fusionStep + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isProcessing && fusionStep >= fusionSteps.length) {
      setIsProcessing(false)
    }
  }, [isProcessing, fusionStep])

  const handleProcess = () => {
    setIsProcessing(true)
    setFusionStep(0)
  }

  const handleReset = () => {
    setIsProcessing(false)
    setFusionStep(0)
  }

  const toggleModality = (modalityId: string) => {
    setSelectedModalities(prev => 
      prev.includes(modalityId) 
        ? prev.filter(m => m !== modalityId)
        : [...prev, modalityId]
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Multimodal Models
        </CardTitle>
        <CardDescription>
          Combine and process multiple types of data simultaneously
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleProcess} disabled={isProcessing || selectedModalities.length < 2} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Process Multimodal
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2">
            {modalities.map((modality) => (
              <Button
                key={modality.id}
                variant={selectedModalities.includes(modality.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleModality(modality.id)}
                disabled={isProcessing}
              >
                {modality.icon}
                {modality.name}
              </Button>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showEmbeddings}
              onChange={(e) => setShowEmbeddings(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Embeddings</span>
          </label>
        </div>

        {/* Fusion Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{fusionSteps[Math.min(fusionStep, fusionSteps.length - 1)].title}</span>
              <span className="text-sm text-gray-600">
                Step {fusionStep + 1}/{fusionSteps.length}
              </span>
            </div>
            <Progress value={(fusionStep / (fusionSteps.length - 1)) * 100} className="h-2" />
            <p className="text-sm text-gray-600">{fusionSteps[Math.min(fusionStep, fusionSteps.length - 1)].description}</p>
          </div>
        )}

        {/* Multimodal Architecture */}
        <div className="space-y-4">
          <h4 className="font-semibold">Multimodal Architecture</h4>
          
          {/* Input Modalities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modalities.map((modality) => (
              <div
                key={modality.id}
                className={`p-4 rounded-lg border-2 text-center ${
                  selectedModalities.includes(modality.id)
                    ? `border-${modality.color}-500 bg-${modality.color}-50`
                    : 'border-gray-300 bg-gray-50 opacity-50'
                }`}
              >
                <div className={`mx-auto w-8 h-8 rounded-full bg-${modality.color}-500 flex items-center justify-center text-white mb-2`}>
                  {modality.icon}
                </div>
                <div className="font-semibold text-sm">{modality.name}</div>
                {selectedModalities.includes(modality.id) && (
                  <div className="mt-2">
                    {showEmbeddings && (
                      <div className="flex gap-1 justify-center">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.5})`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fusion Process */}
          <div className="flex items-center justify-center gap-4">
            {/* Encoders */}
            <div className="flex gap-2">
              {selectedModalities.map((modalityId, i) => {
                const modality = modalities.find(m => m.id === modalityId)!
                return (
                  <motion.div
                    key={modalityId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: fusionStep >= 1 ? 1 : 0.8,
                      opacity: fusionStep >= 1 ? 1 : 0.5
                    }}
                    className={`w-16 h-16 rounded-lg border-2 bg-${modality.color}-100 border-${modality.color}-300 flex items-center justify-center`}
                  >
                    <span className="text-xs font-semibold">Encoder</span>
                  </motion.div>
                )
              })}
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Cross-Modal Attention */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: fusionStep >= 2 ? 1 : 0.8,
                opacity: fusionStep >= 2 ? 1 : 0.5
              }}
              className="w-20 h-16 rounded-lg border-2 border-purple-500 bg-purple-100 flex items-center justify-center"
            >
              <span className="text-xs font-semibold">Cross-Modal</span>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Fusion */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: fusionStep >= 3 ? 1 : 0.8,
                opacity: fusionStep >= 3 ? 1 : 0.5
              }}
              className="w-20 h-16 rounded-lg border-2 border-orange-500 bg-orange-100 flex items-center justify-center"
            >
              <span className="text-xs font-semibold">Fusion</span>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Output */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: fusionStep >= 4 ? 1 : 0.8,
                opacity: fusionStep >= 4 ? 1 : 0.5
              }}
              className="w-16 h-16 rounded-lg border-2 border-green-500 bg-green-100 flex items-center justify-center"
            >
              <span className="text-xs font-semibold">Output</span>
            </motion.div>
          </div>
        </div>

        {/* Applications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">Applications</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>VQA:</strong> Visual Question Answering</li>
              <li>• <strong>Image Captioning:</strong> Text from images</li>
              <li>• <strong>Text-to-Speech:</strong> Generate audio from text</li>
              <li>• <strong>Video Understanding:</strong> Analyze video content</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h5 className="font-semibold text-green-800 mb-2">Key Challenges</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Aligning different modalities</li>
              <li>• Handling missing modalities</li>
              <li>• Computational complexity</li>
              <li>• Data availability and quality</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Continuous Learning Simulator
const ContinuousLearningSimulator = () => {
  const [isLearning, setIsLearning] = useState(false)
  const [dataPoints, setDataPoints] = useState(100)
  const [modelAccuracy, setModelAccuracy] = useState(0.7)
  const [conceptDrift, setConceptDrift] = useState(0.1)
  const [learningStrategy, setLearningStrategy] = useState('incremental')

  useEffect(() => {
    if (isLearning) {
      const interval = setInterval(() => {
        // Simulate continuous learning
        setDataPoints(prev => prev + Math.floor(Math.random() * 10))
        
        // Update accuracy based on concept drift
        const driftEffect = Math.random() * conceptDrift
        const learningEffect = Math.random() * 0.05
        setModelAccuracy(prev => Math.min(0.95, Math.max(0.5, prev + learningEffect - driftEffect)))
        
        // Occasionally increase concept drift
        if (Math.random() < 0.1) {
          setConceptDrift(prev => Math.min(0.5, prev + 0.05))
        }
      }, 500)
      return () => clearInterval(interval)
    }
  }, [isLearning, conceptDrift])

  const handleStartLearning = () => {
    setIsLearning(true)
    setDataPoints(100)
    setModelAccuracy(0.7)
    setConceptDrift(0.1)
  }

  const handleStopLearning = () => {
    setIsLearning(false)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Continuous Learning & Deployment
        </CardTitle>
        <CardDescription>
          Models that learn and adapt in real-time environments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleStartLearning} disabled={isLearning} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Learning
          </Button>
          <Button onClick={handleStopLearning} disabled={!isLearning} variant="outline" size="sm">
            <Pause className="mr-2 h-4 w-4" />
            Stop Learning
          </Button>
          <div className="flex gap-2">
            {['incremental', 'online', 'batch'].map((strategy) => (
              <Button
                key={strategy}
                variant={learningStrategy === strategy ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLearningStrategy(strategy)}
                disabled={isLearning}
              >
                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Data Processed</h4>
            <div className="text-2xl font-bold text-blue-600">{dataPoints.toLocaleString()}</div>
            <div className="text-sm text-blue-700">samples</div>
            {isLearning && (
              <div className="mt-2 text-xs text-blue-600">
                Learning in real-time...
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Model Accuracy</h4>
            <div className="text-2xl font-bold text-green-600">{(modelAccuracy * 100).toFixed(1)}%</div>
            <Progress value={modelAccuracy * 100} className="mt-2" />
            <div className="text-xs text-green-600 mt-1">
              {modelAccuracy > 0.8 ? 'Excellent' : modelAccuracy > 0.7 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-2">Concept Drift</h4>
            <div className="text-2xl font-bold text-orange-600">{(conceptDrift * 100).toFixed(1)}%</div>
            <Progress value={conceptDrift * 100} className="mt-2" />
            <div className="text-xs text-orange-600 mt-1">
              {conceptDrift > 0.3 ? 'High drift detected' : 'Stable environment'}
            </div>
          </div>
        </div>

        {/* Learning Architecture */}
        <div className="space-y-4">
          <h4 className="font-semibold">Continuous Learning Architecture</h4>
          <div className="flex items-center justify-center gap-4">
            {/* Data Stream */}
            <motion.div
              animate={isLearning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-lg border-2 border-blue-500 bg-blue-100 flex items-center justify-center"
            >
              <div className="text-center">
                <Globe className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Data Stream</span>
              </div>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Preprocessing */}
            <div className="w-20 h-20 rounded-lg border-2 border-purple-500 bg-purple-100 flex items-center justify-center">
              <div className="text-center">
                <Settings className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Preprocess</span>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Model Update */}
            <motion.div
              animate={isLearning ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-20 h-20 rounded-lg border-2 border-green-500 bg-green-100 flex items-center justify-center"
            >
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Model</span>
              </div>
            </motion.div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Deployment */}
            <div className="w-20 h-20 rounded-lg border-2 border-orange-500 bg-orange-100 flex items-center justify-center">
              <div className="text-center">
                <Cpu className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Deploy</span>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-gray-400" />

            {/* Feedback */}
            <div className="w-20 h-20 rounded-lg border-2 border-red-500 bg-red-100 flex items-center justify-center">
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Feedback</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Strategies */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-3 rounded-lg border-2 ${
            learningStrategy === 'incremental' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Incremental Learning</h5>
            <p className="text-sm">Update model with new batches of data</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Memory efficient</li>
              <li>• Good for periodic updates</li>
              <li>• Simple implementation</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg border-2 ${
            learningStrategy === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Online Learning</h5>
            <p className="text-sm">Update model with each new sample</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Real-time adaptation</li>
              <li>• Immediate feedback</li>
              <li>• High responsiveness</li>
            </ul>
          </div>

          <div className={`p-3 rounded-lg border-2 ${
            learningStrategy === 'batch' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <h5 className="font-semibold mb-1">Batch Learning</h5>
            <p className="text-sm">Accumulate data before updates</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Stable updates</li>
              <li>• Better convergence</li>
              <li>• Computational efficiency</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LLMPage() {
  const [activeTab, setActiveTab] = useState('transfer-learning')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Large Language Models & AI Specializations</h1>
              <p className="text-sm text-gray-600">Cutting-edge AI models and specialized applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transfer-learning">Transfer Learning</TabsTrigger>
            <TabsTrigger value="multimodal">Multimodal</TabsTrigger>
            <TabsTrigger value="continuous">Continuous Learning</TabsTrigger>
            <TabsTrigger value="explainability">Explainability</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer-learning" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Transfer Learning & Efficient Fine-Tuning</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Adapt powerful pre-trained models to specific tasks with minimal resources
              </p>
            </div>
            
            <TransferLearningSimulator />

            {/* PEFT Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Parameter-Efficient Fine-Tuning (PEFT)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Why PEFT?</h5>
                    <p className="text-sm text-purple-700">Fine-tune massive models with limited resources</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Traditional Fine-tuning:</span>
                      <span className="font-semibold">100% params</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LoRA:</span>
                      <span className="font-semibold text-green-600">0.1% params</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AdaLoRA:</span>
                      <span className="font-semibold text-green-600">0.05% params</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prompt Tuning:</span>
                      <span className="font-semibold text-green-600">0.01% params</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Real-World Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <h5 className="font-semibold text-blue-800">Healthcare</h5>
                      <p className="text-sm text-blue-700">Medical Q&A with domain-specific terminology</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <h5 className="font-semibold text-green-800">Finance</h5>
                      <p className="text-sm text-green-700">Financial analysis and report generation</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <h5 className="font-semibold text-orange-800">Legal</h5>
                      <p className="text-sm text-orange-700">Contract analysis and legal document processing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="multimodal" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Multimodal Models</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Process and understand multiple types of data simultaneously
              </p>
            </div>
            
            <MultimodalSimulator />
          </TabsContent>

          <TabsContent value="continuous" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Continuous Learning & Model Deployment</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Models that adapt and improve in real-time production environments
              </p>
            </div>
            
            <ContinuousLearningSimulator />
          </TabsContent>

          <TabsContent value="explainability" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Explainability & Model Interpretability</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understanding how AI models make decisions and building trust
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Feature Attribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">SHAP Values</h5>
                    <p className="text-sm text-blue-700">Shapley Additive Explanations</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>What it shows:</strong> Feature importance for each prediction</p>
                    <p><strong>How it works:</strong> Game theory approach to allocate contributions</p>
                    <p><strong>Benefits:</strong> Model-agnostic, theoretically sound</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Attention Visualization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Attention Maps</h5>
                    <p className="text-sm text-purple-700">Visualize what the model focuses on</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>What it shows:</strong> Model's focus areas in input</p>
                    <p><strong>How it works:</strong> Weight importance of input elements</p>
                    <p><strong>Benefits:</strong> Intuitive visual explanations</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Counterfactual Explanations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800">What-If Scenarios</h5>
                    <p className="text-sm text-green-700">Show minimal changes needed for different outcomes</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>What it shows:</strong> How to change predictions</p>
                    <p><strong>How it works:</strong> Find closest instances with different outcomes</p>
                    <p><strong>Benefits:</strong> Actionable insights for users</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Concept Activation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">TCAP (Testing with Concept Activation)</h5>
                    <p className="text-sm text-orange-700">Test model's understanding of concepts</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>What it shows:</strong> Concept presence in predictions</p>
                    <p><strong>How it works:</strong> Probe model with concept-specific inputs</p>
                    <p><strong>Benefits:</strong> Validate model reasoning</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trust and Transparency */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Building Trust Through Transparency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800 mb-2">Transparency</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Open model architecture</li>
                      <li>• Clear decision processes</li>
                      <li>• Accessible explanations</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2">Accountability</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Traceable decisions</li>
                      <li>• Error identification</li>
                      <li>• Responsibility assignment</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800 mb-2">Fairness</h5>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Bias detection</li>
                      <li>• Equal treatment</li>
                      <li>• Inclusive outcomes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}