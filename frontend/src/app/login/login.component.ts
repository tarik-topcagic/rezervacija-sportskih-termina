import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginModel = {
    username: '',
    password: ''
  };
  errorMessage: string = '';
  passwordVisible: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.loginModel).subscribe(
      (user) => {
        this.router.navigate(['/pocetna']);
        console.log('Login successful');
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Nevalidno korisničko ime ili lozinka.';
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; 
  }
}





