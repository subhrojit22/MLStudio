'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Eye, EyeOff, Copy, Brain, Zap, Target, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Input image (5x5 cross pattern)
const INPUT_IMAGE = [
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0]
]

// Filter definitions
const FILTERS = {
  'edge-detect': {
    name: 'Edge Detection',
    description: 'Detects horizontal edges and bright-to-dark transitions',
    values: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1]
    ]
  },
  'blur': {
    name: 'Blur',
    description: 'Averages neighboring pixels for smoothing effect',
    values: [
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9],
      [1/9, 1/9, 1/9]
    ]
  },
  'sharpen': {
    name: 'Sharpen',
    description: 'Enhances differences between center and surrounding pixels',
    values: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ]
  }
}

export default function CNNVisualizer() {
  const [selectedFilter, setSelectedFilter] = useState<keyof typeof FILTERS>('edge-detect')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showLog, setShowLog] = useState(false)
  const [convolutionLog, setConvolutionLog] = useState<LogEntry[]>([])
  const [poolingLog, setPoolingLog] = useState<LogEntry[]>([])
  const [activeLogEntry, setActiveLogEntry] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)

  interface LogEntry {
    id: string
    content: string
    type: 'convolution' | 'pooling'
    step?: number
    position?: { row: number; col: number }
    highlight?: string[]
  }

  // Perform convolution
  const performConvolution = (image: number[][], filter: number[][]) => {
    const output: number[][] = []
    const filterSize = filter.length
    const outputSize = image.length - filterSize + 1

    for (let i = 0; i < outputSize; i++) {
      output[i] = []
      for (let j = 0; j < outputSize; j++) {
        let sum = 0
        for (let fi = 0; fi < filterSize; fi++) {
          for (let fj = 0; fj < filterSize; fj++) {
            sum += image[i + fi][j + fj] * filter[fi][fj]
          }
        }
        // Apply ReLU activation
        output[i][j] = Math.max(0, sum)
      }
    }
    return output
  }

  // Perform max pooling
  const performMaxPooling = (featureMap: number[][], poolSize: number = 2) => {
    const output: number[][] = []
    const inputSize = featureMap.length
    const outputSize = Math.ceil(inputSize / poolSize)

    for (let i = 0; i < outputSize; i++) {
      output[i] = []
      for (let j = 0; j < outputSize; j++) {
        let max = 0
        for (let pi = 0; pi < poolSize; pi++) {
          for (let pj = 0; pj < poolSize; pj++) {
            const row = i * poolSize + pi
            const col = j * poolSize + pj
            if (row < inputSize && col < inputSize) {
              max = Math.max(max, featureMap[row][col])
            }
          }
        }
        output[i][j] = max
      }
    }
    return output
  }

  const convOutput = performConvolution(INPUT_IMAGE, FILTERS[selectedFilter].values)
  const pooledOutput = performMaxPooling(convOutput)

  // Generate detailed pooling log
  const generatePoolingLog = () => {
    const logs: LogEntry[] = []
    
    logs.push({
      id: 'pooling-title',
      content: '🟢 POOLING LAYER ANALYSIS',
      type: 'pooling',
      step: 4
    })
    logs.push({
      id: 'pooling-divider',
      content: '═'.repeat(50),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-blank1',
      content: '',
      type: 'pooling'
    })
    
    // WHY POOLING SECTION
    logs.push({
      id: 'pooling-why-title',
      content: '🤔 WHY DO WE NEED POOLING?',
      type: 'pooling',
      step: 4
    })
    logs.push({
      id: 'pooling-why-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-problem',
      content: '📌 Problem: Convolution produces too much data',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-problem1',
      content: '   • After convolution: 3×3 = 9 values',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-problem2',
      content: '   • After next convolution: Even more values!',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-problem3',
      content: '   • Memory and computation explode',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-solutions',
      content: '🎯 Pooling Solutions:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-solution1',
      content: '   1️⃣ Reduce spatial dimensions (downsampling)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-solution2',
      content: '   2️⃣ Keep important features',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-solution3',
      content: '   3️⃣ Make model robust to small shifts',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-solution4',
      content: '   4️⃣ Reduce overfitting risk',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-why-blank2',
      content: '',
      type: 'pooling'
    })
    
    // WHAT IS POOLING SECTION
    logs.push({
      id: 'pooling-what-title',
      content: '📚 WHAT IS POOLING?',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-definition',
      content: '🔧 Definition: Non-linear downsampling operation',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-process',
      content: '📦 Process: Divide → Apply operation → Reduce',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-types-title',
      content: '🎯 Main Types:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank2',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-max',
      content: '   🔥 MAX POOLING (Most Common)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-max1',
      content: '   • Take the maximum value from each region',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-max2',
      content: '   • Keeps the strongest feature response',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-max3',
      content: '   • Preserves edge information',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-max4',
      content: '   • Most widely used in CNNs',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank3',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-avg',
      content: '   📊 AVERAGE POOLING',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-avg1',
      content: '   • Calculate average of all values in region',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-avg2',
      content: '   • Provides smooth summary',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-avg3',
      content: '   • Less sensitive to outliers',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-avg4',
      content: '   • Good for overall feature representation',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank4',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-min',
      content: '   🎲 MIN POOLING',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-min1',
      content: '   • Take the minimum value from each region',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-min2',
      content: '   • Useful for detecting dark features',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-min3',
      content: '   • Rarely used in practice',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank5',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-global',
      content: '   📝 GLOBAL POOLING',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-global1',
      content: '   • Pool entire feature map to single value',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-global2',
      content: '   • Used before fully connected layers',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-global3',
      content: '   • Replaces flattening in modern CNNs',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-what-blank6',
      content: '',
      type: 'pooling'
    })
    
    // HOW POOLING WORKS SECTION
    logs.push({
      id: 'pooling-how-title',
      content: '⚙️ HOW POOLING WORKS',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-steps-title',
      content: '📐 Step-by-Step Process:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step1',
      content: '   Step 1: 📍 Define Pooling Window',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step1-detail',
      content: '           • Usually 2×2 or 3×3',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step1-detail2',
      content: '           • Stride = window size (no overlap)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-blank2',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step2',
      content: '   Step 2: 🔲 Slide Window Over Input',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step2-detail',
      content: '           • Move from top-left to bottom-right',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step2-detail2',
      content: '           • No overlap between windows',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-blank3',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step3',
      content: '   Step 3: 🎯 Apply Pooling Operation',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step3-detail',
      content: '           • Max: Keep largest value',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step3-detail2',
      content: '           • Average: Calculate mean',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step3-detail3',
      content: '           • Min: Keep smallest value',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-blank4',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step4',
      content: '   Step 4: 📦 Build Output Map',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step4-detail',
      content: '           • Each window → one output value',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-step4-detail2',
      content: '           • Output size = input size ÷ window size',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-how-blank5',
      content: '',
      type: 'pooling'
    })
    
    // PRACTICAL EXAMPLE
    logs.push({
      id: 'pooling-example-title',
      content: '🎮 PRACTICAL EXAMPLE: MAX POOLING',
      type: 'pooling',
      step: 4
    })
    logs.push({
      id: 'pooling-example-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-input',
      content: '📊 Input Feature Map (3×3):',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-box1',
      content: '┌─────┬─────┬─────┐',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-row1',
      content: '│  4  │  2  │  8  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-box2',
      content: '├─────┼─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-row2',
      content: '│  6  │  1  │  3  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-box3',
      content: '├─────┼─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-row3',
      content: '│  5  │  7  │  9  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-box4',
      content: '└─────┴─────┴─────┘',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-window',
      content: '🔲 Pooling Window: 2×2',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-stride',
      content: '📏 Stride: 2 (no overlap)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-example-blank2',
      content: '',
      type: 'pooling'
    })
    
    // Window 1
    logs.push({
      id: 'pooling-window1-title',
      content: '🎯 Window 1 (Top-Left):',
      type: 'pooling',
      step: 4,
      highlight: ['conv-0-0', 'conv-0-1', 'conv-1-0', 'conv-1-1']
    })
    logs.push({
      id: 'pooling-window1-box1',
      content: '    ┌─────┬─────┐',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-row1',
      content: '    │  4  │  2  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-box2',
      content: '    ├─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-row2',
      content: '    │  6  │  1  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-box3',
      content: '    └─────┴─────┘',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-values',
      content: '    Values: [4, 2, 6, 1]',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-max',
      content: '    Max: max(4, 2, 6, 1) = 6 ✨',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window1-blank',
      content: '',
      type: 'pooling'
    })
    
    // Window 2
    logs.push({
      id: 'pooling-window2-title',
      content: '🎯 Window 2 (Top-Right):',
      type: 'pooling',
      step: 4,
      highlight: ['conv-0-2', 'conv-1-2']
    })
    logs.push({
      id: 'pooling-window2-box1',
      content: '        ┌─────┬─────┐',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-row1',
      content: '        │  8  │  -  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-box2',
      content: '        ├─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-row2',
      content: '        │  3  │  -  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-box3',
      content: '        └─────┴─────┘',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-values',
      content: '    Values: [8, 3] (padding with 0)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-max',
      content: '    Max: max(8, 3, 0, 0) = 8 ✨',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window2-blank',
      content: '',
      type: 'pooling'
    })
    
    // Window 3
    logs.push({
      id: 'pooling-window3-title',
      content: '🎯 Window 3 (Bottom-Left):',
      type: 'pooling',
      step: 4,
      highlight: ['conv-2-0', 'conv-2-1']
    })
    logs.push({
      id: 'pooling-window3-box1',
      content: '    ┌─────┬─────┐',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-row1',
      content: '    │  5  │  7  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-box2',
      content: '    ├─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-row2',
      content: '    │  9  │  -  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-box3',
      content: '    └─────┴─────┘',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-values',
      content: '    Values: [5, 7, 9] (padding with 0)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-max',
      content: '    Max: max(5, 7, 9, 0) = 9 ✨',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-window3-blank',
      content: '',
      type: 'pooling'
    })
    
    // Output
    logs.push({
      id: 'pooling-output-title',
      content: '📊 Output Feature Map (2×2):',
      type: 'pooling',
      step: 5
    })
    logs.push({
      id: 'pooling-output-box1',
      content: '┌─────┬─────┐',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-output-row1',
      content: '│  6  │  8  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-output-box2',
      content: '├─────┼─────┤',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-output-row2',
      content: '│  9  │  0  │',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-output-box3',
      content: '└─────┴─────┘',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-output-blank',
      content: '',
      type: 'pooling'
    })
    
    // INTUITION AND BENEFITS
    logs.push({
      id: 'pooling-intuition-title',
      content: '💡 POOLING INTUITION',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-max',
      content: '🎯 Why Max Pooling Works:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-max1',
      content: '   • "Is there ANY strong feature here?"',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-max2',
      content: '   • Keeps the most activated neuron',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-max3',
      content: '   • Translation invariance (robust to shifts)',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-max4',
      content: '   • Like asking "Any edge in this area?"',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-avg',
      content: '📊 Why Average Pooling Works:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-avg1',
      content: '   • "What\'s the overall activity level?"',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-avg2',
      content: '   • Smooths out noise',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-avg3',
      content: '   • Gives general feature presence',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-avg4',
      content: '   • Like asking "Average edge strength?"',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-intuition-blank2',
      content: '',
      type: 'pooling'
    })
    
    // REAL-WORLD IMPACT
    logs.push({
      id: 'pooling-impact-title',
      content: '🌍 REAL-WORLD IMPACT',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-divider',
      content: '─'.repeat(40),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-memory',
      content: '📈 Memory Reduction:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-memory1',
      content: '   • Before: 3×3 = 9 values',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-memory2',
      content: '   • After 2×2 pooling: 2×2 = 4 values',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-memory3',
      content: '   • Reduction: 55% less memory!',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-blank',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-speed',
      content: '⚡ Computation Speed:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-speed1',
      content: '   • Fewer parameters in next layers',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-speed2',
      content: '   • Faster training and inference',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-speed3',
      content: '   • Enables deeper networks',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-blank2',
      content: '',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-robust',
      content: '🎯 Feature Robustness:',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-robust1',
      content: '   • Small translations don\'t change output',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-robust2',
      content: '   • Focus on presence, not exact position',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-robust3',
      content: '   • Better generalization',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-impact-blank3',
      content: '',
      type: 'pooling'
    })
    
    logs.push({
      id: 'pooling-complete',
      content: '🟢 POOLING ANALYSIS COMPLETE',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-complete-divider',
      content: '═'.repeat(50),
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-key-takeaway',
      content: '💡 Key Takeaway: Pooling is essential for efficient,',
      type: 'pooling'
    })
    logs.push({
      id: 'pooling-key-takeaway2',
      content: '   robust CNNs that can handle real-world data!',
      type: 'pooling'
    })
    
    return logs
  }

  // Generate detailed convolution log
  const generateConvolutionLog = () => {
    const logs: LogEntry[] = []
    const filter = FILTERS[selectedFilter]
    
    logs.push({
      id: 'conv-title',
      content: '🟢 CONVOLUTION LAYER ANALYSIS',
      type: 'convolution',
      step: 1
    })
    logs.push({
      id: 'conv-divider',
      content: '═'.repeat(50),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-blank1',
      content: '',
      type: 'convolution'
    })
    
    // WHY CONVOLUTION SECTION
    logs.push({
      id: 'conv-why-title',
      content: '🤔 WHY CONVOLUTION?',
      type: 'convolution',
      step: 1
    })
    logs.push({
      id: 'conv-why-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-problem',
      content: '📌 Problem: How do we recognize features in images?',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-problem1',
      content: '   • Images have spatial structure',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-problem2',
      content: '   • Nearby pixels are related',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-problem3',
      content: '   • Features can appear anywhere',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-problem4',
      content: '   • We need local pattern detection',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-solutions',
      content: '🎯 Convolution Solutions:',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-solution1',
      content: '   1️⃣ Local connectivity (receptive fields)',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-solution2',
      content: '   2️⃣ Parameter sharing (same filter everywhere)',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-solution3',
      content: '   3️⃣ Translation equivariance',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-solution4',
      content: '   4️⃣ Hierarchical feature learning',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-why-blank2',
      content: '',
      type: 'convolution'
    })
    
    // WHAT IS CONVOLUTION SECTION
    logs.push({
      id: 'conv-what-title',
      content: '📚 WHAT IS CONVOLUTION?',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-definition',
      content: '🔧 Mathematical Definition:',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-formula',
      content: '   (f * g)[i,j] = Σ f[i+m,j+n] × g[m,n]',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-f',
      content: '   • f: input image',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-g',
      content: '   • g: filter/kernel',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-op',
      content: '   • *: convolution operation',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-intuition',
      content: '🎯 Intuition: Sliding dot product',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-intuition1',
      content: '   • Filter slides over image',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-intuition2',
      content: '   • At each position: multiply & sum',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-intuition3',
      content: '   • High response = pattern match',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-what-blank2',
      content: '',
      type: 'convolution'
    })
    
    // HOW CONVOLUTION WORKS
    logs.push({
      id: 'conv-how-title',
      content: '⚙️ HOW CONVOLUTION WORKS',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step1',
      content: '📐 Step 1: Filter Placement',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step1-detail',
      content: '   • Place filter at top-left corner',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step1-detail2',
      content: '   • Align with image pixels',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step2',
      content: '📐 Step 2: Element-wise Multiplication',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step2-detail',
      content: '   • Multiply overlapping values',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step2-detail2',
      content: '   • Filter × Image patch',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-blank2',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step3',
      content: '📐 Step 3: Summation',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step3-detail',
      content: '   • Add all multiplied values',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step3-detail2',
      content: '   • Single number output',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-blank3',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step4',
      content: '📐 Step 4: Slide & Repeat',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step4-detail',
      content: '   • Move filter to next position',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step4-detail2',
      content: '   • Repeat steps 2-3',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-blank4',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step5',
      content: '📐 Step 5: Build Feature Map',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step5-detail',
      content: '   • Collection of all outputs',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-step5-detail2',
      content: '   • Shows where pattern was found',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-how-blank5',
      content: '',
      type: 'convolution'
    })
    
    // FILTER ANALYSIS
    logs.push({
      id: 'conv-filter-title',
      content: `🔍 FILTER ANALYSIS: ${filter.name}`,
      type: 'convolution',
      step: 1
    })
    logs.push({
      id: 'conv-filter-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-filter-purpose',
      content: `📝 Purpose: ${filter.description}`,
      type: 'convolution'
    })
    logs.push({
      id: 'conv-filter-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-filter-values-title',
      content: '🔢 Filter Values:',
      type: 'convolution'
    })
    filter.values.forEach((row, i) => {
      const rowStr = row.map(val => val.toString().padStart(3)).join(' ')
      logs.push({
        id: `conv-filter-row${i}`,
        content: `   [${rowStr}]`,
        type: 'convolution'
      })
    })
    logs.push({
      id: 'conv-filter-blank2',
      content: '',
      type: 'convolution'
    })
    
    // DETECTION MECHANISM
    logs.push({
      id: 'conv-detection-title',
      content: '🎯 DETECTION MECHANISM',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-detection-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    
    if (selectedFilter === 'edge-detect') {
      logs.push({
        id: 'conv-detection-logic',
        content: '📐 Edge Detection Logic:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic1',
        content: '   • Positive values: bright side',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic2',
        content: '   • Negative values: dark side',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic3',
        content: '   • Zero: no edge (uniform area)',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic4',
        content: '   • High absolute value = strong edge',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-blank',
        content: '',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why',
        content: '🎨 Why This Filter Works:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why1',
        content: '   • [-1, 0, 1]: horizontal gradient',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why2',
        content: '   • Detects left-to-right transitions',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why3',
        content: '   • Bright on right → positive response',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why4',
        content: '   • Bright on left → negative response',
        type: 'convolution'
      })
    } else if (selectedFilter === 'blur') {
      logs.push({
        id: 'conv-detection-logic',
        content: '🌊 Blurring Logic:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic1',
        content: '   • All positive weights (1/9)',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic2',
        content: '   • Averages neighboring pixels',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic3',
        content: '   • Smooths out variations',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic4',
        content: '   • Reduces noise and detail',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-blank',
        content: '',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why',
        content: '🎨 Why This Filter Works:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why1',
        content: '   • Equal weighting → averaging',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why2',
        content: '   • Local mean calculation',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why3',
        content: '   • Low-pass filtering effect',
        type: 'convolution'
      })
    } else if (selectedFilter === 'sharpen') {
      logs.push({
        id: 'conv-detection-logic',
        content: '🔪 Sharpening Logic:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic1',
        content: '   • Center: +5 (enhance center)',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic2',
        content: '   • Surrounding: -1 (subtract neighbors)',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic3',
        content: '   • Highlights differences',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-logic4',
        content: '   • Enhances edges and details',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-blank',
        content: '',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why',
        content: '🎨 Why This Filter Works:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why1',
        content: '   • Boosts center pixel',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why2',
        content: '   • Suppresses surroundings',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-detection-why3',
        content: '   • High-pass filtering effect',
        type: 'convolution'
      })
    }
    logs.push({
      id: 'conv-detection-blank2',
      content: '',
      type: 'convolution'
    })
    
    // INPUT IMAGE ANALYSIS
    logs.push({
      id: 'conv-input-title',
      content: '🖼️ INPUT IMAGE ANALYSIS',
      type: 'convolution',
      step: 0
    })
    logs.push({
      id: 'conv-input-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-desc',
      content: '📊 5×5 Cross Pattern:',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-desc1',
      content: '   • White cross: value = 1',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-desc2',
      content: '   • Black background: value = 0',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-desc3',
      content: '   • Center pixel: brightest point',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-input-values-title',
      content: '🔢 Input Values:',
      type: 'convolution'
    })
    INPUT_IMAGE.forEach((row, i) => {
      const rowStr = row.map(val => val.toString().padStart(3)).join(' ')
      logs.push({
        id: `conv-input-row${i}`,
        content: `   [${rowStr}]`,
        type: 'convolution'
      })
    })
    logs.push({
      id: 'conv-input-blank2',
      content: '',
      type: 'convolution'
    })
    
    // POSITION-BY-POSITION ANALYSIS
    logs.push({
      id: 'conv-position-title',
      content: '🎯 POSITION-BY-POSITION ANALYSIS',
      type: 'convolution',
      step: 2
    })
    logs.push({
      id: 'conv-position-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    
    const positions = [
      { row: 0, col: 0, name: 'Top-Left Corner' },
      { row: 0, col: 1, name: 'Top-Center' },
      { row: 0, col: 2, name: 'Top-Right Corner' },
      { row: 1, col: 0, name: 'Middle-Left' },
      { row: 1, col: 1, name: 'Center' },
      { row: 1, col: 2, name: 'Middle-Right' },
      { row: 2, col: 0, name: 'Bottom-Left Corner' },
      { row: 2, col: 1, name: 'Bottom-Center' },
      { row: 2, col: 2, name: 'Bottom-Right Corner' }
    ]
    
    positions.forEach((pos, index) => {
      const stepNum = 2 + (index / 9) * 0.5 // Spread positions across step 2-2.5
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-title`,
        content: `📍 ${pos.name} (${pos.row},${pos.col}):`,
        type: 'convolution',
        step: stepNum,
        position: pos,
        highlight: [`conv-pos-${pos.row}-${pos.col}`]
      })
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-placement`,
        content: `   Filter placed at rows ${pos.row}-${pos.row+2}, cols ${pos.col}-${pos.col+2}`,
        type: 'convolution'
      })
      
      // Extract the 3x3 patch
      const patch: number[][] = []
      for (let i = 0; i < 3; i++) {
        patch[i] = []
        for (let j = 0; j < 3; j++) {
          patch[i][j] = INPUT_IMAGE[pos.row + i][pos.col + j]
        }
      }
      
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-patch-title`,
        content: '   Image Patch:',
        type: 'convolution'
      })
      patch.forEach((row, i) => {
        const rowStr = row.map(val => val.toString().padStart(3)).join(' ')
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-patch-row${i}`,
          content: `      [${rowStr}]`,
          type: 'convolution'
        })
      })
      
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-filter-title`,
        content: '   Filter:',
        type: 'convolution'
      })
      filter.values.forEach((row, i) => {
        const rowStr = row.map(val => val.toString().padStart(3)).join(' ')
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-filter-row${i}`,
          content: `      [${rowStr}]`,
          type: 'convolution'
        })
      })
      
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-mult-title`,
        content: '   Multiplication:',
        type: 'convolution'
      })
      let sum = 0
      const multiplications: string[] = []
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const product = patch[i][j] * filter.values[i][j]
          sum += product
          if (product !== 0) {
            multiplications.push(`${patch[i][j]}×${filter.values[i][j]}=${product}`)
          }
        }
      }
      
      if (multiplications.length > 0) {
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-mult-detail`,
          content: `      ${multiplications.join(' + ')}`,
          type: 'convolution'
        })
      } else {
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-mult-detail`,
          content: '      All multiplications = 0',
          type: 'convolution'
        })
      }
      
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-sum`,
        content: `   Sum: ${sum}`,
        type: 'convolution'
      })
      
      // Apply ReLU
      const reluSum = Math.max(0, sum)
      if (sum < 0) {
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-relu`,
          content: `   ReLU: max(0, ${sum}) = 0 ✨ (negative clipped)`,
          type: 'convolution'
        })
      } else {
        logs.push({
          id: `conv-pos-${pos.row}-${pos.col}-relu`,
          content: `   ReLU: max(0, ${sum}) = ${reluSum}`,
          type: 'convolution'
        })
      }
      
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-output`,
        content: `   Final Output: ${reluSum}`,
        type: 'convolution'
      })
      logs.push({
        id: `conv-pos-${pos.row}-${pos.col}-blank`,
        content: '',
        type: 'convolution'
      })
    })
    
    // FEATURE MAP SUMMARY
    logs.push({
      id: 'conv-feature-title',
      content: '🗺️ FEATURE MAP SUMMARY',
      type: 'convolution',
      step: 3
    })
    logs.push({
      id: 'conv-feature-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-feature-output-title',
      content: '📊 Complete 3×3 Output:',
      type: 'convolution'
    })
    convOutput.forEach((row, i) => {
      const rowStr = row.map(val => val.toString().padStart(3)).join(' ')
      logs.push({
        id: `conv-feature-row${i}`,
        content: `   [${rowStr}]`,
        type: 'convolution'
      })
    })
    logs.push({
      id: 'conv-feature-blank',
      content: '',
      type: 'convolution'
    })
    
    // INTERPRETATION
    logs.push({
      id: 'conv-interpret-title',
      content: '🔍 INTERPRETATION',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-interpret-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    
    if (selectedFilter === 'edge-detect') {
      logs.push({
        id: 'conv-interpret-results',
        content: '📐 Edge Detection Results:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results1',
        content: '   • High positive values: bright→dark edges',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results2',
        content: '   • High negative values: dark→bright edges',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results3',
        content: '   • Zero values: no edges detected',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results4',
        content: '   • Center shows strongest response',
        type: 'convolution'
      })
    } else if (selectedFilter === 'blur') {
      logs.push({
        id: 'conv-interpret-results',
        content: '🌊 Blurring Results:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results1',
        content: '   • Non-zero where cross overlaps',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results2',
        content: '   • Values represent local averages',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results3',
        content: '   • Smoothed version of cross',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results4',
        content: '   • Reduced contrast at edges',
        type: 'convolution'
      })
    } else if (selectedFilter === 'sharpen') {
      logs.push({
        id: 'conv-interpret-results',
        content: '🔪 Sharpening Results:',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results1',
        content: '   • Enhanced center pixel',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results2',
        content: '   • Suppressed surrounding areas',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results3',
        content: '   • Increased contrast',
        type: 'convolution'
      })
      logs.push({
        id: 'conv-interpret-results4',
        content: '   • Emphasized details',
        type: 'convolution'
      })
    }
    logs.push({
      id: 'conv-interpret-blank',
      content: '',
      type: 'convolution'
    })
    
    // POOLING PREPARATION
    logs.push({
      id: 'conv-pooling-title',
      content: '🏊 POOLING PREPARATION',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-divider',
      content: '─'.repeat(40),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-next',
      content: '📦 Next Step: Max Pooling',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-input',
      content: '   • Input: 3×3 feature map',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-size',
      content: '   • Pool size: 2×2',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-stride',
      content: '   • Stride: 2 (no overlap)',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-output',
      content: '   • Output: 2×2 pooled map',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-blank',
      content: '',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-windows-title',
      content: '🎯 Pooling Windows:',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-window1',
      content: '   Window 1: Top-left 2×2 region',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-window2',
      content: '   Window 2: Top-right 2×2 region',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-window3',
      content: '   Window 3: Bottom-left 2×2 region',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-window4',
      content: '   Window 4: Bottom-right 2×2 region',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-pooling-blank2',
      content: '',
      type: 'convolution'
    })
    
    logs.push({
      id: 'conv-complete',
      content: '🟢 CONVOLUTION ANALYSIS COMPLETE',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-complete-divider',
      content: '═'.repeat(50),
      type: 'convolution'
    })
    logs.push({
      id: 'conv-key-insight',
      content: '💡 Key Insight: Convolution detects specific patterns',
      type: 'convolution'
    })
    logs.push({
      id: 'conv-key-insight2',
      content: '   by comparing local regions with learned filters!',
      type: 'convolution'
    })
    
    return logs
  }

  const handlePlay = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setShowLog(true)
    setConvolutionLog(generateConvolutionLog())
    setPoolingLog(generatePoolingLog())
    setActiveLogEntry(null)
    setIsPaused(false)
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 5) {
          clearInterval(timer)
          setIsPlaying(false)
          return 5
        }
        return prev + 1
      })
    }, 800)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setShowLog(false)
    setConvolutionLog([])
    setPoolingLog([])
    setActiveLogEntry(null)
    setIsPaused(false)
  }

  const copyLogToClipboard = () => {
    const fullLog = [...convolutionLog, '', ...poolingLog].map(entry => 
      typeof entry === 'string' ? entry : entry.content
    ).join('\n')
    navigator.clipboard.writeText(fullLog)
  }

  const refreshLog = () => {
    setConvolutionLog(generateConvolutionLog())
    setPoolingLog(generatePoolingLog())
    setActiveLogEntry(null)
  }

  const handleLogEntryClick = (entry: LogEntry) => {
    if (entry.step !== undefined) {
      setCurrentStep(entry.step)
      setIsPlaying(false)
      setIsPaused(true)
      setActiveLogEntry(entry.id)
    }
  }

  const isHighlighted = (entryId: string) => {
    return activeLogEntry === entryId
  }

  // Visualization with highlighting
  const getCellHighlight = (rowIndex: number, colIndex: number, gridType: 'input' | 'conv' | 'pool') => {
    if (!activeLogEntry) return false
    
    const activeEntry = [...convolutionLog, ...poolingLog].find(entry => entry.id === activeLogEntry)
    if (!activeEntry?.highlight) return false
    
    const cellId = `${gridType}-${rowIndex}-${colIndex}`
    return activeEntry.highlight.includes(cellId)
  }

  const getCellStyle = (value: number, rowIndex: number, colIndex: number, gridType: 'input' | 'conv' | 'pool', step: number) => {
    const isHighlighted = getCellHighlight(rowIndex, colIndex, gridType)
    const shouldShow = currentStep >= step
    
    let bgColor = 'bg-muted'
    let textColor = 'text-muted-foreground'
    
    if (shouldShow) {
      if (gridType === 'input') {
        bgColor = value === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
      } else if (gridType === 'conv') {
        bgColor = value > 0 ? 'bg-blue-500 text-white' : 'bg-muted'
      } else if (gridType === 'pool') {
        bgColor = value > 0 ? 'bg-green-500 text-white' : 'bg-muted'
      }
    }
    
    if (isHighlighted) {
      bgColor = 'bg-yellow-400 text-black border-2 border-yellow-600'
    }
    
    return bgColor
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            CNN Visualizer: Pooling Layers Deep Dive
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understand WHY, WHAT, and HOW of pooling layers with detailed animations and mathematical explanations
          </p>
          {isPaused && (
            <div className="mt-4 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⏸️ Simulation Paused - Click on any log entry to jump to that step
              </p>
            </div>
          )}
        </motion.div>

        {/* Filter Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Select Convolution Filter
              </CardTitle>
              <CardDescription>
                Choose a filter to see how it affects the pooling process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(FILTERS).map(([key, filter]) => (
                  <Button
                    key={key}
                    variant={selectedFilter === key ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-start text-left min-h-[70px] w-full whitespace-normal"
                    onClick={() => setSelectedFilter(key as keyof typeof FILTERS)}
                  >
                    <div className="font-semibold mb-1 text-sm leading-tight w-full">{filter.name}</div>
                    <div className="text-xs opacity-80 leading-relaxed w-full break-words">
                      {filter.description}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Input Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Input Image (5×5)
                </CardTitle>
                <CardDescription>Original cross pattern</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 aspect-square">
                  {INPUT_IMAGE.flat().map((val, i) => {
                    const row = Math.floor(i / 5)
                    const col = i % 5
                    return (
                      <motion.div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-sm font-mono ${getCellStyle(val, row, col, 'input', 0)}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        {val}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Convolution Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Feature Map (3×3)</CardTitle>
                <CardDescription>After convolution + ReLU</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1 aspect-square max-w-[200px] mx-auto">
                  {convOutput.flat().map((val, i) => {
                    const row = Math.floor(i / 3)
                    const col = i % 3
                    return (
                      <motion.div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-sm font-mono ${getCellStyle(val, row, col, 'conv', 1)}`}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: currentStep > 1 ? 1 : 0
                        }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                      >
                        {currentStep > 1 ? val.toFixed(1) : ''}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pooled Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Pooled Output (2×2)
                </CardTitle>
                <CardDescription>After 2×2 max pooling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1 aspect-square max-w-[150px] mx-auto">
                  {pooledOutput.flat().map((val, i) => {
                    const row = Math.floor(i / 2)
                    const col = i % 2
                    return (
                      <motion.div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-sm font-mono ${getCellStyle(val, row, col, 'pool', 4)}`}
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: currentStep > 3 ? 1 : 0
                        }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                      >
                        {currentStep > 3 ? val.toFixed(1) : ''}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          <Button 
            onClick={handlePlay} 
            disabled={isPlaying}
            size="lg"
            className="min-w-[120px]"
          >
            <Play className="mr-2 h-4 w-4" />
            {isPlaying ? 'Playing...' : 'Play'}
          </Button>
          {isPaused && (
            <Button 
              onClick={() => {
                setIsPlaying(true)
                setIsPaused(false)
                setActiveLogEntry(null)
                
                const timer = setInterval(() => {
                  setCurrentStep(prev => {
                    if (prev >= 5) {
                      clearInterval(timer)
                      setIsPlaying(false)
                      setIsPaused(false)
                      return 5
                    }
                    return prev + 1
                  })
                }, 800)
              }}
              size="lg"
              className="min-w-[120px]"
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          <Button 
            onClick={handleReset} 
            variant="outline"
            size="lg"
            className="min-w-[120px]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={() => setShowLog(!showLog)}
            variant="outline"
            size="lg"
            className="min-w-[120px]"
          >
            {showLog ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showLog ? 'Hide Log' : 'Show Log'}
          </Button>
          {showLog && (
            <Button 
              onClick={refreshLog}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          {showLog && (convolutionLog.length > 0 || poolingLog.length > 0) && (
            <Button 
              onClick={copyLogToClipboard}
              variant="outline"
              size="lg"
              className="min-w-[120px]"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          )}
        </motion.div>

        {/* Detailed Log */}
        <AnimatePresence>
          {showLog && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Interactive CNN Analysis Log
                  </CardTitle>
                  <CardDescription>
                    Click on any step to jump to that position in the simulation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-4 font-mono text-sm">
                    {/* Convolution Log */}
                    {convolutionLog.map((entry, index) => (
                      <motion.div
                        key={`conv-${entry.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.01 }}
                        className={`whitespace-pre-line cursor-pointer transition-all duration-200 ${
                          isHighlighted(entry.id) ? 'bg-yellow-100 p-2 rounded border-l-4 border-yellow-500' : 'hover:bg-gray-50 p-2 rounded'
                        } ${
                          entry.content.includes('🟢') ? 'text-green-600 font-bold' :
                          entry.content.includes('🤔') || entry.content.includes('📚') || entry.content.includes('⚙️') ? 'text-blue-600 font-semibold' :
                          entry.content.includes('🔍') || entry.content.includes('🎯') || entry.content.includes('📍') ? 'text-purple-600' :
                          entry.content.includes('📊') || entry.content.includes('🔢') || entry.content.includes('📐') ? 'text-orange-600' :
                          entry.content.includes('═') || entry.content.includes('─') ? 'text-gray-400' :
                          'text-gray-700'
                        } ${
                          entry.step !== undefined ? 'border border-gray-200 hover:border-blue-300' : ''
                        }`}
                        onClick={() => handleLogEntryClick(entry)}
                      >
                        <div className="flex items-center gap-2">
                          {entry.step !== undefined && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Step {entry.step}
                            </span>
                          )}
                          <span>{entry.content}</span>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Pooling Log */}
                    {poolingLog.map((entry, index) => (
                      <motion.div
                        key={`pool-${entry.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (convolutionLog.length + index) * 0.01 }}
                        className={`whitespace-pre-line cursor-pointer transition-all duration-200 ${
                          isHighlighted(entry.id) ? 'bg-yellow-100 p-2 rounded border-l-4 border-yellow-500' : 'hover:bg-gray-50 p-2 rounded'
                        } ${
                          entry.content.includes('🟢') ? 'text-green-600 font-bold' :
                          entry.content.includes('🤔') || entry.content.includes('📚') || entry.content.includes('⚙️') ? 'text-blue-600 font-semibold' :
                          entry.content.includes('🔍') || entry.content.includes('🎯') || entry.content.includes('📍') ? 'text-purple-600' :
                          entry.content.includes('📊') || entry.content.includes('🔢') || entry.content.includes('📐') ? 'text-orange-600' :
                          entry.content.includes('═') || entry.content.includes('─') ? 'text-gray-400' :
                          'text-gray-700'
                        } ${
                          entry.step !== undefined ? 'border border-gray-200 hover:border-blue-300' : ''
                        }`}
                        onClick={() => handleLogEntryClick(entry)}
                      >
                        <div className="flex items-center gap-2">
                          {entry.step !== undefined && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Step {entry.step}
                            </span>
                          )}
                          <span>{entry.content}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Educational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤔 Why Pooling?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pooling reduces computational complexity, provides translation invariance, 
                  and prevents overfitting by downsampling feature maps while preserving 
                  the most important information.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 What is Pooling?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A non-linear downsampling operation that divides the input into 
                  rectangular regions and selects a single representative value 
                  (maximum, average, or minimum) from each region.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚙️ How it Works</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A sliding window moves across the feature map, applying the pooling 
                  operation to each region. The stride determines how far the window 
                  moves, typically equal to the window size for non-overlapping pooling.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}