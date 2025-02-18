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
  successMessage: string = '';  
  isSubmitting: boolean = false; 

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = ''; 

    try {
      const response = await this.authService.register(this.userData);
      console.log("Server Response:", response);
  
      this.successMessage = response.message;
      console.log('Registration Successful:', response.message);
      setTimeout(() => {
        this.router.navigate(['auth/login']);
      }, 2000);
    } catch (error: any) {
      console.error('Registration Failed:', error);
  
      if (error.response && error.response.data) {
        this.errorMessage =
          typeof error.response.data === 'object' && error.response.data.error
            ? error.response.data.error
            : error.response.data;
        console.log("Error from Axios:", this.errorMessage);
      } else if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = "Server Error";
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}