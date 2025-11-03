'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import BackButton from "@/components/BackButton"
import { 
  ArrowRight, 
  RefreshCw, 
  Play, 
  Eye,
  Brain,
  Grid3x3,
  Calculator,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Info
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Matrix {
  name: string
  data: number[][]
  rows: number
  cols: number
}

interface AttentionStep {
  step: string
  description: string
  result?: number[][]
  highlighted?: { row: number; col: number }[]
}

interface QA {
  question: string
  answer: string
  type: 'why' | 'what' | 'how'
}

interface SectionQA {
  [key: string]: QA[]
}

const qaData: SectionQA = {
  'overview': [
    {
      question: "Why do we need attention mechanisms?",
      answer: "Traditional neural networks struggle with long sequences because they compress all information into a fixed-size vector. Attention mechanisms allow models to focus on relevant parts of the input when producing each part of the output, solving the information bottleneck problem.",
      type: 'why'
    },
    {
      question: "What is attention in neural networks?",
      answer: "Attention is a mechanism that allows neural networks to weigh the importance of different input elements when processing information. It mimics human cognitive attention by focusing on relevant parts while ignoring irrelevant information.",
      type: 'what'
    },
    {
      question: "How does attention work in transformers?",
      answer: "Attention in transformers works by computing three matrices (Query, Key, Value) for each input position. The Query represents what we're looking for, Key represents what's available, and Value represents the actual information. The mechanism computes similarity between Query and Key to determine attention weights, then uses these weights to create a weighted sum of Values.",
      type: 'how'
    }
  ],
  'query': [
    {
      question: "Why do we need Query matrices?",
      answer: "Query matrices represent the current context or what the model is 'looking for' at each position. They allow the model to ask questions about the input and find relevant information from other positions.",
      type: 'why'
    },
    {
      question: "What does the Query matrix contain?",
      answer: "The Query matrix contains learned representations that help identify what information is needed for the current task. Each row in Q corresponds to a query vector for a specific position in the sequence.",
      type: 'what'
    },
    {
      question: "How are Query matrices created?",
      answer: "Query matrices are created by multiplying the input embeddings by a learned weight matrix Wq. During training, the model learns to transform input embeddings into effective query representations that help find relevant information.",
      type: 'how'
    }
  ],
  'key': [
    {
      question: "Why do we need Key matrices?",
      answer: "Key matrices provide 'labels' or 'addresses' for each position in the sequence. They allow the model to match queries with the most relevant positions, enabling selective information retrieval.",
      type: 'why'
    },
    {
      question: "What does the Key matrix represent?",
      answer: "The Key matrix contains representations that describe what each position in the sequence 'offers' or contains. Each row in K acts as a key that can be matched against queries.",
      type: 'what'
    },
    {
      question: "How do Keys work with Queries?",
      answer: "Keys work by computing dot products with Queries. The dot product measures similarity - higher values indicate better matches between what we're looking for (Query) and what's available (Key). This creates the attention score matrix.",
      type: 'how'
    }
  ],
  'value': [
    {
      question: "Why do we need Value matrices?",
      answer: "Value matrices contain the actual information that will be communicated between positions. While Keys determine where to look, Values determine what information to retrieve from those positions.",
      type: 'why'
    },
    {
      question: "What does the Value matrix contain?",
      answer: "The Value matrix contains the meaningful content or features that will be passed to other positions. Each row in V represents the information that can be extracted from that position.",
      type: 'what'
    },
    {
      question: "How are Values used in attention?",
      answer: "Values are combined using the attention weights. After computing attention weights from Q×K^T, these weights are used to create a weighted sum of Value vectors, producing the final output that contains relevant information from all positions.",
      type: 'how'
    }
  ],
  'scores': [
    {
      question: "Why do we compute attention scores?",
      answer: "Attention scores quantify the relevance between different positions in the sequence. They determine how much attention each position should pay to every other position, enabling selective information flow.",
      type: 'why'
    },
    {
      question: "What are attention scores?",
      answer: "Attention scores are raw similarity values between Query and Key vectors. They represent how well each query matches each key before normalization. Higher scores indicate stronger relationships.",
      type: 'what'
    },
    {
      question: "How are scores calculated and used?",
      answer: "Scores are calculated by multiplying Q with the transpose of K (Q×K^T). This creates a matrix where each element (i,j) represents the similarity between position i's query and position j's key. These scores are then scaled and normalized to create attention weights.",
      type: 'how'
    }
  ],
  'scaling': [
    {
      question: "Why do we need to scale the scores?",
      answer: "Scaling prevents the softmax function from producing extremely small gradients. As the dimensionality increases, dot products grow larger, leading to saturated softmax outputs. Scaling by √dk keeps the variance stable.",
      type: 'why'
    },
    {
      question: "What is the scaling factor?",
      answer: "The scaling factor is the square root of the embedding dimension (√dk). For example, if the embedding dimension is 4, the scaling factor is 2. This ensures the variance of attention scores remains constant regardless of dimensionality.",
      type: 'what'
    },
    {
      question: "How does scaling affect training?",
      answer: "Scaling improves gradient flow during training. Without scaling, large dot products would push softmax into regions with very small gradients, making learning difficult. Scaling keeps the attention scores in a range where softmax provides meaningful gradients.",
      type: 'how'
    }
  ],
  'softmax': [
    {
      question: "Why do we apply softmax to attention scores?",
      answer: "Softmax converts raw scores into probabilities that sum to 1. This normalization ensures that attention weights represent a proper distribution, allowing the model to allocate attention proportionally across all positions.",
      type: 'why'
    },
    {
      question: "What does softmax do to the scores?",
      answer: "Softmax exponentiates each score and divides by the sum of all exponentiated scores. This produces values between 0 and 1 that sum to 1, representing the probability distribution of attention across positions.",
      type: 'what'
    },
    {
      question: "How is softmax computed for attention?",
      answer: "Softmax is applied row-wise to the scaled score matrix. For each row, it computes exp(score) / sum(exp(all_scores_in_row)). This ensures each position's attention distribution is independent and properly normalized.",
      type: 'how'
    }
  ],
  'output': [
    {
      question: "Why do we multiply attention weights by Values?",
      answer: "This multiplication creates the final output by combining information from all positions according to their relevance. It allows each position to receive a weighted mixture of information from the entire sequence.",
      type: 'why'
    },
    {
      question: "What does the final output represent?",
      answer: "The final output represents a context-aware representation for each position. It contains information from all positions in the sequence, weighted by their relevance to the current position's query.",
      type: 'what'
    },
    {
      question: "How is the output computed?",
      answer: "The output is computed by matrix multiplication of attention weights (from softmax) with the Value matrix. Each output position is a weighted sum of all Value vectors, where weights come from the corresponding row of attention weights.",
      type: 'how'
    }
  ],
  'multihead': [
    {
      question: "Why do we need multi-head attention?",
      answer: "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. This enables the model to capture various types of relationships simultaneously - some heads might focus on syntactic patterns, others on semantic relationships, others on positional dependencies.",
      type: 'why'
    },
    {
      question: "What is multi-head attention?",
      answer: "Multi-head attention is an extension of attention that runs multiple attention mechanisms in parallel. Each 'head' has its own Q, K, V projections and computes attention independently. The outputs are then concatenated and linearly transformed to produce the final result.",
      type: 'what'
    },
    {
      question: "How does multi-head attention work?",
      answer: "Multi-head attention works by: 1) Projecting input embeddings into multiple Q, K, V sets (one per head), 2) Computing attention independently for each head, 3) Concatenating all head outputs, 4) Applying a final linear projection. This allows different heads to learn different types of attention patterns.",
      type: 'how'
    }
  ]
}

export default function AttentionPlayground() {
  const [sequenceLength, setSequenceLength] = useState(3)
  const [embeddingDim, setEmbeddingDim] = useState(4)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCalculations, setShowCalculations] = useState(false)
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('simulator')
  const [numHeads, setNumHeads] = useState(3)
  const [selectedHead, setSelectedHead] = useState(0)
  const [showMultiHead, setShowMultiHead] = useState(false)

  // Sample matrices for demonstration
  const [Q, setQ] = useState<number[][]>([
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0]
  ])

  const [K, setK] = useState<number[][]>([
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [1, 1, 0, 0]
  ])

  const [V, setV] = useState<number[][]>([
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6]
  ])

  // Multi-head attention matrices
  const [multiHeadQ, setMultiHeadQ] = useState<number[][][]>(
    Array.from({ length: numHeads }, () => Q)
  )
  const [multiHeadK, setMultiHeadK] = useState<number[][][]>(
    Array.from({ length: numHeads }, () => K)
  )
  const [multiHeadV, setMultiHeadV] = useState<number[][][]>(
    Array.from({ length: numHeads }, () => V)
  )

  const [attentionWeights, setAttentionWeights] = useState<number[][]>([])
  const [output, setOutput] = useState<number[][]>([])
  const [steps, setSteps] = useState<AttentionStep[]>([])

  // Matrix multiplication
  const matrixMultiply = (A: number[][], B: number[][]): number[][] => {
    const result: number[][] = []
    for (let i = 0; i < A.length; i++) {
      result[i] = []
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0
        for (let k = 0; k < B.length; k++) {
          sum += A[i][k] * B[k][j]
        }
        result[i][j] = Math.round(sum * 100) / 100
      }
    }
    return result
  }

  // Transpose matrix
  const transpose = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]))
  }

  // Softmax function
  const softmax = (arr: number[]): number[] => {
    const maxVal = Math.max(...arr)
    const expArr = arr.map(x => Math.exp(x - maxVal))
    const sumExp = expArr.reduce((a, b) => a + b, 0)
    return expArr.map(x => Math.round((x / sumExp) * 100) / 100)
  }

  // Calculate attention
  const calculateAttention = () => {
    const newSteps: AttentionStep[] = []

    // Step 1: Q × K^T
    newSteps.push({
      step: "1. Q × K^T",
      description: "Multiply Query matrix with transposed Key matrix"
    })

    const KTranspose = transpose(K)
    const scores = matrixMultiply(Q, KTranspose)
    
    newSteps.push({
      step: "1. Q × K^T = Scores",
      description: "Raw attention scores before scaling",
      result: scores
    })

    // Step 2: Scale by √dk
    const scale = Math.sqrt(embeddingDim)
    const scaledScores = scores.map(row => 
      row.map(val => Math.round((val / scale) * 100) / 100)
    )

    newSteps.push({
      step: "2. Scale by √dk",
      description: `Divide scores by √${embeddingDim} = ${scale.toFixed(2)}`,
      result: scaledScores
    })

    // Step 3: Apply softmax
    const attentionWeights = scaledScores.map(row => softmax(row))

    newSteps.push({
      step: "3. Apply Softmax",
      description: "Convert scores to probabilities using softmax",
      result: attentionWeights
    })

    // Step 4: Multiply by V
    const finalOutput = matrixMultiply(attentionWeights, V)

    newSteps.push({
      step: "4. × V = Output",
      description: "Multiply attention weights by Value matrix",
      result: finalOutput
    })

    setSteps(newSteps)
    setAttentionWeights(attentionWeights)
    setOutput(finalOutput)
  }

  useEffect(() => {
    calculateAttention()
  }, [Q, K, V, embeddingDim])

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length])

  const handlePlay = () => {
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const randomizeMatrix = (matrixName: 'Q' | 'K' | 'V') => {
    const newMatrix = Array.from({ length: sequenceLength }, () =>
      Array.from({ length: embeddingDim }, () => Math.floor(Math.random() * 3))
    )
    
    if (matrixName === 'Q') setQ(newMatrix)
    else if (matrixName === 'K') setK(newMatrix)
    else if (matrixName === 'V') setV(newMatrix)
  }

  const toggleQA = (qaKey: string) => {
    setExpandedQA(prev => {
      const newSet = new Set(prev)
      if (newSet.has(qaKey)) {
        newSet.delete(qaKey)
      } else {
        newSet.add(qaKey)
      }
      return newSet
    })
  }

  const getQAIcon = (type: 'why' | 'what' | 'how') => {
    switch (type) {
      case 'why': return <Target className="h-4 w-4" />
      case 'what': return <Info className="h-4 w-4" />
      case 'how': return <Lightbulb className="h-4 w-4" />
    }
  }

  const getQAColor = (type: 'why' | 'what' | 'how') => {
    switch (type) {
      case 'why': return 'text-blue-600'
      case 'what': return 'text-green-600'
      case 'how': return 'text-purple-600'
    }
  }

  // Self-Attention Matrix Component
  const SelfAttentionMatrix = () => {
    const [selfAttentionWeights, setSelfAttentionWeights] = useState<number[][]>([
      [0.8, 0.1, 0.1],
      [0.2, 0.6, 0.2],
      [0.1, 0.1, 0.8]
    ])

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Self-Attention Weights</h4>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${selfAttentionWeights[0].length}, minmax(0, 1fr))` }}>
          {selfAttentionWeights.map((row, i) =>
            row.map((val, j) => (
              <motion.div
                key={`self-${i}-${j}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (i * row.length + j) * 0.1 }}
                className="aspect-square flex items-center justify-center text-xs font-mono rounded bg-blue-100 text-blue-800"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${val})`,
                  color: val > 0.5 ? 'white' : 'black'
                }}
              >
                {val.toFixed(1)}
              </motion.div>
            ))
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Diagonal dominance shows self-attention pattern
        </div>
      </div>
    )
  }

  // Cross-Attention Matrix Component
  const CrossAttentionMatrix = () => {
    const [crossAttentionWeights, setCrossAttentionWeights] = useState<number[][]>([
      [0.7, 0.2, 0.1, 0.0],
      [0.1, 0.6, 0.2, 0.1],
      [0.0, 0.1, 0.7, 0.2],
      [0.2, 0.1, 0.0, 0.7],
      [0.0, 0.0, 0.1, 0.9]
    ])

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Cross-Attention Weights</h4>
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${crossAttentionWeights[0].length}, minmax(0, 1fr))` }}>
          {crossAttentionWeights.map((row, i) =>
            row.map((val, j) => (
              <motion.div
                key={`cross-${i}-${j}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (i * row.length + j) * 0.1 }}
                className="aspect-square flex items-center justify-center text-xs font-mono rounded bg-green-100 text-green-800"
                style={{
                  backgroundColor: `rgba(34, 197, 94, ${val})`,
                  color: val > 0.5 ? 'white' : 'black'
                }}
              >
                {val.toFixed(1)}
              </motion.div>
            ))
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Shows alignment between source and target sequences
        </div>
      </div>
    )
  }

  // Weight Distribution Animation Component
  const WeightDistributionAnimation = () => {
    const [animationStep, setAnimationStep] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [weightHistory, setWeightHistory] = useState<number[][][]>([
      [[0.8, 0.1, 0.1], [0.2, 0.6, 0.2], [0.1, 0.1, 0.8]],
      [[0.6, 0.3, 0.1], [0.3, 0.5, 0.2], [0.2, 0.2, 0.6]],
      [[0.4, 0.4, 0.2], [0.4, 0.3, 0.3], [0.3, 0.3, 0.4]],
      [[0.3, 0.4, 0.3], [0.4, 0.3, 0.3], [0.3, 0.3, 0.4]]
    ])

    useEffect(() => {
      if (isAnimating && animationStep < weightHistory.length - 1) {
        const timer = setTimeout(() => {
          setAnimationStep(animationStep + 1)
        }, 1500)
        return () => clearTimeout(timer)
      } else if (isAnimating && animationStep >= weightHistory.length - 1) {
        setIsAnimating(false)
      }
    }, [isAnimating, animationStep, weightHistory.length])

    const startAnimation = () => {
      setAnimationStep(0)
      setIsAnimating(true)
    }

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Attention Weight Evolution</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={startAnimation}
              disabled={isAnimating}
            >
              <Play className="mr-2 h-4 w-4" />
              {isAnimating ? 'Animating...' : 'Animate'}
            </Button>
          </div>
          <CardDescription>
            Watch how attention patterns change through processing steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Step: {animationStep + 1}/{weightHistory.length}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((animationStep + 1) / weightHistory.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weightHistory.map((weights, stepIndex) => (
              <Card key={stepIndex} className={`border-2 transition-all duration-300 ${stepIndex === animationStep ? 'border-primary shadow-lg' : 'border-muted hover:border-primary/50 hover:shadow-md'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Step {stepIndex + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weights[0].length}, minmax(0, 1fr))` }}>
                    {weights.map((row, i) =>
                      row.map((val, j) => (
                        <motion.div
                          key={`step-${stepIndex}-${i}-${j}`}
                          initial={{ scale: 0.8 }}
                          animate={{ 
                            scale: stepIndex === animationStep ? 1.1 : 1,
                            opacity: stepIndex <= animationStep ? 1 : 0.3
                          }}
                          transition={{ delay: (i * row.length + j) * 0.05 }}
                          className="aspect-square flex items-center justify-center text-xs font-mono rounded"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${val})`,
                            color: val > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {val.toFixed(1)}
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Observation:</strong> Attention weights become more distributed across steps, showing how the model learns to consider multiple contexts.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Layer-wise Attention Component
  const LayerwiseAttention = () => {
    const [selectedLayer, setSelectedLayer] = useState(0)
    const numLayers = 4
    
    const layerPatterns = [
      // Layer 1: Local attention
      [[0.9, 0.1, 0.0], [0.1, 0.8, 0.1], [0.0, 0.1, 0.9]],
      // Layer 2: Semi-local
      [[0.7, 0.2, 0.1], [0.2, 0.6, 0.2], [0.1, 0.2, 0.7]],
      // Layer 3: Global patterns
      [[0.5, 0.3, 0.2], [0.3, 0.4, 0.3], [0.2, 0.3, 0.5]],
      // Layer 4: Complex relationships
      [[0.4, 0.3, 0.3], [0.3, 0.3, 0.4], [0.3, 0.4, 0.3]]
    ]

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-lg">Layer-wise Attention Evolution</CardTitle>
          <CardDescription>
            Explore how attention patterns evolve across transformer layers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Select Layer:</span>
            <div className="flex gap-2">
              {Array.from({ length: numLayers }, (_, i) => (
                <Button
                  key={i}
                  variant={selectedLayer === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLayer(i)}
                >
                  Layer {i + 1}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Layer {selectedLayer + 1} Attention Pattern</h4>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${layerPatterns[selectedLayer][0].length}, minmax(0, 1fr))` }}>
                {layerPatterns[selectedLayer].map((row, i) =>
                  row.map((val, j) => (
                    <motion.div
                      key={`layer-${selectedLayer}-${i}-${j}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (i * row.length + j) * 0.05 }}
                      className="aspect-square flex items-center justify-center text-xs font-mono rounded"
                      style={{
                        backgroundColor: `rgba(168, 85, 247, ${val})`,
                        color: val > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {val.toFixed(1)}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Layer Characteristics</h4>
              <div className="text-sm space-y-2">
                <div className="p-3 bg-purple-50 rounded">
                  <p className="font-semibold text-purple-800">Layer {selectedLayer + 1} Focus:</p>
                  <p className="text-purple-700">
                    {selectedLayer === 0 ? 'Local patterns and immediate neighbors' :
                     selectedLayer === 1 ? 'Short-range dependencies' :
                     selectedLayer === 2 ? 'Global relationships and context' :
                     'Abstract and complex relationships'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-semibold">Pattern Type:</p>
                  <p>
                    {selectedLayer === 0 ? 'Diagonal (self-focused)' :
                     selectedLayer === 1 ? 'Semi-diagonal' :
                     selectedLayer === 2 ? 'Distributed' :
                     'Uniform (complex)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Key Insight:</strong> Lower layers focus on local syntax while higher layers capture semantic relationships and abstract patterns.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Token Influence Graphs Component
  const TokenInfluenceGraphs = () => {
    const [selectedToken, setSelectedToken] = useState(1)
    const tokens = ["The", "cat", "sat", "on", "mat"]
    
    const influenceData = [
      [0.8, 0.1, 0.0, 0.0, 0.1], // The
      [0.2, 0.7, 0.3, 0.1, 0.2], // cat
      [0.1, 0.2, 0.8, 0.3, 0.1], // sat
      [0.0, 0.1, 0.2, 0.7, 0.4], // on
      [0.1, 0.1, 0.0, 0.2, 0.8]  // mat
    ]

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-lg">Token Influence Graphs</CardTitle>
          <CardDescription>
            Visualize which tokens exert the most influence on each other
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Select Target Token:</span>
            <div className="flex gap-2">
              {tokens.map((token, i) => (
                <Button
                  key={i}
                  variant={selectedToken === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedToken(i)}
                >
                  {token}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Influence Graph */}
            <div className="space-y-3">
              <h4 className="font-semibold">Influence Network for "{tokens[selectedToken]}"</h4>
              <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                {/* Nodes */}
                {tokens.map((token, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xs font-semibold ${
                      i === selectedToken ? 'bg-blue-500 text-white' : 'bg-gray-300'
                    }`}
                    style={{
                      left: `${20 + (i % 3) * 30}%`,
                      top: `${20 + Math.floor(i / 3) * 40}%`
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {token}
                  </motion.div>
                ))}
                
                {/* Influence arrows */}
                {tokens.map((_, sourceIdx) => (
                  <motion.div
                    key={`arrow-${sourceIdx}`}
                    className="absolute bg-blue-400"
                    style={{
                      width: `${influenceData[selectedToken][sourceIdx] * 60}px`,
                      height: '2px',
                      left: `${20 + (sourceIdx % 3) * 30 + 12}%`,
                      top: `${20 + Math.floor(sourceIdx / 3) * 40 + 24}px`,
                      transformOrigin: 'left center',
                      transform: `rotate(${Math.atan2(
                        (20 + Math.floor(selectedToken / 3) * 40 + 24) - (20 + Math.floor(sourceIdx / 3) * 40 + 24),
                        (20 + (selectedToken % 3) * 30 + 12) - (20 + (sourceIdx % 3) * 30 + 12)
                      ) * 180 / Math.PI}deg)`
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: sourceIdx * 0.1 }}
                  />
                ))}
              </div>
            </div>

            {/* Influence Values */}
            <div className="space-y-3">
              <h4 className="font-semibold">Influence Scores</h4>
              <div className="space-y-2">
                {tokens.map((token, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-12">{token}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <motion.div
                        className="bg-blue-600 h-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${influenceData[selectedToken][i] * 100}%` }}
                        transition={{ delay: i * 0.1 }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right">
                      {(influenceData[selectedToken][i] * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Analysis:</strong> "{tokens[selectedToken]}" receives most influence from itself ({(influenceData[selectedToken][selectedToken] * 100).toFixed(0)}%) and significant input from neighboring tokens.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Causal Attention & Masking Component
  const CausalAttentionMasking = () => {
    const [sequenceLength, setSequenceLength] = useState(5)
    const [showMask, setShowMask] = useState(true)
    const [currentPosition, setCurrentPosition] = useState(2)
    const [attentionPattern, setAttentionPattern] = useState<number[][]>([])

    // Generate causal attention pattern
    useEffect(() => {
      const pattern = Array.from({ length: sequenceLength }, (_, i) =>
        Array.from({ length: sequenceLength }, (_, j) => {
          if (showMask && j > i) {
            return 0 // Masked position
          }
          // Simulate realistic attention weights
          if (i === j) return 0.7 // Self-attention
          if (j === i - 1) return 0.2 // Previous token
          if (j === i - 2) return 0.1 // Two tokens back
          return 0.05
        })
      )
      setAttentionPattern(pattern)
    }, [sequenceLength, showMask])

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Causal Attention & Masking Explorer
          </CardTitle>
          <CardDescription>
            Understand how autoregressive models use causal masks to prevent future token peeking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Sequence Length: {sequenceLength}</label>
              <Slider
                value={[sequenceLength]}
                onValueChange={(value) => setSequenceLength(value[0])}
                max={8}
                min={3}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Current Position: {currentPosition}</label>
              <Slider
                value={[currentPosition]}
                onValueChange={(value) => setCurrentPosition(value[0])}
                max={sequenceLength - 1}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="causal-mask"
                checked={showMask}
                onChange={(e) => setShowMask(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="causal-mask" className="text-sm">Enable Causal Mask</label>
            </div>
          </div>

          {/* Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Matrix */}
            <div className="space-y-3">
              <h4 className="font-semibold">Causal Attention Matrix</h4>
              <div className="text-sm text-muted-foreground mb-2">
                Position {currentPosition} can only attend to positions ≤ {currentPosition}
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${sequenceLength}, minmax(0, 1fr))` }}>
                {attentionPattern.map((row, i) =>
                  row.map((val, j) => (
                    <motion.div
                      key={`causal-${i}-${j}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (i * sequenceLength + j) * 0.02 }}
                      className={`
                        aspect-square flex items-center justify-center text-xs font-mono rounded border
                        ${i === currentPosition ? 'ring-2 ring-primary' : ''}
                        ${showMask && j > i ? 'bg-gray-100 border-gray-300 text-gray-400' : 
                          val > 0.5 ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}
                      `}
                    >
                      {showMask && j > i ? 'X' : val.toFixed(2)}
                    </motion.div>
                  ))
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Strong attention</span>
                  <div className="w-4 h-4 bg-blue-100 rounded border border-blue-300"></div>
                  <span>Weak attention</span>
                  <div className="w-4 h-4 bg-gray-100 rounded border border-gray-300"></div>
                  <span>Masked</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="space-y-3">
              <h4 className="font-semibold">How Causal Masking Works</h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h5 className="font-semibold text-blue-800">Generation Process</h5>
                  <p className="text-blue-700">
                    When generating token {currentPosition + 1}, the model can only see tokens 1 to {currentPosition + 1}.
                    Future tokens are masked to prevent "cheating."
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <h5 className="font-semibold text-green-800">Applications</h5>
                  <ul className="text-green-700 space-y-1">
                    <li>• GPT and other autoregressive models</li>
                    <li>• Text generation and completion</li>
                    <li>• Music and speech synthesis</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h5 className="font-semibold text-purple-800">Current Pattern</h5>
                  <p className="text-purple-700">
                    {showMask ? 
                      `Position ${currentPosition + 1} shows ${attentionPattern[currentPosition]?.filter((v, j) => j <= currentPosition && v > 0).length || 0} valid attention targets` :
                      `Without masking: ${attentionPattern[currentPosition]?.filter(v => v > 0).length || 0} attention targets`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Generation Example */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Text Generation Example</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <strong>Generated so far:</strong> "The cat sat on the"
                </div>
                <div className="text-sm">
                  <strong>Next token prediction:</strong> 
                  <span className="ml-2 p-2 bg-yellow-100 rounded">
                    mat (0.6) | couch (0.2) | floor (0.1) | chair (0.1)
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  The model predicts "mat" based only on previous words, not future context.
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  // Prompt Engineering Simulator Component
  const PromptEngineeringSimulator = () => {
    const [prompt, setPrompt] = useState("Explain attention mechanisms in simple terms")
    const [selectedLayer, setSelectedLayer] = useState(6)
    const [selectedHead, setSelectedHead] = useState(3)
    const [showActivations, setShowActivations] = useState(true)
    const [tokenAnalysis, setTokenAnalysis] = useState(2)

    const tokens = prompt.split(" ")
    const layers = 12
    const heads = 12

    // Simulate attention weights based on prompt
    const getAttentionWeights = () => {
      return Array.from({ length: tokens.length }, (_, i) =>
        Array.from({ length: tokens.length }, (_, j) => {
          // Simulate different attention patterns based on prompt content
          if (prompt.toLowerCase().includes('attention') && tokens[i].toLowerCase().includes('attention') && tokens[j].toLowerCase().includes('mechanisms')) {
            return 0.8
          }
          if (i === j) return 0.6
          if (Math.abs(i - j) === 1) return 0.3
          return 0.1
        })
      )
    }

    const attentionWeights = getAttentionWeights()

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Prompt Engineering Simulator
          </CardTitle>
          <CardDescription>
            Visualize how different prompts affect attention patterns and layer activations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Enter your prompt:</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Try different prompts to see attention changes..."
              className="w-full"
            />
          </div>

          {/* Layer and Head Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Layer: {selectedLayer + 1}/{layers}</label>
              <Slider
                value={[selectedLayer]}
                onValueChange={(value) => setSelectedLayer(value[0])}
                max={layers - 1}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Head: {selectedHead + 1}/{heads}</label>
              <Slider
                value={[selectedHead]}
                onValueChange={(value) => setSelectedHead(value[0])}
                max={heads - 1}
                min={0}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                id="show-activations"
                checked={showActivations}
                onChange={(e) => setShowActivations(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-activations" className="text-sm">Show Activations</label>
            </div>
          </div>

          {/* Token Analysis */}
          <div className="space-y-3">
            <h4 className="font-semibold">Token Analysis</h4>
            <div className="flex flex-wrap gap-2">
              {tokens.map((token, i) => (
                <Button
                  key={i}
                  variant={tokenAnalysis === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTokenAnalysis(i)}
                  className="text-xs"
                >
                  {token}
                </Button>
              ))}
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Matrix */}
            <div className="space-y-3">
              <h4 className="font-semibold">Attention Pattern (Layer {selectedLayer + 1}, Head {selectedHead + 1})</h4>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${tokens.length}, minmax(0, 1fr))` }}>
                {attentionWeights.map((row, i) =>
                  row.map((val, j) => (
                    <motion.div
                      key={`prompt-${i}-${j}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (i * tokens.length + j) * 0.02 }}
                      className={`
                        aspect-square flex items-center justify-center text-xs font-mono rounded
                        ${i === tokenAnalysis ? 'ring-2 ring-primary' : ''}
                        ${val > 0.6 ? 'bg-orange-500 text-white' : 
                          val > 0.3 ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      {val.toFixed(1)}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Layer Activations */}
            {showActivations && (
              <div className="space-y-3">
                <h4 className="font-semibold">Layer Activations for "{tokens[tokenAnalysis]}"</h4>
                <div className="space-y-2">
                  {Array.from({ length: Math.min(layers, 8) }, (_, layer) => (
                    <div key={layer} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">L{layer + 1}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <motion.div
                          className={`h-4 rounded-full ${
                            layer === selectedLayer ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${30 + Math.random() * 60 + (layer < 4 ? 20 : -10)}%`
                          }}
                          transition={{ delay: layer * 0.1 }}
                        />
                      </div>
                      <span className="text-xs w-12 text-right">
                        {(0.3 + Math.random() * 0.6).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Higher layers show more abstract representations
                </div>
              </div>
            )}
          </div>

          {/* Prompt Analysis */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Prompt Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h5 className="font-semibold text-blue-800">Complexity</h5>
                  <p className="text-blue-700">
                    {tokens.length > 10 ? 'High' : tokens.length > 5 ? 'Medium' : 'Low'} ({tokens.length} tokens)
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <h5 className="font-semibold text-green-800">Key Concepts</h5>
                  <p className="text-green-700">
                    {prompt.toLowerCase().includes('attention') ? 'Attention mechanisms' : 
                     prompt.toLowerCase().includes('explain') ? 'Explanation' : 'General query'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h5 className="font-semibold text-purple-800">Expected Focus</h5>
                  <p className="text-purple-700">
                    Layer {Math.floor(layers * 0.6)}-{Math.floor(layers * 0.8)} (semantic understanding)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  // Multi-Modal Attention Playground Component
  const MultiModalAttentionPlayground = () => {
    const [selectedModality, setSelectedModality] = useState<'image-text' | 'audio-text'>('image-text')
    const [imageRegions, setImageRegions] = useState(9)
    const [textTokens, setTextTokens] = useState(6)
    const [crossModalWeights, setCrossModalWeights] = useState<number[][]>([])

    // Generate cross-modal attention weights
    useEffect(() => {
      const weights = Array.from({ length: textTokens }, (_, i) =>
        Array.from({ length: imageRegions }, (_, j) => {
          // Simulate cross-modal attention patterns
          if (selectedModality === 'image-text') {
            // Text attending to image regions
            if (i === 0 && j === 4) return 0.8 // "cat" attending to cat region
            if (i === 2 && j === 7) return 0.7 // "sitting" attending to pose region
            return Math.random() * 0.3
          } else {
            // Audio attending to text
            return Math.random() * 0.6
          }
        })
      )
      setCrossModalWeights(weights)
    }, [selectedModality, imageRegions, textTokens])

    return (
      <div className="space-y-6">
        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Multi-Modal Attention Playground
            </CardTitle>
            <CardDescription>
              Explore how models attend across different data types simultaneously
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Modality Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Modality Type</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={selectedModality === 'image-text' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedModality('image-text')}
                  >
                    Image + Text
                  </Button>
                  <Button
                    variant={selectedModality === 'audio-text' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedModality('audio-text')}
                  >
                    Audio + Text
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {selectedModality === 'image-text' ? 'Image Regions' : 'Audio Segments'}: {selectedModality === 'image-text' ? imageRegions : '8'}
                </label>
                {selectedModality === 'image-text' && (
                  <Slider
                    value={[imageRegions]}
                    onValueChange={(value) => setImageRegions(value[0])}
                    max={16}
                    min={4}
                    step={1}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Text Tokens: {textTokens}</label>
                <Slider
                  value={[textTokens]}
                  onValueChange={(value) => setTextTokens(value[0])}
                  max={12}
                  min={3}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Cross-Modal Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Modalities */}
              <div className="space-y-4">
                <h4 className="font-semibold">Input Modalities</h4>
                
                {selectedModality === 'image-text' ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-blue-800 mb-2">Image Regions</h5>
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: Math.min(imageRegions, 9) }, (_, i) => (
                          <div
                            key={i}
                            className="aspect-square bg-blue-200 rounded flex items-center justify-center text-xs font-semibold"
                          >
                            R{i + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">Text Tokens</h5>
                      <div className="flex flex-wrap gap-1">
                        {["A", "cat", "sitting", "on", "a", "mat"].slice(0, textTokens).map((token, i) => (
                          <span key={i} className="px-2 py-1 bg-green-200 rounded text-xs">
                            {token}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-2">Audio Segments</h5>
                      <div className="space-y-1">
                        {Array.from({ length: 8 }, (_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-16 bg-purple-200 rounded h-4"></div>
                            <span className="text-xs">Segment {i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-semibold text-green-800 mb-2">Text Tokens</h5>
                      <div className="flex flex-wrap gap-1">
                        {["Hello", "world", "how", "are", "you"].slice(0, textTokens).map((token, i) => (
                          <span key={i} className="px-2 py-1 bg-green-200 rounded text-xs">
                            {token}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cross-Modal Attention Matrix */}
              <div className="space-y-3">
                <h4 className="font-semibold">Cross-Modal Attention</h4>
                <div className="text-sm text-muted-foreground">
                  How text attends to {selectedModality === 'image-text' ? 'image regions' : 'audio segments'}
                </div>
                <div className="grid gap-1" style={{ 
                  gridTemplateColumns: `repeat(${selectedModality === 'image-text' ? imageRegions : 8}, minmax(0, 1fr))` 
                }}>
                  {crossModalWeights.map((row, i) =>
                    row.map((val, j) => (
                      <motion.div
                        key={`cross-modal-${i}-${j}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (i * row.length + j) * 0.02 }}
                        className="aspect-square flex items-center justify-center text-xs font-mono rounded"
                        style={{
                          backgroundColor: selectedModality === 'image-text' ? 
                            `rgba(59, 130, 246, ${val})` : `rgba(168, 85, 247, ${val})`,
                          color: val > 0.5 ? 'white' : 'black'
                        }}
                      >
                        {val.toFixed(1)}
                      </motion.div>
                    ))
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Rows: Text tokens | Columns: {selectedModality === 'image-text' ? 'Image regions' : 'Audio segments'}
                </div>
              </div>
            </div>

            {/* Applications */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Real-World Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-semibold text-blue-800">Visual Question Answering</h5>
                    <p className="text-sm text-blue-700">
                      "What color is the cat?" → Model attends to cat region + "color" token
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <h5 className="font-semibold text-green-800">Image Captioning</h5>
                    <p className="text-sm text-green-700">
                      Generate descriptions by attending to relevant image regions
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h5 className="font-semibold text-purple-800">Speech Recognition</h5>
                    <p className="text-sm text-purple-700">
                      Audio segments attend to text vocabulary for transcription
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h5 className="font-semibold text-orange-800">Multimodal Translation</h5>
                    <p className="text-sm text-orange-700">
                      Translate text while considering visual context
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Memory-Augmented Neural Networks Component
  const MemoryAugmentedNeuralNetworks = () => {
    const [memorySize, setMemorySize] = useState(8)
    const [memorySlots, setMemorySlots] = useState<number[][]>(
      Array.from({ length: 8 }, () => Array.from({ length: 4 }, () => Math.random()))
    )
    const [queryVector, setQueryVector] = useState<number[]>(Array.from({ length: 4 }, () => Math.random()))
    const [attentionWeights, setAttentionWeights] = useState<number[]>([])
    const [readVector, setReadVector] = useState<number[]>([])

    // Simulate memory attention
    useEffect(() => {
      const weights = memorySlots.map(slot => {
        // Cosine similarity simulation
        const similarity = slot.reduce((sum, val, i) => sum + val * queryVector[i], 0) / 
                          (Math.sqrt(slot.reduce((s, v) => s + v * v, 0)) * 
                           Math.sqrt(queryVector.reduce((s, v) => s + v * v, 0)))
        return Math.max(0, similarity)
      })
      
      const normalizedWeights = weights.map(w => w / weights.reduce((a, b) => a + b, 0))
      setAttentionWeights(normalizedWeights)
      
      // Weighted read
      const read = queryVector.map((_, i) => 
        memorySlots.reduce((sum, slot, j) => sum + slot[i] * normalizedWeights[j], 0)
      )
      setReadVector(read)
    }, [memorySlots, queryVector])

    const writeToMemory = (index: number) => {
      const newSlots = [...memorySlots]
      newSlots[index] = Array.from({ length: 4 }, () => Math.random())
      setMemorySlots(newSlots)
    }

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Memory-Augmented Neural Networks
          </CardTitle>
          <CardDescription>
            Simulate external memory reads/writes and attention-directed memory retrieval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Memory Size: {memorySize}</label>
              <Slider
                value={[memorySize]}
                onValueChange={(value) => {
                  setMemorySize(value[0])
                  setMemorySlots(Array.from({ length: value[0] }, () => 
                    Array.from({ length: 4 }, () => Math.random())
                  ))
                }}
                max={16}
                min={4}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQueryVector(Array.from({ length: 4 }, () => Math.random()))}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Random Query
              </Button>
            </div>
          </div>

          {/* Memory Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Memory Bank */}
            <div className="space-y-3">
              <h4 className="font-semibold">Memory Bank</h4>
              <div className="space-y-2">
                {memorySlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm font-medium w-12">M{i}:</span>
                    <div className="flex-1 flex gap-1">
                      {slot.map((val, j) => (
                        <div
                          key={j}
                          className="flex-1 h-6 bg-gray-200 rounded flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: `rgba(59, 130, 246, ${val})`,
                            color: val > 0.5 ? 'white' : 'black'
                          }}
                        >
                          {val.toFixed(1)}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => writeToMemory(i)}
                      className="text-xs"
                    >
                      Write
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Query Vector */}
            <div className="space-y-3">
              <h4 className="font-semibold">Query Vector</h4>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-1 mb-2">
                  {queryVector.map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 bg-blue-200 rounded flex items-center justify-center text-sm font-semibold"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${val})`,
                        color: val > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-blue-700">
                  Current query vector for memory retrieval
                </div>
              </div>

              {/* Attention Weights */}
              <h5 className="font-semibold">Attention Weights</h5>
              <div className="space-y-2">
                {attentionWeights.map((weight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm w-12">M{i}:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <motion.div
                        className="bg-green-600 h-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${weight * 100}%` }}
                        transition={{ delay: i * 0.1 }}
                      />
                    </div>
                    <span className="text-xs w-12 text-right">
                      {weight.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Read Operation */}
            <div className="space-y-3">
              <h4 className="font-semibold">Read Vector</h4>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex gap-1 mb-2">
                  {readVector.map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 bg-green-200 rounded flex items-center justify-center text-sm font-semibold"
                      style={{
                        backgroundColor: `rgba(34, 197, 94, ${val})`,
                        color: val > 0.5 ? 'white' : 'black'
                      }}
                    >
                      {val.toFixed(2)}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-green-700">
                  Weighted combination of memory slots
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <h5 className="font-semibold text-yellow-800 text-sm">Memory Operation</h5>
                <p className="text-xs text-yellow-700">
                  Read = Σ(attention_weight[i] × memory_slot[i])
                </p>
              </div>
            </div>
          </div>

          {/* Applications */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h5 className="font-semibold text-blue-800">Neural Turing Machines</h5>
                  <p className="text-blue-700">
                    Learnable read/write operations for algorithmic tasks
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <h5 className="font-semibold text-green-800">Differentiable Neural Computers</h5>
                  <p className="text-green-700">
                    Complex reasoning with episodic memory
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h5 className="font-semibold text-purple-800">Memory Networks</h5>
                  <p className="text-purple-700">
                    Question answering with long-term memory
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <h5 className="font-semibold text-orange-800">Transformers with Memory</h5>
                  <p className="text-orange-700">
                    Extend context beyond fixed sequence length
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  // Long Context / Sliding Window Component
  const LongContextSlidingWindow = () => {
    const [contextLength, setContextLength] = useState(2048)
    const [windowSize, setWindowSize] = useState(512)
    const [stride, setStride] = useState(256)
    const [currentWindow, setCurrentWindow] = useState(0)
    const [efficiencyMode, setEfficiencyMode] = useState<'sliding' | 'dilated' | 'strided'>('sliding')

    const totalWindows = Math.ceil((contextLength - windowSize) / stride) + 1
    const computationalComplexity = efficiencyMode === 'sliding' ? 
      contextLength * windowSize : 
      efficiencyMode === 'dilated' ? 
      contextLength * Math.sqrt(windowSize) : 
      totalWindows * windowSize * windowSize

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Long-Context & Sliding Window Attention
          </CardTitle>
          <CardDescription>
            Experiment with strategies for efficient attention over long documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Context Length: {contextLength}</label>
              <Slider
                value={[contextLength]}
                onValueChange={(value) => setContextLength(value[0])}
                max={4096}
                min={512}
                step={256}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Window Size: {windowSize}</label>
              <Slider
                value={[windowSize]}
                onValueChange={(value) => setWindowSize(value[0])}
                max={1024}
                min={128}
                step={128}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stride: {stride}</label>
              <Slider
                value={[stride]}
                onValueChange={(value) => setStride(value[0])}
                max={windowSize}
                min={64}
                step={64}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Efficiency Mode</label>
              <div className="flex gap-1 mt-2">
                {(['sliding', 'dilated', 'strided'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={efficiencyMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEfficiencyMode(mode)}
                    className="text-xs"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Efficiency Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complexity Comparison */}
            <div className="space-y-3">
              <h4 className="font-semibold">Computational Complexity</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Standard Attention</span>
                  <span className="text-sm text-red-700">
                    O({contextLength}²) = {(contextLength * contextLength).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {efficiencyMode === 'sliding' ? 'Sliding Window' : 
                     efficiencyMode === 'dilated' ? 'Dilated Attention' : 'Strided Window'}
                  </span>
                  <span className="text-sm text-green-700">
                    O({computationalComplexity.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Memory Reduction</span>
                  <span className="text-sm text-blue-700">
                    {((1 - computationalComplexity / (contextLength * contextLength)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Window Visualization */}
            <div className="space-y-3">
              <h4 className="font-semibold">Window Coverage</h4>
              <div className="relative">
                {/* Full context */}
                <div className="h-8 bg-gray-200 rounded-full mb-2">
                  <div className="h-8 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white">
                    Full Context ({contextLength} tokens)
                  </div>
                </div>
                
                {/* Windows */}
                <div className="relative h-6">
                  {Array.from({ length: Math.min(totalWindows, 8) }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-6 bg-blue-500 rounded flex items-center justify-center text-xs text-white"
                      style={{
                        left: `${(i * stride / contextLength) * 100}%`,
                        width: `${(windowSize / contextLength) * 100}%`
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {i + 1}
                    </motion.div>
                  ))}
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  {totalWindows} windows total, showing first {Math.min(totalWindows, 8)}
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Visualization */}
          <div className="space-y-3">
            <h4 className="font-semibold">Attention Pattern</h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(16, 1fr)' }}>
              {Array.from({ length: 256 }, (_, i) => {
                const row = Math.floor(i / 16)
                const col = i % 16
                let hasAttention = false
                
                if (efficiencyMode === 'sliding') {
                  hasAttention = Math.abs(row - col) <= 2
                } else if (efficiencyMode === 'dilated') {
                  hasAttention = Math.abs(row - col) % 3 === 0
                } else {
                  hasAttention = Math.floor(row / 4) === Math.floor(col / 4)
                }
                
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded ${
                      hasAttention ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                )
              })}
            </div>
            <div className="text-xs text-muted-foreground">
              Pattern: {efficiencyMode === 'sliding' ? 'Local window attention' : 
                       efficiencyMode === 'dilated' ? 'Dilated sparse pattern' : 
                       'Strided block attention'}
            </div>
          </div>

          {/* Use Cases */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Real-World Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h5 className="font-semibold text-blue-800">Long Document Processing</h5>
                  <p className="text-blue-700">
                    Books, research papers, legal documents with thousands of tokens
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <h5 className="font-semibold text-green-800">Code Generation</h5>
                  <p className="text-green-700">
                    Long code files with complex dependencies and structure
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h5 className="font-semibold text-purple-800">DNA Sequence Analysis</h5>
                  <p className="text-purple-700">
                    Genomic data with millions of base pairs
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <h5 className="font-semibold text-orange-800">Time Series Forecasting</h5>
                  <p className="text-orange-700">
                    Long historical data with seasonal patterns
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  // Sparse/Local Attention Component
  const SparseLocalAttention = () => {
    const [pattern, setPattern] = useState<'local' | 'strided' | 'random' | 'fixed'>('local')
    const [sparsity, setSparsity] = useState(75)
    const [windowSize, setWindowSize] = useState(3)
    const [sequenceLength, setSequenceLength] = useState(16)
    const [attentionMatrix, setAttentionMatrix] = useState<boolean[][]>([])

    // Generate sparse attention pattern
    useEffect(() => {
      const matrix = Array.from({ length: sequenceLength }, (_, i) =>
        Array.from({ length: sequenceLength }, (_, j) => {
          switch (pattern) {
            case 'local':
              return Math.abs(i - j) <= Math.floor(windowSize / 2)
            case 'strided':
              return Math.abs(i - j) % windowSize === 0
            case 'random':
              return Math.random() * 100 < (100 - sparsity)
            case 'fixed':
              return j % windowSize === i % windowSize
            default:
              return false
          }
        })
      )
      setAttentionMatrix(matrix)
    }, [pattern, sparsity, windowSize, sequenceLength])

    const actualSparsity = attentionMatrix.length > 0 ? 
      (1 - (attentionMatrix.flat().filter(Boolean).length / (sequenceLength * sequenceLength))) * 100 : 0

    return (
      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Sparse/Local Attention Patterns
          </CardTitle>
          <CardDescription>
            Interactively tweak sparsity and locality patterns to see effects on complexity and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pattern Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Pattern Type</label>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {(['local', 'strided', 'random', 'fixed'] as const).map((p) => (
                  <Button
                    key={p}
                    variant={pattern === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPattern(p)}
                    className="text-xs"
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Sparsity: {sparsity}%</label>
              <Slider
                value={[sparsity]}
                onValueChange={(value) => setSparsity(value[0])}
                max={95}
                min={25}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Window Size: {windowSize}</label>
              <Slider
                value={[windowSize]}
                onValueChange={(value) => setWindowSize(value[0])}
                max={7}
                min={1}
                step={2}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sequence: {sequenceLength}</label>
              <Slider
                value={[sequenceLength]}
                onValueChange={(value) => setSequenceLength(value[0])}
                max={32}
                min={8}
                step={4}
                className="mt-2"
              />
            </div>
          </div>

          {/* Pattern Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attention Matrix */}
            <div className="space-y-3">
              <h4 className="font-semibold">Sparse Attention Pattern</h4>
              <div className="grid gap-0.5" style={{ 
                gridTemplateColumns: `repeat(${sequenceLength}, minmax(0, 1fr))` 
              }}>
                {attentionMatrix.map((row, i) =>
                  row.map((hasAttention, j) => (
                    <motion.div
                      key={`sparse-${i}-${j}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (i * sequenceLength + j) * 0.01 }}
                      className={`aspect-square rounded-sm ${
                        hasAttention ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Actual sparsity: {actualSparsity.toFixed(1)}% | 
                Non-zero entries: {attentionMatrix.flat().filter(Boolean).length}/{sequenceLength * sequenceLength}
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="space-y-3">
              <h4 className="font-semibold">Performance Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">Standard Attention</span>
                  <span className="text-sm font-mono">
                    O({sequenceLength}²) = {(sequenceLength * sequenceLength)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Sparse Attention</span>
                  <span className="text-sm font-mono text-green-700">
                    O({Math.floor(sequenceLength * sequenceLength * (1 - actualSparsity / 100))})
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Speedup</span>
                  <span className="text-sm font-mono text-blue-700">
                    {((sequenceLength * sequenceLength) / Math.floor(sequenceLength * sequenceLength * (1 - actualSparsity / 100))).toFixed(1)}x
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Memory Reduction</span>
                  <span className="text-sm font-mono text-purple-700">
                    {actualSparsity.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pattern Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-semibold text-blue-800 text-sm">Local Pattern</h5>
              <p className="text-xs text-blue-700">
                Each token attends to nearby tokens within a fixed window
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
              <h5 className="font-semibold text-green-800 text-sm">Strided Pattern</h5>
              <p className="text-xs text-green-700">
                Tokens attend to positions at regular intervals
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h5 className="font-semibold text-purple-800 text-sm">Random Pattern</h5>
              <p className="text-xs text-purple-700">
                Random sparse connections for maximum flexibility
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <h5 className="font-semibold text-orange-800 text-sm">Fixed Pattern</h5>
              <p className="text-xs text-orange-700">
                Predefined sparse pattern optimized for hardware
              </p>
            </div>
          </div>

          {/* Trade-offs */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Efficiency vs. Performance Trade-offs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-lg border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                    <h5 className="font-semibold mb-2">High Sparsity (90%+)</h5>
                    <ul className="space-y-1 text-xs">
                      <li>✓ 10x+ speedup</li>
                      <li>✓ Minimal memory usage</li>
                      <li>✗ Limited context access</li>
                      <li>✗ May miss important relations</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                    <h5 className="font-semibold mb-2">Medium Sparsity (50-75%)</h5>
                    <ul className="space-y-1 text-xs">
                      <li>✓ 2-4x speedup</li>
                      <li>✓ Good balance</li>
                      <li>✓ Preserves many relations</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md">
                    <h5 className="font-semibold mb-2">Low Sparsity (&lt;50%)</h5>
                    <ul className="space-y-1 text-xs">
                      <li>✓ Near-full attention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    )
  }

  const MatrixDisplay = ({ matrix, title, highlight, qaSection }: { 
    matrix: number[][], 
    title: string,
    highlight?: { row: number; col: number }[],
    qaSection?: string
  }) => (
    <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {title}
            {qaSection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleQA(qaSection)}
                className="h-6 w-6 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}>
              {matrix.map((row, i) =>
                row.map((val, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (i * row.length + j) * 0.02 }}
                    className={`
                      aspect-square flex items-center justify-center text-xs font-mono rounded
                      ${highlight?.some(h => h.row === i && h.col === j) 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                      }
                    `}
                  >
                    {val}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {qaSection && expandedQA.has(qaSection) && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-3"
            >
              <Separator />
              <div className="space-y-3">
                {qaData[qaSection]?.map((qa, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getQAIcon(qa.type)}
                      <h4 className={`font-semibold text-sm ${getQAColor(qa.type)}`}>
                        {qa.type.toUpperCase()}: {qa.question}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {qa.answer}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )

  const StepDisplay = ({ step, index }: { step: AttentionStep, index: number }) => {
    const qaSection = step.step.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\d+/g, '')
    const actualQASection = Object.keys(qaData).find(key => qaSection.includes(key)) || 
                           (qaSection.includes('qk') ? 'scores' : 
                            qaSection.includes('scale') ? 'scaling' :
                            qaSection.includes('softmax') ? 'softmax' :
                            qaSection.includes('output') ? 'output' : null)

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: index <= currentStep ? 1 : 0.3,
          x: index <= currentStep ? 0 : -20
        }}
        transition={{ delay: index * 0.1 }}
        className={`
          border rounded-lg p-4
          ${index <= currentStep ? 'border-primary' : 'border-muted'}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{step.step}</h3>
            {actualQASection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleQA(`step-${actualQASection}`)}
                className="h-6 w-6 p-0"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          {index <= currentStep && (
            <Badge variant="default">Complete</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {step.description}
        </p>
        
        {step.result && index <= currentStep && (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${step.result[0].length}, minmax(0, 1fr))` }}>
                {step.result.map((row, i) =>
                  row.map((val, j) => (
                    <motion.div
                      key={`${i}-${j}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + (i * row.length + j) * 0.02 }}
                      className={`
                        aspect-square flex items-center justify-center text-xs font-mono rounded
                        ${index === 2 ? 'bg-primary/20' : 'bg-muted'}
                      `}
                    >
                      {val}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">QKV Attention Simulator</h1>
        <p className="text-muted-foreground">
          Visualize how scaled dot-product attention works in transformer models with comprehensive Q&A explanations
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Basic Attention
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Advanced Types
          </TabsTrigger>
          <TabsTrigger value="multimodal" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Multi-Modal
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Column - Input Matrices */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-4"
            >
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Sequence Length: {sequenceLength}</label>
                    <Slider
                      value={[sequenceLength]}
                      onValueChange={(value) => setSequenceLength(value[0])}
                      max={5}
                      min={2}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Embedding Dim: {embeddingDim}</label>
                    <Slider
                      value={[embeddingDim]}
                      onValueChange={(value) => setEmbeddingDim(value[0])}
                      max={8}
                      min={2}
                      step={2}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Multi-Head Attention</label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="multihead"
                        checked={showMultiHead}
                        onChange={(e) => setShowMultiHead(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="multihead" className="text-sm">Enable Multi-Head</label>
                    </div>
                    {showMultiHead && (
                      <div className="mt-2">
                        <label className="text-sm font-medium">Number of Heads: {numHeads}</label>
                        <Slider
                          value={[numHeads]}
                          onValueChange={(value) => setNumHeads(value[0])}
                          max={8}
                          min={1}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => randomizeMatrix('Q')}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Randomize Q
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => randomizeMatrix('K')}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Randomize K
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => randomizeMatrix('V')}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Randomize V
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <MatrixDisplay matrix={Q} title="Query (Q)" qaSection="query" />
              <MatrixDisplay matrix={K} title="Key (K)" qaSection="key" />
              <MatrixDisplay matrix={V} title="Value (V)" qaSection="value" />
            </motion.div>

            {/* Center Column - Calculation Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Attention Calculation Steps
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePlay}
                        disabled={isPlaying}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <StepDisplay key={index} step={step} index={index} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1 space-y-4"
            >
              {attentionWeights.length > 0 && (
                <MatrixDisplay 
                  matrix={attentionWeights} 
                  title="Attention Weights"
                  highlight={currentStep >= 2 ? attentionWeights.map((row, i) => 
                    row.map((_, j) => ({ row: i, col: j }))
                  ).flat() : undefined}
                  qaSection="softmax"
                />
              )}

              {output.length > 0 && (
                <MatrixDisplay 
                  matrix={output} 
                  title="Final Output"
                  highlight={currentStep >= 3 ? output.map((row, i) => 
                    row.map((_, j) => ({ row: i, col: j }))
                  ).flat() : undefined}
                  qaSection="output"
                />
              )}

              <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Guide</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQA('overview')}
                      className="h-6 w-6 p-0"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-2">
                      <strong>Query (Q):</strong> What I'm looking for
                    </p>
                    <p className="mb-2">
                      <strong>Key (K):</strong> What I can offer
                    </p>
                    <p className="mb-2">
                      <strong>Value (V):</strong> What I actually communicate
                    </p>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Formula:</p>
                    <p className="font-mono">Attention(Q,K,V) = softmax(QK^T/√dk)V</p>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Applications:</p>
                    <ul className="space-y-1">
                      <li>• Machine translation</li>
                      <li>• Text summarization</li>
                      <li>• Question answering</li>
                      <li>• Image recognition</li>
                    </ul>
                  </div>

                  {expandedQA.has('overview') && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-3"
                      >
                        <Separator />
                        <div className="space-y-3">
                          {qaData['overview']?.map((qa, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center gap-2">
                                {getQAIcon(qa.type)}
                                <h4 className={`font-semibold text-sm ${getQAColor(qa.type)}`}>
                                  {qa.type.toUpperCase()}: {qa.question}
                                </h4>
                              </div>
                              <p className="text-sm text-muted-foreground pl-6">
                                {qa.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Sub-tabs for advanced features */}
            <Tabs defaultValue="multihead" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="multihead">Multi-Head</TabsTrigger>
                <TabsTrigger value="causal">Causal & Masking</TabsTrigger>
                <TabsTrigger value="prompt">Prompt Engineering</TabsTrigger>
              </TabsList>

              <TabsContent value="multihead" className="space-y-6">
                <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Multi-Head Attention Visualization
                    </CardTitle>
                    <CardDescription>
                      Explore how multiple attention heads work in parallel to capture different types of relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Enhanced Multi-Head Visualization */}
                    <div className="space-y-6">
                      {/* Parallel Processing Diagram */}
                      <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg">Parallel Multi-Head Processing</CardTitle>
                          <CardDescription>
                            See how {numHeads} heads process information simultaneously
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="relative">
                            {/* Input */}
                            <div className="text-center mb-4">
                              <div className="inline-block bg-blue-100 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Input Sequence</span>
                              </div>
                            </div>

                            {/* Parallel Heads */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              {Array.from({ length: Math.min(numHeads, 8) }, (_, headIndex) => (
                                <motion.div
                                  key={headIndex}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: headIndex * 0.1 }}
                                  className="text-center"
                                >
                                  <div className={`p-3 rounded-lg border-2 ${
                                    selectedHead === headIndex ? 'border-primary bg-primary/10' : 'border-muted'
                                  }`}>
                                    <Brain className="w-6 h-6 mx-auto mb-1" />
                                    <div className="text-xs font-semibold">Head {headIndex + 1}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {['Syntax', 'Semantics', 'Position', 'Context', 'Long-range', 'Local', 'Pattern', 'Structure'][headIndex]}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Arrows showing parallel processing */}
                            <div className="relative h-8 mb-4">
                              {Array.from({ length: Math.min(numHeads, 8) }, (_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-0.5 bg-blue-400"
                                  style={{
                                    left: `${12.5 + (i % 4) * 25}%`,
                                    top: '0',
                                    height: '32px'
                                  }}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{ delay: 0.5 + i * 0.1 }}
                                />
                              ))}
                            </div>

                            {/* Concatenation */}
                            <div className="text-center">
                              <div className="inline-block bg-green-100 px-4 py-2 rounded-lg">
                                <span className="font-semibold">Concatenate & Project</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Individual Head Details */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Head Selection and Preview */}
                        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                          <CardHeader>
                            <CardTitle className="text-lg">Head Analysis</CardTitle>
                            <CardDescription>
                              Select a head to view its attention pattern
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: numHeads }, (_, i) => (
                                <Button
                                  key={i}
                                  variant={selectedHead === i ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedHead(i)}
                                  className="flex items-center gap-2"
                                >
                                  <Brain className="w-3 h-3" />
                                  {i + 1}
                                </Button>
                              ))}
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold">Head {selectedHead + 1} Focus</h4>
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">
                                  {selectedHead === 0 ? 'Syntactic patterns: grammar, sentence structure, part-of-speech relationships' :
                                   selectedHead === 1 ? 'Semantic relationships: word meanings, conceptual connections, analogies' :
                                   selectedHead === 2 ? 'Positional encoding: word order, distance relationships, sequential patterns' :
                                   selectedHead === 3 ? 'Contextual understanding: surrounding words, phrase boundaries, scope' :
                                   selectedHead === 4 ? 'Long-range dependencies: subject-verb agreement across clauses, pronoun resolution' :
                                   selectedHead === 5 ? 'Local patterns: n-grams, common phrases, idiomatic expressions' :
                                   selectedHead === 6 ? 'Abstract patterns: thematic roles, discourse relationships' :
                                   'Structural patterns: hierarchical relationships, nested structures'}
                                </p>
                              </div>
                            </div>

                            {/* Mini attention matrix */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold">Attention Pattern</h5>
                              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                {Array.from({ length: 16 }, (_, i) => {
                                  const row = Math.floor(i / 4)
                                  const col = i % 4
                                  const weight = selectedHead === 0 ? (row === col ? 0.8 : 0.1) :
                                                 selectedHead === 1 ? (Math.abs(row - col) <= 1 ? 0.6 : 0.1) :
                                                 selectedHead === 2 ? (col === 0 ? 0.7 : 0.1) :
                                                 0.2 + Math.random() * 0.6
                                  return (
                                    <div
                                      key={i}
                                      className="aspect-square flex items-center justify-center text-xs font-mono rounded"
                                      style={{
                                        backgroundColor: `rgba(59, 130, 246, ${weight})`,
                                        color: weight > 0.5 ? 'white' : 'black'
                                      }}
                                    >
                                      {weight.toFixed(1)}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Combined Output Visualization */}
                        <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                          <CardHeader>
                            <CardTitle className="text-lg">Multi-Head Output</CardTitle>
                            <CardDescription>
                              How all heads combine to create the final representation
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Head Contributions</h4>
                              {Array.from({ length: Math.min(numHeads, 4) }, (_, i) => (
                                <div key={i} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    <span className="text-sm font-medium">Head {i + 1}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {['Syntax', 'Semantics', 'Position', 'Context'][i]}
                                    </Badge>
                                  </div>
                                  <div className="ml-6">
                                    <div className="bg-gray-200 rounded-full h-2">
                                      <motion.div
                                        className="bg-blue-600 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${60 + Math.random() * 30}%` }}
                                        transition={{ delay: i * 0.2 }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                              <h5 className="font-semibold text-green-800 mb-2">Combined Representation</h5>
                              <p className="text-sm text-green-700">
                                Each head contributes unique information, creating a rich, multi-faceted understanding that captures:
                              </p>
                              <ul className="text-sm text-green-700 mt-2 space-y-1">
                                <li>• Grammatical structure (syntax heads)</li>
                                <li>• Meaning relationships (semantic heads)</li>
                                <li>• Word order and position (positional heads)</li>
                                <li>• Broader context (contextual heads)</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="causal" className="space-y-6">
                <CausalAttentionMasking />
              </TabsContent>

              <TabsContent value="prompt" className="space-y-6">
                <PromptEngineeringSimulator />
              </TabsContent>
            </Tabs>
          </motion.div>
        </TabsContent>

        <TabsContent value="multimodal" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MultiModalAttentionPlayground />
          </motion.div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="memory" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="memory">Memory Networks</TabsTrigger>
                <TabsTrigger value="longcontext">Long Context</TabsTrigger>
                <TabsTrigger value="sparse">Sparse Attention</TabsTrigger>
              </TabsList>

              <TabsContent value="memory" className="space-y-6">
                <MemoryAugmentedNeuralNetworks />
              </TabsContent>

              <TabsContent value="longcontext" className="space-y-6">
                <LongContextSlidingWindow />
              </TabsContent>

              <TabsContent value="sparse" className="space-y-6">
                <SparseLocalAttention />
              </TabsContent>
            </Tabs>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}