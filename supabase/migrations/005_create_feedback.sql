-- ===============================================
-- Migration: 005_create_feedback.sql
-- Description: Create feedback table for user ratings on all content
-- Author: TMH Team
-- Date: 2024-01-20
-- ===============================================

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('design', 'generated_content', 'city_element', 'approval')),
    rating TEXT NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
    tags JSONB DEFAULT '[]'::jsonb,
    text_feedback TEXT,
    comparison_winner BOOLEAN DEFAULT FALSE,
    competitor_content_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),

    -- Add indexes for performance
    CONSTRAINT feedback_content_check CHECK (content_id IS NOT NULL)
);

-- Create indexes for better query performance
CREATE INDEX idx_feedback_content_id ON public.feedback(content_id);
CREATE INDEX idx_feedback_content_type ON public.feedback(content_type);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX idx_feedback_tags ON public.feedback USING gin(tags);
CREATE INDEX idx_feedback_comparison_winner ON public.feedback(comparison_winner) WHERE comparison_winner = TRUE;

-- Create composite index for common queries
CREATE INDEX idx_feedback_content_type_rating ON public.feedback(content_type, rating);

-- ===============================================
-- ROW LEVEL SECURITY (RLS)
-- ===============================================

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert feedback
CREATE POLICY "anon_insert_feedback" ON public.feedback
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow authenticated users to insert feedback
CREATE POLICY "auth_insert_feedback" ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy: Allow all users to select feedback
CREATE POLICY "all_select_feedback" ON public.feedback
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Allow users to update their own feedback
CREATE POLICY "auth_update_own_feedback" ON public.feedback
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Policy: Allow users to delete their own feedback
CREATE POLICY "auth_delete_own_feedback" ON public.feedback
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- ===============================================
-- HELPER FUNCTIONS FOR AGGREGATIONS
-- ===============================================

-- Function to get feedback counts by rating for a specific content
CREATE OR REPLACE FUNCTION get_feedback_counts(p_content_id UUID)
RETURNS TABLE(
    thumbs_up_count BIGINT,
    thumbs_down_count BIGINT,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE rating = 'thumbs_up') AS thumbs_up_count,
        COUNT(*) FILTER (WHERE rating = 'thumbs_down') AS thumbs_down_count,
        COUNT(*) AS total_count
    FROM public.feedback
    WHERE content_id = p_content_id;
END;
$$;

