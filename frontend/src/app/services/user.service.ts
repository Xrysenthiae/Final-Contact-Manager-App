import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  getUsers() {
    return axios.get(this.apiUrl, this.getAuthHeaders());
  }

  updateUser(id: string, userData: { username: string, role: string }) {
    return axios.put(`${this.apiUrl}/${id}`, userData, this.getAuthHeaders());
  }

  deleteUser(id: string) {
    return axios.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
