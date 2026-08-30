import { Pipe, PipeTransform } from '@angular/core';

declare global {
  interface Window {
    STAND_API_URL?: string;
  }
}

export const API_BASE_URL =
  typeof window !== 'undefined' && window.STAND_API_URL
    ? window.STAND_API_URL
    : 'https://automotors-back.onrender.com';

// export const API_BASE_URL =
//   typeof window !== 'undefined' && window.STAND_API_URL
//     ? window.STAND_API_URL
//     : 'http://localhost:8080';    

export function resolveImageUrl(url?: string | null): string {
  if (!url || !url.trim()) {
    return '/illustrations/vehicle-placeholder.svg';
  }
  const cleanUrl = url.trim();
  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://') ||
    cleanUrl.startsWith('data:')
  ) {
    return cleanUrl;
  }
  if (
    cleanUrl.startsWith('/illustrations/') ||
    cleanUrl.startsWith('illustrations/')
  ) {
    return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
  }
  if (cleanUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${cleanUrl}`;
  }
  if (cleanUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${cleanUrl}`;
  }
  return cleanUrl.startsWith('/')
    ? `${API_BASE_URL}${cleanUrl}`
    : `${API_BASE_URL}/${cleanUrl}`;
}

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(value?: string | null): string {
    return resolveImageUrl(value);
  }
}

