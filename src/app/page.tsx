'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PlayCircle, Users, Trophy, Brain, Zap, Target, Code } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const features = [
  {
    icon: Brain,
    title: "Interactive Learning",
    description: "Learn ML concepts through hands-on interactive demos and visualizations"
  },
  {
    icon: Code,
    title: "Practical Projects",
    description: "Build real ML projects from scratch with guided notebooks and capstone projects"
  },
  {
    icon: Users,
    title: "Expert Instruction",
    description: "Curated curriculum designed by ML experts and industry practitioners"
  },
  {
    icon: Trophy,
    title: "Track Progress",
    description: "Monitor your learning journey with detailed progress tracking and assessments"
  },
  {
    icon: Zap,
    title: "Modern AI Topics",
    description: "Stay current with Generative AI, Transformers, and cutting-edge ML techniques"
  },
  {
    icon: Target,
    title: "Career Focused",
    description: "Build practical skills that prepare you for ML engineering roles"
  }
]

const chapters = [
  { id: 1, title: "Introduction to Machine Learning", category: "ml-basics", duration: "45 min" },
  { id: 2, title: "Linear Regression & Gradient Descent", category: "ml-basics", duration: "60 min" },
  { id: 3, title: "Classification & Logistic Regression", category: "ml-basics", duration: "55 min" },
  { id: 4, title: "Neural Networks Fundamentals", category: "deep-learning", duration: "70 min" },
  { id: 5, title: "Convolutional Neural Networks", category: "deep-learning", duration: "80 min" },
  { id: 6, title: "Recurrent Neural Networks", category: "deep-learning", duration: "75 min" }
]

const stats = [
  { label: "Interactive Chapters", value: "18+" },
  { label: "Hands-on Projects", value: "25+" },
  { label: "Learning Hours", value: "100+" },
  { label: "Completion Rate", value: "85%" }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Badge variant="outline" className="mb-4 text-sm">
            🚀 Now in Beta - Interactive ML Learning Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Master Machine Learning &
            <span className="text-primary"> Generative AI</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Learn ML concepts through interactive demos, hands-on projects, and expert guidance. 
            From basics to cutting-edge AI, build practical skills for your career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/catalog">
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Learning Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="#curriculum">
                <BookOpen className="mr-2 h-5 w-5" />
                View Curriculum
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose ML Studio?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience a new way to learn machine learning with interactive tools and real-world projects
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Curriculum Preview */}
      <section id="curriculum" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Curriculum
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            18 carefully crafted chapters taking you from ML basics to advanced Generative AI
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all hover:scale-105">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={chapter.category === 'ml-basics' ? 'default' : 'secondary'}>
                      {chapter.category === 'ml-basics' ? 'ML Basics' : 'Deep Learning'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{chapter.duration}</span>
                  </div>
                  <CardTitle className="text-lg">{chapter.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Chapter {chapter.id}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

          <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/catalog">
              View All Chapters
              <PlayCircle className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <div className="mt-4">
            <Button variant="outline" size="lg" asChild>
              <Link href="/playground">
                <Brain className="mr-2 h-5 w-5" />
                Try Interactive Demos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your ML Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners building practical ML skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/catalog">
                Get Started Now
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/playground">
                <Brain className="mr-2 h-5 w-5" />
                Try Interactive Demos
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="font-semibold">ML Studio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ML Studio. Empowering the next generation of ML engineers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}