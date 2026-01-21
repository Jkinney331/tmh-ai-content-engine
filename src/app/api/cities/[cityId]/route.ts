import { NextRequest, NextResponse } from 'next/server'
import { updateCityStatus } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const body = await request.json()

    // Validate the request body
    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = ['draft', 'researching', 'ready', 'approved', 'active', 'archived']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update the city status in the database
    const updatedCity = await updateCityStatus(cityId, body.status)

    if (!updatedCity) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCity)
  } catch (error) {
    console.error('Error updating city status:', error)
    return NextResponse.json(
      { error: 'Failed to update city status' },
      { status: 500 }
    )
  }
}