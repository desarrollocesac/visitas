const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false
});

async function initializeDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database');

    // Create tables
    console.log('📋 Creating tables...');
    
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
      ('Server Room', 'Data center and servers', 5),
      ('Conference Rooms', 'Meeting and conference rooms', 2),
      ('Cafeteria', 'Employee dining area', 1),
      ('Parking Garage', 'Vehicle parking area', 1)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_visitors_id_number ON visitors(id_number);
      CREATE INDEX IF NOT EXISTS idx_visits_visitor_id ON visits(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
      CREATE INDEX IF NOT EXISTS idx_access_logs_visit_id ON access_logs(visit_id);
      CREATE INDEX IF NOT EXISTS idx_access_logs_access_time ON access_logs(access_time);
    `);

    console.log('✅ Database tables created successfully');
    console.log('✅ Default departments inserted');
    console.log('✅ Database indexes created');
    console.log('🎉 Database initialization completed!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;