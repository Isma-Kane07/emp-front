import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 🔍 Détecter si c'est une requête de recherche SUR EMPLOYES
  // Utilisez l'URL originale avant transformation
  const isSearchRequest = req.url.includes('employes/search') ||
                         req.url.includes('/employes/search?');

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
        console.log('🔍 Interceptor - 401 sur:', req.url, 'Recherche employés:', isSearchRequest);

        // 🚨 NE PAS DÉCONNECTER pour les recherches employés
        if (isSearchRequest) {
          console.log('🔍 Interceptor - Erreur 401 de recherche employés, retour sans déconnexion');
          return throwError(() => error);
        }

        // ✅ Pour les autres requêtes, déconnecter l'utilisateur
        console.log('🔍 Interceptor - Déconnexion pour autre requête 401');
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { message: 'Session expirée, veuillez vous reconnecter' }
        });
      }
      return throwError(() => error);
    })
  );
};
