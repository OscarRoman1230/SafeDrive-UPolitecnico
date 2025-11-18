import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { TourService } from "../../core/services/tour.service";
import { ConfigurationService } from "../../core/services/configuration.service";
import { Tour } from "../../core/models/tour.model";
import { isToday } from "date-fns/isToday";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {

  userName: string = 'Conductor';
  lastTour: Tour | null = null;
  statisticsToday = {
    distance: 0,
    duration: 0,
    tours: 0,
    averageAttention: 'N/A'
  };

  constructor(
    private router: Router,
    private tourService: TourService,
    private configurationService: ConfigurationService,
  ) { }

  async ngOnInit() {
    await this.loadData();
  }

  async ionViewWillEnter() {
    await this.loadData();
  }

  private async loadData() {
    // Cargar nombre del usuario
    const config = await this.configurationService.getConfiguration();
    this.userName = config.userName;

    // Cargar recorridos
    const tours = await this.tourService.getTours();

    if (tours.length > 0) {
      this.lastTour = tours[0];
      this.calculateStatisticsToday(tours);
    }
  }

  private calculateStatisticsToday(tours: Tour[]) {
    const toursToday = tours.filter(r => isToday(new Date(r.date)));

    if (toursToday.length === 0) {
      this.statisticsToday = {
        distance: 0,
        duration: 0,
        tours: 0,
        averageAttention: 'N/A'
      };
      return;
    }

    const distanceTotal = toursToday.reduce((sum, r) => sum + r.distance, 0);
    const durationTotal = toursToday.reduce((sum, r) => sum + r.duration, 0);

    const levelAttentionMap = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const averageAttention = toursToday.reduce((sum, r) =>
      sum + levelAttentionMap[r.levelAttention], 0) / toursToday.length;

    let attentionText = 'Media';
    if (averageAttention >= 2.5) attentionText = 'Alta';
    else if (averageAttention < 1.5) attentionText = 'Baja';

    this.statisticsToday = {
      distance: Math.round(distanceTotal * 10) / 10,
      duration: Math.round(durationTotal * 10) / 10,
      tours: toursToday.length,
      averageAttention: attentionText
    };
  }

  getColorAttention(level: string): string {
    switch(level) {
      case 'Alta': return 'success';
      case 'Media': return 'warning';
      case 'Baja': return 'danger';
      default: return 'medium';
    }
  }

  async navigateTo(route: string) {
    await this.router.navigate(['/tabs/' + route]);
  }
}
