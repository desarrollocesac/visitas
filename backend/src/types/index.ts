export interface Visitor {
  id?: string;
  documentType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  photoPath: string;
  idPhotoPath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Visit {
  id?: string;
  visitorId: string;
  hostName: string;
  department: string;
  purpose: string;
  checkInTime: Date;
  checkOutTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  accessAreas: string[];
  stickerPrinted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Department {
  id?: string;
  name: string;
  description?: string;
  accessLevel: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccessLog {
  id?: string;
  visitId: string;
  department: string;
  accessTime: Date;
  accessGranted: boolean;
  reason?: string;
  createdAt?: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface VisitRequest {
  documentType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  hostName: string;
  department: string;
  purpose: string;
  accessAreas: string[];
}