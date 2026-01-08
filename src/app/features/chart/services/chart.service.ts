import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { StatusReportParams, StatusReportResponse, UserStatusCountParams, UserStatusCountResponse } from '../models/report.model';
import { Ticket } from '../../ticket/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class ChartService {
  useMock = true;
  private mockTickets: Ticket[] = [];

  constructor(private api: ApiService) {}

  setMockTickets(tickets: Ticket[]) {
    this.mockTickets = tickets;
  }

  getStatusReport(params: StatusReportParams = {}): Observable<StatusReportResponse> {
    if (this.useMock) {
      const items = this.mockTickets;
      const counts = [
        { status: 'todo', count: items.filter(t => t.status === 'todo').length },
        { status: 'in_progress', count: items.filter(t => t.status === 'in_progress').length },
        { status: 'closed', count: items.filter(t => t.status === 'closed').length },
      ] as any;
      const total = counts.reduce((s: number, c: any) => s + c.count, 0);
      return of({ counts, total });
    }

    let httpParams = new HttpParams();
    if (params.createdByUserId) httpParams = httpParams.set('createdByUserId', params.createdByUserId);
    if (params.assignedToUserId) httpParams = httpParams.set('assignedToUserId', params.assignedToUserId);
    return this.api.get<any>('tickets/report/status', httpParams).pipe(
      map((res: any) => res.data ?? res)
    );
  }

  getUserStatusCount(params: UserStatusCountParams): Observable<UserStatusCountResponse> {
    if (this.useMock) {
      const relation = params.relation ?? 'created';
      const items = this.mockTickets.filter(t => {
        const matchUser = relation === 'assigned' ? t.assignedTo === params.userId : true;
        const matchStatus = params.status ? t.status === params.status : true;
        return matchUser && matchStatus;
      });
      return of({ count: items.length });
    }

    let httpParams = new HttpParams().set('userId', params.userId);
    if (params.relation) httpParams = httpParams.set('relation', params.relation);
    if (params.status) httpParams = httpParams.set('status', params.status);
    return this.api.get<any>('tickets/report/user-status', httpParams).pipe(
      map((res: any) => res.data ?? res)
    );
  }
}
