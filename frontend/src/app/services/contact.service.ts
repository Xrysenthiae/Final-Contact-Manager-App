import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8000/api/contacts';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  getContacts() {
    return axios.get(this.apiUrl, this.getAuthHeaders());
  }

  createContact(contactData: any) {
    return axios.post(this.apiUrl, contactData, this.getAuthHeaders());
  }

  updateContact(id: string, contactData: any) {
    return axios.put(`${this.apiUrl}/${id}`, contactData, this.getAuthHeaders());
  }

  deleteContact(id: string) {
    return axios.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
