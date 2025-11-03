'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  BookOpen, 
  HelpCircle, 
  Star, 
  Eye, 
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface FAQ {
  id: string
  chapterId: string
  question: string
  easyAnswer: string
  detailedAnswer: string
  category: string
  difficulty: string
  tags: string
  views: number
  helpful: number
  chapter?: {
    title: string
    category: string
  }
}

interface Chapter {
  id: string
  title: string
  category: string
}

export default function FAQPage() {
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set())
  const [showDetailed, setShowDetailed] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchFAQs()
    fetchChapters()
  }, [])

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faqs')
      if (response.ok) {
        const data = await response.json()
        setFAQs(data)
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters')
      if (response.ok) {
        const data = await response.json()
        setChapters(data)
      }
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.easyAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.detailedAnswer.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesChapter = selectedChapter === 'all' || faq.chapterId === selectedChapter
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'all' || faq.difficulty === selectedDifficulty

      return matchesSearch && matchesChapter && matchesCategory && matchesDifficulty
    })
  }, [faqs, searchTerm, selectedChapter, selectedCategory, selectedDifficulty])

  const toggleExpand = (faqId: string) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(faqId)) {
        newSet.delete(faqId)
      } else {
        newSet.add(faqId)
      }
      return newSet
    })
  }

  const toggleDetailed = (faqId: string) => {
    setShowDetailed(prev => {
      const newSet = new Set(prev)
      if (newSet.has(faqId)) {
        newSet.delete(faqId)
      } else {
        newSet.add(faqId)
      }
      return newSet
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'general': 'default',
      'technical': 'secondary',
      'practical': 'outline',
      'advanced': 'destructive'
    }
    return colors[category] || 'default'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'PRACTICE': 'default',
      'CHALLENGE': 'secondary',
      'CAPSTONE': 'destructive'
    }
    return colors[difficulty] || 'default'
  }

  const incrementView = async (faqId: string) => {
    try {
      await fetch(`/api/faqs/${faqId}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error incrementing view:', error)
    }
  }

  const incrementHelpful = async (faqId: string) => {
    try {
      await fetch(`/api/faqs/${faqId}/helpful`, { method: 'POST' })
      // Update local state
      setFAQs(prev => prev.map(faq => 
        faq.id === faqId ? { ...faq, helpful: faq.helpful + 1 } : faq
      ))
    } catch (error) {
      console.error('Error incrementing helpful:', error)
    }
  }

  const totalViews = useMemo(() => {
    return faqs.reduce((sum, faq) => sum + (faq.views || 0), 0)
  }, [faqs])

  const totalHelpful = useMemo(() => {
    return faqs.reduce((sum, faq) => sum + (faq.helpful || 0), 0)
  }, [faqs])


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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">FAQ Study Materials</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive Q&A covering all machine learning topics with easy and detailed explanations
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{faqs.length}</div>
            <div className="text-sm text-muted-foreground">Total FAQs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{chapters.length}</div>
            <div className="text-sm text-muted-foreground">Chapters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {totalViews}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {totalHelpful}
            </div>
            <div className="text-sm text-muted-foreground">Helpful Votes</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Chapter Filter */}
                <div>
                  <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="PRACTICE">Practice</SelectItem>
                      <SelectItem value="CHALLENGE">Challenge</SelectItem>
                      <SelectItem value="CAPSTONE">Capstone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                    Search: {searchTerm} ×
                  </Badge>
                )}
                {selectedChapter !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedChapter('all')}>
                    Chapter: {chapters.find(c => c.id === selectedChapter)?.title} ×
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedCategory('all')}>
                    Category: {selectedCategory} ×
                  </Badge>
                )}
                {selectedDifficulty !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedDifficulty('all')}>
                    Difficulty: {selectedDifficulty} ×
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">
            {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} found
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Most relevant first
          </div>
        </div>

        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={getCategoryColor(faq.category)} className="text-xs">
                          {faq.category}
                        </Badge>
                        <Badge variant={getDifficultyColor(faq.difficulty)} className="text-xs">
                          {faq.difficulty}
                        </Badge>
                        {faq.chapter && (
                          <Badge variant="outline" className="text-xs">
                            {faq.chapter.title}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mb-2 leading-tight pr-2">{faq.question}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(faq.id)}
                      className="flex-shrink-0"
                    >
                      {expandedFAQs.has(faq.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedFAQs.has(faq.id) && (
                  <CardContent className="pt-0">
                    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                      {/* Easy Answer */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <h4 className="font-semibold text-green-600">Easy Answer</h4>
                        </div>
                        <p className="text-sm leading-relaxed break-words">{faq.easyAnswer}</p>
                      </div>

                      <Separator />

                      {/* Detailed Answer */}
                      <div>
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <h4 className="font-semibold text-blue-600 truncate">Detailed Answer</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDetailed(faq.id)}
                            className="flex-shrink-0"
                          >
                            {showDetailed.has(faq.id) ? 'Show Less' : 'Show More'}
                          </Button>
                        </div>
                        <div className={`text-sm leading-relaxed break-words ${showDetailed.has(faq.id) ? '' : 'line-clamp-3'}`}>
                          <div dangerouslySetInnerHTML={{ 
                            __html: faq.detailedAnswer.replace(/\n/g, '<br />') 
                          }} />
                        </div>
                      </div>

                      {/* Tags */}
                      {faq.tags && (
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(faq.tags).map((tag: string, tagIndex: number) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {faq.views} views
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {faq.helpful} helpful
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementHelpful(faq.id)}
                            className="w-full sm:w-auto"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </Button>
                          {faq.chapter && (
                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                              <Link href={`/chapter/${faq.chapterId}`}>
                                <BookOpen className="h-4 w-4 mr-1" />
                                View Chapter
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setSelectedChapter('all')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}>
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
