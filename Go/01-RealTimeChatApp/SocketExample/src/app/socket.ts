import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Message {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class Socket {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {}

  connect(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      console.log('WebSocket 连接已建立');
    };

    this.socket.onmessage = (event) => {
      try {
        console.log('原始消息:', event.data); // 调试用

        // 尝试解析 JSON
        const parsedData = JSON.parse(event.data);
        this.messagesSubject.next(parsedData);
      } catch (error) {
        // 如果不是 JSON，就当作普通字符串处理
        console.log('非JSON消息:', event.data);
        this.messagesSubject.next(event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已关闭');
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
  }

  // 发送 JSON 格式消息
  sendMessage(message: Message): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket 连接未建立');
    }
  }

  // 发送原始字符串消息（适配 Go 后端）
  sendRawMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket 连接未建立');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  getConnectionStatus(): string {
    if (!this.socket) return 'DISCONNECTED';

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }
}
