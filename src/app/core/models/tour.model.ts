export interface Tour {
  id: string;
  date: Date;
  distance: number; // en kilómetros
  duration: number; // en minutos
  averageSpeed: number; // km/h
  levelAttention: 'Alta' | 'Media' | 'Baja';
  notes?: string;
}

export interface WeeklyStatistics {
  week: string;
  distanceTotal: number;
  durationTotal: number;
  averageSpeed: number;
  countTours: number;
  averageAttention: number;
}

export interface UserConfig {
  userName: string;
  vehicle: string;
  unitMeasure: 'km' | 'millas';
  activeNotifications: boolean;
  weeklyDistanceGoal?: number;
}
