import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GradeDto {
  id?: number;
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
export class GradeService {
  private apiUrl = `${environment.apiUrl}/grades`;

  constructor(private http: HttpClient) {}

  getAllGrades(): Observable<GradeDto[]> {
    return this.http.get<GradeDto[]>(this.apiUrl);
  }

  getGradeById(id: number): Observable<GradeDto> {
    return this.http.get<GradeDto>(`${this.apiUrl}/${id}`);
  }

  createGrade(grade: GradeDto): Observable<GradeDto> {
    return this.http.post<GradeDto>(`${this.apiUrl}/create`, grade);
  }

  updateGrade(id: number, grade: GradeDto): Observable<GradeDto> {
    return this.http.put<GradeDto>(`${this.apiUrl}/update/${id}`, grade);
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Nouvelle méthode pour la pagination
  getAllGradesPaginated(page: number = 0, size: number = 5): Observable<PageResponse<GradeDto>> {
    return this.http.get<PageResponse<GradeDto>>(
      `${this.apiUrl}/paginated?page=${page}&size=${size}`
    );
  }
}
