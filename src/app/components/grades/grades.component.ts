import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GradeService, GradeDto, PageResponse } from '../../services/grade.service';
import { EmployeService } from '../../services/employe.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.css']
})
export class GradesComponent implements OnInit {
  grades: GradeDto[] = [];
  selectedGrade: GradeDto = this.emptyGrade();
  isEditing = false;
  showForm = false;
  errorMessage = '';
  showDetailModal = false;
  selectedGradeDetail: GradeDto | null = null;
  employesCount: Map<number, number> = new Map();

  // Propriétés pour la pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];

  constructor(
    private gradeService: GradeService,
    private employeService: EmployeService
  ) {}

  ngOnInit(): void {
    this.loadGradesPaginated();
  }

  // Chargement paginé
  loadGradesPaginated(): void {
    this.gradeService.getAllGradesPaginated(this.currentPage, this.pageSize).subscribe({
      next: (page: PageResponse<GradeDto>) => {
        this.grades = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.loadEmployesCount();
      },
      error: (error) => {
        console.error('Erreur chargement grades:', error);
        this.errorMessage = 'Erreur lors du chargement des grades';
      }
    });
  }

  // Charger le nombre d'employés par grade
  loadEmployesCount(): void {
    this.grades.forEach(grade => {
      if (grade.id) {
        this.employeService.getAllEmployes().subscribe(employes => {
          const count = employes.filter(e => e.gradeId === grade.id).length;
          this.employesCount.set(grade.id!, count);
        });
      }
    });
  }

  // Méthodes pour changer de page
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadGradesPaginated();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.loadGradesPaginated();
  }

  emptyGrade(): GradeDto {
    return {
      libelle: '',
      canManageTeam: false,
      hasManager: false
    };
  }

  createGrade(): void {
    this.selectedGrade = this.emptyGrade();
    this.isEditing = false;
    this.showForm = true;
  }

  editGrade(grade: GradeDto): void {
    this.selectedGrade = { ...grade };
    this.isEditing = true;
    this.showForm = true;
  }

  viewGrade(grade: GradeDto): void {
    this.selectedGradeDetail = grade;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedGradeDetail = null;
  }

  deleteGrade(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce grade ?')) {
      this.gradeService.deleteGrade(id).subscribe({
        next: () => {
          this.loadGradesPaginated();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur suppression:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditing && this.selectedGrade.id) {
      this.gradeService.updateGrade(this.selectedGrade.id, this.selectedGrade).subscribe({
        next: () => {
          this.loadGradesPaginated();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error('Erreur modification:', error);
        }
      });
    } else {
      this.gradeService.createGrade(this.selectedGrade).subscribe({
        next: () => {
          this.loadGradesPaginated();
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
    this.selectedGrade = this.emptyGrade();
    this.errorMessage = '';
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

  // Méthodes pour l'affichage des privilèges
  getPrivilegesText(grade: GradeDto): string {
    const privileges = [];
    if (grade.canManageTeam) privileges.push('Gère équipe');
    if (grade.hasManager) privileges.push('A un manager');
    return privileges.length > 0 ? privileges.join(', ') : 'Aucun privilège';
  }

  getPrivilegesBadgeClass(grade: GradeDto): string {
    if (grade.canManageTeam && grade.hasManager) return 'bg-primary';
    if (grade.canManageTeam) return 'bg-success';
    if (grade.hasManager) return 'bg-info';
    return 'bg-secondary';
  }

  getEmployesCount(gradeId: number): number {
    return this.employesCount.get(gradeId) || 0;
  }

  // Méthodes pour l'affichage des privilèges avec icônes
getPrivilegesList(grade: GradeDto): { name: string; has: boolean }[] {
  return [
    { name: 'Gère une équipe', has: grade.canManageTeam },
    { name: 'A un manager', has: grade.hasManager }
  ];
}

getPrivilegeIcon(hasPrivilege: boolean): string {
  return hasPrivilege ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
}

getPrivilegeText(hasPrivilege: boolean): string {
  return hasPrivilege ? 'Oui' : 'Non';
}
}
