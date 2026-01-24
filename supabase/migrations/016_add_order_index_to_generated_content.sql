-- Add order_index column to generated_content if missing
ALTER TABLE generated_content
ADD COLUMN IF NOT EXISTS order_index INTEGER;
