import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { Ticket, TicketListResponse, TicketQueryParams, CreateTicketDto, UpdateTicketDto, TicketStatus } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private api: ApiService) {}

  getTickets(params: TicketQueryParams): Observable<TicketListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.assignee) httpParams = httpParams.set('assignee', params.assignee);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.api.get<any>('tickets', httpParams).pipe(
      map((res: any) => {
        if (res?.data) {
          const d = res.data;
          return {
            tickets: d.tickets ?? d.items ?? [],
            total: d.total ?? d.count ?? 0,
            page: d.page ?? params.page,
            pageSize: d.pageSize ?? params.pageSize,
            totalPages: d.totalPages ?? Math.ceil((d.total ?? d.count ?? 0) / (d.pageSize ?? params.pageSize))
          } as TicketListResponse;
        }
        return {
          tickets: res.tickets ?? res.items ?? [],
          total: res.total ?? res.count ?? 0,
          page: res.page ?? params.page,
          pageSize: res.pageSize ?? params.pageSize,
          totalPages: res.totalPages ?? Math.ceil((res.total ?? res.count ?? 0) / (res.pageSize ?? params.pageSize))
        } as TicketListResponse;
      })
    );
  }

  getTicket(id: string): Observable<Ticket> {
    return this.api.get<any>(`tickets/${id}`).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    return this.api.post<any>('tickets', dto).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  updateTicket(id: string, dto: UpdateTicketDto): Observable<Ticket> {
    return this.api.put<any>(`tickets/${id}`, dto).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  deleteTicket(id: string): Observable<boolean> {
    return this.api.delete<any>(`tickets/${id}`).pipe(
      map((res: any) => {
        if (typeof res === 'boolean') return res;
        if (res?.success !== undefined) return !!res.success;
        return true;
      })
    );
  }

  moveTicket(id: string, status: TicketStatus): Observable<Ticket> {
    return this.api.patch<any>(`tickets/${id}/move`, { status }).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }

  assignTicket(id: string, assignedTo: string): Observable<Ticket> {
    return this.api.patch<any>(`tickets/${id}/assign`, { assignedTo }).pipe(
      map((res: any) => res.data ?? res.ticket ?? res)
    );
  }
}
