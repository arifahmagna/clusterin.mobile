import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-pengaduan',
  templateUrl: './pengaduan.page.html',
  styleUrls: ['./pengaduan.page.scss'],
})
export class PengaduanPage implements OnInit, OnDestroy {
  selectedStatus: string = 'Semua';
  pengaduanList: any[] = [];
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
        this.loadPengaduan();   // ✅ ambil data awal
        this.startPolling();    // ⏱️ mulai polling
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
          this.updatePengaduan(response);
        },
        error: (err) => {
          console.error('Polling pengaduan gagal:', err);
        }
      });
  }

  loadPengaduan() {
    this.apiService.getPengajuan().subscribe({
      next: (response) => {
        this.updatePengaduan(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gagal ambil pengaduan:', err);
        this.isLoading = false;
      }
    });
  }

  updatePengaduan(response: any[]) {
    if (!this.currentUserId) return;

    this.pengaduanList = response
      .filter((item: any) =>
        item.kategori === 'Pengaduan' && item.user?.id === this.currentUserId
      )
      .sort((a: any, b: any) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }

  filteredPengaduan() {
    if (this.selectedStatus === 'Semua') {
      return this.pengaduanList;
    }
    return this.pengaduanList.filter(p => p.status === this.selectedStatus);
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
