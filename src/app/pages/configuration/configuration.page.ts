import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ConfigurationService } from "../../core/services/configuration.service";
import { TourService } from "../../core/services/tour.service";
import { UserConfig } from "../../core/models/tour.model";
import {save} from "ionicons/icons";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
  standalone: false
})
export class ConfigurationPage implements OnInit {
  configuration: UserConfig = {
    userName: 'Conductor',
    vehicle: 'Mi Vehiculo',
    unitMeasure: 'km',
    activeNotifications: true
  };

  useStatistics = {
    totalTours: 0,
    totalDistance: 0,
    totalTime: 0,
    activeDays: 0
  };

  constructor(
    private configurationService: ConfigurationService,
    private tourService: TourService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  async ngOnInit() {
    await this.loadData();
  }

  async ionViewWillEnter() {
    await this.loadData();
  }

  private async loadData() {
    // Cargar configuración
    this.configuration = await this.configurationService.getConfiguration();

    // Calcular estadísticas de uso
    await this.calculateUseStatistics();
  }

  private async calculateUseStatistics() {
    const tours = await this.tourService.getTours();

    if (tours.length === 0) {
      this.useStatistics = {
        totalTours: 0,
        totalDistance: 0,
        totalTime: 0,
        activeDays: 0
      };
      return;
    }

    const totalDistance = tours.reduce((sum, r) => sum + r.distance, 0);
    const totalDuration = tours.reduce((sum, r) => sum + r.duration, 0);

    // Calcular días activos (días únicos con recorridos)
    const singleDates = new Set(
      tours.map(r => new Date(r.date).toDateString())
    );

    this.useStatistics = {
      totalTours: tours.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime: Math.round((totalDuration / 60) * 10) / 10,
      activeDays: singleDates.size
    };
  }

  async saveConfiguration() {
    try {
      await this.configurationService.updateConfiguration(this.configuration);
      await this.showToast('Configuración guardada', 'success');
    } catch (error) {
      console.error('Error al guardar:', error);
      await this.showToast('Error al guardar la configuración', 'danger');
    }
  }

  async exportData() {
    try {
      const tours = await this.tourService.getTours();

      if (tours.length === 0) {
        await this.showToast('No hay datos para exportar', 'warning');
        return;
      }

      const dataStr = JSON.stringify(tours, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `safedrive-backup-${new Date().getTime()}.json`;
      link.click();

      window.URL.revokeObjectURL(url);

      await this.showToast('Datos exportados exitosamente', 'success');
    } catch (error) {
      console.error('Error al exportar:', error);
      await this.showToast('Error al exportar los datos', 'danger');
    }
  }

  async confirmCleanHistory() {
    const alert = await this.alertController.create({
      header: 'Limpiar Historial',
      message: '¿Estás seguro de eliminar TODOS los recorridos? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Todo',
          role: 'destructive',
          handler: async () => {
            await this.cleanHistory();
          }
        }
      ]
    });

    await alert.present();
  }

  private async cleanHistory() {
    try {
      const tours = await this.tourService.getTours();

      for (const tour of tours) {
        await this.tourService.deleteTour(tour.id);
      }

      await this.showToast('Historial limpiado', 'success');
      await this.calculateUseStatistics();
    } catch (error) {
      console.error('Error al limpiar:', error);
      await this.showToast('Error al limpiar el historial', 'danger');
    }
  }

  async confirmResetApp() {
    const alert = await this.alertController.create({
      header: 'Resetear Aplicación',
      message: '¿Estás seguro de restaurar la aplicación? Se eliminarán TODOS los datos y configuraciones.',
      inputs: [
        {
          name: 'confirm',
          type: 'text',
          placeholder: 'Escribe RESETEAR para confirmar'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetear',
          role: 'destructive',
          handler: async (data) => {
            if (data.confirm === 'RESETEAR') {
              await this.resetApp();
              return true;
            } else {
              await this.showToast('Confirmación incorrecta', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async resetApp() {
    try {
      await this.configurationService.resetData();
      await this.showToast('Aplicación reseteada exitosamente', 'success');
      await this.loadData();
    } catch (error) {
      console.error('Error al resetear:', error);
      await this.showToast('Error al resetear la aplicación', 'danger');
    }
  }

  private async showToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  protected readonly save = save;
}
