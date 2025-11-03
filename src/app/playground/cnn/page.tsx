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
  Grid3x3,
  Layers,
  Eye,
  HelpCircle,
  Target,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Move,
  Maximize2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CNNVisualizerComponent from "@/components/cnn-visualizer"
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
      question: "Why do we need Convolutional Neural Networks?",
      answer: "CNNs are specifically designed to process grid-like data such as images. They use convolution operations to automatically learn spatial hierarchies of features, making them far more efficient and effective than traditional neural networks for image tasks.",
      type: 'why'
    },
    {
      question: "What is a Convolutional Neural Network?",
      answer: "A CNN is a deep learning architecture that uses convolution layers to automatically detect features in images. It consists of convolution layers, pooling layers, and fully connected layers that work together to classify or process visual data.",
      type: 'what'
    },
    {
      question: "How do CNNs learn features?",
      answer: "CNNs learn through backpropagation, where filters automatically adjust to detect patterns. Early layers learn simple features like edges and colors, while deeper layers combine these to learn complex patterns like shapes and objects.",
      type: 'how'
    }
  ],
  'convolution': [
    {
      question: "Why is convolution better than fully connected layers for images?",
      answer: "Convolution preserves spatial relationships and shares parameters across the image, making it translation invariant and much more parameter-efficient. This allows CNNs to detect features regardless of their position in the image.",
      type: 'why'
    },
    {
      question: "What is convolution in CNNs?",
      answer: "Convolution is a mathematical operation that slides a filter (kernel) over the input image, computing dot products to create feature maps. Each filter detects specific patterns like edges, corners, or textures.",
      type: 'what'
    },
    {
      question: "How does convolution work step by step?",
      answer: "1. Place filter on top of image region, 2. Multiply overlapping values, 3. Sum all products, 4. Add bias, 5. Apply activation function, 6. Slide filter to next position, 7. Repeat until entire image is processed.",
      type: 'how'
    }
  ],
  'filters': [
    {
      question: "Why do CNNs need multiple filters?",
      answer: "Multiple filters allow the network to detect different types of features simultaneously. Some filters might detect horizontal edges, others vertical edges, corners, or textures. This diversity creates rich feature representations.",
      type: 'why'
    },
    {
      question: "What are CNN filters and kernels?",
      answer: "Filters (or kernels) are small matrices of weights that slide over the input to detect specific patterns. Each filter specializes in detecting one type of feature, like edges, corners, or particular textures.",
      type: 'what'
    },
    {
      question: "How do filters learn to detect features?",
      answer: "Filters start with random weights and are updated through backpropagation. During training, they gradually adjust their weights to minimize the loss function, automatically learning to detect useful patterns for the task.",
      type: 'how'
    }
  ],
  'pooling': [
    {
      question: "Why do we need pooling layers?",
      answer: "Pooling reduces spatial dimensions, making the network more robust to small translations and reducing computational complexity. It also helps create a hierarchy of features and prevents overfitting.",
      type: 'why'
    },
    {
      question: "What is pooling in CNNs?",
      answer: "Pooling is a down-sampling operation that reduces the spatial dimensions of feature maps. Common types include max pooling (takes maximum value) and average pooling (takes average value) in each pooling window.",
      type: 'what'
    },
    {
      question: "How does max pooling work?",
      answer: "Max pooling slides a window over the feature map and takes the maximum value in each window. For a 2x2 pool with stride 2, it divides the feature map size by 4 while keeping the strongest activation in each region.",
      type: 'how'
    }
  ],
  'activation': [
    {
      question: "Why do we need activation functions in CNNs?",
      answer: "Activation functions introduce non-linearity, allowing CNNs to learn complex patterns. Without them, CNNs would just be linear transformations, severely limiting their ability to solve complex problems.",
      type: 'why'
    },
    {
      question: "What is ReLU activation?",
      answer: "ReLU (Rectified Linear Unit) is the most common activation function in CNNs. It outputs the input if positive, and 0 if negative. It's simple, computationally efficient, and helps with the vanishing gradient problem.",
      type: 'what'
    },
    {
      question: "How does ReLU work in CNNs?",
      answer: "After convolution, each value in the feature map passes through ReLU: f(x) = max(0, x). Negative values become 0, positive values remain unchanged. This creates sparse representations and helps the network learn faster.",
      type: 'how'
    }
  ],
  'features': [
    {
      question: "Why do CNNs learn hierarchical features?",
      answer: "Hierarchical features allow CNNs to build complex representations from simple ones. Early layers detect edges, middle layers combine edges into shapes, and deep layers combine shapes into objects, mirroring human visual processing.",
      type: 'why'
    },
    {
      question: "What are feature hierarchies in CNNs?",
      answer: "Feature hierarchies refer to how CNNs learn increasingly complex features at each layer. Layer 1 learns edges, Layer 2 learns textures and simple shapes, Layer 3 learns object parts, and deeper layers learn complete objects.",
      type: 'what'
    },
    {
      question: "How do feature hierarchies emerge during training?",
      answer: "Through backpropagation, early layers learn simple features useful for the task. Later layers build upon these features, combining them to create more complex representations. This happens automatically as the network minimizes loss.",
      type: 'how'
    }
  ]
}

