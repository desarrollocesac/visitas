import pool from './database';

export const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'ANALYST')),
        permissions TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user_sessions table for JWT token management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT true,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create visitors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_number VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        photo_path VARCHAR(500) NOT NULL,
        id_photo_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        access_level INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create visits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
        host_name VARCHAR(200) NOT NULL,
        department VARCHAR(100) NOT NULL,
        purpose TEXT NOT NULL,
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out_time TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        access_areas TEXT[] DEFAULT '{}',
        sticker_printed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create access_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
        department VARCHAR(100) NOT NULL,
        access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_granted BOOLEAN NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default departments
    await pool.query(`
      INSERT INTO departments (name, description, access_level) VALUES
      ('Reception', 'Main reception area', 1),
      ('Human Resources', 'HR Department', 2),
      ('IT Department', 'Information Technology', 3),
      ('Executive Floor', 'Executive offices', 4),
      ('Server Room', 'Data center and servers', 5)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert default admin user (password: admin123)
    await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role, permissions) VALUES
      ('admin', 'admin@visitcontrol.com', '$2a$10$K8W9zv7mZcq3IrL5MdYHK.OkLZ1VnbNqyYfKT2/.vGHdvPYsE9bIm', 'System', 'Administrator', 'ADMIN',
       ARRAY['users.manage', 'users.view', 'visitor.register', 'visitor.view', 'visitor.edit', 'analytics.view', 'reports.view', 'reports.generate', 'system.settings', 'access.logs']),
      ('manager', 'manager@visitcontrol.com', '$2a$10$K8W9zv7mZcq3IrL5MdYHK.OkLZ1VnbNqyYfKT2/.vGHdvPYsE9bIm', 'John', 'Manager', 'MANAGER',
       ARRAY['users.view', 'visitor.register', 'visitor.view', 'visitor.edit', 'analytics.view', 'reports.view', 'reports.generate']),
      ('analyst', 'analyst@visitcontrol.com', '$2a$10$K8W9zv7mZcq3IrL5MdYHK.OkLZ1VnbNqyYfKT2/.vGHdvPYsE9bIm', 'Jane', 'Analyst', 'ANALYST',
       ARRAY['visitor.view', 'analytics.view', 'reports.view'])
      ON CONFLICT (username) DO NOTHING;
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_visitors_id_number ON visitors(id_number);
      CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
      CREATE INDEX IF NOT EXISTS idx_access_logs_visit_id ON access_logs(visit_id);
      CREATE INDEX IF NOT EXISTS idx_access_logs_access_time ON access_logs(access_time);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};