import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ImageUrlPipe } from '../../core/image-url.pipe';
import type {
  FuelType,
  TransmissionType,
  VehicleDetail,
  VehicleFormPayload,
  VehicleImage,
  VehicleStatus,
} from '../../core/models';

@Component({
  selector: 'app-admin-vehicle-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageUrlPipe],
  templateUrl: './admin-vehicle-modal.component.html',
  styleUrl: './admin-vehicle-modal.component.scss',
})
export class AdminVehicleModalComponent implements OnChanges {
  private readonly api = inject(ApiService);

  @Input() vehicleId: string | null = null;
  @Input() isOpen = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly galleryImages = signal<VehicleImage[]>([]);

  formData: VehicleFormPayload = this.getDefaultFormData();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.vehicleId) {
        this.loadVehicleData(this.vehicleId);
      } else {
        this.resetForm();
      }
    }
  }

  private getDefaultFormData(): VehicleFormPayload {
    return {
      title: '',
      brand: '',
      model: '',
      version: '',
      year: new Date().getFullYear(),
      modelYear: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      transmission: 'AUTOMATIC' as TransmissionType,
      fuelType: 'FLEX' as FuelType,
      color: '',
      doors: 4,
      description: '',
      highlights: '',
      featured: false,
      status: 'PUBLISHED' as VehicleStatus,
    };
  }

  private resetForm(): void {
    this.formData = this.getDefaultFormData();
    this.galleryImages.set([]);
    this.errorMessage.set(null);
  }

  private loadVehicleData(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.getAdminVehicle(id).subscribe({
      next: (v: VehicleDetail) => {
        this.formData = {
          title: v.title,
          brand: v.brand,
          model: v.model,
          version: v.version || '',
          year: v.year,
          modelYear: v.modelYear,
          price: parseFloat(v.rawPrice) || 0,
          mileage: v.mileage,
          transmission: (v.transmission as TransmissionType) || 'AUTOMATIC',
          fuelType: (v.fuelType as FuelType) || 'FLEX',
          color: v.color || '',
          doors: v.doors || 4,
          description: v.description || '',
          highlights: v.highlights || '',
          featured: v.featured,
          status: (v.status as VehicleStatus) || 'PUBLISHED',
        };
        this.galleryImages.set(v.images || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar dados do veículo para edição:', err);
        this.errorMessage.set('Falha ao obter dados do veículo.');
        this.isLoading.set(false);
      },
    });
  }

  saveVehicle(): void {
    if (!this.formData.title.trim()) {
      this.errorMessage.set('O título do anúncio é obrigatório.');
      return;
    }
    if (!this.formData.brand.trim()) {
      this.errorMessage.set('A marca é obrigatória.');
      return;
    }
    if (!this.formData.model.trim()) {
      this.errorMessage.set('O modelo é obrigatório.');
      return;
    }
    if (!this.formData.price || this.formData.price <= 0) {
      this.errorMessage.set('Informe um preço válido.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.vehicleId) {
      this.api.updateVehicle(this.vehicleId, this.formData).subscribe({
        next: (updated) => {
          this.isSaving.set(false);
          this.saved.emit();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erro ao atualizar veículo:', err);
          this.isSaving.set(false);
          this.errorMessage.set(
            err.error?.message || 'Não foi possível atualizar o veículo.'
          );
        },
      });
    } else {
      this.api.createVehicle(this.formData).subscribe({
        next: (created) => {
          this.isSaving.set(false);
          this.saved.emit();
          this.closeModal();
        },
        error: (err) => {
          console.error('Erro ao cadastrar veículo:', err);
          this.isSaving.set(false);
          this.errorMessage.set(
            err.error?.message || 'Não foi possível cadastrar o veículo.'
          );
        },
      });
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.vehicleId) return;

    const filesArray = Array.from(input.files);
    this.isUploading.set(true);
    this.errorMessage.set(null);

    this.api.uploadImages(this.vehicleId, filesArray).subscribe({
      next: (images) => {
        this.galleryImages.set(images);
        this.isUploading.set(false);
        input.value = '';
      },
      error: (err) => {
        console.error('Erro ao fazer upload de imagens:', err);
        this.errorMessage.set('Falha no upload das imagens.');
        this.isUploading.set(false);
      },
    });
  }

  setAsCover(imageId: string): void {
    if (!this.vehicleId) return;
    this.api.setCoverImage(this.vehicleId, imageId).subscribe({
      next: (images) => {
        this.galleryImages.set(images);
      },
      error: (err) => {
        console.error('Erro ao definir foto de capa:', err);
      },
    });
  }

  deleteImage(imageId: string): void {
    if (!this.vehicleId) return;
    if (!confirm('Deseja excluir esta imagem da galeria?')) return;

    this.api.deleteImage(this.vehicleId, imageId).subscribe({
      next: (images) => {
        this.galleryImages.set(images);
      },
      error: (err) => {
        console.error('Erro ao excluir imagem:', err);
      },
    });
  }

  closeModal(): void {
    this.closed.emit();
  }
}

