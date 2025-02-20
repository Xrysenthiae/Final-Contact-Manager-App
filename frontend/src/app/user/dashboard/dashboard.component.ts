import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class UserDashboardComponent implements OnInit {
  contacts: any[] = [];
  filteredContacts: any[] = [];
  searchQuery: string = '';
  notificationMessage: string = '';
  newContact = { name: '', email: '', phone: '' };
  submitted = false;

  constructor(
    private contactService: ContactService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchContacts();
  }

  createContact() {
    this.submitted = true;
    const { name, email, phone } = this.newContact;

    if (!name || !email || !phone) {
      this.showNotification('All fields are required!', 'error');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      this.showNotification('Invalid Email Format!', 'error');
      return;
    }

    const phonePattern = /^[0-9]{11}$/;
    if (!phonePattern.test(phone)) {
      this.showNotification('Phone Number must be 11 digits!', 'error');
      return;
    }
    
    this.contactService.createContact(this.newContact)
      .then(response => {
        console.log('Contact Created:', response.data); 
        this.showNotification('Contact Created Successfully!', 'success');
        this.fetchContacts(); 
        this.newContact = { name: '', email: '', phone: '' };
        this.submitted = false;
      })
      .catch(err => {
        console.error('Error Creating Contact:', err);
        this.showNotification('Error Creating Contact', 'error');
      });
  }

  fetchContacts() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No Token Found, Redirecting to Login...');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.contactService.getContacts()
      .then(response => {
        console.log('Contacts Received in Frontend:', response.data);

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          console.warn('No Contacts Found');
          this.showNotification('No Contacts Found', 'error');
          this.contacts = []; 
          this.filteredContacts = [];
          return;
        }

        this.contacts = response.data.data;
        this.filteredContacts = response.data.data;
      })
      .catch(err => {
        console.error('Error Fetching Contacts:', err);
        this.showNotification('Error Loading Contacts', 'error');
      });
  }

  searchContacts() {
    this.filteredContacts = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      contact.phone.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  updateContact(contact: any) {
    const { name, email, phone } = contact;

    if (!name || !email || !phone) {
      this.showNotification('All fields are required!', 'error');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      this.showNotification('Invalid email format!', 'error');
      return;
    }

    const phonePattern = /^[0-9]{11}$/;
    if (!phonePattern.test(phone)) {
      this.showNotification('Phone number must be 11 digits!', 'error');
      return;
    }

    this.contactService.updateContact(contact._id, { name, email, phone })
      .then(() => {
        this.showNotification('Contact Updated Successfully!', 'success');
        this.fetchContacts();
      })
      .catch(err => {
        console.error('Error Updating Contact:', err);
        this.showNotification('Error Updating Contact', 'error');
      });
  }

  deleteContact(id: string) {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contactService.deleteContact(id)
        .then(() => {
          this.contacts = this.contacts.filter(contact => contact._id !== id);
          this.filteredContacts = this.filteredContacts.filter(contact => contact._id !== id);
          this.showNotification('Contact Deleted Successfully!', 'success');
        })
        .catch(err => {
          console.error('Error Deleting Contact:', err);
          this.showNotification('Error Deleting Contact', 'error');
        });
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/auth/login']);
  }

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
