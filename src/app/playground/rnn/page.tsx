'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Brain,
  ArrowRight,
  HelpCircle,
  Target,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Clock,
  Repeat
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BackButton from "@/components/BackButton"

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
      question: "Why do we need Recurrent Neural Networks?",
      answer: "RNNs are designed to handle sequential data where order matters, like text or time series. Unlike feedforward networks, RNNs maintain memory of previous inputs through hidden states, allowing them to capture temporal dependencies and context.",
      type: 'why'
    },
    {
      question: "What is an RNN?",
      answer: "A Recurrent Neural Network is a type of neural network that processes sequences by maintaining a hidden state that captures information from previous time steps. This memory allows RNNs to handle variable-length sequences and capture temporal patterns.",
      type: 'what'
    },
    {
      question: "How do RNNs process sequences?",
      answer: "RNNs process sequences step by step. At each time step, they take the current input and the previous hidden state, compute a new hidden state, and produce an output. The hidden state acts as memory, carrying information forward through the sequence.",
      type: 'how'
    }
  ],
  'hidden': [
    {
      question: "Why do RNNs need hidden states?",
      answer: "Hidden states serve as the memory mechanism of RNNs, allowing them to capture temporal dependencies and context from previous time steps. Without hidden states, RNNs would treat each input independently and couldn't understand sequences.",
      type: 'why'
    },
    {
      question: "What is a hidden state in RNNs?",
      answer: "A hidden state is a vector that summarizes information from previous time steps. It's updated at each time step based on the current input and the previous hidden state, acting as the network's memory of what it has seen so far.",
      type: 'what'
    },
    {
      question: "How are hidden states calculated?",
      answer: "Hidden states are calculated using the formula: h_t = tanh(W_hh * h_{t-1} + W_xh * x_t + b_h). This combines the previous hidden state (h_{t-1}) and current input (x_t) through learned weight matrices and applies a non-linear activation.",
      type: 'how'
    }
  ],
  'sequence': [
    {
      question: "Why do RNNs process data sequentially?",
      answer: "Sequential processing allows RNNs to capture order-dependent patterns and temporal relationships. Many real-world problems like language understanding, speech recognition, and time series prediction depend on the order of data.",
      type: 'why'
    },
    {
      question: "What is sequence processing in RNNs?",
      answer: "Sequence processing means the network processes one element at a time, maintaining a hidden state that carries information forward. Each step can produce an output, and the final hidden state often represents the entire sequence.",
      type: 'what'
    },
    {
      question: "How does information flow through an RNN sequence?",
      answer: "Information flows through two pathways: forward through time steps (input → hidden → output) and through the recurrent connection (previous hidden → current hidden). This creates a loop that allows information to persist across time steps.",
      type: 'how'
    }
  ],
  'vanishing': [
    {
      question: "Why does the vanishing gradient problem occur in RNNs?",
      answer: "Vanishing gradients occur when backpropagating through many time steps. Repeated multiplication by small weights (< 1) causes gradients to shrink exponentially, making it difficult to learn long-range dependencies.",
      type: 'why'
    },
    {
      question: "What is the vanishing gradient problem?",
      answer: "The vanishing gradient problem is when gradients become extremely small during backpropagation through time, preventing the network from learning long-range dependencies. Early layers receive almost no gradient signal and can't update their weights effectively.",
      type: 'what'
    },
    {
      question: "How can we solve vanishing gradients?",
      answer: "Solutions include: using ReLU activation functions, gradient clipping, proper weight initialization, and using advanced RNN architectures like LSTMs and GRUs that have built-in mechanisms to preserve gradient flow.",
      type: 'how'
    }
  ],
  'lstm': [
    {
      question: "Why were LSTMs invented?",
      answer: "LSTMs were invented to solve the vanishing gradient problem in traditional RNNs. They use gates to control information flow, allowing the network to remember important information over long sequences and forget irrelevant details.",
      type: 'why'
    },
    {
      question: "What is an LSTM?",
      answer: "Long Short-Term Memory (LSTM) is an advanced RNN architecture that uses memory cells and gates (input, forget, output) to control information flow. It can selectively remember or forget information, making it effective for long sequences.",
      type: 'what'
    },
    {
      question: "How do LSTM gates work?",
      answer: "LSTM gates use sigmoid activation to produce values between 0 and 1, acting as controllers. The forget gate decides what to discard, the input gate decides what to store, and the output gate decides what to expose from the memory cell.",
      type: 'how'
    }
  ],
  'applications': [
    {
      question: "Why are RNNs good for natural language processing?",
      answer: "RNNs excel at NLP because language is inherently sequential with complex dependencies. They can capture context, grammar, and meaning by processing words in order while maintaining memory of previous words.",
      type: 'why'
    },
    {
      question: "What are common RNN applications?",
      answer: "Common applications include: machine translation, text generation, sentiment analysis, speech recognition, time series prediction, music generation, handwriting recognition, and video analysis.",
      type: 'what'
    },
    {
      question: "How are RNNs used in practice?",
      answer: "In practice, RNNs are often used in encoder-decoder architectures for sequence-to-sequence tasks, combined with attention mechanisms for better performance, and trained with techniques like teacher forcing and scheduled sampling.",
      type: 'how'
    }
  ]
}

