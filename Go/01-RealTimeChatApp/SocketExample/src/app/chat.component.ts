import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Socket, Message } from './socket';

interface ChatMessage {
  user: string;
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h2>实时聊天室</h2>
        <div class="connection-status" [class]="connectionStatus.toLowerCase()">
          {{ connectionStatus }}
        </div>
      </div>

      <div class="chat-messages">
        <div *ngFor="let msg of messages" class="message">
          <div class="message-header">
            <span class="username">{{ msg.user }}</span>
            <span class="timestamp">{{
              msg.timestamp | date : 'HH:mm:ss'
            }}</span>
          </div>
          <div class="message-content">{{ msg.message }}</div>
        </div>
      </div>

      <div class="chat-input">
        <div class="user-input">
          <input
            type="text"
            [(ngModel)]="username"
            placeholder="输入用户名"
            class="username-input"
            [disabled]="isConnected"
          />
        </div>
        <div class="message-input">
          <input
            type="text"
            [(ngModel)]="newMessage"
            placeholder="输入消息..."
            class="message-text"
            (keyup.enter)="sendMessage()"
            [disabled]="!isConnected"
          />
          <button
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || !isConnected"
            class="send-button"
          >
            发送
          </button>
        </div>
        <div class="connection-controls">
          <button
            *ngIf="!isConnected"
            (click)="connect()"
            [disabled]="!username.trim()"
            class="connect-button"
          >
            连接
          </button>
          <button
            *ngIf="isConnected"
            (click)="disconnect()"
            class="disconnect-button"
          >
            断开连接
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-container {
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .chat-header {
        background: #007bff;
        color: white;
        padding: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chat-header h2 {
        margin: 0;
        font-size: 1.2em;
      }

      .connection-status {
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8em;
        font-weight: bold;
      }

      .connection-status.connected {
        background: #28a745;
      }

      .connection-status.connecting {
        background: #ffc107;
        color: #000;
      }

      .connection-status.disconnected {
        background: #dc3545;
      }

      .chat-messages {
        height: 400px;
        overflow-y: auto;
        padding: 15px;
        background: #f8f9fa;
      }

      .message {
        margin-bottom: 15px;
        padding: 10px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .message-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }

      .username {
        font-weight: bold;
        color: #007bff;
      }

      .timestamp {
        font-size: 0.8em;
        color: #666;
      }

      .message-content {
        color: #333;
      }

      .chat-input {
        padding: 15px;
        background: white;
        border-top: 1px solid #ddd;
      }

      .user-input,
      .message-input,
      .connection-controls {
        margin-bottom: 10px;
      }

      .user-input input,
      .message-input input {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }

      .message-input {
        display: flex;
        gap: 10px;
      }

      .message-text {
        flex: 1;
      }

      .send-button,
      .connect-button,
      .disconnect-button {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .send-button {
        background: #007bff;
        color: white;
      }

      .send-button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .connect-button {
        background: #28a745;
        color: white;
      }

      .disconnect-button {
        background: #dc3545;
        color: white;
      }

      .connection-controls {
        text-align: center;
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  newMessage = '';
  username = '';
  connectionStatus = 'DISCONNECTED';
  isConnected = false;

  private websocketUrl = 'ws://localhost:12345/ws';

  constructor(private socketService: Socket) {}

  ngOnInit() {
    this.socketService.messages$.subscribe((message: Message) => {
      this.handleMessage(message);
    });

    setInterval(() => {
      this.updateConnectionStatus();
    }, 1000);
  }

  ngOnDestroy() {
    this.socketService.disconnect();
  }

  connect() {
    if (this.username.trim()) {
      this.socketService.connect(this.websocketUrl);
    }
  }

  disconnect() {
    this.socketService.disconnect();
    this.messages = [];
  }

  sendMessage() {
    if (this.newMessage.trim() && this.isConnected) {
      // 直接发送字符串，Go 后端会处理为 {sender, content} 格式
      this.socketService.sendRawMessage(this.newMessage);
      this.newMessage = '';
    }
  }

  private handleMessage(message: any) {
    console.log('接收到消息:', message); // 调试用

    let chatMessage: ChatMessage;

    // 处理 Go 后端的消息格式 {sender, recipient, content}
    if (message.sender !== undefined || message.content !== undefined) {
      chatMessage = {
        user: message.sender || 'System',
        message: message.content || '',
        timestamp: new Date(),
      };
    }
    // 处理其他可能的格式
    else if (message.data && typeof message.data === 'object') {
      chatMessage = {
        user: message.data.user || message.data.sender || 'Unknown',
        message:
          message.data.message ||
          message.data.content ||
          JSON.stringify(message.data),
        timestamp: message.data.timestamp
          ? new Date(message.data.timestamp)
          : new Date(),
      };
    }
    // 如果是字符串消息
    else if (typeof message === 'string') {
      chatMessage = {
        user: 'Server',
        message: message,
        timestamp: new Date(),
      };
    }
    // 兜底处理
    else {
      chatMessage = {
        user: 'Unknown',
        message: JSON.stringify(message),
        timestamp: new Date(),
      };
    }

    this.messages.push(chatMessage);

    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  private updateConnectionStatus() {
    this.connectionStatus = this.socketService.getConnectionStatus();
    this.isConnected = this.connectionStatus === 'CONNECTED';
  }
}
