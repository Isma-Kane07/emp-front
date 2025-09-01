import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeService, EmployeDto } from '../../services/employe.service';
import { DepartementService, DepartementDto } from '../../services/departement.service';
import { MissionService, MissionDto } from '../../services/mission.service';

interface DashboardStats {
  totalEmployes: number;
  totalDepartements: number;
  totalMissions: number;
  missionsEnCours: number;
  missionsTerminees: number;
  missionsEnAttente: number;
  employesSansMission: number;
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalEmployes: 0,
    totalDepartements: 0,
    totalMissions: 0,
    missionsEnCours: 0,
    missionsTerminees: 0,
    missionsEnAttente: 0,
    employesSansMission: 0
  };

  recentActivities: RecentActivity[] = [];
  isLoading = true;

  constructor(
    private employeService: EmployeService,
    private departementService: DepartementService,
    private missionService: MissionService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;

    // Chargement parallèle des données
    Promise.all([
      this.employeService.getAllEmployes().toPromise(),
      this.departementService.getAllDepartements().toPromise(),
      this.missionService.getAllMissions().toPromise()
    ]).then(([employes, departements, missions]) => {
      if (employes) {
        this.stats.totalEmployes = employes.length;
        this.stats.employesSansMission = employes.filter(e =>
          !missions?.some(m => m.employeId === e.id)
        ).length;
      }

      if (departements) {
        this.stats.totalDepartements = departements.length;
      }

      if (missions) {
        this.stats.totalMissions = missions.length;
        this.stats.missionsEnCours = missions.filter(m => m.statut === 'EN_COURS').length;
        this.stats.missionsTerminees = missions.filter(m => m.statut === 'TERMINEE').length;
        this.stats.missionsEnAttente = missions.filter(m => m.statut === 'EN_ATTENTE').length;
      }

      this.generateRecentActivities();
      this.isLoading = false;
    }).catch(error => {
      console.error('Erreur chargement dashboard:', error);
      this.isLoading = false;
    });
  }

  private generateRecentActivities(): void {
    // Simulation d'activités récentes (à remplacer par des vraies données)
    this.recentActivities = [
      {
        type: 'Nouvel Employé',
        description: 'Ahmed Khan a été ajouté',
        time: 'Il y a 2 heures',
        icon: 'bi bi-person-plus',
        color: 'text-primary'
      },
      {
        type: 'Mission Terminée',
        description: 'Projet client XYZ complété',
        time: 'Il y a 5 heures',
        icon: 'bi bi-check-circle',
        color: 'text-success'
      },
      {
        type: 'Nouvelle Mission',
        description: 'Audit interne démarré',
        time: 'Hier',
        icon: 'bi bi-briefcase',
        color: 'text-info'
      },
      {
        type: 'Mise à jour',
        description: 'Département IT modifié',
        time: 'Avant-hier',
        icon: 'bi bi-building',
        color: 'text-warning'
      }
    ];
  }

  getMissionProgress(): number {
    if (this.stats.totalMissions === 0) return 0;
    return Math.round((this.stats.missionsTerminees / this.stats.totalMissions) * 100);
  }

  getDepartmentUtilization(): number {
    if (this.stats.totalDepartements === 0) return 0;
    return Math.round((this.stats.totalEmployes / (this.stats.totalDepartements * 10)) * 100);
  }
}
