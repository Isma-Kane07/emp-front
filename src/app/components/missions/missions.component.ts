import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MissionService, MissionDto, PageResponse } from '../../services/mission.service';
import { EmployeService, EmployeDto } from '../../services/employe.service';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './missions.component.html',
  styleUrls: ['./missions.component.css']
})
export class MissionsComponent implements OnInit {
  missions: MissionDto[] = [];
  employes: EmployeDto[] = [];
  selectedMission: MissionDto = this.emptyMission();
  isEditing = false;
  showForm = false;
  errorMessage = '';
  showDetailModal = false;
  selectedMissionDetail: MissionDto | null = null;

  // Filtrage
  statuts: string[] = ['EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
  selectedStatut: string = '';
  isFiltering: boolean = false;

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];

  constructor(
    private missionService: MissionService,
    private employeService: EmployeService
  ) {}

  ngOnInit(): void {
    this.loadMissionsPaginated();
    this.loadEmployes();
  }

  // Chargement avec filtrage - CORRECTION ICI
  loadMissionsPaginated(): void {
    this.missionService.getMissionsFiltered(this.selectedStatut, this.currentPage, this.pageSize).subscribe({
      next: (page: PageResponse<MissionDto>) => {
        this.handleMissionResponse(page);
        this.isFiltering = !!this.selectedStatut; // Mettre à jour isFiltering
      },
      error: (error) => {
        this.handleError('Erreur chargement missions:', error);
      }
    });
  }

  // SUPPRIMEZ ces méthodes devenues inutiles :
  // loadAllMissions() {}
  // loadMissionsByStatut() {}

  // Gérer la réponse des missions
  private handleMissionResponse(page: PageResponse<MissionDto>): void {
    this.missions = page.content;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
  }

  // Gérer les erreurs
  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = 'Erreur lors du chargement des missions';
  }

  // Appliquer le filtre
  applyFilter(): void {
    this.currentPage = 0;
    this.loadMissionsPaginated();
  }

  // Réinitialiser le filtre
  resetFilter(): void {
    this.selectedStatut = '';
    this.currentPage = 0;
    this.loadMissionsPaginated();
  }

  // Charger les employés
  loadEmployes(): void {
    this.employeService.getAllEmployes().subscribe({
      next: (data) => this.employes = data,
      error: (error) => console.error('Erreur chargement employés:', error)
    });
  }

  // Modification de onPageSizeChange
  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.loadMissionsPaginated();
  }

  // Modification de goToPage
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadMissionsPaginated();
    }
  }

  // ... le reste de vos méthodes (emptyMission, createMission, editMission, etc.)
  // doivent rester inchangées

  emptyMission(): MissionDto {
    return {
      description: '',
      lieu: '',
      dateDebut: '',
      dateFin: '',
      statut: 'EN_ATTENTE'
    };
  }

  createMission(): void {
    this.selectedMission = this.emptyMission();
    this.isEditing = false;
    this.showForm = true;
  }

  editMission(mission: MissionDto): void {
    this.selectedMission = { ...mission };
    this.isEditing = true;
    this.showForm = true;
  }

  viewMission(mission: MissionDto): void {
    this.selectedMissionDetail = mission;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedMissionDetail = null;
  }

  deleteMission(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) {
      this.missionService.deleteMission(id).subscribe({
        next: () => {
          this.loadMissionsPaginated();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur suppression:', error);
        }
      });
    }
  }

  onSubmit(): void {
    const missionData = {
      ...this.selectedMission,
      dateDebut: this.formatDateForBackend(this.selectedMission.dateDebut),
      dateFin: this.formatDateForBackend(this.selectedMission.dateFin)
    };

    if (this.isEditing && this.selectedMission.id) {
      this.missionService.updateMission(this.selectedMission.id, missionData).subscribe({
        next: () => {
          this.loadMissionsPaginated();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error('Erreur modification:', error);
        }
      });
    } else {
      this.missionService.createMission(missionData).subscribe({
        next: () => {
          this.loadMissionsPaginated();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la création';
          console.error('Erreur création:', error);
        }
      });
    }
  }

  resetForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedMission = this.emptyMission();
    this.errorMessage = '';
  }

  formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  }

  formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  formatDateDisplay(dateString: string): string {
    if (!dateString) return 'Non définie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  }

  getEmployeName(employeId?: number): string {
    if (!employeId) return 'Non assigné';
    const employe = this.employes.find(e => e.id === employeId);
    return employe ? `${employe.prenom} ${employe.nom}` : 'Non assigné';
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-warning text-dark';
      case 'EN_COURS': return 'bg-primary';
      case 'TERMINEE': return 'bg-success';
      case 'ANNULEE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatutText(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'EN_COURS': return 'En cours';
      case 'TERMINEE': return 'Terminée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  }

  getMaxDisplayed(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  get pages(): number[] {
    const pages = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
