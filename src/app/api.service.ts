import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://clusterin.site/api';

  constructor(private http: HttpClient, private storage: Storage) { }

  //mengambil token autentikasi dr storage
  private async getToken(): Promise<string | null> {
    await this.storage.create();
    return await this.storage.get('token');
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      // Tambahkan jika perlu: 'Content-Type': 'application/json'
    });
  }

  // ambil semua data tamu
  getGuest(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = this.getHeaders(token || '');
        return this.http.get<any>(`${this.apiUrl}/guest`, { headers });
      }),
      map(res => res.data)
    );
  }

  //update data tamu
  updateTamu(id: number, data: any): Promise<any> {
    return this.getToken().then(token => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      return this.http.post(`${this.apiUrl}/guest/update/${id}`, data, { headers }).toPromise();
    });
  }

//ambil semua data pengajuan
  getPengajuan(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = this.getHeaders(token || '');
        return this.http.get<any>(`${this.apiUrl}/pengajuan`, { headers });
      }),
      map(res => res.data)
    );
  }

  // Ambil profil user dari storage
  async getProfile(): Promise<any> {
    return await this.getCurrentUser(); // Gak perlu ambil semua user
  }

  //
  updateFotoProfile(userId: number, data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      return this.http.post(`${this.apiUrl}/photoprofile/update/${userId}`, data, { headers }).toPromise();
    });
  }


  // Kirim update profil user ke backend  berdasarkan current user
  async updateProfile(data: any): Promise<any> {
    const token = await this.getToken();
    const currentUser = await this.getCurrentUser();

    if (!token || !currentUser?.id) throw new Error('User belum login');
    const headers = this.getHeaders(token);
    //endpoitnya
    return this.http.post(`${this.apiUrl}/user/update/$ {currentUser.id}`, data, { headers }).toPromise();
  }


  async updateProfileByRumah(nomor: string, data: any): Promise<any> {
    const token = await this.getToken();
    const currentUser = await this.getCurrentUser();

    if (!token || !currentUser?.id) throw new Error('User belum login');

    const headers = this.getHeaders(token);
    return this.http.post(`${this.apiUrl}/user/update/${currentUser.id}`, data, { headers }).toPromise();
  }






  // method POST
  postData(data: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = this.getHeaders(token || '').set('Content-Type', 'application/json');
        return this.http.post(`${this.apiUrl}/endpoint-spesifik`, data, { headers });
      })
    );
  }

  //mengambil data user yang login
  async getCurrentUser(): Promise<any> {
    await this.storage.create(); 
    return await this.storage.get('user');
  }
//menyimpan data user lgoin ke storage
  async setCurrentUser(user: any): Promise<void> {
    await this.storage.set('user', user);
  }

  //bersihin seluruh data storage (user & token) ketiak logout
  async logout(): Promise<void> {
    await this.storage.clear(); // ini lebih aman daripada remove() sebagian
  }


//
  async kirimPermohonan(data: any): Promise<Observable<any>> {
    const token = await this.getToken();
    if (!token) throw new Error('Token tidak ditemukan di storage');

    const headers = this.getHeaders(token);
    const formData = new FormData();

    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    }

    return this.http.post(`${this.apiUrl}/pengajuan/create`, formData, { headers });
  }

  kirimPengajuan(data: FormData): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      return this.http.post(`${this.apiUrl}/pengajuan/create`, data, { headers }).toPromise();
    });
  }


  // Ambil semua anggota keluarga berdasarkan alamat
  getAnggota(address: string): Promise<any[]> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.get<any>(`${this.apiUrl}/anggota`, { headers }).toPromise()
        .then(res => res.data.filter((a: any) => a.address === address));
    });
  }


  getUsers(address: string): Promise<any[]> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.get<any>(`${this.apiUrl}/users`, { headers }).toPromise()
        .then(res => res.data.filter((a: any) => a.address === address));
    });
  }


  // Tambah anggota
  createAnggota(data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.post(`${this.apiUrl}/anggota/create`, data, { headers }).toPromise();
    });
  }

  // Update anggota
  updateAnggota(id: number, data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.post(`${this.apiUrl}/anggota/update/${id}`, data, { headers }).toPromise();
    });
  }

  // Hapus anggota
  deleteAnggota(id: number): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.post(`${this.apiUrl}/anggota/delete/${id}`, {}, { headers }).toPromise();
    });
  }

  // Ambil data rumah
  getRumah(): Promise<any[]> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.get<any>(`${this.apiUrl}/rumah`, { headers }).toPromise()
        .then(res => res.data);
    });
  }

  // Tambah rumah
  createRumah(data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post(`${this.apiUrl}/rumah/create`, data, { headers }).toPromise();
    });
  }

  // Update rumah
  updateRumah(id: number, data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post(`${this.apiUrl}/rumah/update/${id}`, data, { headers }).toPromise();
    });
  }

  // Hapus rumah
  deleteRumah(id: number): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      return this.http.post(`${this.apiUrl}/rumah/delete/${id}`, {}, { headers }).toPromise();
    });
  }

  //nambahin tamu
  createTamu(data: any): Promise<any> {
    return this.getToken().then(token => {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });
      console.log('Mengirim data ke /api/guest/create:', data);
      return this.http.post(`${this.apiUrl}/guest/create`, data, { headers }).toPromise();
    });
  }

  //ambil data shift
  getShift(): Promise<any[]> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.get<any>(`${this.apiUrl}/shift`, { headers }).toPromise()
        .then(res => res.data);
    });
  }

  //bikin shift baru
  createShift(data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.post(`${this.apiUrl}/shift/create`, data, { headers }).toPromise();
    });
  }

  //update shift
  updateShift(id: number, data: any): Promise<any> {
    return this.storage.get('token').then(token => {
      const headers = this.getHeaders(token || '');
      return this.http.post(`${this.apiUrl}/shift/update/${id}`, data, { headers }).toPromise();
    });
  }


}