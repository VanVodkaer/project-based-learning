import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatComponent } from './chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'SocketExample';
}
