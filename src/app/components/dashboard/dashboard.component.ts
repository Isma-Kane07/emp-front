import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeService } from '../../services/employe.service';
import { DepartementService } from '../../services/departement.service';
import { MissionService } from '../../services/mission.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    totalEmployes: 0,
    totalDepartements: 0,
    totalMissions: 0,
    missionsEnCours: 0
  };

  constructor(
    private employeService: EmployeService,
    private departementService: DepartementService,
    private missionService: MissionService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.employeService.getAllEmployes().subscribe(employes => {
      this.stats.totalEmployes = employes.length;
    });

    this.departementService.getAllDepartements().subscribe(departements => {
      this.stats.totalDepartements = departements.length;
    });

    this.missionService.getAllMissions().subscribe(missions => {
      this.stats.totalMissions = missions.length;
      this.stats.missionsEnCours = missions.filter(m => m.statut === 'EN_COURS').length;
    });
  }
}
