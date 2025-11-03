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
  Move3d,
  Layers,
  Eye
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
      question: "Why do we need Variational Autoencoders?",
      answer: "VAEs provide a principled approach to generative modeling by learning smooth, continuous latent spaces. Unlike traditional autoencoders, VAEs can generate new data by sampling from the learned distribution, making them powerful for creativity and data generation.",
      type: 'why'
    },
    {
      question: "What is a Variational Autoencoder?",
      answer: "A VAE is a generative model that learns to encode input data into a probability distribution (typically Gaussian) in latent space, then decode samples from this distribution to reconstruct or generate new data. It consists of an encoder, decoder, and the reparameterization trick.",
      type: 'what'
    },
    {
      question: "How do VAEs differ from regular autoencoders?",
      answer: "Unlike regular autoencoders that encode to a single point, VAEs encode to a distribution (mean and variance). They use the reparameterization trick for backpropagation and include a KL divergence loss term that regularizes the latent space to be smooth and continuous.",
      type: 'how'
    }
  ],
  'encoder': [
    {
      question: "Why does the VAE encoder output distributions?",
      answer: "Outputting distributions allows the model to capture uncertainty and create a smooth latent space. This enables interpolation between data points and generation of new samples by sampling from the learned distributions, which isn't possible with deterministic encodings.",
      type: 'why'
    },
    {
      question: "What does the VAE encoder do?",
      answer: "The encoder takes input data and outputs the parameters (mean and log-variance) of a Gaussian distribution in latent space. Instead of mapping to a single point, it maps to a probability distribution, capturing the uncertainty about where the input should be encoded.",
      type: 'what'
    },
    {
      question: "How does the encoder learn to produce good distributions?",
      answer: "The encoder is trained to produce distributions that, when sampled from, allow the decoder to reconstruct the original input. The balance between reconstruction loss and KL divergence ensures the distributions are both informative and well-regularized.",
      type: 'how'
    }
  ],
  'latent': [
    {
      question: "Why is the latent space so important in VAEs?",
      answer: "The latent space is where the model learns meaningful representations of data. A well-structured latent space enables smooth interpolation, data generation, and dimensionality reduction. It's the core of what makes VAEs powerful generative models.",
      type: 'why'
    },
    {
      question: "What is latent space in VAEs?",
      answer: "Latent space is a lower-dimensional continuous space where the VAE represents compressed versions of input data. Each point in this space corresponds to a potential generated output, and similar points should produce similar outputs.",
      type: 'what'
    },
    {
      question: "How does VAE create a smooth latent space?",
      answer: "VAEs create smooth latent space through the KL divergence loss term, which encourages the learned distributions to be close to a standard normal distribution. This prevents the model from 'cheating' by using discontinuous regions of space.",
      type: 'how'
    }
  ],
  'sampling': [
    {
      question: "Why do we need the reparameterization trick?",
      answer: "The reparameterization trick allows VAEs to be trained with backpropagation. Direct sampling from a distribution is non-differentiable, but reparameterization expresses sampling as a deterministic function of parameters plus random noise.",
      type: 'why'
    },
    {
      question: "What is the reparameterization trick?",
      answer: "The reparameterization trick expresses sampling from a distribution as: z = μ + σ ⊙ ε, where ε ~ N(0,1). This makes sampling differentiable with respect to μ and σ, enabling gradient-based optimization.",
      type: 'what'
    },
    {
      question: "How does the reparameterization trick work in practice?",
      answer: "Instead of sampling directly from N(μ, σ), we sample ε from N(0,1) and compute z = μ + σ ⊙ ε. During backpropagation, gradients flow through μ and σ but not through the random ε, making the entire process differentiable.",
      type: 'how'
    }
  ],
  'decoder': [
    {
      question: "Why does the VAE decoder need to handle distribution inputs?",
      answer: "The decoder must reconstruct inputs from points sampled in latent space, not just deterministic encodings. This makes it more robust and enables the generation of new, unseen data by sampling from different points in latent space.",
      type: 'why'
    },
    {
      question: "What does the VAE decoder do?",
      answer: "The decoder takes a point from latent space and reconstructs the original input data. It learns to map any point in the learned latent space to a realistic output, enabling both reconstruction and generation.",
      type: 'what'
    },
    {
      question: "How does the decoder learn to generate realistic outputs?",
      answer: "The decoder is trained to minimize reconstruction loss between its output and the original input. By seeing many samples from different parts of latent space during training, it learns to produce realistic outputs for any point in the learned space.",
      type: 'how'
    }
  ],
  'loss': [
    {
      question: "Why do VAEs need reconstruction loss?",
      answer: "Reconstruction loss ensures the VAE learns to encode and decode data accurately. Without it, the model could 'cheat' by ignoring the input and generating random outputs. This component forces the encoder-decoder pair to preserve meaningful information about the original data.",
      type: 'why'
    },
    {
      question: "What is reconstruction loss in VAEs?",
      answer: "Reconstruction loss measures how well the VAE can reconstruct the original input. It's typically Mean Squared Error (MSE) for continuous data or cross-entropy for discrete data. Lower values mean the reconstructed output is more similar to the original input.",
      type: 'what'
    },
    {
      question: "How is reconstruction loss calculated?",
      answer: "For continuous data: MSE = mean((input - reconstructed)²). For discrete data: Cross-entropy = -sum(input × log(reconstructed)). The loss is averaged over all pixels/elements in the data and across the batch.",
      type: 'how'
    },
    {
      question: "Why do VAEs need KL divergence loss?",
      answer: "KL divergence prevents the model from 'cheating' by mapping each input to a completely separate region of latent space. It forces all learned distributions to stay close to a standard normal distribution, creating a smooth, continuous latent space where interpolation and generation are possible.",
      type: 'why'
    },
    {
      question: "What is KL divergence in VAEs?",
      answer: "KL divergence measures how much the learned latent distribution differs from the prior distribution (typically N(0,1)). It's a regularization term that prevents the model from collapsing distributions and ensures the latent space is well-structured for generation.",
      type: 'what'
    },
    {
      question: "How is KL divergence calculated for VAEs?",
      answer: "For Gaussian distributions: KL = 0.5 × sum(μ² + σ² - log(σ²) - 1), where μ is the mean and σ² is the variance. This closed-form solution makes VAE training efficient compared to other regularization methods.",
      type: 'how'
    },
    {
      question: "Why does total loss combine both components?",
      answer: "Total loss balances two competing objectives: accurate reconstruction (low reconstruction loss) and smooth latent space (low KL divergence). Without this balance, the model would either ignore the latent structure or ignore reconstruction quality. The combination enables both good encoding/decoding and meaningful generation.",
      type: 'why'
    },
    {
      question: "What is the VAE total loss formula?",
      answer: "Total Loss = Reconstruction Loss + β × KL Divergence, where β is a weighting factor. The reconstruction term ensures quality, while the KL term regularizes the latent space. The β parameter (β-VAE) allows trading off between these objectives.",
      type: 'what'
    },
    {
      question: "How do you balance the two loss components?",
      answer: "Balance through the β parameter: start with β=1, increase if latent space is too irregular, decrease if reconstruction quality is poor. Common strategies: β-annealing (gradually increase β during training) or using β-schedules based on training progress.",
      type: 'how'
    }
  ],
  'generation': [
    {
      question: "Why can VAEs generate new data?",
      answer: "VAEs can generate new data because they learn a smooth, continuous latent space with a known prior distribution. By sampling points from this space (even those not seen during training), the decoder can produce novel but realistic outputs.",
      type: 'why'
    },
    {
      question: "What is generation in VAEs?",
      answer: "Generation in VAEs means creating new data by sampling points from the latent space distribution (typically N(0,1)) and passing them through the decoder. This produces novel outputs that resemble the training data but aren't exact copies.",
      type: 'what'
    },
    {
      question: "How does VAE generation compare to other methods?",
      answer: "Compared to GANs, VAEs produce more diverse but sometimes blurrier outputs. Compared to normalizing flows, VAEs are simpler but may have less accurate likelihood estimation. VAEs excel at learning smooth latent spaces for interpolation.",
      type: 'how'
    }
  ]
}

