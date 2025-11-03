'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  RefreshCw, 
  Download, 
  Settings, 
  Zap,
  Move3d,
  Grid3x3,
  MousePointer,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LatentPoint {
  x: number
  y: number
  id: string
  timestamp: number
}

interface GeneratedImage {
  id: string
  coordinates: { x: number; y: number }
  imageData: string
  timestamp: number
  prompt?: string
}

export default function LatentSpaceExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [autoGenerate, setAutoGenerate] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [explorationHistory, setExplorationHistory] = useState<LatentPoint[]>([])
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 })

  // Generate random image data (placeholder for actual AI generation)
  const generateImage = useCallback(async (coordinates: { x: number; y: number }) => {
    setIsGenerating(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Generate placeholder image using canvas
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Create abstract pattern based on coordinates
    const gradient = ctx.createRadialGradient(
      128 + coordinates.x * 50, 
      128 + coordinates.y * 50, 
      0,
      128, 128, 128
    )
    
    const hue1 = (coordinates.x + 1) * 180
    const hue2 = (coordinates.y + 1) * 180
    
    gradient.addColorStop(0, `hsl(${hue1}, 70%, 50%)`)
    gradient.addColorStop(0.5, `hsl(${hue2}, 60%, 45%)`)
    gradient.addColorStop(1, `hsl(${(hue1 + hue2) / 2}, 50%, 30%)`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    
    // Add some geometric patterns
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(
        128 + Math.sin(coordinates.x * Math.PI + i) * 60,
        128 + Math.cos(coordinates.y * Math.PI + i) * 60,
        20 + i * 10,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    }
    
    const imageData = canvas.toDataURL()
    
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      coordinates,
      imageData,
      timestamp: Date.now(),
      prompt: `Generated at coordinates (${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)})`
    }
    
    setGeneratedImages(prev => [newImage, ...prev.slice(0, 11)]) // Keep last 12 images
    setIsGenerating(false)
    
    return newImage
  }, [])

  // Handle canvas click
  const handleCanvasClick = useCallback(async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2 / zoomLevel - centerOffset.x
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2 / zoomLevel - centerOffset.y
    
    setCurrentPoint({ x, y })
    
    // Add to exploration history
    const newPoint: LatentPoint = {
      x,
      y,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    setExplorationHistory(prev => [...prev.slice(-49), newPoint]) // Keep last 50 points
    
    // Generate image at this point
    await generateImage({ x, y })
  }, [generateImage, zoomLevel, centerOffset])

  // Handle mouse move for coordinate display
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2 / zoomLevel - centerOffset.x
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2 / zoomLevel - centerOffset.y
    
    setHoveredPoint({ x, y })
  }, [zoomLevel, centerOffset])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')!
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, width, height)
    
    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.scale(zoomLevel, zoomLevel)
    ctx.translate(centerOffset.x * width / 2, centerOffset.y * height / 2)
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1 / zoomLevel
      
      for (let i = -10; i <= 10; i++) {
        // Vertical lines
        ctx.beginPath()
        ctx.moveTo(i * width / 20, -height / 2)
        ctx.lineTo(i * width / 20, height / 2)
        ctx.stroke()
        
        // Horizontal lines
        ctx.beginPath()
        ctx.moveTo(-width / 2, i * height / 20)
        ctx.lineTo(width / 2, i * height / 20)
        ctx.stroke()
      }
      
      // Draw axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2 / zoomLevel
      
      // X-axis
      ctx.beginPath()
      ctx.moveTo(-width / 2, 0)
      ctx.lineTo(width / 2, 0)
      ctx.stroke()
      
      // Y-axis
      ctx.beginPath()
      ctx.moveTo(0, -height / 2)
      ctx.lineTo(0, height / 2)
      ctx.stroke()
    }
    
    // Draw exploration history
    explorationHistory.forEach((point, index) => {
      const opacity = (index + 1) / explorationHistory.length * 0.5
      ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`
      ctx.beginPath()
      ctx.arc(point.x * width / 4, point.y * height / 4, 3 / zoomLevel, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw current point
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(currentPoint.x * width / 4, currentPoint.y * height / 4, 6 / zoomLevel, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw hover point
    if (hoveredPoint && showCoordinates) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 1 / zoomLevel
      ctx.setLineDash([5 / zoomLevel, 5 / zoomLevel])
      ctx.beginPath()
      ctx.moveTo(hoveredPoint.x * width / 4, -height / 2)
      ctx.lineTo(hoveredPoint.x * width / 4, height / 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-width / 2, hoveredPoint.y * height / 4)
      ctx.lineTo(width / 2, hoveredPoint.y * height / 4)
      ctx.stroke()
      ctx.setLineDash([])
    }
    
    ctx.restore()
    
    // Draw coordinate text
    if (showCoordinates && hoveredPoint) {
      ctx.fillStyle = 'white'
      ctx.font = '12px monospace'
      ctx.fillText(
        `Latent X: ${hoveredPoint.x.toFixed(2)}, Latent Y: ${hoveredPoint.y.toFixed(2)}`,
        10,
        20
      )
    }
  }, [currentPoint, explorationHistory, hoveredPoint, showGrid, showCoordinates, zoomLevel, centerOffset])

  // Auto-generate random points
  useEffect(() => {
    if (!autoGenerate) return
    
    const interval = setInterval(async () => {
      const x = (Math.random() - 0.5) * 2
      const y = (Math.random() - 0.5) * 2
      
      setCurrentPoint({ x, y })
      
      const newPoint: LatentPoint = {
        x,
        y,
        id: Date.now().toString(),
        timestamp: Date.now()
      }
      setExplorationHistory(prev => [...prev.slice(-49), newPoint])
      
      await generateImage({ x, y })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [autoGenerate, generateImage])

  const resetExploration = () => {
    setCurrentPoint({ x: 0, y: 0 })
    setExplorationHistory([])
    setGeneratedImages([])
    setZoomLevel(1)
    setCenterOffset({ x: 0, y: 0 })
  }

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = imageData
    link.click()
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
        >
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Latent Space Explorer</h1>
        </motion.div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Navigate through the 2D latent space to generate unique AI images. 
          Each point in this space represents different features and styles.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Move3d className="h-5 w-5" />
                    Latent Space (2D)
                  </CardTitle>
                  <CardDescription>
                    Click anywhere to generate new images or explore coordinates
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Zoom: {zoomLevel.toFixed(1)}x
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {generatedImages.length} images
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full border rounded-lg cursor-crosshair bg-gray-900"
                  onClick={handleCanvasClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* Coordinate Display Overlay */}
                <AnimatePresence>
                  {hoveredPoint && showCoordinates && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono"
                    >
                      <div>Latent X: {hoveredPoint.x.toFixed(3)}</div>
                      <div>Latent Y: {hoveredPoint.y.toFixed(3)}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Current Point Indicator */}
                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4" />
                    Current: ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)})
                  </div>
                </div>
                
                {/* Generating Indicator */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
                    >
                      <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Generating image...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>How to use:</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click anywhere in the latent space to generate new images</li>
                      <li>Each coordinate (X, Y) represents unique features and styles</li>
                      <li>Nearby points in space produce similar images</li>
                      <li>Use the controls to adjust zoom and explore different regions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Images Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Generated Images
              </CardTitle>
              <CardDescription>
                Recent images generated from different latent space coordinates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedImages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on the latent space to start generating images</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {generatedImages.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.imageData}
                        alt={`Generated at (${image.coordinates.x.toFixed(2)}, ${image.coordinates.y.toFixed(2)})`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-white text-xs text-center">
                          <div>({image.coordinates.x.toFixed(2)},</div>
                          <div>{image.coordinates.y.toFixed(2)})</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Display Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Display Options</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid" className="text-sm">Show Grid</Label>
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-coordinates" className="text-sm">Show Coordinates</Label>
                  <Switch
                    id="show-coordinates"
                    checked={showCoordinates}
                    onCheckedChange={setShowCoordinates}
                  />
                </div>
              </div>

              <Separator />

              {/* Zoom Control */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Zoom Level</Label>
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => setZoomLevel(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x</span>
                  <span>{zoomLevel.toFixed(1)}x</span>
                  <span>3x</span>
                </div>
              </div>

              <Separator />

              {/* Auto Generate */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-generate" className="text-sm font-medium">Auto Generate</Label>
                  <p className="text-xs text-muted-foreground">
                    Randomly explore and generate images
                  </p>
                </div>
                <Switch
                  id="auto-generate"
                  checked={autoGenerate}
                  onCheckedChange={setAutoGenerate}
                />
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={resetExploration}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Exploration
                </Button>
                
                {selectedImage && (
                  <Button
                    onClick={() => downloadImage(selectedImage.imageData, `latent-${selectedImage.coordinates.x.toFixed(2)}-${selectedImage.coordinates.y.toFixed(2)}.png`)}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Selected
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Points Explored</span>
                <span className="text-sm font-medium">{explorationHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Images Generated</span>
                <span className="text-sm font-medium">{generatedImages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Region</span>
                <span className="text-sm font-medium">
                  {Math.abs(currentPoint.x) < 0.5 && Math.abs(currentPoint.y) < 0.5 ? 'Center' : 
                   Math.abs(currentPoint.x) > 0.5 ? 'Edge' : 'Mid'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Image Details */}
          {selectedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <img
                  src={selectedImage.imageData}
                  alt="Selected generated image"
                  className="w-full rounded-lg border"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="font-mono">
                      ({selectedImage.coordinates.x.toFixed(3)}, {selectedImage.coordinates.y.toFixed(3)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Generated:</span>
                    <span>{new Date(selectedImage.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}