-- Function to get feedback aggregations by tags
CREATE OR REPLACE FUNCTION get_feedback_by_tags(p_tags JSONB DEFAULT NULL)
RETURNS TABLE(
    tag TEXT,
    thumbs_up_count BIGINT,
    thumbs_down_count BIGINT,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_tags IS NULL THEN
        -- Return all tags
        RETURN QUERY
        WITH tag_expansion AS (
            SELECT
                jsonb_array_elements_text(tags) AS tag,
                rating
            FROM public.feedback
            WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0
        )
        SELECT
            te.tag,
            COUNT(*) FILTER (WHERE te.rating = 'thumbs_up') AS thumbs_up_count,
            COUNT(*) FILTER (WHERE te.rating = 'thumbs_down') AS thumbs_down_count,
            COUNT(*) AS total_count
        FROM tag_expansion te
        GROUP BY te.tag
        ORDER BY total_count DESC;
    ELSE
        -- Return specific tags
        RETURN QUERY
        WITH tag_expansion AS (
            SELECT
                jsonb_array_elements_text(tags) AS tag,
                rating
            FROM public.feedback
            WHERE tags @> p_tags
        )
        SELECT
            te.tag,
            COUNT(*) FILTER (WHERE te.rating = 'thumbs_up') AS thumbs_up_count,
            COUNT(*) FILTER (WHERE te.rating = 'thumbs_down') AS thumbs_down_count,
            COUNT(*) AS total_count
        FROM tag_expansion te
        GROUP BY te.tag
        ORDER BY total_count DESC;
    END IF;
END;
$$;

-- Function to get comparison winners
CREATE OR REPLACE FUNCTION get_comparison_winners(p_content_type TEXT DEFAULT NULL)
RETURNS TABLE(
    winner_id UUID,
    loser_id UUID,
    win_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        content_id AS winner_id,
        competitor_content_id AS loser_id,
        COUNT(*) AS win_count
    FROM public.feedback
    WHERE
        comparison_winner = TRUE
        AND competitor_content_id IS NOT NULL
        AND (p_content_type IS NULL OR content_type = p_content_type)
    GROUP BY content_id, competitor_content_id
    ORDER BY win_count DESC;
END;
$$;

-- Function to get overall feedback stats
CREATE OR REPLACE FUNCTION get_feedback_stats(
    p_content_type TEXT DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
    content_type TEXT,
    thumbs_up_count BIGINT,
    thumbs_down_count BIGINT,
    total_count BIGINT,
    approval_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.content_type,
        COUNT(*) FILTER (WHERE f.rating = 'thumbs_up') AS thumbs_up_count,
        COUNT(*) FILTER (WHERE f.rating = 'thumbs_down') AS thumbs_down_count,
        COUNT(*) AS total_count,
        ROUND(
            100.0 * COUNT(*) FILTER (WHERE f.rating = 'thumbs_up') / NULLIF(COUNT(*), 0),
            2
        ) AS approval_rate
    FROM public.feedback f
    WHERE
        (p_content_type IS NULL OR f.content_type = p_content_type)
        AND (p_start_date IS NULL OR f.created_at >= p_start_date)
        AND (p_end_date IS NULL OR f.created_at <= p_end_date)
    GROUP BY f.content_type
    ORDER BY total_count DESC;
END;
$$;

-- ===============================================
-- SAMPLE DATA FOR TESTING
-- ===============================================

-- Insert sample feedback data
INSERT INTO public.feedback (content_id, content_type, rating, tags, text_feedback, comparison_winner, competitor_content_id)
VALUES
    -- Feedback for designs
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'design', 'thumbs_up',
     '["urban", "modern", "innovative"]'::jsonb, 'Great modern design!', FALSE, NULL),

    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'design', 'thumbs_down',
     '["too_complex"]'::jsonb, 'Too complicated for my taste', FALSE, NULL),

    -- Feedback for generated content
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'generated_content', 'thumbs_up',
     '["creative", "viral_potential"]'::jsonb, 'This would go viral on Reddit!', FALSE, NULL),

    -- Comparison feedback
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'generated_content', 'thumbs_up',
     '["better_quality", "more_engaging"]'::jsonb, 'This version is much better',
     TRUE, 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid),

    -- More feedback for aggregation testing
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'city_element', 'thumbs_up',
     '["urban", "sustainable"]'::jsonb, 'Love the sustainable approach', FALSE, NULL),

    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'city_element', 'thumbs_up',
     '["urban", "green"]'::jsonb, 'Great green infrastructure', FALSE, NULL);

-- ===============================================
-- GRANT PERMISSIONS
-- ===============================================

-- Grant permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.feedback TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_by_tags TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_comparison_winners TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_stats TO anon, authenticated;

-- ===============================================
-- COMMENTS FOR DOCUMENTATION
-- ===============================================

COMMENT ON TABLE public.feedback IS 'Stores user feedback and ratings for all content types';
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback entry';
COMMENT ON COLUMN public.feedback.content_id IS 'UUID of the content being rated';
COMMENT ON COLUMN public.feedback.content_type IS 'Type of content (design, generated_content, city_element, approval)';
COMMENT ON COLUMN public.feedback.rating IS 'User rating (thumbs_up or thumbs_down)';
COMMENT ON COLUMN public.feedback.tags IS 'JSON array of tags associated with the feedback';
COMMENT ON COLUMN public.feedback.text_feedback IS 'Optional text feedback from the user';
COMMENT ON COLUMN public.feedback.comparison_winner IS 'True if this content won in a comparison';
COMMENT ON COLUMN public.feedback.competitor_content_id IS 'UUID of the content this was compared against';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when the feedback was created';
COMMENT ON COLUMN public.feedback.created_by IS 'UUID of the user who created the feedback';

COMMENT ON FUNCTION get_feedback_counts IS 'Returns aggregated feedback counts for a specific content item';
COMMENT ON FUNCTION get_feedback_by_tags IS 'Returns feedback aggregations grouped by tags';
COMMENT ON FUNCTION get_comparison_winners IS 'Returns comparison results showing winners and losers';
COMMENT ON FUNCTION get_feedback_stats IS 'Returns overall feedback statistics with optional filters';