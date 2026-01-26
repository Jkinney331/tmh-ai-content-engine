import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params
    const approvals = await request.json()

    // Validate input
    if (!Array.isArray(approvals)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected array of approvals.' },
        { status: 400 }
      )
    }

    // Validate each approval object
    for (const approval of approvals) {
      if (!approval.elementId || !approval.status) {
        return NextResponse.json(
          { error: 'Each approval must have elementId and status' },
          { status: 400 }
        )
      }

      if (!['approved', 'rejected', 'pending'].includes(approval.status)) {
        return NextResponse.json(
          { error: 'Status must be approved, rejected, or pending' },
          { status: 400 }
        )
      }
    }

    // Update each element in the database
    const updatePromises = approvals.map(async (approval) => {
      const updateData: any = {
        status: approval.status,
        updated_at: new Date().toISOString()
      }

      // Only update notes if provided
      if (approval.notes !== undefined) {
        updateData.notes = approval.notes
      }

      const { data, error } = await supabase
        .from('city_elements')
        .update(updateData)
        .eq('id', approval.elementId)
        .eq('city_id', cityId) // Extra safety check to ensure element belongs to the city
        .select()

      if (error) {
        console.error(`Error updating element ${approval.elementId}:`, error)
        throw error
      }

      return data
    })

    // Wait for all updates to complete
    const results = await Promise.all(updatePromises)

    return NextResponse.json(
      {
        message: 'Decisions saved successfully',
        updated: results.flat().length
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error updating elements:', error)
    return NextResponse.json(
      { error: 'Failed to update element approvals' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const { cityId } = await params

    const { data: elements, error } = await supabase
      .from('city_elements')
      .select('*')
      .eq('city_id', cityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching city elements:', error)
      throw error
    }

    return NextResponse.json(elements || [], { status: 200 })

  } catch (error) {
    console.error('Error fetching elements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch city elements' },
      { status: 500 }
    )
  }
}