import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../../services/auth.service";
import { inject } from "@angular/core";

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);  
    const currentUser = authService.currentUserValue;
  
    if (currentUser && currentUser.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
    }
  
    return next(req);
  };