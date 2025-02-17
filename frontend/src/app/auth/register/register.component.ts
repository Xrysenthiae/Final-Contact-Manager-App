import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  userData = { username: '', password: '', role: 'user' };

  constructor(private authService: AuthService) {}

  async register() {
    await this.authService.register(this.userData);
  }
}
