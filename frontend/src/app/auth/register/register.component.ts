import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RegisterComponent {
  userData = { username: '', password: '', role: 'user' };
  errorMessage: string = '';  
  isSubmitting: boolean = false; 

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    this.isSubmitting = true;
    this.errorMessage = ''; 

    try {
      const response = await this.authService.register(this.userData);

      if (response && response.message && response.message.includes('Successfully')) {
        console.log('Registration Successful:', response);
        this.router.navigate(['auth/login']);
      } else {
        throw new Error('Registration Failed: Invalid Response.');
      }
    } catch (error: any) {
      console.error('Registration Failed:', error);
      this.errorMessage = error.message || 'An Unexpected Error Occurred.';
    } finally {
      this.isSubmitting = false;
    }
  }
}