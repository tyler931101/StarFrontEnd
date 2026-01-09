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
        const data = res?.data || res;
        return {
          users: data.users ?? data.items ?? [],
          total: data.total ?? data.count ?? 0,
          page: data.page ?? params.page,
          pageSize: data.pageSize ?? params.pageSize,
          totalPages: data.totalPages ?? Math.ceil((data.total ?? data.count ?? 0) / (data.pageSize ?? params.pageSize)),
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
