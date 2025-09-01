import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DepartementDto {
  id?: number;
  nomDepartement: string;
  tailleMax: number;
  tailleActuelle?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class DepartementService {
  private apiUrl = `${environment.apiUrl}/departements`;

  constructor(private http: HttpClient) {}

  // Méthodes existantes...
  getAllDepartements(): Observable<DepartementDto[]> {
    return this.http.get<DepartementDto[]>(this.apiUrl);
  }

  getDepartementById(id: number): Observable<DepartementDto> {
    return this.http.get<DepartementDto>(`${this.apiUrl}/${id}`);
  }

  getTailleActuelle(id: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/taille-actuelle/${id}`);
  }

  createDepartement(departement: DepartementDto): Observable<DepartementDto> {
    return this.http.post<DepartementDto>(`${this.apiUrl}/create`, departement);
  }

  updateDepartement(id: number, departement: DepartementDto): Observable<DepartementDto> {
    return this.http.put<DepartementDto>(`${this.apiUrl}/update/${id}`, departement);
  }

  deleteDepartement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Nouvelle méthode pour la pagination
  getAllDepartementsPaginated(page: number = 0, size: number = 5): Observable<PageResponse<DepartementDto>> {
    return this.http.get<PageResponse<DepartementDto>>(
      `${this.apiUrl}/paginated?page=${page}&size=${size}`
    );
  }

  // Méthode pour compter les employés par département
countEmployesByDepartement(departementId: number): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/count-by-departement/${departementId}`);
}
}
