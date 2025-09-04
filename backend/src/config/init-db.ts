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

    // Create document_types table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create positions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create employees table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        document_type_id UUID REFERENCES document_types(id),
        document_number VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name1 VARCHAR(100) NOT NULL,
        last_name2 VARCHAR(100),
        nick_name VARCHAR(100),
        position_id UUID REFERENCES positions(id),
        department_id UUID REFERENCES departments(id),
        picture VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100),
        UNIQUE(document_type_id, document_number)
      );
    `);

    // Create authorized_areas table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS authorized_areas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        security_level VARCHAR(20) NOT NULL CHECK (security_level IN ('Bajo', 'Medio', 'Alto', 'Crítico')),
        requires_escort BOOLEAN DEFAULT false,
        max_occupancy INTEGER,
        location VARCHAR(200),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      );
    `);

    // Update departments table structure
    await pool.query(`
      ALTER TABLE departments
      ADD COLUMN IF NOT EXISTS manager VARCHAR(200),
      ADD COLUMN IF NOT EXISTS location VARCHAR(200),
      ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
      ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);
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

    // Insert default document types
    await pool.query(`
      INSERT INTO document_types (name, description) VALUES
      ('Cédula de Ciudadanía', 'Documento de identidad nacional para ciudadanos colombianos'),
      ('Cédula de Extranjería', 'Documento de identidad para extranjeros residentes en Colombia'),
      ('Pasaporte', 'Documento de viaje internacional'),
      ('Tarjeta de Identidad', 'Documento de identificación temporal'),
      ('Licencia de Conducción', 'Documento de autorización para conducir vehículos')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert default positions
    await pool.query(`
      INSERT INTO positions (name, description) VALUES
      ('Gerente General', 'Máxima autoridad ejecutiva'),
      ('Gerente de Área', 'Responsable de área específica'),
      ('Coordinador', 'Coordina actividades del equipo'),
      ('Analista', 'Realiza análisis y estudios específicos'),
      ('Asistente', 'Brinda apoyo administrativo'),
      ('Técnico', 'Especialista técnico'),
      ('Operario', 'Personal operativo')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert sample employees
    await pool.query(`
      INSERT INTO employees (code, document_type_id, document_number, first_name, last_name1, last_name2, nick_name, position_id, department_id, created_by)
      SELECT
        'EMP001',
        dt.id,
        '12345678',
        'Juan Carlos',
        'García',
        'López',
        'Juan',
        p.id,
        d.id,
        'system'
      FROM document_types dt, positions p, departments d
      WHERE dt.name = 'Cédula de Ciudadanía'
        AND p.name = 'Gerente General'
        AND d.name = 'Human Resources'
      ON CONFLICT (code) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO employees (code, document_type_id, document_number, first_name, last_name1, last_name2, nick_name, position_id, department_id, created_by)
      SELECT
        'EMP002',
        dt.id,
        '87654321',
        'María Elena',
        'Rodríguez',
        'Martínez',
        'María',
        p.id,
        d.id,
        'system'
      FROM document_types dt, positions p, departments d
      WHERE dt.name = 'Cédula de Ciudadanía'
        AND p.name = 'Coordinador'
        AND d.name = 'IT Department'
      ON CONFLICT (code) DO NOTHING;
    `);

    // Insert default authorized areas
    await pool.query(`
      INSERT INTO authorized_areas (name, description, security_level, requires_escort, max_occupancy, location, created_by) VALUES
      ('Recepción Principal', 'Área de recepción y atención al público', 'Bajo', false, 50, 'Planta Baja', 'system'),
      ('Oficinas Administrativas', 'Área de oficinas administrativas generales', 'Medio', false, 30, 'Primer Piso', 'system'),
      ('Sala de Servidores', 'Centro de datos y servidores críticos', 'Crítico', true, 5, 'Sótano', 'system'),
      ('Área de Producción', 'Zona de manufactura y producción', 'Alto', false, 20, 'Segundo Piso', 'system'),
      ('Laboratorio', 'Laboratorio de investigación y desarrollo', 'Alto', true, 10, 'Tercer Piso', 'system')
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
      CREATE INDEX IF NOT EXISTS idx_document_types_name ON document_types(name);
      CREATE INDEX IF NOT EXISTS idx_positions_name ON positions(name);
      CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(code);
      CREATE INDEX IF NOT EXISTS idx_employees_document ON employees(document_type_id, document_number);
      CREATE INDEX IF NOT EXISTS idx_authorized_areas_name ON authorized_areas(name);
      CREATE INDEX IF NOT EXISTS idx_authorized_areas_security_level ON authorized_areas(security_level);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};