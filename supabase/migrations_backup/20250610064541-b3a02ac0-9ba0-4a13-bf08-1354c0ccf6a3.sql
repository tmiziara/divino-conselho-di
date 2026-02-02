-- Check if RLS is enabled on versiculos table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'versiculos';

-- Check RLS policies on versiculos table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'versiculos';