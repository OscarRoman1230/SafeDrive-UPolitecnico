import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Tour, WeeklyStatistics  } from '../models/tour.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { startOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private readonly STORAGE_KEY = 'tours';
  private toursSubject = new BehaviorSubject<Tour[]>([]);
  public tours$: Observable<Tour[]> = this.toursSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadTours().then(r => r);
  }

  private async loadTours(): Promise<void> {
    const tours = await this.storageService.get(this.STORAGE_KEY) || [];
    // Convertir strings de fecha a objetos Date
    const toursWithDates = tours.map((r: any) => ({
      ...r,
      date: new Date(r.date)
    }));
    this.toursSubject.next(toursWithDates);
  }

  async getTours(): Promise<Tour[]> {
    return this.toursSubject.value;
  }

  async addTour(tour: Omit<Tour, 'id'>): Promise<void> {
    const tours = this.toursSubject.value;
    const newTour: Tour = {
      ...tour,
      id: this.generateId()
    };

    tours.unshift(newTour); // Agregar al inicio
    await this.saveTours(tours);
  }

  async updateTour(id: string, tourUpdate: Partial<Tour>): Promise<void> {
    const tours = this.toursSubject.value;
    const index = tours.findIndex(r => r.id === id);

    if (index !== -1) {
      tours[index] = { ...tours[index], ...tourUpdate };
      await this.saveTours(tours);
    }
  }

  async deleteTour(id: string): Promise<void> {
    const tours = this.toursSubject.value.filter(r => r.id !== id);
    await this.saveTours(tours);
  }

  async getTourById(id: string): Promise<Tour | undefined> {
    return this.toursSubject.value.find(r => r.id === id);
  }

  async getWeeklyStatistics(): Promise<WeeklyStatistics[]> {
    const tours = this.toursSubject.value;
    const weekStatistics = new Map<string, Tour[]>();

    // Agrupar recorridos por semana
    tours.forEach(tours => {
      const startWeek = startOfWeek(tours.date, { locale: es });
      const claveWeek = format(startWeek, 'yyyy-MM-dd');

      if (!weekStatistics.has(claveWeek)) {
        weekStatistics.set(claveWeek, []);
      }
      weekStatistics.get(claveWeek)!.push(tours);
    });

    // Calcular estadísticas por cada semana
    const statistics: WeeklyStatistics[] = [];
    weekStatistics.forEach((toursWeek, claveWeek) => {
      const distanceTotal = toursWeek.reduce((sum, r) => sum + r.distance, 0);
      const durationTotal = toursWeek.reduce((sum, r) => sum + r.duration, 0);
      const averageSpeed = distanceTotal > 0 ? (distanceTotal / (durationTotal / 60)) : 0;

      const levelAttentionMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
      const averageAttention = toursWeek.reduce((sum, r) =>
        sum + levelAttentionMap[r.levelAttention], 0) / toursWeek.length;

      statistics.push({
        week: format(new Date(claveWeek), "'Semana del' dd 'de' MMMM", { locale: es }),
        distanceTotal: Math.round(distanceTotal * 10) / 10,
        durationTotal: Math.round(durationTotal),
        averageSpeed: Math.round(averageSpeed * 10) / 10,
        countTours: toursWeek.length,
        averageAttention: Math.round(averageAttention * 10) / 10
      });
    });

    return statistics.sort((a, b) => b.week.localeCompare(a.week));
  }

  private async saveTours(tours: Tour[]): Promise<void> {
    await this.storageService.set(this.STORAGE_KEY, tours);
    this.toursSubject.next(tours);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
}
