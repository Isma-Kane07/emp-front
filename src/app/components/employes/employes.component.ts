import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeService, EmployeDto, PageResponse } from '../../services/employe.service';
import { DepartementService, DepartementDto } from '../../services/departement.service';
import { GradeService, GradeDto } from '../../services/grade.service';

@Component({
  selector: 'app-employes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent implements OnInit, OnDestroy {
  employes: EmployeDto[] = [];
  filteredEmployes: EmployeDto[] = [];
  departements: DepartementDto[] = [];
  grades: GradeDto[] = [];
  selectedEmploye: EmployeDto = this.emptyEmploye();
  isEditing = false;
  showForm = false;
  errorMessage = '';
  showDetailModal = false;
  selectedEmployeDetail: EmployeDto | null = null;

  // Recherche
  searchTerm: string = '';
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];

  constructor(
    private employeService: EmployeService,
    private departementService: DepartementService,
    private gradeService: GradeService
  ) {}

  ngOnInit(): void {
    this.loadEmployesPaginated();
    this.loadDepartements();
    this.loadGrades();

    // Configuration de la recherche en temps réel
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  // Chargement paginé
  loadEmployesPaginated(): void {
    this.employeService.getAllEmployesPaginated(this.currentPage, this.pageSize).subscribe({
      next: (page: PageResponse<EmployeDto>) => {
        this.employes = page.content;
        this.filteredEmployes = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Erreur chargement employés:', error);
        this.errorMessage = 'Erreur lors du chargement des employés';
      }
    });
  }

  // Charger les départements
  loadDepartements(): void {
    this.departementService.getAllDepartements().subscribe({
      next: (data) => this.departements = data,
      error: (error) => console.error('Erreur chargement départements:', error)
    });
  }

  // Charger les grades
  loadGrades(): void {
    this.gradeService.getAllGrades().subscribe({
      next: (data) => this.grades = data,
      error: (error) => console.error('Erreur chargement grades:', error)
    });
  }

  // Recherche d'employés
  onSearchInput(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  performSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;

    if (!this.searchTerm.trim()) {
      this.resetSearch();
      return;
    }

    this.isSearching = true;
    this.employeService.searchEmployes(this.searchTerm).subscribe({
      next: (employes) => {
        this.filteredEmployes = employes;
        this.totalElements = employes.length;
        this.totalPages = Math.ceil(employes.length / this.pageSize);
        this.currentPage = 0;
      },
      error: (error) => {
        console.error('Erreur recherche employés:', error);
        this.errorMessage = 'Erreur lors de la recherche';
        this.isSearching = false;
      }
    });
  }

  // Réinitialiser la recherche
  resetSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.loadEmployesPaginated();
  }

  // Méthodes pour changer de page
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.isSearching) {
        // Pour la recherche, on utilise filteredEmployes
        this.updatePagination();
      } else {
        this.loadEmployesPaginated();
      }
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    if (this.isSearching) {
      this.updatePagination();
    } else {
      this.loadEmployesPaginated();
    }
  }

  // Mise à jour de la pagination pour les résultats de recherche
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEmployes.length / this.pageSize);
  }

  // Obtenir les employés à afficher
  getDisplayedEmployes(): EmployeDto[] {
    if (this.isSearching) {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredEmployes.slice(start, end);
    }
    return this.employes;
  }

  getMaxDisplayed(): number {
    if (this.isSearching) {
      return Math.min((this.currentPage + 1) * this.pageSize, this.filteredEmployes.length);
    }
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  emptyEmploye(): EmployeDto {
    return {
      nom: '',
      prenom: '',
      tel: '',
      mail: ''
    };
  }

  createEmploye(): void {
    this.selectedEmploye = this.emptyEmploye();
    this.isEditing = false;
    this.showForm = true;
  }

  editEmploye(employe: EmployeDto): void {
    this.selectedEmploye = { ...employe };
    this.isEditing = true;
    this.showForm = true;
  }

  viewEmploye(employe: EmployeDto): void {
    this.selectedEmployeDetail = employe;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEmployeDetail = null;
  }

  deleteEmploye(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeService.deleteEmploye(id).subscribe({
        next: () => {
          this.loadEmployesPaginated();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur suppression:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditing && this.selectedEmploye.id) {
      this.employeService.updateEmploye(this.selectedEmploye.id, this.selectedEmploye).subscribe({
        next: () => {
          this.loadEmployesPaginated();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error('Erreur modification:', error);
        }
      });
    } else {
      this.employeService.createEmploye(this.selectedEmploye).subscribe({
        next: () => {
          this.loadEmployesPaginated();
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
    this.selectedEmploye = this.emptyEmploye();
    this.errorMessage = '';
  }

  // Méthodes pour l'affichage
  getDepartementName(id?: number): string {
    if (!id) return 'Non assigné';
    const dept = this.departements.find(d => d.id === id);
    return dept ? dept.nomDepartement : 'Non assigné';
  }

  getGradeName(id?: number): string {
    if (!id) return 'Non assigné';
    const grade = this.grades.find(g => g.id === id);
    return grade ? grade.libelle : 'Non assigné';
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
