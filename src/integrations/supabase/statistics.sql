
-- Function to get department statistics
CREATE OR REPLACE FUNCTION get_department_stats()
RETURNS TABLE (name text, value bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    department as name, 
    COUNT(*) as value
  FROM 
    profiles
  WHERE 
    department IS NOT NULL
  GROUP BY 
    department
  ORDER BY
    value DESC;
END;
$$;

-- Function to get university statistics
CREATE OR REPLACE FUNCTION get_university_stats()
RETURNS TABLE (name text, value bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    university as name, 
    COUNT(*) as value
  FROM 
    profiles
  WHERE 
    university IS NOT NULL
  GROUP BY 
    university
  ORDER BY 
    value DESC;
END;
$$;

-- Function to get role statistics
CREATE OR REPLACE FUNCTION get_role_stats()
RETURNS TABLE (name text, value bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    role as name, 
    COUNT(*) as value
  FROM 
    profiles
  GROUP BY 
    role
  ORDER BY
    value DESC;
END;
$$;

-- Function to get real-time department statistics with pagination
CREATE OR REPLACE FUNCTION get_department_stats_paginated(page_size INT, page_number INT)
RETURNS TABLE (name text, value bigint) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    department as name, 
    COUNT(*) as value
  FROM 
    profiles
  WHERE 
    department IS NOT NULL
  GROUP BY 
    department
  ORDER BY
    value DESC, name ASC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$;
