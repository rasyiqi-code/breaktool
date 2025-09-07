-- Add vendor status fields to users table
ALTER TABLE users ADD COLUMN vendor_status VARCHAR(50);
ALTER TABLE users ADD COLUMN vendor_approved_at TIMESTAMP;
ALTER TABLE users ADD COLUMN vendor_approved_by VARCHAR(255);

-- Create vendor_applications table
CREATE TABLE vendor_applications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_size VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  website_url VARCHAR(500) NOT NULL,
  linkedin_url VARCHAR(500),
  company_description TEXT NOT NULL,
  products_services TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  business_model VARCHAR(255) NOT NULL,
  motivation TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX idx_vendor_applications_created_at ON vendor_applications(created_at);

-- Add foreign key constraint
ALTER TABLE vendor_applications ADD CONSTRAINT fk_vendor_applications_user_id 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
