import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  ANALYST: 'analyst'
};

// Permisos por rol
export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'visitor.register',
    'visitor.view',
    'visitor.edit',
    'visitor.delete',
    'reports.view',
    'reports.export',
    'settings.manage',
    'users.manage',
    'system.monitor'
  ],
  [ROLES.MANAGER]: [
    'visitor.register',
    'visitor.view',
    'visitor.edit',
    'reports.view',
    'reports.export',
    'system.monitor'
  ],
  [ROLES.ANALYST]: [
    'visitor.view',
    'reports.view',
    'reports.export'
  ]
};

// Usuarios de demostración
const DEMO_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: ROLES.ADMIN,
    name: 'Rinaldy Molina',
    email: 'admin@empresa.com',
    avatar: null,
    department: 'Administración'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    role: ROLES.MANAGER,
    name: 'Jose Salazar',
    email: 'manager@empresa.com',
    avatar: null,
    department: 'Gerencia'
  },
  {
    id: 3,
    username: 'analyst',
    password: 'analyst123',
    role: ROLES.ANALYST,
    name: 'Luis Kendry',
    email: 'analyst@empresa.com',
    avatar: null,
    department: 'Análisis'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Simular validación de credenciales
      const foundUser = DEMO_USERS.find(
        u => u.username === username && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      } else {
        return { 
          success: false, 
          error: 'Usuario o contraseña incorrectos' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userPermissions = PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;