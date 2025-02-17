import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8000/api/contacts';

  getContacts(userId: string) {
    return axios.get(`${this.apiUrl}/user/${userId}`);
  }

  createContact(contactData: any) {
    return axios.post(this.apiUrl, contactData);
  }

  updateContact(id: string, contactData: any) {
    return axios.put(`${this.apiUrl}/${id}`, contactData);
  }

  deleteContact(id: string) {
    return axios.delete(`${this.apiUrl}/${id}`);
  }
}
