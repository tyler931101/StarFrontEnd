import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatService } from './services/chat.service';
import { CommonModule } from '@angular/common';
import { ChatUser } from './models/chat.model';
import { AvatarService } from 'app/core/services/avatar.service';

@Component({
  selector: 'app-chat.component',
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {

  chatUsers: ChatUser[] = [];
  isLoading = false;

  chatUserAvatars: Map<string, string> = new Map();
  constructor(
    private chatService: ChatService,
    private avatarService: AvatarService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.chatService.getChatUsers().subscribe({
      next: (response) => {
        this.chatUsers = response.chatUsers;
        this.isLoading = false;
        this.loadAllAvatars();
      },
      error: (error) => {
        console.error('Error loading chat users:', error);
        this.isLoading = false;
      }
    });
  }

  //Avatar
  loadAllAvatars() {
    // Clear previous avatars for this page
    this.chatUserAvatars.clear();
    
    // Load avatar for each user
    this.chatUsers.forEach(chatUser => {
      this.loadUserAvatar(chatUser.id);
    });
  }
  
  loadUserAvatar(chatUserId: string): void {
    this.avatarService.getAvatar(chatUserId).subscribe({
      next: (avatarUrl) => {
        // Store the avatar URL in the map
        this.chatUserAvatars.set(chatUserId, avatarUrl);
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error(`Failed to load avatar for user ${chatUserId}:`, error);
        // Set a default avatar on error
        this.chatUserAvatars.set(chatUserId, 'assets/default-avatar.png');
        this.cdr.detectChanges();
      }
    });
  }
  
  // Helper method to get avatar URL from cache
  getAvatar(userId: string): string {
    return this.chatUserAvatars.get(userId) || 'assets/default-avatar.png';
  }
  
  ngOnDestroy() {
    this.chatUserAvatars.clear();
    this.avatarService.clearAvatars();
  }
}
