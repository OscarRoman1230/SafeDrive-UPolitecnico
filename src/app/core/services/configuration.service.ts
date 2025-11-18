import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { UserConfig } from '../models/tour.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {
  private readonly STORAGE_KEY = 'configurations';
  private readonly CONFIG_DEFAULT: UserConfig = {
    userName: 'Conductor',
    vehicle: 'Mi Vehículo',
    unitMeasure: 'km',
    activeNotifications: true
  };

  private configurationSubject = new BehaviorSubject<UserConfig>(this.CONFIG_DEFAULT);
  public configuration$: Observable<UserConfig> = this.configurationSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadConfiguration().then(r => r);
  }

  private async loadConfiguration(): Promise<void> {
    const config = await this.storageService.get(this.STORAGE_KEY);
    if (config) {
      this.configurationSubject.next(config);
    } else {
      await this.saveConfiguration(this.CONFIG_DEFAULT);
    }
  }

  async getConfiguration(): Promise<UserConfig> {
    return this.configurationSubject.value;
  }

  async updateConfiguration(config: Partial<UserConfig>): Promise<void> {
    const configActual = this.configurationSubject.value;
    const newConfig = { ...configActual, ...config };
    await this.saveConfiguration(newConfig);
  }

  async resetData(): Promise<void> {
    await this.storageService.clear();
    await this.saveConfiguration(this.CONFIG_DEFAULT);
  }

  private async saveConfiguration(config: UserConfig): Promise<void> {
    await this.storageService.set(this.STORAGE_KEY, config);
    this.configurationSubject.next(config);
  }
}
