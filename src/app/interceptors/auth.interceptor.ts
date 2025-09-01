import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  let clonedRequest = req;

  // Ajouter le token d'authentification
  if (token) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Ajouter l'URL de base de l'API pour les requêtes relatives
  if (req.url.startsWith('/')) {
    clonedRequest = clonedRequest.clone({
      url: environment.apiUrl + req.url
    });
  }

  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem('access_token');
        router.navigate(['/login'], {
          queryParams: { message: 'Session expirée, veuillez vous reconnecter' }
        });
      }
      return throwError(() => error);
    })
  );
};
