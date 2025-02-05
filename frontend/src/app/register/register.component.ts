import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerModel = {
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: ''
  };

  passwordStrengthError = false;
  passwordVisible: boolean = false;
  usernameTakenError = false;
  usernameSpaceError = false;

  constructor(private authService: AuthService, private router: Router) {}

  validateUsername(): void {
    this.usernameSpaceError = false;
    const username = this.registerModel.username || '';
    const spaceRegex = /\s/;  

    if (spaceRegex.test(username)) {
      this.usernameSpaceError = true;
    }
  }

  validatePassword(): void {
    this.passwordStrengthError = false;  
    const password = this.registerModel.password || '';  
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,}$/;  
    const spaceRegex = /\s/;  

    if (spaceRegex.test(password)) {
      this.passwordStrengthError = true;  
    } else if (password.length < 6) {
      this.passwordStrengthError = true;  
    } else if (!passwordRegex.test(password)) {
      this.passwordStrengthError = true;  
    }
  }

  register(form: NgForm) {
    if (form.invalid || this.passwordStrengthError || this.usernameSpaceError) {
      return;
    }

    this.usernameTakenError = false; 

    this.authService.register(this.registerModel).subscribe({
      next: (response) => {
        this.authService.login({ username: this.registerModel.username, password: this.registerModel.password })
          .subscribe({
            next: () => {
              this.router.navigate(['/pocetna']); 
            },
            error: (error) => {
              console.error('Login error:', error);
            }
          });
      },
      error: (error) => {
        if (error.error && error.error.message === "Username is already taken.") {
          this.usernameTakenError = true; 
        }
        console.error('Registration error:', error);
        console.log('Full error details:', error.error);  
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}









