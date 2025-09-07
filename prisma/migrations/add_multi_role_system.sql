-- Migration: Add Multi-Role System
-- Description: Implement user_roles table and update users table for multi-role support

-- Create user_roles table for many-to-many relationship
CREATE TABLE user_roles (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  granted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_user_roles_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint to prevent duplicate roles per user
  CONSTRAINT unique_user_role UNIQUE(user_id, role)
);

-- Add indexes for performance
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX idx_user_roles_granted_at ON user_roles(granted_at);

-- Add new columns to users table
ALTER TABLE users ADD COLUMN primary_role VARCHAR(50);
ALTER TABLE users ADD COLUMN active_role VARCHAR(50);
ALTER TABLE users ADD COLUMN role_switched_at TIMESTAMP;

-- Create index for new columns
CREATE INDEX idx_users_primary_role ON users(primary_role);
CREATE INDEX idx_users_active_role ON users(active_role);

-- Add comments for documentation
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON COLUMN user_roles.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_roles.role IS 'Role name (user, verified_tester, vendor, admin, super_admin)';
COMMENT ON COLUMN user_roles.is_active IS 'Whether this role is currently active for the user';
COMMENT ON COLUMN user_roles.granted_at IS 'When this role was granted to the user';
COMMENT ON COLUMN user_roles.granted_by IS 'Who granted this role (admin user ID)';

COMMENT ON COLUMN users.primary_role IS 'The primary role of the user (first role they had)';
COMMENT ON COLUMN users.active_role IS 'The currently active role for UI context';
COMMENT ON COLUMN users.role_switched_at IS 'When the user last switched roles';
