import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../service/firebase.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
  providers:[FirebaseService],

})
export class ChatComponent {
  
  chatService = inject(FirebaseService);

  user: { name: any, profile: string } ={
    name: "Jane Doe",
    profile:"profile.png"
  }

  
  isVisible = false;
  toggleDiv() {
    this.isVisible = !this.isVisible;
  }

  userName:any|undefined
  ngOnInit():void{
    this.chatService.user$.subscribe((user: any | null) => {
      if (user) {
        this.userName = user.displayName;
      } else {
        this.userName = 'Guest';
      }
    });  }
  
}
