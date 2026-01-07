import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Ticket, TicketListResponse, TicketQueryParams, CreateTicketDto, UpdateTicketDto, TicketStatus } from '../models/ticket.model';
import { User } from '../../admin/models/user.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private api: ApiService) {}

  getTickets(params: TicketQueryParams): Observable<TicketListResponse> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.assignee) httpParams = httpParams.set('assignee', params.assignee);

    return this.api.get<any>('ticket', httpParams).pipe(
      map((res: any) => {
        if (res?.data) {
          const d = res.data;
          return {
            tickets: d.tickets ?? d.items ?? [],
          } as TicketListResponse;
        }
        return {
          tickets: res.tickets ?? res.items ?? [],
        } as TicketListResponse;
      })
    );
  }

  getTicket(id: string): Observable<Ticket> {
    return this.api.get<any>(`ticket/${id}`).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    return this.api.post<any>('ticket', dto).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  updateTicket(id: string, dto: UpdateTicketDto): Observable<Ticket> {
    return this.api.put<any>(`ticket/${id}`, dto).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  deleteTicket(id: string): Observable<boolean> {
    return this.api.delete<any>(`ticket/${id}`).pipe(
      map((res: any) => {
        if (typeof res === 'boolean') return res;
        if (res?.success !== undefined) return !!res.success;
        return true;
      })
    );
  }

  moveTicket(id: string, status: TicketStatus): Observable<Ticket> {
    return this.api.patch<any>(`ticket/${id}/move`, { status }).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  assignTicket(id: string, assignedTo: string): Observable<Ticket> {
    return this.api.patch<any>(`ticket/${id}/assign`, { assignedTo }).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  // Lightweight users fetch for assignee dropdown (status filter optional, no pagination)
  getAssignes(): Observable<User[]> {
    return this.api.get<any>('ticket/assignes').pipe(
      map((res: any) => {
        const list = res?.data?.users ?? res?.data?.items ?? res?.users ?? res?.items ?? [];
        return list as User[];
      })
    );
  }
}
