import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular'; // ← Solo esta importación

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init().then(r => r);
  }

  async init() {
    this._storage = await this.storage.create();
  }

  public async set(key: string, value: any): Promise<void> {
    await this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  public async remove(key: string): Promise<void> {
    await this._storage?.remove(key);
  }

  public async clear(): Promise<void> {
    await this._storage?.clear();
  }

  public async keys(): Promise<string[]> {
    return await this._storage?.keys() || [];
  }
}
