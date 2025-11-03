import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const chapters = await db.chapter.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        timeEstimate: true,
        order: true
      }
    })

    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, objectives, quickRead, content, notebookUrl, timeEstimate, order } = body

    const chapter = await db.chapter.create({
      data: {
        title,
        description,
        category,
        objectives: JSON.stringify(objectives),
        quickRead,
        content,
        notebookUrl,
        timeEstimate,
        order,
        isPublished: false
      }
    })

    return NextResponse.json(chapter, { status: 201 })
  } catch (error) {
    console.error('Error creating chapter:', error)
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    )
  }
}