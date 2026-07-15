import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { getRolesFromToken } from '../../services/jwt.util';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const currentUser = this.authService.currentUserValue;

    if (currentUser?.token && getRolesFromToken(currentUser.token).includes('Admin')) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
