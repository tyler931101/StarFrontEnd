export interface ChatUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatUserListResponse {
  chatUsers: ChatUser[];
  total: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

export interface SendMessageDto {
  receiverId: string;
  content: string;
}

