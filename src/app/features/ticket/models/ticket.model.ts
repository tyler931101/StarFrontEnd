export type TicketStatus = 'todo' | 'in_progress' | 'resolved' | 'testing' | 'closed';

export interface Ticket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: TicketStatus;
  assignedTo: string;
  assignee?: {
    id: string;
    username: string;
    email?: string;
  };
  description?: string;
  dueDate: string;
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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  description?: string;
  dueDate: string;
}

export interface UpdateTicketDto {
  title?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  description?: string;
  dueDate: string;
}
