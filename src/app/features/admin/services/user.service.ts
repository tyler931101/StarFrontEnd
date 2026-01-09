import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { User, UserListResponse, UserQueryParams } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getUsers(params: UserQueryParams): Observable<UserListResponse> {
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('pageSize', params.pageSize);

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.api.get<any>('admin/users', httpParams).pipe(
      map((res: any) => {
        // Normalize common API shapes into UserListResponse
        if (res?.data) {
          const d = res.data;
          return {
            users: d.users ?? d.items ?? [],
            total: d.total ?? d.count ?? 0,
            page: d.page ?? params.page,
            pageSize: d.pageSize ?? params.pageSize,
            totalPages: d.totalPages ?? Math.ceil((d.total ?? d.count ?? 0) / (d.pageSize ?? params.pageSize))
          } as UserListResponse;
        }
        return {
          users: res.users ?? res.items ?? [],
          total: res.total ?? res.count ?? 0,
          page: res.page ?? params.page,
          pageSize: res.pageSize ?? params.pageSize,
          totalPages: res.totalPages ?? Math.ceil((res.total ?? res.count ?? 0) / (res.pageSize ?? params.pageSize))
        } as UserListResponse;
      })
    );
  }

  // getUser(id: string): Observable<User> {
  //   return this.api.get<any>(`admin/user/${id}`).pipe(
  //     map((res: any) => res.data ?? res.user ?? res)
  //   );
  // }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.api.put<any>(`admin/user/${id}`, userData).pipe(
      map((res: any) => res.data ?? res.user ?? res)
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.api.delete<any>(`admin/user/${id}`).pipe(
      map((res: any) => {
        if (typeof res === 'boolean') return res;
        if (res?.success !== undefined) return !!res.success;
        return true;
      })
    );
  }
}
