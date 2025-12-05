import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { ComponentsModule } from './shared/components/components.module';

// Routes

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }

