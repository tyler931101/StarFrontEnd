import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import components
import { SearchComponent } from './search/search.component';
import { ModalComponent } from './modal/modal.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { PaginationComponent } from './pagination/pagination.component';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    ConfirmComponent,
    SearchComponent,
    PaginationComponent
  ],
  exports: [
    SearchComponent,
    ModalComponent,
    ConfirmComponent,
    PaginationComponent
  ]
})
export class ComponentsModule { }
