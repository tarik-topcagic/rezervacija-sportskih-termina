import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  constructor(private router: Router) {
    this.redirectIfOnAuthPage();
  }

  private redirectIfOnAuthPage(): void {
    const authRoutes = ['/prijava', '/registracija'];
    if (authRoutes.includes(window.location.pathname)) {
      this.router.navigate(['/']);
    }
  }
}


