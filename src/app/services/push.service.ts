import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  constructor(
    private http: HttpClient,
    private storage: Storage,
    private toastController: ToastController
  ) {}

  async registerPush() {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') {
      console.log('Push permission not granted');
      return;
    }

    PushNotifications.register();

    PushNotifications.addListener('registration', async (token: Token) => {
      console.log(' Token FCM:', token.value);

      const toast = await this.toastController.create({
        message: 'Token: ' + token.value,
        duration: 4000,
        position: 'bottom',
        color: 'medium'
      });
      await toast.present();

      const user = await this.storage.get('user');
      const authToken = await this.storage.get('token');
      if (user?.id && authToken) {
        this.http.post(`https://clusterin.site/api/notify/${user.id}`, {
          token: token.value
        }, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }).subscribe({
          next: async () => {
            const ok = await this.toastController.create({
              message: ' Token berhasil dikirim ke backend',
              duration: 3000,
              position: 'bottom',
              color: 'success'
            });
            await ok.present();
          },
          error: async err => {
            const errToast = await this.toastController.create({
              message: ' Kirim token gagal: ' + (err.error?.message || err.statusText),
              duration: 4000,
              position: 'bottom',
              color: 'danger'
            });
            await errToast.present();
            console.error(' Error kirim token:', err);
          }
        });
      } else {
        console.warn(' Belum login, token tidak dikirim');
      }
    });

    PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
      console.log(' Notifikasi masuk saat foreground:', notification); //BARU DITAMBAHIN NIH

      const toast = await this.toastController.create({
        message: `${notification.title}: ${notification.body}`,
        duration: 4000,
        position: 'top',
        color: 'primary'
      });
      await toast.present();
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log(' Notifikasi diklik:', action);
    });
  }
}
