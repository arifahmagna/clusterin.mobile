import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/api.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss'],
  standalone: false,
})
export class ShiftComponent implements OnInit, OnDestroy {
  semuaShift: any[] = [];
  searchTerm: string = '';
  selectedDate: string = '';
  semuaDitampilkan: boolean = false;

  private pollingSub!: Subscription;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSemuaShift();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  loadSemuaShift() {
    this.api.getShift().then(data => {
      this.semuaShift = [...data].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }).catch(err => {
      console.error('Gagal memuat shift:', err);
    });
  }

  startPolling() {
    this.pollingSub = interval(10000)
      .pipe(switchMap(() => this.api.getShift()))
      .subscribe({
        next: (data: any[]) => {
          this.semuaShift = [...data].sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          );
        },
        error: (err) => {
          console.error('Gagal polling shift:', err);
        }
      });
  }

  get filteredShift() {
    return this.semuaShift
      .filter((shift) => {
        const cocokNama = this.searchTerm
          ? shift.user?.fullname.toLowerCase().includes(this.searchTerm.toLowerCase())
          : true;

        const cocokTanggal = this.selectedDate
          ? shift.mulai?.slice(0, 10) === this.selectedDate
          : true;

        return cocokNama && cocokTanggal;
      })
      .slice(0, this.semuaDitampilkan ? undefined : 5);
  }
}
