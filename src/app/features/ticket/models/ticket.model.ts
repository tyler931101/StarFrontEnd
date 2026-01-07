export type TicketStatus = 'todo' | 'in_progress' | 'resolved' | 'testing' | 'done';

export interface Ticket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: TicketStatus;
  assignedTo: string;
  assignedToId?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: TicketStatus;
  assignee?: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
}

export interface CreateTicketDto {
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: TicketStatus;
  assignedTo?: string;
  assignedToId?: number;
  description?: string;
}

export interface UpdateTicketDto {
  title?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: TicketStatus;
  assignedTo?: string;
  assignedToId?: number;
  description?: string;
}
