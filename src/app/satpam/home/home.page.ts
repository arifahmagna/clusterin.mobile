import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  currentUser: any = null;
  tamuHariIni: number = 0;
  aktivitas: any[] = [];
  shiftInfo: any = null;

  private pollingSub!: Subscription;

  constructor(
    private navController: NavController,
    private api: ApiService
  ) {}

  //komponen dimuat
  async ngOnInit() {
    this.currentUser = await this.api.getCurrentUser(); //ambil currentUser
    this.loadAllData(); 
    this.startPolling();
  }

  //komponen dihancurkan
  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  //reload otomatis
  startPolling() {
    this.pollingSub = interval(10000).subscribe(() => {
      this.loadAllData();
    });
  }

  loadAllData() {
    this.loadShiftInfo();
    this.loadTamuHariIni();
  }

  async loadShiftInfo() {
    try {
      const allShift = await this.api.getShift();
      const activeShift = allShift.find((s: any) =>
        s.id_satpam === this.currentUser.nik &&
        (!s.selesai || s.status?.toLowerCase() === 'on')
      );

      //activeShift tampilkan ON
      if (activeShift) {
        this.shiftInfo = {
          shift: activeShift.shift,
          status: activeShift.status?.toUpperCase() || 'OFF',
        };
        //tidak active, off
      } else {
        this.shiftInfo = {
          shift: '-', status: 'OFF'
        };
      }
    } catch (err) {
      console.error('Gagal mengambil shift:', err);
    }
  }

  loadTamuHariIni() {
    this.api.getGuest().subscribe((guests: any[]) => {
      const today = new Date().toISOString().slice(0, 10);

      //filter tamu berdasarkan updated_at=today
      this.tamuHariIni = guests.filter((g: any) => {
        const updatedDate = g.updated_at ? new Date(g.updated_at).toISOString().slice(0, 10) : null; //ambil tgl dr updated_at
        return updatedDate === today;
      }).length;

      //urutin tamu dr updated_at terbaru
      const sorted = guests
        .filter((g: any) => g.updated_at)
        .sort((a: any, b: any) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        //untuk aktiviitas trbaru
      this.aktivitas = sorted.slice(0, 5).map((g: any) => ({
        nama: g.fullname,
        status: g.status?.toLowerCase() === 'masuk' ? 'check-in' : 'check-out',
        statusColor: g.status?.toLowerCase() === 'masuk' ? 'success' : 'failed',
        tanggal: new Date(g.updated_at).toLocaleString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        alamat: g.address,
        tujuan: g.reason,
        alamatTujuan: g.destination,
        estimasi: g.estimation,
        waktuMasuk: g.checkin,
        waktuKeluar: g.checkout,
        keterangan: g.reason,
        isOpen: false
      }));
    });
  }

  lihatSemuaAktivitas() {
    this.navController.navigateForward('/status');
  }

  goToLaporan() {
    this.navController.navigateForward('/laporan');
  }
}
