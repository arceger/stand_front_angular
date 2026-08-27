import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppStateService } from '../core/app-state.service';
import { ImageUrlPipe } from '../core/image-url.pipe';
import { EuroPipe } from '../core/euro.pipe';
import type { VehicleCard, VehicleFilters } from '../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageUrlPipe, EuroPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly appState = inject(AppStateService);

  readonly searchText = signal<string>('');
  readonly selectedBrand = signal<string>('');
  readonly selectedMinYear = signal<number | null>(null);
  readonly selectedMaxPrice = signal<number | null>(null);

  readonly isLoading = this.appState.isLoading;
  readonly errorMessage = this.appState.error;
  readonly featuredVehicles = this.appState.featuredVehicles;
  readonly allVehicles = this.appState.vehicles;

  // Selected hero featured vehicle
  readonly mainFeatured = computed<VehicleCard | null>(() => {
    const featuredList = this.featuredVehicles();
    if (featuredList.length > 0) {
      return featuredList[0];
    }
    const all = this.allVehicles();
    return all.length > 0 ? all[0] : null;
  });

  // Extract distinct brand list from available inventory
  readonly availableBrands = computed<string[]>(() => {
    const brands = new Set<string>();
    this.allVehicles().forEach((v) => {
      if (v.brand?.trim()) {
        brands.add(v.brand.trim());
      }
    });
    return Array.from(brands).sort();
  });

  ngOnInit(): void {
    if (this.allVehicles().length === 0) {
      this.appState.loadCatalog();
      this.appState.loadFeatured();
    }
  }

  applyFilters(): void {
    const filters: VehicleFilters = {};
    const search = this.searchText().trim();
    if (search) {
      filters.search = search;
    }
    const brand = this.selectedBrand().trim();
    if (brand) {
      filters.brand = brand;
    }
    const minYear = this.selectedMinYear();
    if (minYear && minYear > 1900) {
      filters.minYear = minYear;
    }
    const maxPrice = this.selectedMaxPrice();
    if (maxPrice && maxPrice > 0) {
      filters.maxPrice = maxPrice;
    }

    this.appState.loadCatalog(filters);
  }

  resetFilters(): void {
    this.searchText.set('');
    this.selectedBrand.set('');
    this.selectedMinYear.set(null);
    this.selectedMaxPrice.set(null);
    this.appState.loadCatalog({});
  }

  retryLoad(): void {
    this.applyFilters();
    this.appState.loadFeatured();
  }

  formatMileage(km: number | undefined): string {
    if (km === undefined || km === null) return '0 km';
    return `${km.toLocaleString('pt-BR')} km`;
  }

  formatFuel(fuel: string | undefined): string {
    switch (fuel) {
      case 'FLEX':
        return 'Flex';
      case 'GASOLINE':
        return 'Gasolina';
      case 'DIESEL':
        return 'Diesel';
      case 'HYBRID':
        return 'Híbrido';
      case 'ELECTRIC':
        return 'Elétrico';
      default:
        return fuel || 'Flex';
    }
  }

  formatTransmission(trans: string | undefined): string {
    return trans === 'AUTOMATIC' ? 'Automático' : 'Manual';
  }
}
