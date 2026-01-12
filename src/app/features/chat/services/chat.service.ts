import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { ChatUserListResponse, ChatMessage, SendMessageDto } from '../models/chat.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
    private hubConnection: HubConnection | null = null;
    private messageReceivedSubject = new BehaviorSubject<ChatMessage | null>(null);

    messageReceived$ = this.messageReceivedSubject.asObservable();

    constructor(
        private api: ApiService
    ) { }

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

    getMessages(userId: string): Observable<ChatMessage[]> {
        return this.api.get<any>(`chat/messages/${userId}`).pipe(
            map((res: any) => {
                return res?.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt),
                    isRead: msg.isRead
                })) || [];
            })
        );
    }

    sendMessage(message: SendMessageDto): Observable<any> {
        return this.api.post('chat/send', message);
    }

    startConnection(): Promise<void> {
        if (this.hubConnection?.state === 'Connected') {
            return Promise.resolve();
        }

        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        console.log('Token length:', token?.length);

        if (!token) {
            return Promise.reject('No authentication token found');
        }

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${environment.apiBaseUrl}/hubs/chat`, {
                accessTokenFactory: () => {
                    console.log('Providing access token for SignalR');
                    return token;
                }
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
            this.messageReceivedSubject.next(message);
        });

        this.hubConnection.onreconnecting(error => {
            console.log('SignalR reconnecting:', error);
        });

        this.hubConnection.onreconnected(connectionId => {
            console.log('SignalR reconnected:', connectionId);
        });

        this.hubConnection.onclose(error => {
            console.log('SignalR connection closed:', error);
        });

        console.log('Starting SignalR connection...');
        return this.hubConnection.start()
            .then(() => {
                console.log('SignalR connection established successfully');
            })
            .catch((err: any) => {
                console.error('Error establishing SignalR connection:', err);
                throw err;
            });
    }

    stopConnection(): void {
        if (this.hubConnection) {
            this.hubConnection.stop()
                .then(() => console.log('SignalR connection stopped'))
                .catch((err: any) => console.error('Error stopping SignalR connection:', err));
        }
    }

    sendHubMessage(message: SendMessageDto): Promise<void> {
        if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
            throw new Error('SignalR connection is not established');
        }

        return this.hubConnection.invoke('SendMessage', message);
    }

    getConnectionState(): string {
        return this.hubConnection?.state || 'Disconnected';
    }
}
