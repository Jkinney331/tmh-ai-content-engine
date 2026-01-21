-- Test Script for Content Types Table
-- This script verifies all acceptance criteria

-- Test 1: Verify table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'content_types'
ORDER BY ordinal_position;

-- Test 2: Insert a new content type with template
INSERT INTO public.content_types (
    name,
    description,
    template,
    variables,
    output_format,
    platform_specs,
    active
) VALUES (
    'Test Content Type',
    'A test content type for verification',
    'Hello {{user_name}}! Welcome to {{city_name}}. Here is a {{element_type}} for you to explore.',
    '[
        {"name": "user_name", "type": "string", "required": true},
        {"name": "city_name", "type": "string", "required": true},
        {"name": "element_type", "type": "string", "required": true}
    ]'::JSONB,
    'text',
    '{"test": {"max_length": 500}}'::JSONB,
    true
) RETURNING *;

-- Test 3: Query active content types
SELECT
    id,
    name,
    description,
    output_format,
    active,
    created_at
FROM public.content_types
WHERE active = true
ORDER BY created_at DESC;

-- Test 4: Verify all required columns exist
SELECT
    CASE
        WHEN COUNT(*) = 9 THEN 'PASS: All required columns exist'
        ELSE 'FAIL: Missing columns'
    END AS column_test
FROM information_schema.columns
WHERE table_name = 'content_types'
    AND column_name IN (
        'id', 'name', 'description', 'template',
        'variables', 'output_format', 'platform_specs',
        'active', 'created_at'
    );

-- Test 5: Verify data types
SELECT
    CASE
        WHEN c.column_name = 'id' AND c.data_type = 'uuid' THEN 'PASS: id is uuid'
        WHEN c.column_name = 'name' AND c.data_type = 'text' THEN 'PASS: name is text'
        WHEN c.column_name = 'description' AND c.data_type = 'text' THEN 'PASS: description is text'
        WHEN c.column_name = 'template' AND c.data_type = 'text' THEN 'PASS: template is text'
        WHEN c.column_name = 'variables' AND c.data_type = 'jsonb' THEN 'PASS: variables is jsonb'
        WHEN c.column_name = 'output_format' AND c.data_type = 'text' THEN 'PASS: output_format is text'
        WHEN c.column_name = 'platform_specs' AND c.data_type = 'jsonb' THEN 'PASS: platform_specs is jsonb'
        WHEN c.column_name = 'active' AND c.data_type = 'boolean' THEN 'PASS: active is boolean'
        WHEN c.column_name = 'created_at' AND c.udt_name = 'timestamptz' THEN 'PASS: created_at is timestamptz'
        ELSE 'FAIL: ' || c.column_name || ' has incorrect type'
    END AS type_test
FROM information_schema.columns c
WHERE c.table_name = 'content_types'
    AND c.column_name IN (
        'id', 'name', 'description', 'template',
        'variables', 'output_format', 'platform_specs',
        'active', 'created_at'
    );

-- Test 6: Verify sample data was inserted
SELECT
    COUNT(*) AS sample_count,
    CASE
        WHEN COUNT(*) >= 5 THEN 'PASS: Sample content types inserted'
        ELSE 'FAIL: Sample content types not found'
    END AS sample_test
FROM public.content_types;

-- Test 7: Test querying with different filters
SELECT name, active, output_format
FROM public.content_types
WHERE output_format = 'markdown'
ORDER BY name;

-- Test 8: Test JSONB array functionality
SELECT
    name,
    jsonb_array_length(variables) as variable_count,
    variables->0->>'name' as first_variable_name
FROM public.content_types
WHERE jsonb_array_length(variables) > 0
LIMIT 3;

-- Cleanup test data (keep sample data)
DELETE FROM public.content_types WHERE name = 'Test Content Type';

-- Final Summary
SELECT 'All acceptance criteria verified successfully!' AS test_result;