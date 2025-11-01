import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userForm!: FormGroup;
  showForm = false;
  editingUserId: string | null = null;
  users: User[] = [];
  filteredUsers: User[] = [];
  searchUser: string = '';
  isSuperAdmin = false;

  constructor(
    private translate: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Set default language
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      nom: new FormControl('', [Validators.required]),
      prenom: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('', Validators.required),
      numero_telephone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')])
    });

    this.checkUserRole();
    this.fetchUsers(); // Fetch users based on role
  }

  checkUserRole(): void {
    const authData = this.authService.getAuthData();
    if (authData && authData.groups) {
      this.isSuperAdmin = authData.groups.includes('superadmin');
    }
  }

  fetchUsers(): void {
    // Only fetch users if the user is a superadmin
    if (!this.isSuperAdmin) {
      this.users = []; // Ensure the list is empty for admins
      this.filteredUsers = [];
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      console.error('No token found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<{ users: User[] }>('http://localhost:8000/authentification/users/affiche/', { headers })
      .subscribe(
        (response) => {
          if (Array.isArray(response.users)) {
            this.users = response.users;
            this.filteredUsers = [...response.users];
          } else {
            console.error('Server response is not an array:', response);
          }
        },
        (error) => {
          console.error('Error fetching users:', error);
        }
      );
  }

  handleAddUser(): void {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      const token = this.authService.getAccessToken();
      if (!token) {
        console.error('No token found. Please log in again.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      this.http.post<{ users: User[] }>('http://localhost:8000/authentification/users/register/', newUser, { headers })
        .subscribe(
          (response) => {
            this.fetchUsers();
            this.userForm.reset();
            this.showForm = false;
            Swal.fire(this.translate.instant('user_added_success'));
          },
          (error) => {
            console.error('Error adding user:', error);
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('error'),
              text: this.translate.instant('error_adding_user')
            });
          }
        );
    }
  }

  handleDeleteUser(user: User): void {
    if (!user || !user.id) {
      console.error('User ID is missing or undefined');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '300px',
      data: { id: user.id }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (!token) {
          console.error('No token found. Please log in again.');
          return;
        }

        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        this.http.delete(`http://localhost:8000/authentification/users/delete/${user.id}/`, { headers })
          .subscribe(
            () => {
              this.fetchUsers();
              Swal.fire(this.translate.instant('user_deleted_success'));
            },
            (error) => {
              console.error('Error deleting user:', error);
              Swal.fire({
                icon: 'error',
                title: this.translate.instant('error'),
                text: this.translate.instant('error_deleting_user')
              });
            }
          );
      }
    });
  }

  editUser(userId: string): void {
    this.editingUserId = userId;
    const userToEdit = this.users.find(user => user.id === userId);
    if (userToEdit) {
      this.userForm.setValue({
        nom: userToEdit.nom,
        prenom: userToEdit.prenom,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        numero_telephone: userToEdit.numero_telephone
      });
      this.showForm = true;
    }
  }

  saveUser(): void {
    if (this.userForm.valid && this.editingUserId) {
      const updatedUser = this.userForm.value;
      const token = this.authService.getAccessToken();
      if (!token) {
        console.error('No token found. Please log in again.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      this.http.put(`http://localhost:8000/authentification/users/modifier/${this.editingUserId}/`, updatedUser, { headers })
        .subscribe(
          () => {
            this.fetchUsers();
            this.editingUserId = null;
            this.userForm.reset();
            this.showForm = false;
            Swal.fire(this.translate.instant('user_updated_success'));
          },
          (error) => {
            console.error('Error updating user:', error);
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('error'),
              text: this.translate.instant('error_updating_user')
            });
          }
        );
    }
  }

  cancelEdit(): void {
    this.editingUserId = null;
    this.userForm.reset();
    this.showForm = false;
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter((user) =>
      Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(this.searchUser.toLowerCase())
      )
    );
  }

  onUserSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchUser = target.value;
    this.filterUsers();
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
  numero_telephone: string;
}