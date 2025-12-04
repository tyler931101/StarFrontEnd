import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonClass = 'primary';
  @Input() confirmDisabled = false;
  @Input() isVisible = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  
  constructor(private elementRef: ElementRef) {}
  
  open() {
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
  }
  
  close() {
    this.isVisible = false;
    document.body.style.overflow = 'auto';
    this.closeModal.emit();
  }
  
  confirmAction() {
    this.confirm.emit();
  }
  
  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isVisible) {
      this.close();
    }
  }
  
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (this.isVisible && !this.elementRef.nativeElement.querySelector('.modal-dialog').contains(event.target)) {
      this.close();
    }
  }
}
