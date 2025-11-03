import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (chapterId && chapterId !== 'all') {
      where.chapterId = chapterId
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }
    
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { easyAnswer: { contains: search } },
        { detailedAnswer: { contains: search } }
      ]
    }

    const faqs = await db.fAQ.findMany({
      where,
      include: {
        chapter: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: [
        { views: 'desc' },
        { helpful: 'desc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      chapterId, 
      question, 
      easyAnswer, 
      detailedAnswer, 
      category, 
      difficulty, 
      tags 
    } = body

    const faq = await db.fAQ.create({
      data: {
        chapterId,
        question,
        easyAnswer,
        detailedAnswer,
        category,
        difficulty,
        tags: JSON.stringify(tags || [])
      }
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    )
  }
}