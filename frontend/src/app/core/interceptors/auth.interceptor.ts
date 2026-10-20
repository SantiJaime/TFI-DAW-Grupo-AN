import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const authToken = authService.token();

  if (!authToken) {
    return next(req);
  }

  const reqWithToken = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authToken}`)
  });

  return next(reqWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
}