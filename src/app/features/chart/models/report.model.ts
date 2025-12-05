import { TicketStatus } from '../../ticket/models/ticket.model';

export interface StatusCount {
  status: TicketStatus;
  count: number;
}

export interface StatusReportParams {
  createdByUserId?: string;
  assignedToUserId?: string;
}

export interface StatusReportResponse {
  counts: StatusCount[];
  total: number;
}

export interface UserStatusCountParams {
  userId: string;
  relation?: 'created' | 'assigned';
  status?: TicketStatus;
}

export interface UserStatusCountResponse {
  count: number;
}
