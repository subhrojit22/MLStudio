'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, PlayCircle, Brain, Cpu, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Chapter {
  id: string
  title: string
  description: string
  category: string
  timeEstimate: number
  order: number
}

const categoryIcons = {
  'ML Basics': Brain,
  'deep-learning': Cpu,
  'generative-ai': Sparkles
}

const categoryColors = {
  'ML Basics': 'default',
  'deep-learning': 'secondary',
  'generative-ai': 'outline'
}

export default function CatalogPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters')
      if (response.ok) {
        const data = await response.json()
        setChapters(data)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChapters = selectedCategory === 'all' 
    ? chapters 
    : chapters.filter(chapter => chapter.category === selectedCategory)

  const categories = ['all', ...Array.from(new Set(chapters.map(ch => ch.category)))]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Learning Catalog</h1>
        <p className="text-muted-foreground">
          Master machine learning through our comprehensive curriculum
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All Chapters' : category}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Chapters Grid */}
      <div className="space-y-6">
        {filteredChapters.map((chapter, index) => {
          const IconComponent = categoryIcons[chapter.category as keyof typeof categoryIcons] || BookOpen
          
          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <Badge variant={categoryColors[chapter.category as keyof typeof categoryColors] as any}>
                          {chapter.category}
                        </Badge>
                        <Badge variant="outline">Chapter {chapter.order}</Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{chapter.title}</CardTitle>
                      <CardDescription className="text-base">
                        {chapter.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {chapter.timeEstimate} min
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Exercises & Quiz
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/chapter/${chapter.id}`}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Learning
                      </Link>
                    </Button>
                  </div>
                  
                  {/* Progress Bar (placeholder) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredChapters.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No chapters found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or check back later for new content.
          </p>
        </motion.div>
      )}
    </div>
  )
}