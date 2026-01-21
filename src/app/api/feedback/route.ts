import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      contentId,
      contentType,
      rating,
      tags,
      textFeedback,
      comparisonWinner
    } = body

    // Validation: Rating is required
    if (!rating) {
      return NextResponse.json(
        { error: 'Rating is required' },
        { status: 400 }
      )
    }

    // Validation: Rating must be thumbs_up or thumbs_down
    if (rating !== 'thumbs_up' && rating !== 'thumbs_down') {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      )
    }

    // Validation: Check if content exists based on content type
    let contentExists = false

    if (contentType === 'design') {
      const { data: design } = await supabase
        .from('designs')
        .select('id')
        .eq('id', contentId)
        .single()
      contentExists = !!design
    } else if (contentType === 'generated_content') {
      const { data: content } = await supabase
        .from('generated_content')
        .select('id')
        .eq('id', contentId)
        .single()
      contentExists = !!content
    } else if (contentType === 'city_element') {
      const { data: element } = await supabase
        .from('city_elements')
        .select('id')
        .eq('id', contentId)
        .single()
      contentExists = !!element
    } else if (contentType === 'approval') {
      // For approvals, we'll assume it exists as this might be a different flow
      contentExists = true
    }

    if (!contentExists) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    // Save feedback to database
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        content_id: contentId,
        content_type: contentType,
        rating: rating || null,
        tags: tags || [],
        text_feedback: textFeedback || null,
        comparison_winner: comparisonWinner || null
      } as any)
      .select()
      .single()

    if (feedbackError) {
      console.error('Error saving feedback:', feedbackError)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    // If this is a winning design comparison, save the design as approved
    if (comparisonWinner && contentType === 'design') {
      const { error: updateError } = await (supabase as any)
        .from('designs')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId)

      if (updateError) {
        console.error('Error updating design status:', updateError)
        // Don't fail the whole request if design update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Design saved!',
      data: feedback
    })

  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType')

    let query = supabase.from('feedback').select('*')

    if (contentId) {
      query = query.eq('content_id', contentId)
    }

    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching feedback:', error)
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}