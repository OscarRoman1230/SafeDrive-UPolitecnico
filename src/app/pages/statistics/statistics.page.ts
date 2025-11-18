import { Component, OnInit } from '@angular/core';
import { TourService } from "../../core/services/tour.service";
import {Tour, WeeklyStatistics} from 'src/app/core/models/tour.model';
import { ChartConfiguration } from "chart.js";

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: false
})
export class StatisticsPage implements OnInit {
  generalStatistics = {
    totalTours: 0,
    totalDistance: 0,
    totalTime: 0,
    averageSpeed: 0
  };

  weeklyStatistics: WeeklyStatistics[] = [];

  chartDistanceData: ChartConfiguration['data'] | null = null;
  chartAttentionData: ChartConfiguration['data'] | null = null;

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' km';
          }
        }
      }
    }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor( private tourService: TourService ) { }

  async ngOnInit() {
    await this.loadStatistics();
  }

  async ionViewWillEnter() {
    await this.loadStatistics();
  }

  private async loadStatistics() {
    const tours = await this.tourService.getTours();

    if (tours.length === 0) {
      this.generalStatistics = {
        totalTours: 0,
        totalDistance: 0,
        totalTime: 0,
        averageSpeed: 0
      };
      return;
    }

    // Calcular estadísticas generales
    const totalDistance = tours.reduce((sum, r) => sum + r.distance, 0);
    const totalTime = tours.reduce((sum, r) => sum + r.duration, 0);

    this.generalStatistics = {
      totalTours: tours.length,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime: Math.round((totalTime / 60) * 10) / 10,
      averageSpeed: totalTime > 0
        ? Math.round((totalDistance / (totalTime / 60)) * 10) / 10
        : 0
    };

    // Cargar estadísticas semanales
    this.weeklyStatistics = await this.tourService.getWeeklyStatistics();

    // Generar gráficos
    this.generarGraficoDistancia();
    this.generarGraficoAtencion(tours);
  }

  private generarGraficoDistancia() {
    if (this.weeklyStatistics.length === 0) {
      this.chartDistanceData = null;
      return;
    }

    const lastWeeks = this.weeklyStatistics.slice(0, 6).reverse();

    this.chartDistanceData = {
      labels: lastWeeks.map(s => s.week.replace('Semana del ', '')),
      datasets: [
        {
          label: 'Distancia (km)',
          data: lastWeeks.map(s => s.distanceTotal),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        }
      ]
    };
  }

  private generarGraficoAtencion(tours: Tour[]) {
    if (tours.length === 0) {
      this.chartAttentionData = null;
      return;
    }

    const conteo = {
      Alta: 0,
      Media: 0,
      Baja: 0
    };

    tours.forEach(r => {
      conteo[r.levelAttention]++;
    });

    this.chartAttentionData = {
      labels: ['Alta', 'Media', 'Baja'],
      datasets: [
        {
          data: [conteo.Alta, conteo.Media, conteo.Baja],
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)',   // Verde
            'rgba(251, 191, 36, 0.6)',  // Amarillo
            'rgba(239, 68, 68, 0.6)'    // Rojo
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2
        }
      ]
    };
  }

  getAtencionBadgeColor(promedio: number): string {
    if (promedio >= 2.5) return 'success';
    if (promedio >= 1.5) return 'warning';
    return 'danger';
  }

  getAtencionTexto(promedio: number): string {
    if (promedio >= 2.5) return 'Alta';
    if (promedio >= 1.5) return 'Media';
    return 'Baja';
  }

}
