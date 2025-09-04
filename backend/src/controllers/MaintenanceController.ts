import { Request, Response } from 'express';
import { DocumentTypeModel } from '../models/DocumentType';
import { PositionModel } from '../models/Position';
import { EmployeeModel } from '../models/Employee';
import { DepartmentModel } from '../models/Department';
import { AuthorizedAreaModel } from '../models/AuthorizedArea';

export class MaintenanceController {
  // Document Types endpoints
  static async getDocumentTypes(req: Request, res: Response) {
    try {
      const documentTypes = await DocumentTypeModel.getAll();
      res.json(documentTypes);
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const documentType = await DocumentTypeModel.getById(id);
      if (!documentType) {
        res.status(404).json({ error: 'Document type not found' });
        return;
      }
      res.json(documentType);
    } catch (error) {
      console.error('Error fetching document type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const documentType = await DocumentTypeModel.create(req.body);
      res.status(201).json(documentType);
    } catch (error) {
      console.error('Error creating document type:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Document type name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const documentType = await DocumentTypeModel.update(id, req.body);
      if (!documentType) {
        res.status(404).json({ error: 'Document type not found' });
        return;
      }
      res.json(documentType);
    } catch (error) {
      console.error('Error updating document type:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Document type name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteDocumentType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await DocumentTypeModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Document type not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Positions endpoints
  static async getPositions(req: Request, res: Response) {
    try {
      const positions = await PositionModel.getAll();
      res.json(positions);
    } catch (error) {
      console.error('Error fetching positions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getPosition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const position = await PositionModel.getById(id);
      if (!position) {
        res.status(404).json({ error: 'Position not found' });
        return;
      }
      res.json(position);
    } catch (error) {
      console.error('Error fetching position:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createPosition(req: Request, res: Response): Promise<void> {
    try {
      const position = await PositionModel.create(req.body);
      res.status(201).json(position);
    } catch (error) {
      console.error('Error creating position:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Position name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updatePosition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const position = await PositionModel.update(id, req.body);
      if (!position) {
        res.status(404).json({ error: 'Position not found' });
        return;
      }
      res.json(position);
    } catch (error) {
      console.error('Error updating position:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Position name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deletePosition(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await PositionModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Position not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting position:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Employees endpoints
  static async getEmployees(req: Request, res: Response) {
    try {
      const employees = await EmployeeModel.getAll();
      res.json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.getById(id);
      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json(employee);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const employee = await EmployeeModel.create(req.body);
      res.status(201).json(employee);
    } catch (error) {
      console.error('Error creating employee:', error);
      if ((error as any).code === '23505') {
        if ((error as any).constraint === 'employees_code_key') {
          res.status(400).json({ error: 'Employee code already exists' });
          return;
        }
        if ((error as any).constraint === 'employees_document_type_id_document_number_key') {
          res.status(400).json({ error: 'Employee with this document already exists' });
          return;
        }
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const employee = await EmployeeModel.update(id, req.body);
      if (!employee) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      if ((error as any).code === '23505') {
        if ((error as any).constraint === 'employees_code_key') {
          res.status(400).json({ error: 'Employee code already exists' });
          return;
        }
        if ((error as any).constraint === 'employees_document_type_id_document_number_key') {
          res.status(400).json({ error: 'Employee with this document already exists' });
          return;
        }
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await EmployeeModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Departments endpoints
  static async getDepartments(req: Request, res: Response) {
    try {
      const departments = await DepartmentModel.getAll();
      res.json(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const department = await DepartmentModel.getById(id);
      if (!department) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      res.json(department);
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const department = await DepartmentModel.create(req.body);
      res.status(201).json(department);
    } catch (error) {
      console.error('Error creating department:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Department name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const department = await DepartmentModel.update(id, req.body);
      if (!department) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      res.json(department);
    } catch (error) {
      console.error('Error updating department:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Department name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await DepartmentModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Department not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Authorized Areas endpoints
  static async getAuthorizedAreas(req: Request, res: Response) {
    try {
      const authorizedAreas = await AuthorizedAreaModel.getAll();
      res.json(authorizedAreas);
    } catch (error) {
      console.error('Error fetching authorized areas:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAuthorizedArea(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authorizedArea = await AuthorizedAreaModel.getById(id);
      if (!authorizedArea) {
        res.status(404).json({ error: 'Authorized area not found' });
        return;
      }
      res.json(authorizedArea);
    } catch (error) {
      console.error('Error fetching authorized area:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async createAuthorizedArea(req: Request, res: Response): Promise<void> {
    try {
      const authorizedArea = await AuthorizedAreaModel.create(req.body);
      res.status(201).json(authorizedArea);
    } catch (error) {
      console.error('Error creating authorized area:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Authorized area name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateAuthorizedArea(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const authorizedArea = await AuthorizedAreaModel.update(id, req.body);
      if (!authorizedArea) {
        res.status(404).json({ error: 'Authorized area not found' });
        return;
      }
      res.json(authorizedArea);
    } catch (error) {
      console.error('Error updating authorized area:', error);
      if ((error as any).code === '23505') {
        res.status(400).json({ error: 'Authorized area name already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteAuthorizedArea(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await AuthorizedAreaModel.delete(id);
      if (!deleted) {
        res.status(404).json({ error: 'Authorized area not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting authorized area:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}