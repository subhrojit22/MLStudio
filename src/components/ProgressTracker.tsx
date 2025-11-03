'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Target, Award } from "lucide-react"

interface ProgressItem {
  id: string
  title: string
  description: string
  progress: number
  timeSpent: number
  totalTopics: number
  completedTopics: string[]
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface ProgressTrackerProps {
  items: ProgressItem[]
}

export default function ProgressTracker({ items }: ProgressTrackerProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'advanced': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'expert': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <CheckCircle className="h-4 w-4" />
      case 'intermediate': return <Target className="h-4 w-4" />
      case 'advanced': return <Award className="h-4 w-4" />
      case 'expert': return <Award className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const overallProgress = items.length > 0 
    ? items.reduce((sum, item) => sum + item.progress, 0) / items.length 
    : 0

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(overallProgress)}%
            </div>
            <p className="text-gray-600">
              {overallProgress >= 80 ? 'Expert Level Achieved!' : 
               overallProgress >= 60 ? 'Making Great Progress!' : 
               'Keep Learning!'}
            </p>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="grid grid-cols-2 md: grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {items.filter(i => i.progress === 100).length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {items.filter(i => i.progress > 0 && i.progress < 100).length}
              </div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-600">
                {items.filter(i => i.progress === 0).length}
              </div>
              <div className="text-xs text-gray-600">Not Started</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">
                {items.reduce((sum, i) => sum + i.timeSpent, 0) / 60}h
              </div>
              <div className="text-xs text-gray-600">Hours Learned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Progress Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getDifficultyIcon(item.difficulty)}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(item.difficulty)}>
                  {item.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{item.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span>{item.completedTopics.length}/{item.totalTopics}</span>
                  </div>
                  <div className="text-xs text-gray-600">Topics</div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{item.timeSpent}h</span>
                  </div>
                  <div className="text-xs text-gray-600">Time Spent</div>
                </div>
              </div>

              {/* Completed Topics */}
              {item.completedTopics.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-green-700">Completed Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {item.completedTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Estimate */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Target className="w-3 h-3" />
                <span>Estimated: {item.estimatedTime}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}