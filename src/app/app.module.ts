import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { AppRoutingModule, routes } from './app.routes';

@NgModule({
  declarations: [],
  imports: [
    AppComponent,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    // Toastr removed - provide a no-op implementation below to satisfy DI
    
    CoreModule,
    AppRoutingModule
  ],
  providers: [
    // Noop Toastr removed; uses NotificationService instead
   ],
   bootstrap: [AppComponent]
 })
 export class AppModule {}