import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {Company, User} from '../../models/user.model';
import {ApiService} from '../../services/api.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  user: User = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CANDIDATE' as any
  };
  companies: Company[] = [];
  selectedCompanyId: number | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadCompanies();
  }

  loadCompanies() {
    this.apiService.getAllCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  onRoleChange() {
    if (this.user.role === 'CANDIDATE') {
      this.selectedCompanyId = null;
    }
  }

  onSubmit() {
    if (!this.user.firstName || !this.user.lastName || !this.user.email || !this.user.password || !this.user.role) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.user.role === 'RECRUITER' && !this.selectedCompanyId) {
      this.errorMessage = 'Please select a company for recruiter role';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const userToCreate = { ...this.user };
    if (this.user.role === 'RECRUITER' && this.selectedCompanyId) {
      userToCreate.company = { id: this.selectedCompanyId } as Company;
    }

    this.apiService.createUser(userToCreate).subscribe({
      next: (user) => {
        console.log('User created successfully:', user);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = 'Failed to create account. Please try again.';
        this.loading = false;
      }
    });
  }

}
