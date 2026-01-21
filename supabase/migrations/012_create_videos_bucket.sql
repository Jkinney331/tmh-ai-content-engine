-- Create videos storage bucket for storing generated videos
-- Run this in Supabase SQL Editor

-- Create the videos bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

-- Allow public read access to videos
DROP POLICY IF EXISTS "Public video access" ON storage.objects;
CREATE POLICY "Public video access"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
DROP POLICY IF EXISTS "Authenticated video upload" ON storage.objects;
CREATE POLICY "Authenticated video upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow anon users to upload videos (for development)
DROP POLICY IF EXISTS "Anon video upload" ON storage.objects;
CREATE POLICY "Anon video upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'videos');

-- Allow users to update their videos
DROP POLICY IF EXISTS "Video update policy" ON storage.objects;
CREATE POLICY "Video update policy"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos')
WITH CHECK (bucket_id = 'videos');

-- Allow users to delete videos
DROP POLICY IF EXISTS "Video delete policy" ON storage.objects;
CREATE POLICY "Video delete policy"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos');
