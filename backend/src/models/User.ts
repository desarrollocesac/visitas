import { z } from 'zod';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  permissions: string[];
  is_active: boolean;
  last_login: Date | null;
  avatar_url?: string;
  phone?: string;
  created_at: Date;
  updated_at: Date;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST';

export interface UserPermissions {
  'users.manage': boolean;
  'users.view': boolean;
  'visitor.register': boolean;
  'visitor.view': boolean;
  'visitor.edit': boolean;
  'analytics.view': boolean;
  'reports.view': boolean;
  'reports.generate': boolean;
  'system.settings': boolean;
  'access.logs': boolean;
}

export const defaultPermissions: Record<UserRole, string[]> = {
  ADMIN: [
    'users.manage',
    'users.view',
    'visitor.register',
    'visitor.view', 
    'visitor.edit',
    'analytics.view',
    'reports.view',
    'reports.generate',
    'system.settings',
    'access.logs'
  ],
  MANAGER: [
    'users.view',
    'visitor.register',
    'visitor.view',
    'visitor.edit', 
    'analytics.view',
    'reports.view',
    'reports.generate'
  ],
  ANALYST: [
    'visitor.view',
    'analytics.view',
    'reports.view'
  ]
};

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  role: z.enum(['ADMIN', 'MANAGER', 'ANALYST']),
  phone: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'ANALYST']).optional(),
  is_active: z.boolean().optional(),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;