export default function RNNTracer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeStep, setCurrentTimeStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1500)
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('tracer')
  const [showGradients, setShowGradients] = useState(false)

  // Sample sequence: "hello"
  const sequence = ['h', 'e', 'l', 'l', 'o']
  
  // Hidden states for each time step
  const [hiddenStates, setHiddenStates] = useState<number[][]>([
    [0.1, 0.2], // Initial hidden state
    [0.3, 0.4], // After 'h'
    [0.5, 0.6], // After 'e'
    [0.7, 0.8], // After 'l'
    [0.9, 0.1], // After 'l'
    [0.2, 0.3]  // After 'o'
  ])

  // Outputs for each time step
  const [outputs, setOutputs] = useState<number[][]>([
    [0.1, 0.3, 0.6], // After 'h'
    [0.2, 0.4, 0.4], // After 'e'
    [0.5, 0.1, 0.4], // After 'l'
    [0.3, 0.7, 0.0], // After 'l'
    [0.6, 0.2, 0.2]  // After 'o'
  ])

  // Gradient flow visualization
  const [gradientFlow, setGradientFlow] = useState<number[][]>([
    [1.0, 0.8, 0.6, 0.4, 0.2], // Forward gradients
    [0.2, 0.4, 0.6, 0.8, 1.0]  // Backward gradients
  ])

  // Animation logic
  useEffect(() => {
    if (isPlaying && currentTimeStep < sequence.length) {
      const timer = setTimeout(() => {
        setCurrentTimeStep(currentTimeStep + 1)
      }, animationSpeed)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentTimeStep >= sequence.length) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentTimeStep, animationSpeed])

  const handlePlay = () => {
    setCurrentTimeStep(0)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setCurrentTimeStep(0)
    setIsPlaying(false)
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

  const StateVisualization = ({ 
    title, 
    values, 
    isActive, 
    qaSection 
  }: { 
    title: string, 
    values: number[], 
    isActive: boolean,
    qaSection?: string 
  }) => (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 justify-center">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1 : 0.8, 
                opacity: 1,
                backgroundColor: isActive ? `rgba(59, 130, 246, ${Math.abs(value)})` : undefined
              }}
              transition={{ delay: index * 0.1 }}
              className="w-12 h-12 rounded-lg border-2 border-primary/20 flex items-center justify-center text-sm font-mono"
              style={{
                backgroundColor: isActive ? `rgba(59, 130, 246, ${Math.abs(value)})` : 'rgba(0, 0, 0, 0.05)',
                color: isActive && Math.abs(value) > 0.5 ? 'white' : 'black'
              }}
            >
              {value.toFixed(1)}
            </motion.div>
          ))}
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

  const SequenceStep = ({ 
    char, 
    index, 
    isActive, 
    isCompleted 
  }: { 
    char: string, 
    index: number, 
    isActive: boolean,
    isCompleted: boolean 
  }) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isActive ? 1.2 : isCompleted ? 1 : 0.8, 
        opacity: 1 
      }}
      transition={{ delay: index * 0.1 }}
      className={`
        w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300
        ${isActive 
          ? 'border-primary bg-primary text-primary-foreground scale-110' 
          : isCompleted 
            ? 'border-green-500 bg-green-100 text-green-800' 
            : 'border-gray-300 bg-gray-100 text-gray-600'
        }
      `}
    >
      {char}
    </motion.div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-purple-500 bg-opacity-10 rounded-lg">
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold">RNN Tracer</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleQA('overview')}
            className="h-8 w-8 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trace how information flows through Recurrent Neural Networks across time steps
        </p>
        
        <AnimatePresence>
          {expandedQA.has('overview') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Card className="text-left">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {qaData['overview']?.map((qa, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getQAIcon(qa.type)}
                          <h4 className={`font-semibold ${getQAColor(qa.type)}`}>
                            {qa.type.toUpperCase()}: {qa.question}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                          {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sequence Tracer
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Learning Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracer" className="space-y-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Sequence Processing Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Process Sequence
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPlaying(false)}
                    disabled={!isPlaying}
                    className="flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Animation Speed: {animationSpeed}ms</label>
                  <Slider
                    value={[animationSpeed]}
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                    max={3000}
                    min={500}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Processing sequence: "{sequence.join('')}" | Time Step: {currentTimeStep}/{sequence.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sequence Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Input Sequence
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('sequence')}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Watch how the RNN processes each character in sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 justify-center">
                  {sequence.map((char, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <SequenceStep 
                        char={char} 
                        index={index} 
                        isActive={index === currentTimeStep && isPlaying}
                        isCompleted={index < currentTimeStep || (!isPlaying && currentTimeStep === sequence.length)}
                      />
                      {index < sequence.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {expandedQA.has('sequence') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-3"
                    >
                      <Separator />
                      <div className="space-y-3">
                        {qaData['sequence']?.map((qa, index) => (
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
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hidden States Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Hidden States Evolution
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('hidden')}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Watch how hidden states change as the network processes the sequence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">Initial</div>
                      <StateVisualization 
                        title="" 
                        values={hiddenStates[0]} 
                        isActive={false}
                      />
                    </div>
                    {sequence.map((char, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-muted-foreground mb-2">'{char}'</div>
                        <StateVisualization 
                          title="" 
                          values={hiddenStates[index + 1]} 
                          isActive={index === currentTimeStep - 1 && isPlaying}
                        />
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {expandedQA.has('hidden') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <Separator />
                        <div className="space-y-3">
                          {qaData['hidden']?.map((qa, index) => (
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
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Outputs and Gradient Flow */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Output Sequence */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Output Sequence
                  </CardTitle>
                  <CardDescription>
                    Outputs generated at each time step
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sequence.map((char, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Badge variant="outline">'{char}'</Badge>
                        <div className="flex-1 flex gap-1">
                          {outputs[index].map((value, valIndex) => (
                            <div
                              key={valIndex}
                              className="flex-1 h-6 rounded flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: `rgba(34, 197, 94, ${value})`,
                                color: value > 0.5 ? 'white' : 'black'
                              }}
                            >
                              {value.toFixed(1)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gradient Flow */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Gradient Flow
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGradients(!showGradients)}
                    >
                      {showGradients ? 'Hide' : 'Show'} Gradients
                    </Button>
                  </div>
                  <CardDescription>
                    Visualizing vanishing gradient problem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {showGradients && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Forward Pass Gradients</h4>
                        <div className="flex gap-1">
                          {gradientFlow[0].map((value, index) => (
                            <div
                              key={index}
                              className="flex-1 h-8 rounded flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${value})`,
                                color: value > 0.5 ? 'white' : 'black'
                              }}
                            >
                              {value.toFixed(1)}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Backward Pass Gradients</h4>
                        <div className="flex gap-1">
                          {gradientFlow[1].map((value, index) => (
                            <div
                              key={index}
                              className="flex-1 h-8 rounded flex items-center justify-center text-xs"
                              style={{
                                backgroundColor: `rgba(239, 68, 68, ${value})`,
                                color: value > 0.5 ? 'white' : 'black'
                              }}
                            >
                              {value.toFixed(1)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleQA('vanishing')}
                        className="w-full"
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Learn About Vanishing Gradients
                      </Button>

                      <AnimatePresence>
                        {expandedQA.has('vanishing') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                          >
                            <Separator />
                            <div className="space-y-3">
                              {qaData['vanishing']?.map((qa, index) => (
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
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* LSTM Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    LSTM vs Simple RNN
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('lstm')}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  How LSTMs solve the vanishing gradient problem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-red-600">Simple RNN</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        <span>Single recurrent connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Prone to vanishing gradients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Limited short-term memory</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 text-green-600">LSTM</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        <span>Multiple gated connections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Preserves gradient flow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Long-term memory capability</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <AnimatePresence>
                  {expandedQA.has('lstm') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-3"
                    >
                      <Separator />
                      <div className="space-y-3">
                        {qaData['lstm']?.map((qa, index) => (
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
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Comprehensive RNN Learning Guide
                </CardTitle>
                <CardDescription>
                  Master recurrent neural networks with detailed Q&A explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(qaData).map(([section, qaList]) => (
                  <Collapsible key={section} open={expandedQA.has(`learn-${section}`)} onOpenChange={() => toggleQA(`learn-${section}`)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          <span className="font-semibold capitalize">
                            {section === 'overview' ? 'Overview' :
                             section === 'hidden' ? 'Hidden States' :
                             section === 'sequence' ? 'Sequence Processing' :
                             section === 'vanishing' ? 'Vanishing Gradients' :
                             section === 'lstm' ? 'LSTM Networks' :
                             section === 'applications' ? 'Applications' : section}
                          </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedQA.has(`learn-${section}`) ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 space-y-4"
                      >
                        {qaList.map((qa, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${getQAColor(qa.type)}`}>
                                {getQAIcon(qa.type)}
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className={`font-semibold ${getQAColor(qa.type)}`}>
                                  {qa.type.toUpperCase()}: {qa.question}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {qa.answer}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}