export default function VAEExplorer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(2000)
  const [expandedQA, setExpandedQA] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('explorer')
  const [latentPoint, setLatentPoint] = useState({ x: 0, y: 0 })
  const [showSampling, setShowSampling] = useState(false)

  // Sample data point (simplified 2D representation)
  const [inputData] = useState({
    image: [1, 0, 1, 0, 0, 1, 1, 0, 1], // 3x3 binary image
    label: "Face"
  })

  // Encoder output (mean and log-variance)
  const [encoderOutput] = useState({
    mu: [0.5, -0.3],
    logvar: [-0.2, 0.1]
  })

  // Sampled latent point
  const [sampledZ, setSampledZ] = useState([0.3, -0.2])

  // Decoder output - dynamic based on latent point
  const generateDecoderOutput = (x: number, y: number) => {
    // Simulate VAE decoder output based on latent coordinates
    // This creates different patterns based on where you click in latent space
    const output = []
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      
      // Create different patterns based on latent coordinates
      let value = 0.5 // Base value
      
      // Add influence from x coordinate (horizontal patterns)
      value += Math.sin(x * Math.PI + col * 0.5) * 0.3
      
      // Add influence from y coordinate (vertical patterns)  
      value += Math.cos(y * Math.PI + row * 0.5) * 0.3
      
      // Add some non-linearity
      value = 1 / (1 + Math.exp(-value * 3)) // Sigmoid activation
      
      // Add some randomness for variety
      value += (Math.sin(x * y * 10 + i) * 0.1)
      
      // Clamp between 0 and 1
      value = Math.max(0, Math.min(1, value))
      
      output.push(value)
    }
    return output
  }

  const [decoderOutput, setDecoderOutput] = useState(() => 
    generateDecoderOutput(latentPoint.x, latentPoint.y)
  )

  // Update decoder output when latent point changes
  useEffect(() => {
    setDecoderOutput(generateDecoderOutput(latentPoint.x, latentPoint.y))
  }, [latentPoint.x, latentPoint.y])

  // Loss components - dynamic based on latent point
  const generateLossComponents = (x: number, y: number) => {
    // Simulate how loss components change based on latent position
    // Points closer to origin have lower KL divergence (more like prior)
    const distanceFromOrigin = Math.sqrt(x * x + y * y)
    
    // KL divergence increases with distance from origin (0,0)
    const kl = Math.min(0.5, distanceFromOrigin * 0.15 + Math.random() * 0.05)
    
    // Reconstruction loss varies based on position in latent space
    const reconstruction = 0.1 + Math.abs(Math.sin(x * 2) * Math.cos(y * 2)) * 0.2 + Math.random() * 0.05
    
    // Total loss is the sum
    const total = reconstruction + kl
    
    return {
      reconstruction: Math.round(reconstruction * 1000) / 1000,
      kl: Math.round(kl * 1000) / 1000,
      total: Math.round(total * 1000) / 1000
    }
  }

  const [lossComponents, setLossComponents] = useState(() => 
    generateLossComponents(latentPoint.x, latentPoint.y)
  )

  // Update loss components when latent point changes
  useEffect(() => {
    setLossComponents(generateLossComponents(latentPoint.x, latentPoint.y))
  }, [latentPoint.x, latentPoint.y])

  // Animation steps
  const animationSteps = [
    'Input Data',
    'Encoder (μ, σ)',
    'Sampling (z)',
    'Decoder',
    'Reconstruction',
    'Loss Calculation'
  ]

  // Animation logic
  useEffect(() => {
    if (isPlaying && currentStep < animationSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, animationSpeed)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= animationSteps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, animationSpeed])

  const handlePlay = () => {
    setCurrentStep(0)
    setIsPlaying(true)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleLatentChange = (axis: 'x' | 'y', value: number) => {
    setLatentPoint(prev => {
      const newPoint = { ...prev, [axis]: value }
      // Update decoder output when latent point changes
      setDecoderOutput(generateDecoderOutput(newPoint.x, newPoint.y))
      return newPoint
    })
  }

  const handleLatentSpaceClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 4 - 2  // Convert to [-2, 2] range
    const y = -(((event.clientY - rect.top) / rect.height) * 4 - 2)  // Convert to [-2, 2] range, inverted
    setLatentPoint({ x, y })
    
    // Update decoder output when latent point changes
    setDecoderOutput(generateDecoderOutput(x, y))
    
    // Add a small animation effect
    const point = document.createElement('div')
    point.className = 'absolute w-2 h-2 bg-primary rounded-full pointer-events-none'
    point.style.left = `${event.clientX - rect.left - 4}px`
    point.style.top = `${event.clientY - rect.top - 4}px`
    point.style.animation = 'ping 0.5s ease-out'
    event.currentTarget.appendChild(point)
    setTimeout(() => point.remove(), 500)
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

  const ImageDisplay = ({ 
    data, 
    title, 
    isActive, 
    qaSection 
  }: { 
    data: number[], 
    title: string, 
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
        <div className="grid grid-cols-3 gap-1 w-24 h-24 mx-auto">
          {data.map((value, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: isActive ? 1 : 0.8, 
                opacity: 1 
              }}
              transition={{ delay: index * 0.05 }}
              className={`
                aspect-square rounded border
                ${value > 0.5 
                  ? 'bg-gray-800 border-gray-600' 
                  : 'bg-gray-100 border-gray-300'
                }
              `}
            />
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

  const DistributionDisplay = ({ 
    title, 
    mu, 
    sigma, 
    isActive, 
    qaSection 
  }: { 
    title: string, 
    mu: number, 
    sigma: number, 
    isActive: boolean,
    qaSection?: string 
  }) => {
    const samples = Array.from({ length: 50 }, () => {
      const u1 = Math.random()
      const u2 = Math.random()
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      return mu + sigma * z0
    })

    return (
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
          <div className="text-center space-y-2">
            <div className="text-xs text-muted-foreground">
              μ = {mu.toFixed(2)}, σ = {sigma.toFixed(2)}
            </div>
            <div className="h-16 flex items-end justify-center gap-1">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="w-1 bg-primary/60 rounded-t"
                  style={{ height: `${Math.max(2, Math.abs(sample) * 20)}px` }}
                />
              ))}
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
  }

  const LatentSpaceExplorer = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Move3d className="h-5 w-5" />
            Latent Space Explorer
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleQA('latent')}
            className="h-6 w-6 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Click anywhere in the latent space to generate new images
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 2D Latent Space Visualization */}
          <div 
            className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 cursor-crosshair hover:border-primary transition-colors"
            onClick={handleLatentSpaceClick}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Latent Space (2D)</div>
                <div className="text-xs text-muted-foreground">Click anywhere to generate</div>
              </div>
            </div>
            
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full">
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeWidth="1" />
            </svg>
            
            {/* Sampled point */}
            <motion.div
              className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer"
              style={{
                left: `${50 + latentPoint.x * 20}%`,
                top: `${50 - latentPoint.y * 20}%`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.3 }}
              title={`Latent: (${latentPoint.x.toFixed(2)}, ${latentPoint.y.toFixed(2)})`}
            />
            
            {/* Coordinate display */}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-mono">
              ({latentPoint.x.toFixed(2)}, {latentPoint.y.toFixed(2)})
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Latent X: {latentPoint.x.toFixed(2)}</label>
              <Slider
                value={[latentPoint.x]}
                onValueChange={(value) => handleLatentChange('x', value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Latent Y: {latentPoint.y.toFixed(2)}</label>
              <Slider
                value={[latentPoint.y]}
                onValueChange={(value) => handleLatentChange('y', value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="mt-1"
              />
            </div>
          </div>

          {/* Generated output */}
          <div className="text-center">
            <div className="text-sm font-medium mb-2">Generated Output</div>
            <motion.div 
              key={`${latentPoint.x.toFixed(2)}-${latentPoint.y.toFixed(2)}`}
              className="grid grid-cols-3 gap-1 w-24 h-24 mx-auto"
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {decoderOutput.map((value, index) => (
                <motion.div
                  key={index}
                  className={`
                    aspect-square rounded border
                    ${value > 0.5 
                      ? 'bg-gray-800 border-gray-600' 
                      : 'bg-gray-100 border-gray-300'
                    }
                  `}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                />
              ))}
            </motion.div>
          </div>

          <AnimatePresence>
            {expandedQA.has('latent') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <Separator />
                <div className="space-y-3">
                  {qaData['latent']?.map((qa, index) => (
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
          <div className="p-3 bg-green-500 bg-opacity-10 rounded-lg">
            <Layers className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">VAE Explorer</h1>
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
          Explore how Variational Autoencoders learn latent spaces and generate new data
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
          <TabsTrigger value="explorer" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Interactive Explorer
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Learning Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-6">
          {/* Animation Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  VAE Process Animation
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
                    Start Animation
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

                <div className="flex items-center gap-2">
                  {animationSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${index <= currentStep ? 'bg-primary' : 'bg-gray-300'}
                      `} />
                      <span className={`
                        text-sm
                        ${index <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}
                      `}>
                        {step}
                      </span>
                      {index < animationSteps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* VAE Pipeline */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ImageDisplay 
                data={inputData.image} 
                title="Input Data"
                isActive={currentStep === 0}
                qaSection="encoder"
              />
            </motion.div>

            {/* Latent Space */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`transition-all duration-300 ${currentStep >= 1 && currentStep <= 3 ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Latent Space</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQA('encoder')}
                        className="h-6 w-6 p-0"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQA('sampling')}
                        className="h-6 w-6 p-0"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {currentStep >= 1 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Encoder Output:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <DistributionDisplay 
                          title="Z₁" 
                          mu={encoderOutput.mu[0]} 
                          sigma={Math.exp(encoderOutput.logvar[0] / 2)}
                          isActive={currentStep === 1}
                        />
                        <DistributionDisplay 
                          title="Z₂" 
                          mu={encoderOutput.mu[1]} 
                          sigma={Math.exp(encoderOutput.logvar[1] / 2)}
                          isActive={currentStep === 1}
                        />
                      </div>
                    </div>
                  )}
                  
                  {currentStep >= 2 && (
                    <div className="text-center p-3 bg-primary/10 rounded">
                      <div className="text-xs text-muted-foreground mb-1">Sampled z:</div>
                      <div className="font-mono text-sm">
                        [{sampledZ[0].toFixed(2)}, {sampledZ[1].toFixed(2)}]
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <ImageDisplay 
                data={decoderOutput} 
                title="Reconstruction"
                isActive={currentStep === 3}
                qaSection="decoder"
              />
            </motion.div>
          </div>

          {/* Loss Components */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={currentStep === 4 ? 'ring-2 ring-primary bg-primary/5' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Loss Components
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('loss')}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Understanding the VAE loss function
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    key={`recon-${lossComponents.reconstruction.toFixed(3)}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4 text-center">
                      <h4 className="font-semibold text-red-600 mb-2">Reconstruction</h4>
                      <motion.div 
                        className="text-2xl font-bold"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {lossComponents.reconstruction.toFixed(3)}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">MSE Loss</div>
                    </Card>
                  </motion.div>
                  
                  <motion.div
                    key={`kl-${lossComponents.kl.toFixed(3)}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="p-4 text-center">
                      <h4 className="font-semibold text-blue-600 mb-2">KL Divergence</h4>
                      <motion.div 
                        className="text-2xl font-bold"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {lossComponents.kl.toFixed(3)}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">Regularization</div>
                    </Card>
                  </motion.div>
                  
                  <motion.div
                    key={`total-${lossComponents.total.toFixed(3)}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="p-4 text-center">
                      <h4 className="font-semibold text-green-600 mb-2">Total Loss</h4>
                      <motion.div 
                        className="text-2xl font-bold"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                      >
                        {lossComponents.total.toFixed(3)}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">Sum</div>
                    </Card>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {expandedQA.has('loss') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-3"
                    >
                      <Separator />
                      <div className="space-y-3">
                        {qaData['loss']?.map((qa, index) => (
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

          {/* Latent Space Explorer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <LatentSpaceExplorer />
          </motion.div>

          {/* Generation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Generation Mode
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQA('generation')}
                    className="h-6 w-6 p-0"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Generate new data by sampling from latent space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    VAEs can generate new data by sampling points from the learned latent space distribution
                  </p>
                  <Button onClick={() => setShowSampling(!showSampling)}>
                    {showSampling ? 'Hide' : 'Show'} Sampling Process
                  </Button>
                  
                  {showSampling && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {Array.from({ length: 4 }, (_, i) => {
                        const x = (Math.random() - 0.5) * 4
                        const y = (Math.random() - 0.5) * 4
                        return (
                          <div key={i} className="text-center">
                            <div className="text-xs text-muted-foreground mb-2">
                              z = [{x.toFixed(1)}, {y.toFixed(1)}]
                            </div>
                            <div className="grid grid-cols-3 gap-1 w-16 h-16 mx-auto">
                              {decoderOutput.map((value, index) => (
                                <div
                                  key={index}
                                  className={`
                                    aspect-square rounded border
                                    ${Math.random() > 0.5 
                                      ? 'bg-gray-800 border-gray-600' 
                                      : 'bg-gray-100 border-gray-300'
                                    }
                                  `}
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <AnimatePresence>
                    {expandedQA.has('generation') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-3"
                      >
                        <Separator />
                        <div className="space-y-3">
                          {qaData['generation']?.map((qa, index) => (
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
                  Comprehensive VAE Learning Guide
                </CardTitle>
                <CardDescription>
                  Master Variational Autoencoders with detailed Q&A explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(qaData).map(([section, qaList]) => (
                  <Collapsible key={section} open={expandedQA.has(`learn-${section}`)} onOpenChange={() => toggleQA(`learn-${section}`)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-4 h-auto">
                        <div className="flex items-center gap-2">
                          <Layers className="h-5 w-5" />
                          <span className="font-semibold capitalize">
                            {section === 'overview' ? 'Overview' :
                             section === 'encoder' ? 'Encoder Network' :
                             section === 'latent' ? 'Latent Space' :
                             section === 'sampling' ? 'Reparameterization Trick' :
                             section === 'decoder' ? 'Decoder Network' :
                             section === 'loss' ? 'Loss Function' :
                             section === 'generation' ? 'Data Generation' : section}
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