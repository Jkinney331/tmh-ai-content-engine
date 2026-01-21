-- Add error_message column to cities table for better error tracking
-- Migration: 014
-- Date: 2026-01-21

-- Add error_message column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cities' AND column_name = 'error_message'
    ) THEN
        ALTER TABLE cities ADD COLUMN error_message TEXT;
        COMMENT ON COLUMN cities.error_message IS 'Stores error messages when city research or processing fails';
    END IF;
END
$$;

-- Ensure 'error' is a valid status value (if using enum)
-- Note: This is a no-op if already exists or if using text type
DO $$
BEGIN
    -- Check if status is an enum type
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'city_status'
    ) THEN
        -- Add 'error' value if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'error'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'city_status')
        ) THEN
            ALTER TYPE city_status ADD VALUE IF NOT EXISTS 'error';
        END IF;
    END IF;
EXCEPTION
    WHEN others THEN
        -- Status might be a text column, which is fine
        RAISE NOTICE 'Status column is not an enum, skipping enum update';
END
$$;

-- Create index on error_message for quick lookups of failed cities
CREATE INDEX IF NOT EXISTS idx_cities_error_message ON cities(error_message) WHERE error_message IS NOT NULL;

-- Success
DO $$
BEGIN
    RAISE NOTICE 'Added error_message column to cities table';
END
$$;
