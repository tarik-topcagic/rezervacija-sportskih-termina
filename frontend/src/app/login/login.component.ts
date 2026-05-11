import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginModel = {
    username: '',
    password: ''
  };
  errorMessageKey: string = '';
  passwordVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
  ) {}
  ngOnInit(): void {
    document.body.classList.add('login-page');
  }

  login() {
    this.authService.login(this.loginModel).subscribe(
      (user) => {
        this.languageService.syncLanguageFromBackend().subscribe(() => {
          this.router.navigate(['/home']);
          console.log('Login successful');
        });
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessageKey = 'invalidLogin';
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible; 
  }

  ngOnDestroy(): void {
    document.body.classList.remove('login-page');
  }
}
