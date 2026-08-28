import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AppStateService } from '../core/app-state.service';
import { AdminAuthService } from '../core/admin-auth.service';
import { ImageUrlPipe } from '../core/image-url.pipe';
import { EuroPipe } from '../core/euro.pipe';
import type { LeadPayload, VehicleDetail } from '../core/models';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageUrlPipe, EuroPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly appState = inject(AppStateService);
  readonly auth = inject(AdminAuthService);

  readonly vehicle = signal<VehicleDetail | null>(null);
  readonly selectedImageUrl = signal<string | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  // Formulário de Lead / Proposta
  readonly showLeadModal = signal<boolean>(false);
  readonly isSubmittingLead = signal<boolean>(false);
  readonly leadSuccess = signal<string | null>(null);
  readonly leadError = signal<string | null>(null);

  leadForm: LeadPayload = {
    customerName: '',
    phone: '',
    email: '',
    message: '',
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.loadVehicle(slug);
      } else {
        this.errorMessage.set('Veículo não especificado.');
        this.isLoading.set(false);
      }
    });
  }

  loadVehicle(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.api.getVehicle(slug).subscribe({
      next: (data) => {
        this.vehicle.set(data);
        this.appState.setVehicle(data);
        // Seleciona a capa ou a primeira foto da galeria
        const coverImg = data.images?.find((img) => img.cover)?.imageUrl;
        this.selectedImageUrl.set(
          coverImg || data.coverImageUrl || data.images?.[0]?.imageUrl || ''
        );
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Falha ao carregar detalhes do veículo:', err);
        this.errorMessage.set(
          'Não foi possível encontrar este veículo ou o estoque foi atualizado.'
        );
        this.isLoading.set(false);
      },
    });
  }

  selectImage(url: string): void {
    this.selectedImageUrl.set(url);
  }

  openLeadModal(): void {
    this.leadSuccess.set(null);
    this.leadError.set(null);
    const v = this.vehicle();
    this.leadForm = {
      customerName: '',
      phone: '',
      email: '',
      message: v
        ? `Olá! Tenho interesse no veículo ${v.title} (${v.year}). Poderiam entrar em contato comigo?`
        : '',
    };
    this.showLeadModal.set(true);
  }

  closeLeadModal(): void {
    this.showLeadModal.set(false);
  }

  submitLead(): void {
    const v = this.vehicle();
    if (!v) return;

    if (!this.leadForm.customerName.trim()) {
      this.leadError.set('Por favor, informe seu nome completo.');
      return;
    }
    if (!this.leadForm.phone.trim()) {
      this.leadError.set('Por favor, informe seu telefone ou WhatsApp.');
      return;
    }

    this.isSubmittingLead.set(true);
    this.leadError.set(null);

    this.api.sendLead(v.slug, this.leadForm).subscribe({
      next: (res) => {
        this.isSubmittingLead.set(false);
        this.leadSuccess.set(
          res?.message ||
            'Sua proposta foi enviada com sucesso! Um consultor entrará em contato em breve.'
        );
      },
      error: (err) => {
        console.error('Erro ao enviar proposta:', err);
        this.isSubmittingLead.set(false);
        this.leadError.set(
          err.error?.message ||
            'Não foi possível enviar a proposta. Verifique os dados e tente novamente.'
        );
      },
    });
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
        return fuel || '-';
    }
  }

  formatTransmission(trans: string | undefined): string {
    return trans === 'AUTOMATIC' ? 'Automático' : 'Manual';
  }
// Método para avançar para a próxima imagem ao clicar na foto principal
nextImage(): void {
  const v = this.vehicle();
  if (!v || !v.images || v.images.length <= 1) return;

  const currentIndex = v.images.findIndex(img => img.imageUrl === this.selectedImageUrl());
  const nextIndex = (currentIndex + 1) % v.images.length;
  this.selectedImageUrl.set(v.images[nextIndex].imageUrl);
}

// Método para voltar para a imagem anterior
prevImage(): void {
  const v = this.vehicle();
  if (!v || !v.images || v.images.length <= 1) return;

  const currentIndex = v.images.findIndex(img => img.imageUrl === this.selectedImageUrl());
  const prevIndex = (currentIndex - 1 + v.images.length) % v.images.length;
  this.selectedImageUrl.set(v.images[prevIndex].imageUrl);
}
}
