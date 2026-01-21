-- Migration: Add order_index to generated_content for drag-drop reordering
-- Version: 009
-- Description: Adds order_index field to support custom ordering of content in grids

-- Add order_index column to generated_content table
ALTER TABLE public.generated_content
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Add index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_generated_content_order
ON public.generated_content(city_id, content_type, order_index);

-- Update existing rows to have sequential order indices based on creation date
UPDATE public.generated_content gc
SET order_index = sub.row_num - 1
FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY city_id, content_type ORDER BY created_at) as row_num
    FROM public.generated_content
) sub
WHERE gc.id = sub.id;

-- Add comment for documentation
COMMENT ON COLUMN public.generated_content.order_index IS 'Custom order index for drag-drop reordering in UI grids (0-based)';

-- Grant permissions
GRANT ALL ON public.generated_content TO anon;
GRANT ALL ON public.generated_content TO authenticated;
GRANT ALL ON public.generated_content TO service_role;