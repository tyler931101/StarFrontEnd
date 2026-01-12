import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './services/chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatUser, ChatMessage, SendMessageDto } from './models/chat.model';
import { AvatarService } from 'app/core/services/avatar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat.component',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit, OnDestroy {

  chatUsers: ChatUser[] = [];
  isLoading = false;
  selectedChatUser: ChatUser | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoadingMessages = false;
  connectionStatus = 'Disconnected';

  chatUserAvatars: Map<string, string> = new Map();

  private messageSubscription: Subscription | null = null;

  constructor(
    private chatService: ChatService,
    private avatarService: AvatarService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit() {
    this.loadUsers();
    this.setupSignalR();
  }

  async setupSignalR() {
    try {
      await this.chatService.startConnection();
      this.updateConnectionStatus();

      this.messageSubscription = this.chatService.messageReceived$.subscribe(message => {
        if (message && this.selectedChatUser &&
          (message.senderId === this.selectedChatUser.id || message.receiverId === this.selectedChatUser.id)) {
          this.messages.push(message);
          this.cdr.detectChanges();
          this.scrollToBottom();
        }
      });
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
      this.connectionStatus = 'Failed';
      this.cdr.detectChanges();
    }
  }

  updateConnectionStatus() {
    this.connectionStatus = this.chatService.getConnectionState();
    this.cdr.detectChanges();
  }

  loadUsers() {
    this.isLoading = true;
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

  loadMessages(userId: string) {
    this.isLoadingMessages = true;
    this.messages = [];

    this.chatService.getMessages(userId).subscribe({
      next: (messages) => {
        this.messages = messages.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        this.isLoadingMessages = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedChatUser) {
      return;
    }

    const message: SendMessageDto = {
      receiverId: this.selectedChatUser.id,
      content: this.newMessage.trim()
    };

    this.chatService.sendHubMessage(message)
      .then(() => {
        this.newMessage = '';
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      const messageContainer = document.querySelector('.chat-messages');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }

  loadAllAvatars() {
    this.chatUserAvatars.clear();

    this.chatUsers.forEach(chatUser => {
      this.loadUserAvatar(chatUser.id);
    });
  }

  loadUserAvatar(chatUserId: string): void {
    this.avatarService.getAvatar(chatUserId).subscribe({
      next: (avatarUrl) => {
        this.chatUserAvatars.set(chatUserId, avatarUrl);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Failed to load avatar for user ${chatUserId}:`, error);
        this.chatUserAvatars.set(chatUserId, 'assets/default-avatar.png');
        this.cdr.detectChanges();
      }
    });
  }

  getAvatar(userId: string): string {
    return this.chatUserAvatars.get(userId) || 'assets/default-avatar.png';
  }

  selectChatUser(chatUser: ChatUser) {
    if (this.selectedChatUser === chatUser) {
      this.selectedChatUser = null;
      this.messages = [];
    } else {
      this.selectedChatUser = chatUser;
      this.loadMessages(chatUser.id);
    }
    this.cdr.detectChanges();
  }

  isUserSelected(chatUser: ChatUser): boolean {
    return this.selectedChatUser?.id === chatUser.id;
  }

  isMessageFromCurrentUser(message: ChatMessage): boolean {
    const currentUserId = localStorage.getItem('token') ? this.getUserIdFromToken() : null;
    return message.senderId === currentUserId;
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.nameid || payload?.sub || null;
    } catch {
      return null;
    }
  }

  formatMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    this.chatUserAvatars.clear();
    this.avatarService.clearAvatars();

    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }

    this.chatService.stopConnection();
  }
}
