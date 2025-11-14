// Register interceptors globally

import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { TokenRefreshInterceptor } from './interceptors/token-refresh.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenRefreshInterceptor, multi: true }
  ]
})
export class CoreModule {}