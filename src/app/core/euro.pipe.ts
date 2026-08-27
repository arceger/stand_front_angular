import { Pipe, PipeTransform } from '@angular/core';

export function formatEuro(
  price?: string | null,
  rawPrice?: string | number | null
): string {
  if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
    const num =
      typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice));
    if (!isNaN(num)) {
      return new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
      }).format(num);
    }
  }

  if (!price || !price.trim()) {
    return '0,00 €';
  }

  const clean = price.trim();

  // If already contains €
  if (clean.includes('€')) {
    return clean;
  }

  // Replace R$ if present from legacy format
  if (clean.startsWith('R$') || clean.includes('R$')) {
    return clean.replace(/^R\$\s*/, '').replace(/\s*R\$/, '') + ' €';
  }

  // If it's a numeric string
  const num = parseFloat(clean.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (!isNaN(num)) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(num);
  }

  return `${clean} €`;
}

@Pipe({
  name: 'euro',
  standalone: true,
})
export class EuroPipe implements PipeTransform {
  transform(price?: string | null, rawPrice?: string | number | null): string {
    return formatEuro(price, rawPrice);
  }
}

