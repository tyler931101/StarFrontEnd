export type TicketStatus = 'todo' | 'in_progress' | 'done';

export interface Ticket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: TicketStatus;
  assignedTo: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: TicketStatus;
  assignee?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateTicketDto {
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: TicketStatus;
  assignedTo: string;
  description?: string;
}

export interface UpdateTicketDto {
  title?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: TicketStatus;
  assignedTo?: string;
  description?: string;
}
