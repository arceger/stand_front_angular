import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AdminAuthService } from '../../core/admin-auth.service';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import { EuroPipe } from '../../core/euro.pipe';
import { AdminVehicleModalComponent } from '../admin-vehicle-modal/admin-vehicle-modal.component';
import type {
  AdminDashboard,
  AdminVehicle,
  VehicleStatus,
} from '../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ImageUrlPipe,
    EuroPipe,
    AdminVehicleModalComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly dashboard = signal<AdminDashboard | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  // Filtros de busca
  searchText = '';
  statusFilter = '';

  // Controle do Modal
  isModalOpen = false;
  selectedVehicleId: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api
      .getAdminDashboard(this.searchText, this.statusFilter)
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erro ao carregar dashboard admin:', err);
          if (err.status === 401) {
            this.auth.clearSession();
            this.router.navigate(['/admin/login']);
            return;
          }
          this.errorMessage.set(
            'Não foi possível carregar os dados administrativos.'
          );
          this.isLoading.set(false);
        },
      });
  }

  applySearch(): void {
    this.loadDashboard();
  }

  updateVehicleStatus(vehicle: AdminVehicle, newStatus: string): void {
    this.api
      .updateVehicleStatus(vehicle.id, newStatus as VehicleStatus)
      .subscribe({
        next: () => {
          vehicle.status = newStatus as VehicleStatus;
          this.loadDashboard();
        },
        error: (err) => {
          console.error('Erro ao atualizar status:', err);
          alert('Falha ao atualizar status do veículo.');
        },
      });
  }

  openCreateModal(): void {
    this.selectedVehicleId = null;
    this.isModalOpen = true;
  }

  openEditModal(vehicleId: string): void {
    this.selectedVehicleId = vehicleId;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedVehicleId = null;
  }

  onModalSaved(): void {
    this.loadDashboard();
  }

  logout(): void {
    this.auth.clearSession();
    this.router.navigate(['/admin/login']);
  }
}

