import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';
import {
  AdminDashboard,
  LeadPayload,
  LoginResponse,
  VehicleDetail,
  VehicleFilters,
  VehicleFormPayload,
  VehicleImage,
  VehicleStatus,
  VehicleCard,
} from './models';
import { API_BASE_URL } from './image-url.pipe';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AdminAuthService);
  readonly baseUrl = API_BASE_URL;

  getHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/actuator/health`);
  }

  getFeaturedVehicles(): Observable<VehicleCard[]> {
    return this.http.get<VehicleCard[]>(`${this.baseUrl}/api/public/vehicles/featured`);
  }

  getVehicles(filters: VehicleFilters = {}): Observable<VehicleCard[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<VehicleCard[]>(`${this.baseUrl}/api/public/vehicles`, { params });
  }

  getVehicle(slug: string): Observable<VehicleDetail> {
    return this.http.get<VehicleDetail>(`${this.baseUrl}/api/public/vehicles/${slug}`);
  }

  sendLead(slug: string, payload: LeadPayload): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/api/public/vehicles/${slug}/leads`, payload);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/admin/auth/login`, { email, password });
  }

  getAdminDashboard(search = '', status = ''): Observable<AdminDashboard> {
    let params = new HttpParams();
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<AdminDashboard>(`${this.baseUrl}/api/admin/vehicles`, { params, headers: this.adminHeaders() });
  }

  getAdminVehicle(id: string): Observable<VehicleDetail> {
    return this.http.get<VehicleDetail>(`${this.baseUrl}/api/admin/vehicles/${id}`, { headers: this.adminHeaders() });
  }

  createVehicle(payload: VehicleFormPayload): Observable<VehicleDetail> {
    return this.http.post<VehicleDetail>(`${this.baseUrl}/api/admin/vehicles`, payload, { headers: this.adminHeaders() });
  }

  updateVehicle(id: string, payload: VehicleFormPayload): Observable<VehicleDetail> {
    return this.http.put<VehicleDetail>(`${this.baseUrl}/api/admin/vehicles/${id}`, payload, { headers: this.adminHeaders() });
  }

  updateVehicleStatus(id: string, status: VehicleStatus): Observable<VehicleDetail> {
    return this.http.patch<VehicleDetail>(`${this.baseUrl}/api/admin/vehicles/${id}/status`, { status }, { headers: this.adminHeaders() });
  }

  uploadImages(id: string, files: File[]): Observable<VehicleImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<VehicleImage[]>(`${this.baseUrl}/api/admin/vehicles/${id}/images`, formData, { headers: this.adminHeaders() });
  }

  replaceImage(id: string, imageId: string, file: File): Observable<VehicleImage[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<VehicleImage[]>(`${this.baseUrl}/api/admin/vehicles/${id}/images/${imageId}`, formData, {
      headers: this.adminHeaders(),
    });
  }

  reorderImages(id: string, imageIds: string[]): Observable<VehicleImage[]> {
    return this.http.put<VehicleImage[]>(`${this.baseUrl}/api/admin/vehicles/${id}/images/order`, { imageIds }, { headers: this.adminHeaders() });
  }

  setCoverImage(id: string, imageId: string): Observable<VehicleImage[]> {
    return this.http.patch<VehicleImage[]>(`${this.baseUrl}/api/admin/vehicles/${id}/images/${imageId}/cover`, {}, { headers: this.adminHeaders() });
  }

  deleteImage(id: string, imageId: string): Observable<VehicleImage[]> {
    return this.http.delete<VehicleImage[]>(`${this.baseUrl}/api/admin/vehicles/${id}/images/${imageId}`, { headers: this.adminHeaders() });
  }

  private adminHeaders(): HttpHeaders {
    const token = this.auth.token();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
