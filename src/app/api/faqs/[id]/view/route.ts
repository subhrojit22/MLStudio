import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.fAQ.update({
      where: { id: id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ message: 'View counted successfully' })
  } catch (error) {
    console.error('Error incrementing view:', error)
    return NextResponse.json(
      { error: 'Failed to increment view' },
      { status: 500 }
    )
  }
}