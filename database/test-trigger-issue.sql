-- Check if the trigger is causing the RLS issue
-- Let's temporarily disable the trigger and test

-- First, let's see the trigger definition
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'public';

-- Test query with trigger enabled
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Temporarily disable the trigger to test
ALTER TABLE users DISABLE TRIGGER update_users_updated_at;

-- Test query without trigger
SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1;

-- Re-enable the trigger
ALTER TABLE users ENABLE TRIGGER update_users_updated_at;

-- Also check if there are any function issues with the trigger
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%updated_at%';
