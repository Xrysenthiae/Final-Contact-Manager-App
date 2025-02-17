import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api/users';

  getUsers() {
    return axios.get(this.apiUrl);
  }

  updateUser(id: string, userData: any) {
    return axios.put(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string) {
    return axios.delete(`${this.apiUrl}/${id}`);
  }
}
