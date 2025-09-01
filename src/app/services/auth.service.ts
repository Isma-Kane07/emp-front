import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.token);
          localStorage.setItem('token_expiration', this.getTokenExpiration(response.token).toString());
          console.log('🔐 Login réussi - Token stocké');
        }),
        catchError((error: HttpErrorResponse) => {
          let errorMessage = 'Erreur de connexion';

          if (error.status === 401) {
            errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  logout(): void {
    console.log('🔐 Déconnexion - Suppression du token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    const isValid = !!token && this.isTokenValid();
    console.log('🔐 isLoggedIn:', isValid);
    return isValid;
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🔐 Token récupéré:', token ? 'OUI' : 'NON');
    return token;
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🔐 Token invalide: aucun token');
      return false;
    }

    try {
      const expiration = this.getTokenExpiration(token);
      const isValid = Date.now() < expiration;
      console.log('🔐 Token valide:', isValid, 'Expire dans:', Math.max(0, expiration - Date.now()) / 1000 + 's');
      return isValid;
    } catch (error) {
      console.log('🔐 Token invalide: erreur de parsing');
      return false;
    }
  }

  private getTokenExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convertir en milliseconds
    } catch (error) {
      console.error('🔐 Erreur décodage token:', error);
      return 0;
    }
  }

  // Méthode pour vérifier et rediriger si le token est expiré
  checkTokenAndRedirect(): boolean {
    const isValid = this.isTokenValid();
    if (!isValid) {
      console.log('🔐 Redirection: token expiré');
      this.logout();
      this.router.navigate(['/login'], {
        queryParams: { message: 'Session expirée, veuillez vous reconnecter' }
      });
    }
    return isValid;
  }

  // 🔍 Méthode de diagnostic
  debugToken(): void {
    const token = this.getToken();
    console.log('=== 🔍 DEBUG TOKEN ===');
    console.log('Token présent:', !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Payload:', payload);
        console.log('Expiration:', new Date(payload.exp * 1000));
        console.log('Temps restant:', Math.max(0, (payload.exp * 1000) - Date.now()) / 1000 + 's');
      } catch (e) {
        console.log('Token invalide pour debug');
      }
    }
    console.log('=====================');
  }
}
