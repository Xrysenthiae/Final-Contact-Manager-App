import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  notificationMessage: string = ''; 

  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No Token Found, Redirecting to Login...');
      this.router.navigate(['/auth/login']); 
      return;
    }
  
    this.userService.getUsers()
      .then(response => {
        console.log('Users Received in Frontend:', response.data); 
  
        if (!response.data || response.data.length === 0) {
          console.warn('No Users Found or Data is Empty');
          this.showNotification('No Users Found', 'error');
          return;
        }
  
        this.users = response.data;
        this.filteredUsers = response.data;
      })
      .catch(err => {
        console.error('Error Fetching Users:', err);
        this.showNotification('Error Loading Users', 'error');
      });
  }
  
  searchUsers() {
    this.filteredUsers = this.users.filter(user => 
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  updateUser(user: any) {
    this.userService.updateUser(user._id, { username: user.username, role: user.role })
      .then(() => {
        this.showNotification('User Updated Successfully!', 'success');
        this.fetchUsers(); 
      })
      .catch(err => {
        console.error('Error Updating User:', err);
        this.showNotification('Error Updating User', 'error');
      });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id)
        .then(() => {
          this.users = this.users.filter(user => user._id !== id);
          this.filteredUsers = this.filteredUsers.filter(user => user._id !== id);
          this.showNotification('User Deleted Successfully!', 'success');
        })
        .catch(err => {
          console.error('Error Deleting User:', err);
          this.showNotification('Error Deleting User', 'error');
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
