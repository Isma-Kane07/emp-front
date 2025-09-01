import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartementService, DepartementDto, PageResponse } from '../../services/departement.service';

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.css']
})
export class DepartementsComponent implements OnInit {
  departements: DepartementDto[] = [];
  selectedDepartement: DepartementDto = this.emptyDepartement();
  isEditing = false;
  showForm = false;
  errorMessage = '';
  showDetailModal = false;
  selectedDepartementDetail: DepartementDto | null = null;

  // Propriétés pour la pagination
  currentPage = 0;
  pageSize = 5;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 20, 50];

  constructor(private departementService: DepartementService) {}

  ngOnInit(): void {
    this.loadDepartementsPaginated();
  }

  loadDepartementsPaginated(): void {
    this.departementService.getAllDepartementsPaginated(this.currentPage, this.pageSize).subscribe({
      next: (page: PageResponse<DepartementDto>) => {
        this.departements = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;

        // Charger la taille actuelle pour chaque département
        this.loadTailleActuelleForAll();
      },
      error: (error) => {
        console.error('Erreur chargement départements:', error);
        this.errorMessage = 'Erreur lors du chargement des départements';
      }
    });
  }

  // Nouvelle méthode pour charger la taille actuelle
  loadTailleActuelleForAll(): void {
    this.departements.forEach(departement => {
      if (departement.id) {
        this.departementService.getTailleActuelle(departement.id).subscribe({
          next: (taille) => {
            departement.tailleActuelle = taille;
          },
          error: (error) => {
            console.error('Erreur chargement taille actuelle:', error);
            departement.tailleActuelle = 0;
          }
        });
      }
    });
  }

  // Méthodes pour changer de page
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadDepartementsPaginated();
    }
  }

  onPageSizeChange(event: any): void {
    this.pageSize = Number(event.target.value);
    this.currentPage = 0;
    this.loadDepartementsPaginated();
  }

  emptyDepartement(): DepartementDto {
    return {
      nomDepartement: '',
      tailleMax: 10
    };
  }

  createDepartement(): void {
    this.selectedDepartement = this.emptyDepartement();
    this.isEditing = false;
    this.showForm = true;
  }

  editDepartement(departement: DepartementDto): void {
    this.selectedDepartement = { ...departement };
    this.isEditing = true;
    this.showForm = true;
  }

  viewDepartement(departement: DepartementDto): void {
    this.selectedDepartementDetail = departement;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDepartementDetail = null;
  }

  deleteDepartement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      this.departementService.deleteDepartement(id).subscribe({
        next: () => {
          this.loadDepartementsPaginated();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression';
          console.error('Erreur suppression:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditing && this.selectedDepartement.id) {
      this.departementService.updateDepartement(this.selectedDepartement.id, this.selectedDepartement).subscribe({
        next: () => {
          this.loadDepartementsPaginated();
          this.resetForm();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la modification';
          console.error('Erreur modification:', error);
        }
      });
    } else {
      this.departementService.createDepartement(this.selectedDepartement).subscribe({
        next: () => {
          this.loadDepartementsPaginated();
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
    this.selectedDepartement = this.emptyDepartement();
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
}
