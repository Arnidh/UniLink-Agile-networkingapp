
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
    department;
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
    university;
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
    role;
END;
$$;
