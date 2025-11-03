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
        helpful: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ message: 'Helpful vote counted successfully' })
  } catch (error) {
    console.error('Error incrementing helpful:', error)
    return NextResponse.json(
      { error: 'Failed to increment helpful vote' },
      { status: 500 }
    )
  }
}