import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MissionDto {
  id?: number;
  description: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  employeId?: number;
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
export class MissionService {
  private apiUrl = `${environment.apiUrl}/missions`;

  constructor(private http: HttpClient) {}

  getAllMissions(): Observable<MissionDto[]> {
    return this.http.get<MissionDto[]>(this.apiUrl);
  }

  getMissionById(id: number): Observable<MissionDto> {
    return this.http.get<MissionDto>(`${this.apiUrl}/${id}`);
  }

  createMission(mission: MissionDto): Observable<MissionDto> {
    return this.http.post<MissionDto>(`${this.apiUrl}/create`, mission);
  }

  updateMission(id: number, mission: MissionDto): Observable<MissionDto> {
    return this.http.put<MissionDto>(`${this.apiUrl}/update/${id}`, mission);
  }

  deleteMission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Nouvelle méthode pour la pagination
  getMissionsPaginated(page: number = 0, size: number = 5): Observable<PageResponse<MissionDto>> {
    return this.http.get<PageResponse<MissionDto>>(
      `${this.apiUrl}/paginated?page=${page}&size=${size}`
    );
  }

  getMissionsFiltered(statut?: string, page: number = 0, size: number = 10): Observable<PageResponse<MissionDto>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

  if (statut && statut !== '') {
    params = params.set('statut', statut);
  }

  return this.http.get<PageResponse<MissionDto>>(`${this.apiUrl}/filter`, { params });
}
}
