'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ArrowRight, 
  Type, 
  Play, 
  RotateCcw,
  Sparkles,
  BookOpen,
  Zap,
  Hash,
  Grid3x3,
  Eye,
  Layers,
  HelpCircle,
  Target,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BackButton from "@/components/BackButton"

// Sample texts for demonstration
const sampleTexts = [
  {
    label: "Simple Sentence",
    text: "Hello world! How are you today?"
  },
  {
    label: "ML Example",
    text: "Machine learning is a subset of artificial intelligence."
  },
  {
    label: "Complex Text",
    text: "Transformers revolutionized natural language processing with self-attention mechanisms."
  }
]

// Tokenization methods
const tokenizationMethods = {
  whitespace: {
    name: "Whitespace",
    description: "Splits text on spaces and newlines",
    icon: Hash,
    color: "bg-blue-500"
  },
  character: {
    name: "Character",
    description: "Each character becomes a token",
    icon: Type,
    color: "bg-green-500"
  },
  subword: {
    name: "Subword (BPE)",
    description: "Breaks words into meaningful sub-units",
    icon: Layers,
    color: "bg-purple-500"
  }
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
      question: "Why do we need tokenization in machine learning?",
      answer: "Machine learning models can't process raw text directly. Tokenization converts text into numerical representations that models can understand. It's the first step in natural language processing that bridges the gap between human language and machine computation.",
      type: 'why'
    },
    {
      question: "What is tokenization?",
      answer: "Tokenization is the process of breaking down text into smaller units called tokens. These tokens can be words, characters, or subwords, depending on the tokenization strategy used. Each token is then mapped to a numerical ID for model processing.",
      type: 'what'
    },
    {
      question: "How does tokenization work in modern NLP models?",
      answer: "Modern NLP models use sophisticated tokenization algorithms like BPE (Byte-Pair Encoding) or WordPiece. These methods build a vocabulary of common subword units by analyzing large text corpora, then use this vocabulary to break new text into familiar pieces.",
      type: 'how'
    }
  ],
  'methods': [
    {
      question: "Why are there different tokenization methods?",
      answer: "Different methods balance different trade-offs. Whitespace is simple but struggles with unknown words, character-level handles any text but creates long sequences, and subword provides a balance by breaking rare words into familiar pieces while keeping common words intact.",
      type: 'why'
    },
    {
      question: "What are the main types of tokenization?",
      answer: "The main types are: Whitespace tokenization (splits on spaces), Character tokenization (each character is a token), and Subword tokenization (breaks words into meaningful sub-units like 'un-', 'happy', '-ness').",
      type: 'what'
    },
    {
      question: "How do I choose the right tokenization method?",
      answer: "Choose based on your use case: Whitespace for simple applications with clean text, Character for languages with complex morphology or when handling any text, Subword for most modern NLP applications as it provides the best balance of vocabulary size and representation quality.",
      type: 'how'
    }
  ],
  'whitespace': [
    {
      question: "Why use whitespace tokenization?",
      answer: "Whitespace tokenization is simple, fast, and intuitive. It works well for languages with clear word boundaries like English and is easy to implement. It's a good starting point for basic text processing tasks.",
      type: 'why'
    },
    {
      question: "What does whitespace tokenization do?",
      answer: "Whitespace tokenization splits text wherever it encounters spaces, tabs, or newlines. Each resulting sequence of characters between whitespace becomes a token. For example, 'Hello world' becomes ['Hello', 'world'].",
      type: 'what'
    },
    {
      question: "How does whitespace tokenization handle punctuation?",
      answer: "Basic whitespace tokenization treats punctuation as part of words, so 'world!' becomes a single token. More advanced versions might separate punctuation first. This method struggles with contractions like 'don't' and compound words.",
      type: 'how'
    }
  ],
  'character': [
    {
      question: "Why would we use character-level tokenization?",
      answer: "Character tokenization eliminates the vocabulary problem entirely - there are only so many characters. It handles any text, including typos, rare words, and different languages. It's also computationally predictable and memory efficient.",
      type: 'why'
    },
    {
      question: "What is character-level tokenization?",
      answer: "Character tokenization breaks text into individual characters. Each character (including spaces and punctuation) becomes a separate token. 'Hello' becomes ['H', 'e', 'l', 'l', 'o'].",
      type: 'what'
    },
    {
      question: "How do models handle character tokenization output?",
      answer: "Models using character tokenization typically learn to combine characters into meaningful patterns during training. They might use CNNs, RNNs, or attention mechanisms to learn character-level relationships and build word-like representations.",
      type: 'how'
    }
  ],
  'subword': [
    {
      question: "Why is subword tokenization popular in modern models?",
      answer: "Subword tokenization offers the best of both worlds: it handles unknown words by breaking them into familiar pieces, keeps common words intact for efficiency, and reduces vocabulary size compared to word-level tokenization. Models like GPT and BERT use it.",
      type: 'why'
    },
    {
      question: "What is subword tokenization?",
      answer: "Subword tokenization breaks words into meaningful sub-units. For example, 'unhappiness' might become ['un', 'happ', 'iness']. It uses algorithms like BPE to learn common subword patterns from training data.",
      type: 'what'
    },
    {
      question: "How does BPE (Byte-Pair Encoding) work?",
      answer: "BPE starts with individual characters and iteratively merges the most frequent adjacent pairs. For example, if 'e' and 'r' often appear together, they merge into 'er'. This continues until reaching a desired vocabulary size, creating meaningful subword units.",
      type: 'how'
    }
  ],
  'vocabulary': [
    {
      question: "Why do we need a vocabulary mapping?",
      answer: "Models need numerical inputs, not text tokens. A vocabulary maps each unique token to a unique ID, creating a consistent way to convert between human-readable tokens and model-readable numbers. This mapping is essential for training and inference.",
      type: 'why'
    },
    {
      question: "What is a vocabulary in tokenization?",
      answer: "A vocabulary is a mapping between tokens and numerical IDs. It's essentially a dictionary where each unique token gets assigned a unique integer. For example, {'hello': 0, 'world': 1, '!': 2}. The vocabulary size affects model complexity and memory usage.",
      type: 'what'
    },
    {
      question: "How is a vocabulary created and used?",
      answer: "Vocabularies are created by analyzing training text and selecting the most common tokens up to a desired size. During tokenization, each token is looked up in the vocabulary and replaced with its corresponding ID. Unknown tokens might get a special UNK token ID.",
      type: 'how'
    }
  ],
  'embeddings': [
    {
      question: "Why do we need embeddings after tokenization?",
      answer: "Token IDs are just integers with no inherent meaning. Embeddings convert these discrete IDs into dense, continuous vectors that capture semantic relationships. These vectors allow models to understand that 'king' and 'queen' are related, or that 'run' and 'running' have similar meanings.",
      type: 'why'
    },
    {
      question: "What are token embeddings?",
      answer: "Token embeddings are high-dimensional vectors (typically 128-4096 dimensions) that represent the meaning of each token. Each dimension captures different aspects of the token's meaning and usage. Similar tokens have similar vectors in this semantic space.",
      type: 'what'
    },
    {
      question: "How are embeddings learned and used?",
      answer: "Embeddings are learned during model training through backpropagation. They start as random vectors and are gradually adjusted to minimize the loss on the training task. During inference, each token ID is looked up in an embedding table to get its vector representation.",
      type: 'how'
    }
  ],
  'statistics': [
    {
      question: "Why are tokenization statistics important?",
      answer: "Statistics help us understand the efficiency and impact of our tokenization choices. They reveal compression ratios, vocabulary usage, and potential issues like too many unknown tokens or overly long sequences that could affect model performance.",
      type: 'why'
    },
    {
      question: "What do tokenization statistics tell us?",
      answer: "Statistics show: character-to-token ratio (compression efficiency), vocabulary size (memory usage), token sequence length (affects model speed), and unique token count (vocabulary utilization). These metrics help optimize tokenization for specific use cases.",
      type: 'what'
    },
    {
      question: "How can we use tokenization statistics to improve models?",
      answer: "By analyzing statistics, we can: adjust vocabulary size for better memory usage, choose optimal tokenization methods for our text domain, identify preprocessing needs, and estimate computational requirements for model deployment.",
      type: 'how'
    }
  ]
}

