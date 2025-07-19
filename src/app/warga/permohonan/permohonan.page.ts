import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-permohonan',
  templateUrl: './permohonan.page.html',
  styleUrls: ['./permohonan.page.scss'],
})
export class PermohonanPage implements OnInit, OnDestroy {
  selectedStatus: string = 'Semua';
  permohonanList: any[] = [];
  isLoading = false;
  private pollingSub!: Subscription;
  private currentUserId: number | null = null;

  constructor(private apiService: ApiService) {}

  async ngOnInit() {
    this.isLoading = true;

    try {
      const currentUser = await this.apiService.getCurrentUser();
      this.currentUserId = currentUser?.id || null;

      if (this.currentUserId) {
        this.loadPermohonan();   // ✅ ambil data pertama kali
        this.startPolling();     // ⏱️ polling
      } else {
        console.warn('User ID tidak ditemukan');
        this.isLoading = false;
      }
    } catch (err) {
      console.error('Gagal ambil user dari storage', err);
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  startPolling() {
    this.pollingSub = interval(10000)
      .pipe(switchMap(() => this.apiService.getPengajuan()))
      .subscribe({
        next: (response) => {
          this.updatePermohonan(response);
        },
        error: (err) => {
          console.error('Gagal polling permohonan:', err);
        }
      });
  }

  loadPermohonan() {
    this.apiService.getPengajuan().subscribe({
      next: (response) => {
        this.updatePermohonan(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal ambil permohonan awal:', err);
        this.isLoading = false;
      }
    });
  }

  updatePermohonan(response: any[]) {
    if (!this.currentUserId) return;

    this.permohonanList = response
      .filter((pengajuan: any) =>
        pengajuan.kategori === 'Permohonan' && pengajuan.user?.id === this.currentUserId
      )
      .sort((a: any, b: any) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }

  filteredPermohonan() {
    if (this.selectedStatus === 'Semua') {
      return this.permohonanList;
    }
    return this.permohonanList.filter(p => p.status === this.selectedStatus);
  }

  getBorderColor(status: string): string {
    switch (status) {
      case 'Disetujui': return '#16a34a';
      case 'Menunggu': return '#f59e0b';
      case 'Ditolak': return '#dc2626';
      case 'Dilihat': return '#3B82F6';
      default: return '#6b7280';
    }
  }
}
