import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
})
export class ConfirmComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to perform this action?';
  @Input() details?: string;
  @Input() type: 'warning' | 'info' | 'success' = 'warning';
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonClass = 'danger';
  @Input() isVisible = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  
  onConfirm() {
    this.confirm.emit();
  }
  
  onClose() {
    this.closeModal.emit();
  }
}
