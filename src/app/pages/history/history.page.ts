import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { TourService } from "../../core/services/tour.service";
import { Tour } from "../../core/models/tour.model";
import { format } from "date-fns";
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false
})
export class HistoryPage implements OnInit {
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  searchTerm: string = '';
  filterAttention: string = 'Todas';

  constructor(
    private tourService: TourService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  async ngOnInit() {
    await this.loadTours();
  }

  async ionViewWillEnter() {
    await this.loadTours();
  }

  private async loadTours() {
    this.tours = await this.tourService.getTours();
    this.filterTours();
  }

  filterTours() {
    let resultados = [...this.tours];

    // Filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const termino = this.searchTerm.toLowerCase();
      resultados = resultados.filter(r => {
        const fechaStr = format(new Date(r.date), 'dd/MM/yyyy', { locale: es });
        const notasStr = (r.notes || '').toLowerCase();
        return fechaStr.includes(termino) || notasStr.includes(termino);
      });
    }

    // Filtrar por nivel de atención
    if (this.filterAttention !== 'Todas') {
      resultados = resultados.filter(r => r.levelAttention === this.filterAttention);
    }

    this.filteredTours = resultados;
  }

  calcularDistanciaTotal(): number {
    const total = this.filteredTours.reduce((sum, r) => sum + r.distance, 0);
    return Math.round(total * 10) / 10;
  }

  calcularPromedioAtencion(): string {
    if (this.filteredTours.length === 0) return 'N/A';

    const nivelAtencionMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const promedio = this.filteredTours.reduce((sum, r) =>
      sum + nivelAtencionMap[r.levelAttention], 0) / this.filteredTours.length;

    if (promedio >= 2.5) return 'Alta';
    if (promedio >= 1.5) return 'Media';
    return 'Baja';
  }

  getColorAttention(level: string): string {
    switch(level) {
      case 'Alta': return 'success';
      case 'Media': return 'warning';
      case 'Baja': return 'danger';
      default: return 'medium';
    }
  }

  async editTour(tour: Tour) {
    const alert = await this.alertController.create({
      header: 'Editar Recorrido',
      inputs: [
        {
          name: 'distance',
          type: 'number',
          placeholder: 'Distancia (km)',
          value: tour.distance
        },
        {
          name: 'duration',
          type: 'number',
          placeholder: 'Duración (minutos)',
          value: tour.duration
        },
        {
          name: 'averageSpeed',
          type: 'number',
          placeholder: 'Velocidad Promedio (km/h)',
          value: tour.averageSpeed
        },
        {
          name: 'notes',
          type: 'textarea',
          placeholder: 'Notas',
          value: tour.notes || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.distance > 0 && data.duration > 0 && data.averageSpeed > 0) {
              await this.updateTour(tour.id, data);
              return true;
            } else {
              await this.showToast('Todos los valores deben ser mayores a 0', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async updateTour(id: string, datos: any) {
    try {
      await this.tourService.updateTour(id, {
        distance: Number(datos.distance),
        duration: Number(datos.duration),
        averageSpeed: Number(datos.averageSpeed),
        notes: datos.notes || undefined
      });

      await this.showToast('Recorrido actualizado exitosamente', 'success');
      await this.loadTours();
    } catch (error) {
      console.error('Error al actualizar:', error);
      await this.showToast('Error al actualizar el recorrido', 'danger');
    }
  }

  async confirmDelete(tour: Tour) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar el recorrido del ${format(new Date(tour.date), 'dd/MM/yyyy HH:mm')}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.deleteTour(tour.id);
          }
        }
      ]
    });

    await alert.present();
  }

  private async deleteTour(id: string) {
    try {
      await this.tourService.deleteTour(id);
      await this.showToast('Recorrido eliminado', 'success');
      await this.loadTours();
    } catch (error) {
      console.error('Error al eliminar:', error);
      await this.showToast('Error al eliminar el recorrido', 'danger');
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