export default function CNNVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState(0)
  const [convolutionSpeed, setConvolutionSpeed] = useState(1000)
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('convolution')
  const [convolutionLog, setConvolutionLog] = useState<string[]>([])
  const [showLog, setShowLog] = useState(false)

  // Helper function
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

  // Sample input image (5x5)
  const [inputImage] = useState<number[][]>([
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0]
  ])

  // Sample filters
  const [filters] = useState<number[][][]>([
    // Edge detection filter
    [
      [-1, -1, -1],
      [-1,  8, -1],
      [-1, -1, -1]
    ],
    // Horizontal line detector
    [
      [-1, -1, -1],
      [ 2,  2,  2],
      [-1, -1, -1]
    ],
    // Vertical line detector
    [
      [-1,  2, -1],
      [-1,  2, -1],
      [-1,  2, -1]
    ]
  ])

  // Apply convolution
  const applyConvolution = (image: number[][], filter: number[][]) => {
    const imageSize = image.length
    const filterSize = filter.length
    const outputSize = imageSize - filterSize + 1
    const output: number[][] = []

    for (let i = 0; i < outputSize; i++) {
      output[i] = []
      for (let j = 0; j < outputSize; j++) {
        let sum = 0
        for (let fi = 0; fi < filterSize; fi++) {
          for (let fj = 0; fj < filterSize; fj++) {
            sum += image[i + fi][j + fj] * filter[fi][fj]
          }
        }
        output[i][j] = Math.max(0, sum) // ReLU activation
      }
    }
    return output
  }

  // Apply max pooling
  const applyMaxPooling = (featureMap: number[][]) => {
    const size = featureMap.length
    const pooledSize = Math.floor(size / 2)
    const pooled: number[][] = []

    for (let i = 0; i < pooledSize; i++) {
      pooled[i] = []
      for (let j = 0; j < pooledSize; j++) {
        let max = -Infinity
        for (let pi = 0; pi < 2; pi++) {
          for (let pj = 0; pj < 2; pj++) {
            max = Math.max(max, featureMap[i * 2 + pi][j * 2 + pj])
          }
        }
        pooled[i][j] = max
      }
    }
    return pooled
  }

  // Generate detailed convolution log
  const generateConvolutionLog = () => {
    const log: string[] = []
    const filter = filters[selectedFilter]
    
    log.push("🚀 Starting CNN Convolution Process")
    log.push("=" .repeat(50))
    log.push("")
    
    log.push("📊 INPUT IMAGE (5x5):")
    log.push("Cross pattern with center emphasis")
    inputImage.forEach((row, i) => {
      log.push(`  Row ${i + 1}: [${row.join(', ')}]`)
    })
    log.push("")
    
    log.push("🔧 SELECTED FILTER:")
    log.push(`Filter ${selectedFilter + 1}: ${selectedFilter === 0 ? 'Edge Detection' : selectedFilter === 1 ? 'Horizontal Line' : 'Vertical Line'}`)
    filter.forEach((row, i) => {
      log.push(`  Row ${i + 1}: [${row.join(', ')}]`)
    })
    log.push("")
    
    log.push("🔄 CONVOLUTION PROCESS:")
    log.push("Applying filter with stride 1, no padding")
    log.push("Output size: (5-3+1) x (5-3+1) = 3x3")
    log.push("")
    
    // Calculate each position
    for (let outputRow = 0; outputRow < 3; outputRow++) {
      for (let outputCol = 0; outputCol < 3; outputCol++) {
        log.push(`📍 Position [${outputRow + 1}, ${outputCol + 1}]:`)
        log.push(`   Filter placed at input rows ${outputRow + 1}-${outputRow + 3}, cols ${outputCol + 1}-${outputCol + 3}`)
        
        let sum = 0
        const calculations: string[] = []
        
        for (let filterRow = 0; filterRow < 3; filterRow++) {
          for (let filterCol = 0; filterCol < 3; filterCol++) {
            const inputVal = inputImage[outputRow + filterRow][outputCol + filterCol]
            const filterVal = filter[filterRow][filterCol]
            const product = inputVal * filterVal
            sum += product
            
            if (inputVal !== 0 || filterVal !== 0) {
              calculations.push(`     ${inputVal} × ${filterVal} = ${product}`)
            }
          }
        }
        
        if (calculations.length > 0) {
          log.push("   Calculations:")
          log.push(calculations.join('\n'))
          log.push(`   Sum: ${sum}`)
        } else {
          log.push("   All multiplications = 0")
        }
        
        // Apply ReLU
        const reluResult = Math.max(0, sum)
        log.push(`   ReLU(max(0, ${sum})) = ${reluResult}`)
        log.push(`   ✅ Feature Map [${outputRow + 1}, ${outputCol + 1}] = ${reluResult}`)
        log.push("")
      }
    }
    
    log.push("📈 FEATURE MAP RESULT (3x3):")
    const finalFeatureMap = applyConvolution(inputImage, filter)
    finalFeatureMap.forEach((row, i) => {
      log.push(`  Row ${i + 1}: [${row.join(', ')}]`)
    })
    log.push("")
    
    log.push("🏊 MAX POOLING PROCESS:")
    log.push("Applying 2x2 max pooling with stride 2")
    log.push("Output size: floor(3/2) x floor(3/2) = 1x1")
    log.push("")
    
    // Pooling calculations
    log.push("📍 Pooling Window [1,1]: covers feature map [1,1] to [2,2]")
    const poolValues = [
      finalFeatureMap[0][0], finalFeatureMap[0][1],
      finalFeatureMap[1][0], finalFeatureMap[1][1]
    ]
    log.push(`   Values: [${poolValues.join(', ')}]`)
    const maxPool = Math.max(...poolValues)
    log.push(`   Max(${poolValues.join(', ')}) = ${maxPool}`)
    log.push(`   ✅ Pooled Map [1,1] = ${maxPool}`)
    log.push("")
    
    log.push("📊 FINAL POOLED MAP (1x1):")
    const finalPooledMap = applyMaxPooling(finalFeatureMap)
    finalPooledMap.forEach((row, i) => {
      log.push(`  Row ${i + 1}: [${row.join(', ')}]`)
    })
    log.push("")
    
    log.push("🎯 SUMMARY:")
    log.push(`✅ Input: 5x5 image with cross pattern`)
    log.push(`✅ Filter: ${selectedFilter === 0 ? 'Edge Detection' : selectedFilter === 1 ? 'Horizontal Line' : 'Vertical Line'} kernel`)
    log.push(`✅ Feature Map: 3x3 with ReLU activation`)
    log.push(`✅ Pooled Map: 1x1 after max pooling`)
    log.push(`✅ Final Output: ${finalPooledMap[0][0]}`)
    log.push("")
    log.push("🔍 Key Insights:")
    if (selectedFilter === 0) {
      log.push("• Edge detection filter highlights the cross shape")
      log.push("• Center of cross produces strongest activation")
      log.push("• ReLU removes negative values, keeping only detected features")
    } else if (selectedFilter === 1) {
      log.push("• Horizontal line detector responds to horizontal patterns")
      log.push("• Middle row of cross triggers highest response")
      log.push("• Vertical elements are suppressed by this filter")
    } else {
      log.push("• Vertical line detector responds to vertical patterns")
      log.push("• Middle column of cross triggers highest response")
      log.push("• Horizontal elements are suppressed by this filter")
    }
    log.push("• Max pooling preserves strongest feature while reducing size")
    log.push("=" .repeat(50))
    log.push("✨ Convolution Complete!")
    
    return log
  }

  // Compute outputs
  const featureMap = applyConvolution(inputImage, filters[selectedFilter])
  const pooledMap = applyMaxPooling(featureMap)

  // Animation control
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < 8) {
          setCurrentStep(currentStep + 1)
        } else {
          setIsPlaying(false)
        }
      }, convolutionSpeed)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, convolutionSpeed])

  const handlePlay = () => {
    setCurrentStep(0)
    setIsPlaying(true)
    setShowLog(true)
    const log = generateConvolutionLog()
    setConvolutionLog(log)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
    setShowLog(false)
    setConvolutionLog([])
  }

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
          <div className="p-3 bg-blue-500 bg-opacity-10 rounded-lg">
            <Grid3x3 className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold">CNN Visualizer</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleQA('overview')}
            className="h-8 w-8 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">
          Explore how Convolutional Neural Networks process images through interactive visualizations
        </p>
      </motion.div>

      {/* Overview Q&A */}
      <AnimatePresence>
        {expandedQA.has('overview') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {qaData['overview']?.map((qa, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {qa.type === 'why' && <Target className="h-4 w-4 text-blue-600" />}
                        {qa.type === 'what' && <Info className="h-4 w-4 text-green-600" />}
                        {qa.type === 'how' && <Lightbulb className="h-4 w-4 text-purple-600" />}
                        <h4 className={`font-semibold ${
                          qa.type === 'why' ? 'text-blue-600' :
                          qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                        }`}>
                          {qa.type.toUpperCase()}: {qa.question}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
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

      {/* CNN Visualizer Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              CNN Visualizer: Pooling Layers Deep Dive
            </CardTitle>
            <CardDescription>
              Understand WHY, WHAT, and HOW of pooling layers with detailed animations and mathematical explanations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CNNVisualizerComponent />
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="convolution">Convolution</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="pooling">Pooling</TabsTrigger>
          <TabsTrigger value="learn">Learn</TabsTrigger>
        </TabsList>

        {/* Convolution Tab */}
        <TabsContent value="convolution" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="h-5 w-5" />
                  Convolution Operation
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleQA('convolution')}
                  className="h-6 w-6 p-0"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                See how filters slide over images to create feature maps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Controls */}
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
                    variant={isPlaying ? "destructive" : "default"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={() => setShowLog(!showLog)}
                    variant={showLog ? "default" : "outline"}
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showLog ? 'Hide Log' : 'Show Log'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Speed:</span>
                    <Slider
                      value={[convolutionSpeed]}
                      onValueChange={(value) => setConvolutionSpeed(value[0])}
                      max={2000}
                      min={500}
                      step={100}
                      className="w-32"
                    />
                  </div>
                </div>

                {/* Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Input Image */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Input Image</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-5 gap-1">
                          {inputImage.map((row, i) =>
                            row.map((val, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`
                                  aspect-square flex items-center justify-center text-sm font-mono rounded border
                                  ${val > 0 
                                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }
                                `}
                              >
                                {val}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Feature Map */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Feature Map</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-1">
                          {featureMap.map((row, i) =>
                            row.map((val, j) => (
                              <motion.div
                                key={`${i}-${j}`}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ 
                                  scale: 1, 
                                  opacity: 1,
                                  backgroundColor: isPlaying && currentStep === i * 3 + j ? 'rgb(59, 130, 246)' : undefined,
                                  color: isPlaying && currentStep === i * 3 + j ? 'white' : undefined
                                }}
                                transition={{ delay: (i * 3 + j) * 0.1 }}
                                className={`
                                  aspect-square flex items-center justify-center text-sm font-mono rounded border
                                  ${val > 0 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }
                                `}
                              >
                                {val}
                              </motion.div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Pooled Map */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Pooled Map</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-1">
                          {pooledMap.map((row, i) =>
                            row.map((val, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`
                                  aspect-square flex items-center justify-center text-sm font-mono rounded border
                                  ${val > 0 
                                    ? 'bg-orange-100 text-orange-800 border-orange-200' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                  }
                                `}
                              >
                                {val}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>

              {/* Convolution Q&A */}
              <AnimatePresence>
                {expandedQA.has('convolution') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {qaData['convolution']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  CNN Filters & Kernels
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleQA('filters')}
                  className="h-6 w-6 p-0"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Select different filters to see how they detect different features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {filters.map((filter, index) => (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedFilter === index ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedFilter(index)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center mb-2">
                        <Badge variant="outline">Filter {index + 1}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {filter.map((row, i) =>
                          row.map((val, j) => (
                            <div
                              key={`${i}-${j}`}
                              className={`
                                aspect-square flex items-center justify-center text-sm font-mono rounded
                                ${val > 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : val < 0 
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-600'
                                }
                              `}
                            >
                              {val}
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters Q&A */}
              <AnimatePresence>
                {expandedQA.has('filters') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {qaData['filters']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Convolution Log */}
          <AnimatePresence>
            {showLog && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Convolution Process Log
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLog(false)}
                        className="h-6 w-6 p-0"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      Step-by-step breakdown of the convolution operation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
                        {convolutionLog.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                              ${line.includes('🚀') || line.includes('✨') ? 'text-green-600 font-bold' : ''}
                              ${line.includes('📊') || line.includes('🔧') || line.includes('📈') || line.includes('🏊') ? 'text-blue-600 font-semibold' : ''}
                              ${line.includes('🔄') || line.includes('📍') ? 'text-purple-600 font-semibold' : ''}
                              ${line.includes('✅') ? 'text-green-600' : ''}
                              ${line.includes('🎯') || line.includes('🔍') ? 'text-orange-600 font-semibold' : ''}
                              ${line.includes('=') ? 'border-b border-gray-300 pb-1 mb-1' : ''}
                            `}
                          >
                            {line}
                          </motion.div>
                        ))}
                      </pre>
                    </div>
                    {convolutionLog.length > 0 && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => {
                            const log = generateConvolutionLog()
                            setConvolutionLog(log)
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Refresh Log
                        </Button>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(convolutionLog.join('\n'))
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Copy Log
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Pooling Tab */}
        <TabsContent value="pooling" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Maximize2 className="h-5 w-5" />
                  Pooling Layers
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleQA('pooling')}
                  className="h-6 w-6 p-0"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                See how pooling reduces spatial dimensions while preserving important features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Before Pooling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-1">
                      {featureMap.map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`
                              aspect-square flex items-center justify-center text-sm font-mono rounded border
                              ${val > 0 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                              }
                            `}
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">After Max Pooling</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-1">
                      {pooledMap.map((row, i) =>
                        row.map((val, j) => (
                          <div
                            key={`${i}-${j}`}
                            className={`
                              aspect-square flex items-center justify-center text-sm font-mono rounded border
                              ${val > 0 
                                ? 'bg-orange-100 text-orange-800 border-orange-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                              }
                            `}
                          >
                            {val}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pooling Q&A */}
              <AnimatePresence>
                {expandedQA.has('pooling') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <Separator className="mb-4" />
                    <div className="space-y-3">
                      {qaData['pooling']?.map((qa, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${
                              qa.type === 'why' ? 'text-blue-600' :
                              qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                            }`}>
                              {qa.type === 'why' && <Target className="h-4 w-4" />}
                              {qa.type === 'what' && <Info className="h-4 w-4" />}
                              {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className={`font-semibold ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type.toUpperCase()}: {qa.question}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {qa.answer}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learn Tab */}
        <TabsContent value="learn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Comprehensive Learning Guide
              </CardTitle>
              <CardDescription>
                Master CNN concepts through detailed explanations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['activation', 'features'].map((section) => (
                  <Collapsible
                    key={section}
                    open={expandedQA.has(`learn-${section}`)}
                    onOpenChange={() => toggleQA(`learn-${section}`)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto"
                      >
                        <div className="flex items-center gap-2">
                          <Grid3x3 className="h-5 w-5" />
                          <span className="font-semibold capitalize">
                            {section === 'activation' ? 'Activation Functions' :
                             section === 'features' ? 'Feature Hierarchies' : section}
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
                        {qaData[section]?.map((qa, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 ${
                                qa.type === 'why' ? 'text-blue-600' :
                                qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                              }`}>
                                {qa.type === 'why' && <Target className="h-4 w-4" />}
                                {qa.type === 'what' && <Info className="h-4 w-4" />}
                                {qa.type === 'how' && <Lightbulb className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className={`font-semibold ${
                                  qa.type === 'why' ? 'text-blue-600' :
                                  qa.type === 'what' ? 'text-green-600' : 'text-purple-600'
                                }`}>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}