export default function TokenizerPlayground() {
  const [inputText, setInputText] = useState("Hello world! How are you today?")
  const [tokens, setTokens] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<keyof typeof tokenizationMethods>('whitespace')
  const [currentStep, setCurrentStep] = useState(0)
  const [showEmbeddings, setShowEmbeddings] = useState(false)
  const [vocab, setVocab] = useState<Map<string, number>>(new Map())
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())

  // Tokenization functions
  const tokenize = (text: string, method: keyof typeof tokenizationMethods): string[] => {
    switch (method) {
      case 'whitespace':
        return text.split(/\s+/).filter(token => token.length > 0)
      case 'character':
        return text.split('')
      case 'subword':
        // Simple subword simulation (real BPE is much more complex)
        return text.split(/(\w+|\W)/).filter(token => token.length > 0)
      default:
        return []
    }
  }

  // Create a simple vocabulary
  const createVocabulary = (tokenList: string[]) => {
    const vocabMap = new Map<string, number>()
    tokenList.forEach((token, index) => {
      if (!vocabMap.has(token)) {
        vocabMap.set(token, vocabMap.size)
      }
    })
    return vocabMap
  }

  // Generate mock embeddings (in real models, these would be learned)
  const generateEmbeddings = (tokenIds: number[]) => {
    return tokenIds.map(id => 
      Array.from({ length: 8 }, () => Math.sin(id * Math.random() * 10))
    )
  }

  // Handle tokenization with animation
  const handleTokenize = async () => {
    setIsAnimating(true)
    setCurrentStep(0)
    setShowEmbeddings(false)
    
    const newTokens = tokenize(inputText, selectedMethod)
    const newVocab = createVocabulary(newTokens)
    
    // Animate token creation
    for (let i = 0; i <= newTokens.length; i++) {
      setCurrentStep(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    setTokens(newTokens)
    setVocab(newVocab)
    setIsAnimating(false)
  }

  // Reset everything
  const handleReset = () => {
    setTokens([])
    setCurrentStep(0)
    setShowEmbeddings(false)
    setVocab(new Map())
    setIsAnimating(false)
  }

  // Load sample text
  const loadSampleText = (text: string) => {
    setInputText(text)
    handleReset()
  }

  // Get token IDs from vocabulary
  const getTokenIds = () => {
    return tokens.map(token => vocab.get(token) || 0)
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

  const QASection = ({ qaKey, title, description }: { qaKey: string, title: string, description: string }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleQA(qaKey)}
          className="h-8 w-8 p-0"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
      
      <AnimatePresence>
        {expandedQA.has(qaKey) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <Separator />
            <div className="space-y-3">
              {qaData[qaKey]?.map((qa, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getQAIcon(qa.type)}
                    <h5 className={`font-semibold text-sm ${getQAColor(qa.type)}`}>
                      {qa.type.toUpperCase()}: {qa.question}
                    </h5>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <BackButton />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-500 bg-opacity-10 rounded-lg">
            <Type className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold">Tokenizer Playground</h1>
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
          Watch how text gets converted into tokens that machine learning models can understand. 
          Try different tokenization methods and see how they affect the result!
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

      <Tabs defaultValue="playground" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="playground" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Interactive Playground
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playground" className="space-y-6">
          {/* Method Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    <CardTitle>Choose Tokenization Method</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('methods')}
                    className="h-8 w-8 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Different methods split text in different ways. Try them all!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(tokenizationMethods).map(([key, method]) => (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedMethod === key 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => {
                          setSelectedMethod(key as keyof typeof tokenizationMethods)
                          handleReset()
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${method.color} bg-opacity-10`}>
                              <method.icon className={`h-5 w-5 ${method.color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="font-semibold">{method.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <QASection 
                  qaKey="methods" 
                  title="About Tokenization Methods"
                  description="Learn why different methods exist and when to use each one"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Type your text or choose from the examples below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value)
                      handleReset()
                    }}
                    placeholder="Enter text to tokenize..."
                    className="min-h-[100px] resize-none pr-20"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                    {inputText.length} chars
                  </div>
                </div>
                
                {/* Sample Texts */}
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadSampleText(sample.text)}
                      className="text-xs"
                    >
                      {sample.label}
                    </Button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTokenize} 
                    disabled={isAnimating || !inputText.trim()}
                    className="flex-1"
                  >
                    {isAnimating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                        </motion.div>
                        Tokenizing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Tokenize Text
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isAnimating}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tokenization Results */}
          <AnimatePresence>
            {(tokens.length > 0 || isAnimating) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Grid3x3 className="h-5 w-5" />
                        Tokenization Result
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQA(selectedMethod)}
                        className="h-8 w-8 p-0"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Watch how your text gets broken down into tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Original Text */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Original Text:</h4>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                        {inputText}
                      </div>
                    </div>

                    {/* Tokens Animation */}
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">Tokens ({tokens.length}):</h4>
                      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-muted rounded-lg">
                        {isAnimating ? (
                          // Show tokens appearing one by one
                          tokenize(inputText, selectedMethod).slice(0, currentStep).map((token, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <Badge variant="secondary" className="text-sm px-3 py-1">
                                {token}
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          // Show all tokens with hover effects
                          tokens.map((token, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className="text-sm px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                {token}
                              </Badge>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Method-specific Q&A */}
                    <QASection 
                      qaKey={selectedMethod} 
                      title={`About ${tokenizationMethods[selectedMethod].name} Tokenization`}
                      description={`Learn how ${tokenizationMethods[selectedMethod].name.toLowerCase()} tokenization works and when to use it`}
                    />

                    {/* Token IDs */}
                    {!isAnimating && tokens.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Token IDs:</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQA('vocabulary')}
                            className="h-6 w-6 p-0"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                          {getTokenIds().map((id, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex items-center gap-1"
                            >
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {tokens[index]} → {id}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>

                        <QASection 
                          qaKey="vocabulary" 
                          title="About Vocabulary Mapping"
                          description="Learn how tokens are converted to numerical IDs"
                        />
                      </motion.div>
                    )}

                    {/* Statistics */}
                    {!isAnimating && tokens.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Statistics:</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQA('statistics')}
                            className="h-6 w-6 p-0"
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <Card className="p-3 text-center">
                            <div className="text-2xl font-bold text-blue-500">{inputText.length}</div>
                            <div className="text-xs text-muted-foreground">Characters</div>
                          </Card>
                          <Card className="p-3 text-center">
                            <div className="text-2xl font-bold text-green-500">{tokens.length}</div>
                            <div className="text-xs text-muted-foreground">Tokens</div>
                          </Card>
                          <Card className="p-3 text-center">
                            <div className="text-2xl font-bold text-purple-500">{vocab.size}</div>
                            <div className="text-xs text-muted-foreground">Unique Tokens</div>
                          </Card>
                          <Card className="p-3 text-center">
                            <div className="text-2xl font-bold text-orange-500">
                              {tokens.length > 0 ? (inputText.length / tokens.length).toFixed(1) : '0'}
                            </div>
                            <div className="text-xs text-muted-foreground">Chars/Token</div>
                          </Card>
                        </div>

                        <QASection 
                          qaKey="statistics" 
                          title="About Tokenization Statistics"
                          description="Understand what these metrics tell us about tokenization efficiency"
                        />
                      </motion.div>
                    )}

                    {/* Show Embeddings Button */}
                    {!isAnimating && tokens.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                      >
                        <Button
                          variant="outline"
                          onClick={() => setShowEmbeddings(!showEmbeddings)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          {showEmbeddings ? 'Hide' : 'Show'} Embeddings
                        </Button>
                      </motion.div>
                    )}

                    {/* Embeddings Visualization */}
                    <AnimatePresence>
                      {showEmbeddings && !isAnimating && tokens.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-muted-foreground break-words md:text-sm">
                              Token Embeddings (8-dimensional vectors):
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQA('embeddings')}
                              className="h-6 w-6 p-0"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {tokens.map((token, index) => {
                              const embedding = generateEmbeddings([getTokenIds()[index]])[0]
                              return (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                                >
                                  <Badge variant="secondary" className="min-w-[60px] text-center">
                                    {token}
                                  </Badge>
                                  <div className="flex-1 flex items-center gap-1">
                                    {embedding.map((value, i) => (
                                      <div
                                        key={i}
                                        className="flex-1 h-8 rounded flex items-center justify-center text-xs font-mono"
                                        style={{
                                          backgroundColor: `rgba(59, 130, 246, ${Math.abs(value)})`,
                                          color: Math.abs(value) > 0.5 ? 'white' : 'black'
                                        }}
                                      >
                                        {value.toFixed(2)}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>

                          <QASection 
                            qaKey="embeddings" 
                            title="About Token Embeddings"
                            description="Learn how tokens become meaningful vector representations"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="learn" className="space-y-6">
          {/* Educational Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Comprehensive Learning Guide
                </CardTitle>
                <CardDescription>
                  Master tokenization concepts with detailed Q&A explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(qaData).map(([section, qaList]) => (
                  <Collapsible key={section} open={expandedQA.has(`learn-${section}`)} onOpenChange={() => toggleQA(`learn-${section}`)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                        <div className="flex items-center gap-2">
                          <Type className="h-5 w-5" />
                          <span className="font-semibold capitalize">
                            {section === 'overview' ? 'Overview' :
                             section === 'methods' ? 'Tokenization Methods' :
                             section === 'whitespace' ? 'Whitespace Tokenization' :
                             section === 'character' ? 'Character Tokenization' :
                             section === 'subword' ? 'Subword Tokenization' :
                             section === 'vocabulary' ? 'Vocabulary Mapping' :
                             section === 'embeddings' ? 'Token Embeddings' :
                             section === 'statistics' ? 'Statistics & Analysis' : section}
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