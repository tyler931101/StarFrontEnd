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

