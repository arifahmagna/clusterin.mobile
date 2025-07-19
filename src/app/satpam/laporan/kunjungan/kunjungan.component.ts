import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-kunjungan',
  templateUrl: './kunjungan.component.html',
  styleUrls: ['./kunjungan.component.scss'],
  standalone: false
})
export class KunjunganComponent implements OnInit, OnDestroy {
  tamuList: any[] = [];
  checkInList: any[] = [];
  checkOutList: any[] = [];
  searchTerm: string = '';
  selectedDate: string = '';
  semuaDitampilkan: boolean = false;
  selectedTab: string = 'checkin';

  private pollingSub!: Subscription;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTamu();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  startPolling() {
    this.pollingSub = interval(10000) // setiap 10 detik
      .pipe(switchMap(() => this.api.getGuest()))
      .subscribe({
        next: (data: any[]) => {
          this.tamuList = data || [];
          this.updateCheckLists();
        },
        error: (err) => {
          console.error('Gagal polling tamu:', err);
        }
      });
  }

  loadTamu() {
    this.api.getGuest().subscribe((data: any[]) => {
      this.tamuList = data || [];
      this.updateCheckLists();
    });
  }

   //urutin berdasarkan updated_at trbaru
  updateCheckLists() {
    const sorted = [...this.tamuList].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    this.checkInList = sorted.filter(t => t.status === 'Masuk');
    this.checkOutList = sorted.filter(t => t.status === 'Keluar');
  }

  tampilkanSemua() {
    this.semuaDitampilkan = true;
  }

  sembunyikanSebagian() {
    this.semuaDitampilkan = false;
  }

  filterTamu(list: any[]) {
    return list
      .filter(tamu => {
        const namaCocok = !this.searchTerm || tamu.fullname?.toLowerCase().includes(this.searchTerm.toLowerCase());
        const tanggalCocok = !this.selectedDate || tamu.updated_at?.slice(0, 10) === this.selectedDate;
        return namaCocok && tanggalCocok;
      })
      .slice(0, this.semuaDitampilkan ? undefined : 5);
  }

  combineTanggalJam(tanggal: string, jam: string): Date | null {
    if (!tanggal || !jam) return null;

    const tgl = new Date(tanggal);
    const [jamStr, menitStr] = jam.split(':');
    tgl.setHours(+jamStr, +menitStr, 0, 0);
    return tgl;
  }
}
