import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { App } from './app';
import { CoreModule } from './core/core.module';
import { routes } from './app.routes';
import { LayoutModule } from './core/layouts/layout.module';

@NgModule({
  imports: [
    App,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
      closeButton: true,
      progressBar: true
    }),
    CoreModule,
    LayoutModule
  ],
  bootstrap: [App]
})
export class AppModule {}