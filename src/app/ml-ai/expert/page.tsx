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
  Globe,
  Shield,
  Scale,
  Database,
  Cloud,
  Lock,
  Users,
  Gavel
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Scalability and Big Data ML Simulator
const ScalabilitySimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false)
  const [dataSize, setDataSize] = useState(100) // GB
  const [numNodes, setNumNodes] = useState(4)
  const [processingTime, setProcessingTime] = useState(0)
  const [distributedStrategy, setDistributedStrategy] = useState('data-parallel')

  const strategies = [
    { id: 'data-parallel', name: 'Data Parallel', description: 'Same model, different data batches' },
    { id: 'model-parallel', name: 'Model Parallel', description: 'Different model parts on different nodes' },
    { id: 'pipeline', name: 'Pipeline Parallel', description: 'Stage model across nodes' }
  ]

  useEffect(() => {
    if (isSimulating) {
      const interval = setInterval(() => {
        // Simulate processing time based on strategy and scale
        const baseTime = dataSize / numNodes
        const strategyMultiplier = {
          'data-parallel': 0.8,
          'model-parallel': 1.2,
          'pipeline': 1.0
        }[distributedStrategy]
        
        setProcessingTime(prev => Math.min(100, prev + baseTime * strategyMultiplier))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [isSimulating, dataSize, numNodes, distributedStrategy])

  const handleStart = () => {
    setIsSimulating(true)
    setProcessingTime(0)
  }

  const handleReset = () => {
    setIsSimulating(false)
    setProcessingTime(0)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Scalability and Big Data ML
        </CardTitle>
        <CardDescription>
          Distributed systems and cloud architectures for massive scale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleStart} disabled={isSimulating} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Start Simulation
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Data: {dataSize}GB</label>
              <Slider
                value={dataSize}
                onValueChange={setDataSize}
                max={1000}
                min={10}
                step={10}
                className="mt-2 w-32"
                disabled={isSimulating}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nodes: {numNodes}</label>
              <Slider
                value={numNodes}
                onValueChange={setNumNodes}
                max={16}
                min={1}
                step={1}
                className="mt-2 w-24"
                disabled={isSimulating}
              />
            </div>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="flex gap-2">
          {strategies.map((strategy) => (
            <Button
              key={strategy.id}
              variant={distributedStrategy === strategy.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDistributedStrategy(strategy.id)}
              disabled={isSimulating}
            >
              {strategy.name}
            </Button>
          ))}
        </div>

        {/* Processing Progress */}
        {isSimulating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing Progress</span>
              <span className="text-sm text-gray-600">{processingTime.toFixed(1)}%</span>
            </div>
            <Progress value={processingTime} className="h-2" />
            <p className="text-sm text-gray-600">
              Strategy: {strategies.find(s => s.id === distributedStrategy)?.description}
            </p>
          </div>
        )}

        {/* Distributed Architecture Visualization */}
        <div className="space-y-4">
          <h4 className="font-semibold">Distributed Architecture</h4>
          <div className="flex justify-center">
            <div className="relative">
              {/* Master Node */}
              <div className="w-16 h-16 rounded-lg border-2 border-blue-500 bg-blue-100 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
              
              {/* Worker Nodes */}
              <div className="flex gap-4">
                {Array.from({ length: numNodes }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-12 h-12 rounded-lg border-2 ${
                      isSimulating ? 'border-green-500 bg-green-100' : 'border-gray-300 bg-gray-100'
                    } flex items-center justify-center`}>
                      <Database className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Node {i + 1}</div>
                    {isSimulating && (
                      <div className="w-12 h-1 bg-gray-200 rounded mt-1">
                        <motion.div
                          className="h-1 bg-green-500 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2 }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Connections */}
              <svg className="absolute inset-0 pointer-events-none">
                {Array.from({ length: numNodes }, (_, i) => (
                  <line
                    key={i}
                    x1="32"
                    y1="32"
                    x2={32 + (i * 60)}
                    y2="80"
                    stroke="#6b7280"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-1">Throughput</h5>
            <div className="text-2xl font-bold text-blue-600">
              {(dataSize * numNodes / 10).toFixed(0)} GB/s
            </div>
            <p className="text-xs text-blue-600">Peak performance</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
            <h5 className="font-semibold text-green-800 mb-1">Efficiency</h5>
            <div className="text-2xl font-bold text-green-600">
              {(85 + Math.random() * 10).toFixed(1)}%
            </div>
            <p className="text-xs text-green-600">Resource utilization</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h5 className="font-semibold text-purple-800 mb-1">Latency</h5>
            <div className="text-2xl font-bold text-purple-600">
              {(100 / numNodes).toFixed(0)}ms
            </div>
            <p className="text-xs text-purple-600">Average response time</p>
          </div>
        </div>

        {/* Big Data Technologies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h5 className="font-semibold mb-2">Data Processing Frameworks</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Apache Spark</span>
                <Badge variant="secondary">In-memory</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm">Hadoop MapReduce</span>
                <Badge variant="secondary">Batch</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Dask</span>
                <Badge variant="secondary">Python</Badge>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h5 className="font-semibold mb-2">Cloud Platforms</h5>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm">AWS SageMaker</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Google Vertex AI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Azure ML</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Adversarial Attacks Simulator
const AdversarialSimulator = () => {
  const [isAttacking, setIsAttacking] = useState(false)
  const [attackStrength, setAttackStrength] = useState([0.1])
  const [modelConfidence, setModelConfidence] = useState(0.95)
  const [perturbation, setPerturbation] = useState(0)
  const [attackType, setAttackType] = useState('fgsm')

  const attackTypes = [
    { id: 'fgsm', name: 'FGSM', description: 'Fast Gradient Sign Method' },
    { id: 'pgd', name: 'PGD', description: 'Projected Gradient Descent' },
    { id: 'deepfool', name: 'DeepFool', description: 'Minimal perturbation' }
  ]

  useEffect(() => {
    if (isAttacking) {
      const interval = setInterval(() => {
        // Simulate adversarial attack
        setPerturbation(prev => Math.min(1, prev + attackStrength[0] * 0.1))
        setModelConfidence(prev => Math.max(0.1, prev - attackStrength[0] * 0.05))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isAttacking, attackStrength])

  const handleAttack = () => {
    setIsAttacking(true)
    setPerturbation(0)
    setModelConfidence(0.95)
  }

  const handleReset = () => {
    setIsAttacking(false)
    setPerturbation(0)
    setModelConfidence(0.95)
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Model Robustness and Adversarial Attacks
        </CardTitle>
        <CardDescription>
          Understand how small input changes can fool models and build defenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleAttack} disabled={isAttacking} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Launch Attack
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2">
            {attackTypes.map((attack) => (
              <Button
                key={attack.id}
                variant={attackType === attack.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAttackType(attack.id)}
                disabled={isAttacking}
              >
                {attack.name}
              </Button>
            ))}
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Attack Strength: {attackStrength[0].toFixed(2)}</label>
            <Slider
              value={attackStrength}
              onValueChange={setAttackStrength}
              max={0.5}
              min={0.01}
              step={0.01}
              className="mt-2"
              disabled={isAttacking}
            />
          </div>
        </div>

        {/* Attack Progress */}
        {isAttacking && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Attack Progress</span>
              <span className="text-sm text-gray-600">{(perturbation * 100).toFixed(1)}%</span>
            </div>
            <Progress value={perturbation * 100} className="h-2" />
            <p className="text-sm text-gray-600">
              Method: {attackTypes.find(a => a.id === attackType)?.description}
            </p>
          </div>
        )}

        {/* Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original vs Adversarial */}
          <div className="space-y-3">
            <h4 className="font-semibold">Input Perturbation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-gray-300 mx-auto mb-2 flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium">Original</p>
                <p className="text-xs text-gray-600">Clean input</p>
              </div>
              <div className="text-center">
                <div className={`w-24 h-24 rounded-lg border-2 mx-auto mb-2 flex items-center justify-center ${
                  perturbation > 0.5 ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'
                }`}>
                  <Image className="w-8 h-8 text-orange-600" />
                  {perturbation > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs font-bold text-red-600">
                        +{(perturbation * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium">Adversarial</p>
                <p className="text-xs text-gray-600">
                  Perturbed by {(perturbation * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Model Confidence */}
          <div className="space-y-3">
            <h4 className="font-semibold">Model Confidence</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Original Prediction</span>
                  <span className="text-sm font-medium">95.0%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Adversarial Prediction</span>
                  <span className={`text-sm font-medium ${
                    modelConfidence < 0.5 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {(modelConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={modelConfidence * 100} 
                  className="h-2"
                />
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Attack Success!</strong> Model confidence dropped by {(95 - modelConfidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Defense Mechanisms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-1">Adversarial Training</h5>
            <p className="text-sm text-blue-700">Include adversarial examples in training data</p>
            <p className="text-xs text-blue-600 mt-1">Most effective defense</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
            <h5 className="font-semibold text-green-800 mb-1">Input Preprocessing</h5>
            <p className="text-sm text-green-700">Randomization, smoothing, compression</p>
            <p className="text-xs text-green-600 mt-1">Easy to implement</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h5 className="font-semibold text-purple-800 mb-1">Defensive Distillation</h5>
            <p className="text-sm text-purple-700">Train model to resist perturbations</p>
            <p className="text-xs text-purple-600 mt-1">Model-based defense</p>
          </div>
        </div>

        {/* Real-World Impact */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-2">Real-World Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Vulnerable Systems</h5>
              <ul className="text-sm space-y-1">
                <li>• Autonomous vehicles (traffic signs)</li>
                <li>• Medical imaging (X-rays, MRIs)</li>
                <li>• Face recognition systems</li>
                <li>• Voice assistants</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">Consequences</h5>
              <ul className="text-sm space-y-1">
                <li>• Safety risks in critical systems</li>
                <li>• Privacy violations</li>
                <li>• Financial fraud</li>
                <li>• Security breaches</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Ethical AI Simulator
const EthicalAISimulator = () => {
  const [selectedPrinciples, setSelectedPrinciples] = useState(['fairness', 'transparency'])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationScore, setEvaluationScore] = useState(0)
  const [currentPrinciple, setCurrentPrinciple] = useState(0)

  const principles = [
    { 
      id: 'fairness', 
      name: 'Fairness', 
      icon: <Users className="h-4 w-4" />,
      description: 'Ensure equitable treatment across demographic groups',
      metrics: ['Demographic parity', 'Equal opportunity', 'Equalized odds']
    },
    { 
      id: 'transparency', 
      name: 'Transparency', 
      icon: <Eye className="h-4 w-4" />,
      description: 'Make AI decisions understandable and explainable',
      metrics: ['Model interpretability', 'Feature importance', 'Decision rationale']
    },
    { 
      id: 'accountability', 
      name: 'Accountability', 
      icon: <Gavel className="h-4 w-4" />,
      description: 'Establish clear responsibility for AI outcomes',
      metrics: ['Audit trails', 'Error reporting', 'Human oversight']
    },
    { 
      id: 'privacy', 
      name: 'Privacy', 
      icon: <Lock className="h-4 w-4" />,
      description: 'Protect personal data and user privacy',
      metrics: ['Data encryption', 'Anonymization', 'Consent management']
    },
    { 
      id: 'safety', 
      name: 'Safety', 
      icon: <Shield className="h-4 w-4" />,
      description: 'Prevent harm and ensure reliable operation',
      metrics: ['Risk assessment', 'Fail-safes', 'Human control']
    }
  ]

  useEffect(() => {
    if (isEvaluating && currentPrinciple < selectedPrinciples.length) {
      const timer = setTimeout(() => {
        setEvaluationScore(prev => prev + (80 + Math.random() * 20) / selectedPrinciples.length)
        setCurrentPrinciple(currentPrinciple + 1)
      }, 1500)
      return () => clearTimeout(timer)
    } else if (isEvaluating && currentPrinciple >= selectedPrinciples.length) {
      setIsEvaluating(false)
    }
  }, [isEvaluating, currentPrinciple, selectedPrinciples.length])

  const handleEvaluate = () => {
    setIsEvaluating(true)
    setCurrentPrinciple(0)
    setEvaluationScore(0)
  }

  const handleReset = () => {
    setIsEvaluating(false)
    setCurrentPrinciple(0)
    setEvaluationScore(0)
  }

  const togglePrinciple = (principleId: string) => {
    setSelectedPrinciples(prev => 
      prev.includes(principleId) 
        ? prev.filter(p => p !== principleId)
        : [...prev, principleId]
    )
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Regulatory, Ethical, and Societal Impacts
        </CardTitle>
        <CardDescription>
          Navigate the complex landscape of AI ethics and responsible development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button onClick={handleEvaluate} disabled={isEvaluating || selectedPrinciples.length === 0} size="sm">
            <Play className="mr-2 h-4 w-4" />
            Evaluate Ethics
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Principle Selection */}
        <div className="space-y-3">
          <h4 className="font-semibold">Select Ethical Principles to Evaluate</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {principles.map((principle) => (
              <div
                key={principle.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPrinciples.includes(principle.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}
                onClick={() => togglePrinciple(principle.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {principle.icon}
                  <span className="font-medium text-sm">{principle.name}</span>
                </div>
                <p className="text-xs text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Progress */}
        {isEvaluating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Evaluating: {principles.find(p => p.id === selectedPrinciples[currentPrinciple])?.name}
              </span>
              <span className="text-sm text-gray-600">
                {currentPrinciple + 1}/{selectedPrinciples.length}
              </span>
            </div>
            <Progress value={(currentPrinciple / selectedPrinciples.length) * 100} className="h-2" />
          </div>
        )}

        {/* Overall Score */}
        {evaluationScore > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Overall Ethical Score</h4>
              <span className={`text-lg font-bold ${
                evaluationScore >= 80 ? 'text-green-600' : 
                evaluationScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {evaluationScore.toFixed(1)}/100
              </span>
            </div>
            <Progress value={evaluationScore} className="h-3" />
            <p className="text-sm text-gray-600 mt-1">
              {evaluationScore >= 80 ? 'Excellent ethical standards' :
               evaluationScore >= 60 ? 'Good ethical practices' :
               'Needs improvement in ethical considerations'}
            </p>
          </div>
        )}

        {/* Regulatory Frameworks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Global AI Regulations</h4>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-1">EU AI Act</h5>
                <p className="text-sm text-blue-700">Risk-based classification system</p>
                <div className="text-xs text-blue-600 mt-1">
                  Prohibited: Social scoring, real-time biometrics
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                <h5 className="font-semibold text-green-800 mb-1">US AI Bill of Rights</h5>
                <p className="text-sm text-green-700">Consumer protection principles</p>
                <div className="text-xs text-green-600 mt-1">
                  Focus: Safety, privacy, notice, explanation, alternatives
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                <h5 className="font-semibold text-purple-800 mb-1">China AI Governance</h5>
                <p className="text-sm text-purple-700">Comprehensive regulatory framework</p>
                <div className="text-xs text-purple-600 mt-1">
                  Algorithm registration, data security requirements
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Industry Standards</h4>
            <div className="space-y-2">
              <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                <h5 className="font-semibold text-orange-800 mb-1">IEEE P7000</h5>
                <p className="text-sm text-orange-700">Standard for Algorithmic Bias</p>
                <div className="text-xs text-orange-600 mt-1">
                  Governance, risk management, transparency
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-2 border-red-200">
                <h5 className="font-semibold text-red-800 mb-1">NIST AI RMF</h5>
                <p className="text-sm text-red-700">AI Risk Management Framework</p>
                <div className="text-xs text-red-600 mt-1">
                  Govern, map, measure, manage
                </div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <h5 className="font-semibold text-indigo-800 mb-1">ISO/IEC 23894</h5>
                <p className="text-sm text-indigo-700">AI System Lifecycle Process</p>
                <div className="text-xs text-indigo-600 mt-1">
                  Development, deployment, operation, maintenance
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Checklist */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold mb-3">Responsible AI Implementation Checklist</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-sm mb-2">Before Development</h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Conduct impact assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Engage stakeholders</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Define ethical requirements</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">During Development</h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Regular bias audits</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Transparency features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Human oversight mechanisms</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">After Deployment</h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Continuous monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Incident response plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Regular ethical reviews</span>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-sm mb-2">Ongoing Governance</h5>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Ethics committee oversight</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Public reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Community engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExpertPage() {
  const [activeTab, setActiveTab] = useState('scalability')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expert Topics and Current Challenges</h1>
              <p className="text-sm text-gray-600">Advanced concepts and real-world AI challenges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scalability">Scalability</TabsTrigger>
            <TabsTrigger value="adversarial">Adversarial</TabsTrigger>
            <TabsTrigger value="ethics">Ethics & Society</TabsTrigger>
          </TabsList>

          <TabsContent value="scalability" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Scalability and Big Data ML</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Distributed systems and cloud architectures for massive scale machine learning
              </p>
            </div>
            
            <ScalabilitySimulator />
          </TabsContent>

          <TabsContent value="adversarial" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Model Robustness and Adversarial Attacks</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Understanding vulnerabilities and building defenses against adversarial examples
              </p>
            </div>
            
            <AdversarialSimulator />
          </TabsContent>

          <TabsContent value="ethics" className="space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Regulatory, Ethical, and Societal Impacts</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Navigate the complex landscape of AI ethics and responsible development
              </p>
            </div>
            
            <EthicalAISimulator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}