import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmployeDto {
  id?: number;
  nom: string;
  prenom: string;
  matricule?: string;
  tel: string;
  mail: string;
  dateEmbauche?: string;
  gradeId?: number;
  departementId?: number;
}

export interface DepartementDto {
  id: number;
  nomDepartement: string;
  tailleMax: number;
}

export interface GradeDto {
  id: number;
  libelle: string;
  canManageTeam: boolean;
  hasManager: boolean;
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
export class EmployeService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Employés
  getAllEmployes(): Observable<EmployeDto[]> {
    return this.http.get<EmployeDto[]>(`${this.apiUrl}/employes`);
  }

  getEmployeById(id: number): Observable<EmployeDto> {
    return this.http.get<EmployeDto>(`${this.apiUrl}/employes/${id}`);
  }

  createEmploye(employe: EmployeDto): Observable<EmployeDto> {
    return this.http.post<EmployeDto>(`${this.apiUrl}/employes/create`, employe);
  }

  updateEmploye(id: number, employe: EmployeDto): Observable<EmployeDto> {
    return this.http.put<EmployeDto>(`${this.apiUrl}/employes/update/${id}`, employe);
  }

  deleteEmploye(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/employes/delete/${id}`);
  }

  // Départements
  getAllDepartements(): Observable<DepartementDto[]> {
    return this.http.get<DepartementDto[]>(`${this.apiUrl}/departements`);
  }

  // Grades
  getAllGrades(): Observable<GradeDto[]> {
    return this.http.get<GradeDto[]>(`${this.apiUrl}/grades`);
  }

  getAllEmployesPaginated(page: number = 0, size: number = 5): Observable<PageResponse<EmployeDto>> {
  return this.http.get<PageResponse<EmployeDto>>(
    `${this.apiUrl}/employes/paginated?page=${page}&size=${size}`
  );
}

// Méthodes pour départements et grades paginés si besoin
getAllDepartementsPaginated(page: number = 0, size: number = 10): Observable<PageResponse<DepartementDto>> {
  return this.http.get<PageResponse<DepartementDto>>(
    `${this.apiUrl}/departements/paginated?page=${page}&size=${size}`
  );
}

getAllGradesPaginated(page: number = 0, size: number = 10): Observable<PageResponse<GradeDto>> {
  return this.http.get<PageResponse<GradeDto>>(
    `${this.apiUrl}/grades/paginated?page=${page}&size=${size}`
  );
}

// employe.service.ts
searchEmployes(searchTerm: string): Observable<EmployeDto[]> {
  return this.http.get<EmployeDto[]>(
    `${this.apiUrl}/employes/search?q=${encodeURIComponent(searchTerm)}`
  );
}

}
