import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api.service';


@Component({
  standalone: false,
  selector: 'app-kunjungan',
  templateUrl: './kunjungan.page.html',
  styleUrls: ['./kunjungan.page.scss'],
})
export class KunjunganPage implements OnInit {
  searchTerm = '';
  selectedStatus = 'Semua';
  selectedIndex: number | null = 0;
  guestList: any[] = [];
  isLoading = false;

  toggleDetail(index: number) {
    this.selectedIndex = this.selectedIndex === index ? null : index;
  }

  constructor(
    private apiService: ApiService) { }
  ionViewWillEnter() {
    this.loadGuestData();
  }
  
  filteredGuests() {
  return this.guestList.filter(tamu => {
    const keyword = this.searchTerm.toLowerCase();
    const matchNama = tamu.fullname?.toLowerCase().includes(keyword);
    const matchStatus = this.selectedStatus === 'Semua' || tamu.status === this.selectedStatus;
    return matchNama && matchStatus;
  });
}



  loadGuestData() {
  this.isLoading = true;
  this.apiService.getGuest().subscribe({
    next: (data) => {
      //  Urutkan berdasarkan updated_at atau checkin (yang terbaru di atas)
      this.guestList = data.sort((a: any, b: any) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error:', err);
      this.isLoading = false;
    }
  });
}


 ngOnInit() {


}
}
