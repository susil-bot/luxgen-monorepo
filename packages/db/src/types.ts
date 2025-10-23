export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant extends BaseEntity {
  name: string;
  subdomain: string;
  settings: Record<string, any>;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenant: Tenant;
}

export interface Course extends BaseEntity {
  title: string;
  description?: string;
  instructor: User;
  students: User[];
  tenant: Tenant;
  startDate?: Date;
  endDate?: Date;
  status: string;
}

export interface CreateTenantInput {
  name: string;
  subdomain: string;
  settings?: Record<string, any>;
}

export interface UpdateTenantInput {
  name?: string;
  subdomain?: string;
  settings?: Record<string, any>;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface UpdateUserInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  instructorId: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  instructorId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}
