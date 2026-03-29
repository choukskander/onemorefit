
export type Language = 'fr' | 'en';

export enum ClassType {
  Pump = 'Pump',
  HIT = 'HIT',
  Bodycombat = 'Bodycombat',
  Spinning = 'Spinning',
  Femmes100 = '100% Femmes',
  Abdos = 'Abdos',
  CrossTraining = 'Cross Training'
}

export interface GymClass {
  id: string;
  name: string;
  type: ClassType;
  day: string; // French day names
  time: string;
  capacity: number;
}

export interface User {
  email: string;
  password?: string;
  name?: string;
  blocked?: boolean;
  subscriptionEndDate?: string; // Format ISO: '2026-04-28'
}

export interface Reservation {
  id: string;
  userEmail: string;
  classId: string;
  timestamp: number;
}

export interface WaitlistEntry {
  userEmail: string;
  classId: string;
}
