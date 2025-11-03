import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const chapter = await db.chapter.findUnique({
      where: {
        id: id,
        isPublished: true
      },
      include: {
        exercises: {
          orderBy: {
            order: 'asc'
          }
        },
        quizzes: {
          orderBy: {
            order: 'asc'
          }
        },
        resources: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const parsedChapter = {
      ...chapter,
      objectives: chapter.objectives ? JSON.parse(chapter.objectives) : []
    }

    return NextResponse.json(parsedChapter)
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    )
  }
}