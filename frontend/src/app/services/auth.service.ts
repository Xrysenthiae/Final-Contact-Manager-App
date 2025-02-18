import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private router: Router) {}

  async login(credentials: any) {
    try {
      const response = await axios.post(`${this.apiUrl}/login`, credentials);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/user']);
      }

      return response.data;
    } catch (error) {
      console.error('Login Failed:', error);
      throw error;
    }
  }

  async register(userData: any) {
    try {
      const response = await axios.post(`${this.apiUrl}/register`, userData);
      const { token } = response.data;
      
      localStorage.setItem("auth_token", token);
      
      return response.data;
    } catch (error) {
      console.error("Registration Failed", error);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
