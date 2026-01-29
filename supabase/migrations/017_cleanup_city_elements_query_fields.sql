-- Remove query/search_query fields from city_elements.element_value
-- Safe to run multiple times
UPDATE city_elements
SET element_value = element_value - 'query' - 'search_query'
WHERE element_value ? 'query' OR element_value ? 'search_query';
