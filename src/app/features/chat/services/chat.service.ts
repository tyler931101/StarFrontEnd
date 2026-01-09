import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { ChatUserListResponse } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
    constructor(
        private api: ApiService
    ) {}

    getChatUsers() {
        return this.api.get<any>('chat/users').pipe(
            map((res: any) => {
                
                const chatUsers = res?.chatUsers ?? [];
                
                return {
                    chatUsers: chatUsers,
                    total: res?.total ?? chatUsers.length
                } as ChatUserListResponse;
            })
        );
    }
}