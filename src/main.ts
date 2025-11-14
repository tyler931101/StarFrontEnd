import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { App } from './app/app';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app/app.routes';
import { CoreModule } from './app/core/core.module';

bootstrapApplication(App, {
  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      RouterModule.forRoot(routes),
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
        closeButton: true,
        progressBar: true
      }),
      CoreModule,
      HttpClientModule
    )
  ]
}).catch(err => console.error(err));