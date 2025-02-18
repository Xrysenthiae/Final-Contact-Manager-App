import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      console.log('Attempting Login with:', this.credentials);
      const userData = await this.authService.login(this.credentials);

      this.successMessage = `Welcome, ${userData.user.username}! Redirecting...`;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('role', userData.user.role);

      setTimeout(() => {
        if (userData.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      }, 1000);
    } catch (error: any) {  
      console.error('Login Error:', error);

      if (error?.status === 400) {
        this.errorMessage = "Required: Username and Password";
      } else if (error?.status === 404) {
        this.errorMessage = "User Does Not Exist";
      } else if (error?.status === 401) {
        this.errorMessage = "Incorrect Password";
      } else {
        this.errorMessage = "Login Error";
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
