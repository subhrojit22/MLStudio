'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  Brain, 
  Code, 
  CheckCircle, 
  ArrowLeft,
  ExternalLink,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  Eye,
  ChevronDown,
  ChevronUp,
  GraduationCap
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Chapter {
  id: string
  title: string
  description: string
  category: string
  timeEstimate: number
  order: number
  objectives: string[]
  quickRead: string
  content: string
  notebookUrl: string
  exercises: any[]
  quizzes: any[]
  resources: any[]
}

interface FAQ {
  id: string
  question: string
  easyAnswer: string
  detailedAnswer: string
  category: string
  subtopic?: string
  difficulty: string
  tags: string[]
  views: number
  helpful: number
}

export default function ChapterPage() {
  const params = useParams()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set())
  const [showDetailed, setShowDetailed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (params.id) {
      fetchChapter(params.id as string)
      fetchFAQs(params.id as string)
    }
  }, [params.id])

  const fetchChapter = async (id: string) => {
    try {
      const response = await fetch(`/api/chapters/${id}`)
      if (response.ok) {
        const data = await response.json()
        setChapter(data)
      }
    } catch (error) {
      console.error('Error fetching chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFAQs = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/faqs?chapterId=${chapterId}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }

  const toggleExpanded = (faqId: string) => {
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

  const markHelpful = async (faqId: string, helpful: boolean) => {
    try {
      await fetch(`/api/faqs/${faqId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful })
      })
      
      setFaqs(prev => prev.map(faq => 
        faq.id === faqId 
          ? { ...faq, helpful: faq.helpful + (helpful ? 1 : 0) }
          : faq
      ))
    } catch (error) {
      console.error('Error marking FAQ as helpful:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded mb-8"></div>
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Button asChild>
            <Link href="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
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
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/faq">
              <HelpCircle className="mr-2 h-4 w-4" />
              View All FAQs
            </Link>
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">Chapter {chapter.order}</Badge>
              <Badge>{chapter.category}</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
            <p className="text-muted-foreground text-lg">{chapter.description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {chapter.timeEstimate} min
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Chapter Progress</span>
            <span className="text-muted-foreground">0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="exercises">Exercises</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="faq">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {chapter.objectives && chapter.objectives.length > 0 ? (
                      chapter.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{objective}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Understand the fundamental concepts and principles</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Read</CardTitle>
                  <CardDescription>
                    Get a high-level overview of the key concepts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {chapter.quickRead ? (
                      <p>{chapter.quickRead}</p>
                    ) : (
                      <p className="text-muted-foreground">
                        This chapter introduces fundamental concepts that will help you 
                        understand the core principles of machine learning.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {chapter.content ? (
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Detailed content is being prepared for this chapter.
                      </p>
                      {chapter.notebookUrl && (
                        <Button asChild>
                          <Link href={chapter.notebookUrl} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Interactive Notebook
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Hands-on Exercises
                  </CardTitle>
                  <CardDescription>
                    Practice what you've learned with these exercises
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chapter.exercises && chapter.exercises.length > 0 ? (
                    <div className="space-y-4">
                      {chapter.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Exercise {index + 1}: {exercise.title}</h4>
                            <Badge variant="outline">{exercise.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {exercise.description}
                          </p>
                          <Button size="sm">
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Exercise
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Exercises are being prepared for this chapter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Chapter Quiz
                  </CardTitle>
                  <CardDescription>
                    Test your understanding of the chapter material
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chapter.quizzes && chapter.quizzes.length > 0 ? (
                    <div className="space-y-4">
                      {chapter.quizzes.map((quiz, index) => (
                        <div key={quiz.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Quiz {index + 1}: {quiz.title}</h4>
                            <Badge variant="outline">{quiz.timeLimit ? `${quiz.timeLimit} min` : 'No time limit'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {quiz.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Passing score: {quiz.passingScore}%
                            </p>
                            <Button size="sm">
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Start Quiz
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Quiz is being prepared for this chapter.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Chapter FAQs
                  </CardTitle>
                  <CardDescription>
                    Frequently asked questions for this chapter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {faqs.length > 0 ? (
                    <div className="space-y-4">
                      {faqs.map((faq, index) => (
                        <div key={faq.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{faq.question}</h4>
                            <Badge variant="outline">{faq.difficulty}</Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-green-600 mb-1">Easy Answer:</h5>
                              <p className="text-sm text-muted-foreground">{faq.easyAnswer}</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-blue-600 mb-1">Detailed Answer:</h5>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {faq.detailedAnswer}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{faq.views} views</span>
                              <span>•</span>
                              <span>{faq.helpful} helpful</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/faq?chapter=${chapter.id}`}>
                                View All FAQs
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">
                        No FAQs available for this chapter yet.
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/faq">
                          Browse All FAQs
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Right Column - Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Interactive Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interactive Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Brain className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  Interactive visualizations coming soon!
                </p>
                <Button variant="outline" size="sm" disabled>
                  Try Demo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          {chapter.resources && chapter.resources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chapter.resources.map((resource, index) => (
                    <div key={resource.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.type}</p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={resource.url} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/faq?chapter=${chapter.id}`}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Get Help
                </Link>
              </Button>
              {chapter.notebookUrl && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={chapter.notebookUrl} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Notebook
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}