INSERT INTO storage.buckets (id, name, public)
VALUES ('ltrfl-cad', 'ltrfl-cad', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated read access to ltrfl-cad"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ltrfl-cad');

CREATE POLICY "Allow authenticated insert access to ltrfl-cad"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ltrfl-cad');

CREATE POLICY "Allow authenticated update access to ltrfl-cad"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ltrfl-cad');
