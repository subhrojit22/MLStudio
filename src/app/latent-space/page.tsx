'use client'

import LatentSpaceExplorer from '@/components/latent-space-explorer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BackButton from '@/components/BackButton'
import { Brain, Move3d, Grid3x3, MousePointer, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LatentSpacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <BackButton />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-indigo-500 bg-opacity-10 rounded-lg">
              <Move3d className="h-8 w-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold">Latent Space Explorer</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Navigate through a 2D latent space to generate unique AI images. 
            Each coordinate represents different features and styles in the generative model.
          </p>
        </motion.div>

        {/* Information Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-primary" />
                  Click anywhere to generate new images
                </li>
                <li className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4 text-primary" />
                  Real-time coordinate display (Latent X, Latent Y)
                </li>
                <li className="flex items-center gap-2">
                  <Move3d className="h-4 w-4 text-primary" />
                  Visual exploration history tracking
                </li>
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Zoom and pan controls for precise navigation
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Auto-generate mode for continuous exploration
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How Coordinates Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  The latent space coordinates (X, Y) typically range from -1 to 1. 
                  Each point encodes different features - nearby points produce similar images, 
                  while distant points create completely different styles and content.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Coordinate System:</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• <strong>Center (0, 0):</strong> Neutral/average features</li>
                    <li>• <strong>Edges:</strong> More extreme or specialized features</li>
                    <li>• <strong>Distance:</strong> How different the features are</li>
                    <li>• <strong>Direction:</strong> Type of feature variation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LatentSpaceExplorer />
        </motion.div>
      </div>
    </div>
  )
}