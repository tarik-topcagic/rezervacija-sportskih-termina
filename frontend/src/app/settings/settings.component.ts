import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { UserService, UserSettings } from '../../services/user.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, NavbarComponent, TranslatePipe],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  languages: { code: string; name: string }[] = [];
  settings: UserSettings | null = null;
  emailNotificationsEnabled = false;
  darkModeEnabled = false;
  selectedLanguage = 'bs';
  newUsername = '';
  successMessage = '';
  errorMessage = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.languages = this.languageService.languages;
    this.darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    this.selectedLanguage = this.languageService.currentLanguage;
    this.applyDarkMode();
    this.loadSettings();
  }

  loadSettings(): void {
    this.userService.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
        this.emailNotificationsEnabled = settings.emailNotificationsEnabled;
        this.newUsername = settings.username;
      },
      error: () => {
        this.errorMessage = this.languageService.translate('settingsLoadError');
      },
    });
  }

  saveEmailNotifications(): void {
    this.clearMessages();
    this.userService
      .updateEmailNotifications(this.emailNotificationsEnabled)
      .subscribe({
        next: () => {
          if (this.settings) {
            this.settings.emailNotificationsEnabled =
              this.emailNotificationsEnabled;
          }
          this.successMessage = this.languageService.translate('notificationsSaved');
        },
        error: () => {
          this.errorMessage = this.languageService.translate('notificationsSaveError');
        },
      });
  }

  toggleDarkMode(): void {
    localStorage.setItem('darkMode', String(this.darkModeEnabled));
    this.applyDarkMode();
  }

  changeUsername(): void {
    this.clearMessages();
    const username = this.newUsername.trim();

    if (!username) {
      this.errorMessage = this.languageService.translate('usernameRequired');
      return;
    }

    this.userService.updateUsername(username).subscribe({
      next: (response) => {
        const updatedUsername = response.username || username;
        if (this.settings) {
          this.settings.username = updatedUsername;
        }
        this.newUsername = updatedUsername;
        this.authService.updateCurrentUser({
          token: response.token,
          username: updatedUsername,
          fullName: response.fullName,
        });
        this.userService.refreshProfile();
        this.successMessage = this.languageService.translate('usernameChanged');
      },
      error: (error) => {
        this.errorMessage =
          error.error?.field === 'username'
            ? this.languageService.translate('usernameTaken')
            : this.languageService.translate('usernameChangeError');
      },
    });
  }

  logoutFromAllDevices(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }

  saveLanguage(): void {
    this.clearMessages();
    this.languageService.setLanguage(this.selectedLanguage);
    this.successMessage = this.languageService.translate('languageSaved');
  }

  get selectedLanguageName(): string {
    return (
      this.languages.find((language) => language.code === this.selectedLanguage)
        ?.name || this.languageService.getLanguageName('bs')
    );
  }

  private applyDarkMode(): void {
    document.body.classList.toggle('dark-mode', this.darkModeEnabled);
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
