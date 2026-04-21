import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  constructor(private router: Router, private languageService: LanguageService) {
    this.applySavedDarkMode();
    this.applySavedLanguage();
    this.redirectIfOnAuthPage();
  }

  private applySavedDarkMode(): void {
    document.body.classList.toggle(
      'dark-mode',
      localStorage.getItem('darkMode') === 'true',
    );
  }

  private applySavedLanguage(): void {
    this.languageService.setLanguage(localStorage.getItem('appLanguage') || 'bs');
  }

  private redirectIfOnAuthPage(): void {
    const authRoutes = ['/prijava', '/registracija'];
    if (authRoutes.includes(window.location.pathname)) {
      this.router.navigate(['/']);
    }
  }
}
