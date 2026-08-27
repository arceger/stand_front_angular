import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import type { VehicleCard, VehicleFilters } from './models';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly api = inject(ApiService);

  readonly vehicle = signal<VehicleCard | null>(null);
  readonly vehicles = signal<VehicleCard[]>([]);
  readonly featuredVehicles = signal<VehicleCard[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  setVehicle(vehicle: VehicleCard | null): void {
    this.vehicle.set(vehicle);
  }

  setVehicles(vehicles: VehicleCard[]): void {
    this.vehicles.set(vehicles);
    if (!this.vehicle() && vehicles.length > 0) {
      this.vehicle.set(vehicles[0]);
    }
  }

  loadCatalog(filters: VehicleFilters = {}): Promise<VehicleCard[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return new Promise((resolve) => {
      this.api.getVehicles(filters).subscribe({
        next: (items) => {
          this.vehicles.set(items);
          if (items.length > 0 && !this.vehicle()) {
            this.vehicle.set(items[0]);
          }
          this.isLoading.set(false);
          resolve(items);
        },
        error: (err) => {
          console.error('Falha ao carregar catálogo da API:', err);
          this.error.set(
            'Não foi possível carregar os veículos do estoque. Verifique a conexão com o backend.'
          );
          this.isLoading.set(false);
          resolve([]);
        },
      });
    });
  }

  loadFeatured(): Promise<VehicleCard[]> {
    return new Promise((resolve) => {
      this.api.getFeaturedVehicles().subscribe({
        next: (items) => {
          this.featuredVehicles.set(items);
          if (items.length > 0 && !this.vehicle()) {
            this.vehicle.set(items[0]);
          }
          resolve(items);
        },
        error: (err) => {
          console.warn('Falha ao carregar destaques da API:', err);
          resolve([]);
        },
      });
    });
  }
}
