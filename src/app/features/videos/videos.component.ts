import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../shared/components/components.module';

@Component({
  selector: 'app-videos',
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule
  ],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.css',
})
export class VideosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  isCreateNewVideoModalVisible = false;

  // Loading states
  isSubmitting = false;
  isUploading = false;
  isLoadingVideo = false;

  callVideo: string = 'assets/default-avatar.png';

  // Messages
  successMessage = '';
  errorMessage = '';
  videoError = '';
  passwordError = '';

  selectedFile?: File;

  constructor() { }

  ngOnInit(): void { }

  openCreateModal() {
    this.isCreateNewVideoModalVisible = true;
  }

  saveNewVideo() {
    // Logic to save the new video
  }

  closeNewVideoModal() {
    this.isCreateNewVideoModalVisible = false;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!this.isValidVideo(file)) {
      // Reset file input
      this.fileInput.nativeElement.value = '';
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.callVideo = String(reader.result);
      this.videoError = '';
    };
    reader.readAsDataURL(file);

    // Reset file input
    this.fileInput.nativeElement.value = '';
  }

  isValidVideo(file: File): boolean {
    // allow common video MIME types and fallback to extension check if type is empty
    const allowedTypes = new Set([
      'video/mp4',
      'video/x-msvideo',     // avi
      'video/x-matroska',    // mkv
      'video/webm',
      'video/quicktime'      // mov
    ]);
    const allowedExt = ['mp4', 'avi', 'mkv', 'webm', 'mov'];

    const maxSize = 2000 * 1024 * 1024; // 2000 MB
    const maxSizeMB = 2000;

    if (file.type) {
      if (!allowedTypes.has(file.type)) {
        this.videoError = `Invalid video type. Allowed: MP4, AVI, MKV, WEBM, MOV.`;
        return false;
      }
    } else {
      // fallback by extension
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!allowedExt.includes(ext)) {
        this.videoError = `Invalid video type (unknown mime). Allowed extensions: ${allowedExt.join(', ')}.`;
        return false;
      }
    }

    if (file.size > maxSize) {
      this.videoError = `Video too large. Maximum size is ${maxSizeMB}MB.`;
      return false;
    }

    this.videoError = '';
    return true;
  }
}
