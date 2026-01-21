-- Test script to verify tag analysis functionality
-- Run this against your Supabase database to test the feature

-- Insert test feedback with various tags
INSERT INTO public.feedback (content_id, content_type, rating, tags, text_feedback)
VALUES
    -- Golden hour tag - mostly positive
    (gen_random_uuid(), 'generated_content', 'thumbs_up', '["golden_hour", "warm_lighting"]'::jsonb, 'Love the golden hour lighting'),
    (gen_random_uuid(), 'generated_content', 'thumbs_up', '["golden_hour", "cinematic"]'::jsonb, 'Perfect golden hour shot'),
    (gen_random_uuid(), 'generated_content', 'thumbs_up', '["golden_hour"]'::jsonb, 'Beautiful golden hour'),
    (gen_random_uuid(), 'generated_content', 'thumbs_up', '["golden_hour", "vibrant"]'::jsonb, 'Great golden hour colors'),
    (gen_random_uuid(), 'generated_content', 'thumbs_down', '["golden_hour", "too_warm"]'::jsonb, 'Too much golden hour effect'),

    -- Urban tag - mixed
    (gen_random_uuid(), 'design', 'thumbs_up', '["urban", "modern"]'::jsonb, 'Great urban design'),
    (gen_random_uuid(), 'design', 'thumbs_down', '["urban", "busy"]'::jsonb, 'Too urban for my taste'),
    (gen_random_uuid(), 'design', 'thumbs_up', '["urban", "innovative"]'::jsonb, 'Love the urban feel'),

    -- Minimalist tag - mostly negative
    (gen_random_uuid(), 'design', 'thumbs_down', '["minimalist", "boring"]'::jsonb, 'Too minimalist'),
    (gen_random_uuid(), 'design', 'thumbs_down', '["minimalist", "empty"]'::jsonb, 'Minimalist but empty'),
    (gen_random_uuid(), 'design', 'thumbs_down', '["minimalist"]'::jsonb, 'Not a fan of minimalist'),
    (gen_random_uuid(), 'design', 'thumbs_up', '["minimalist", "clean"]'::jsonb, 'Clean minimalist design');

-- Query to verify the data using the same function our component uses
SELECT * FROM get_feedback_by_tags();

-- Expected output should show:
-- golden_hour: ~85% positive (4 thumbs_up out of 5 total)
-- urban: ~67% positive (2 thumbs_up out of 3 total)
-- minimalist: ~25% positive (1 thumbs_up out of 4 total)