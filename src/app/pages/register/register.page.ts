import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from "@ionic/angular/standalone";
import { TourService } from "../../core/services/tour.service";
import { Tour } from "../../core/models/tour.model";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage  {
  @ViewChild('formTour') formTour!: NgForm;

  tour = {
    date: new Date().toISOString(),
    distance: 0,
    duration: 0,
    averageSpeed: 0,
    levelAttention: 'Media' as 'Alta' | 'Media' | 'Baja',
    notes: ''
  };

  dateMax = new Date().toISOString();

  constructor(
    private tourService: TourService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
  ) { }

  calculateSpeed (): number {
    if (this.tour.distance > 0 && this.tour.duration > 0) {
      const speed = (this.tour.distance / (this.tour.duration / 60));
      return Math.round(speed * 10) / 10;
    }
    return 0;
  }

  useSpeedCalculate() {
    this.tour.averageSpeed = this.calculateSpeed();
  }

  async saveTour () {
    if (!this.formTour.valid) {
      await this.showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    // Validaciones adicionales
    if (this.tour.distance <= 0) {
      await this.showToast('La distancia debe ser mayor a 0', 'warning');
      return;
    }

    if (this.tour.duration <= 0) {
      await this.showToast('La duración debe ser mayor a 0', 'warning');
      return;
    }

    if (this.tour.averageSpeed <= 0) {
      await this.showToast('La velocidad debe ser mayor a 0', 'warning');
      return;
    }

    // Mostrar confirmación
    const alert = await this.alertController.create({
      header: 'Confirmar Registro',
      message: `¿Deseas guardar este recorrido de ${this.tour.distance} km?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.save();
          }
        }
      ]
    });

    await alert.present();
  }

  private async save () {
    try {
      const newTour: Omit<Tour, 'id'> = {
        date: new Date(this.tour.date),
        distance: Number(this.tour.distance),
        duration: Number(this.tour.duration),
        averageSpeed: Number(this.tour.averageSpeed),
        levelAttention: this.tour.levelAttention,
        notes: this.tour.notes || undefined
      };

      await this.tourService.addTour(newTour);

      await this.showToast('Recorrido guardado exitosamente', 'success');
      this.cleanForm();

      // Navegar al historial
      await this.router.navigate(['/tabs/history']);
    } catch (error) {
      console.error('Error al guardar:', error);
      await this.showToast('Error al guardar el recorrido', 'danger');
    }
  }

  cleanForm() {
    this.tour = {
      date: new Date().toISOString(),
      distance: 0,
      duration: 0,
      averageSpeed: 0,
      levelAttention: 'Media',
      notes: ''
    };

    if (this.formTour) {
      this.formTour.resetForm({
        date: new Date().toISOString(),
        levelAttention: 'Media'
      });
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
      buttons: [{
        text: 'OK',
        role: 'cancel'
      }]
    });
    await toast.present();
  }

}
