
import { ClassType, GymClass } from './types';

export const CLASS_CAPACITIES: Record<ClassType, number> = {
  [ClassType.Pump]: 20,
  [ClassType.HIT]: 20,
  [ClassType.Bodycombat]: 30,
  [ClassType.Spinning]: 10,
  [ClassType.Femmes100]: 25,
  [ClassType.Abdos]: 25,
  [ClassType.CrossTraining]: 25,
  [ClassType.TRX]: 15,
  [ClassType.BodyBalance]: 20,
};

export const RAW_SCHEDULE: Omit<GymClass, 'id' | 'capacity'>[] = [
  // Monday
  { name: '100% Femmes', type: ClassType.Femmes100, day: 'Lundi', time: '12:00' },
  { name: 'Lesmills Bodycombat', type: ClassType.Bodycombat, day: 'Lundi', time: '19:00' },
  { name: 'Abdos', type: ClassType.Abdos, day: 'Lundi', time: '20:00' },
  // Tuesday
  { name: '100% Femmes', type: ClassType.Femmes100, day: 'Mardi', time: '12:00' },
  { name: 'Pump', type: ClassType.Pump, day: 'Mardi', time: '19:00' },
  { name: 'Spinning', type: ClassType.Spinning, day: 'Mardi', time: '19:00' },
  { name: 'HIT', type: ClassType.HIT, day: 'Mardi', time: '20:00' },
  // Wednesday
  { name: 'Spinning', type: ClassType.Spinning, day: 'Mercredi', time: '18:30' },
  { name: 'Cross Training', type: ClassType.CrossTraining, day: 'Mercredi', time: '19:00' },
  // Thursday
  { name: '100% Femmes', type: ClassType.Femmes100, day: 'Jeudi', time: '12:00' },
  { name: 'Spinning', type: ClassType.Spinning, day: 'Jeudi', time: '18:30' },
  { name: 'Lesmills Bodycombat', type: ClassType.Bodycombat, day: 'Jeudi', time: '19:00' },
  { name: 'Abdos', type: ClassType.Abdos, day: 'Jeudi', time: '20:00' },
  // Friday
  { name: 'Pump', type: ClassType.Pump, day: 'Vendredi', time: '19:00' },
  { name: 'HIT', type: ClassType.HIT, day: 'Vendredi', time: '20:00' },
  // Saturday
  { name: 'Cross Training', type: ClassType.CrossTraining, day: 'Samedi', time: '18:30' },
  // Sunday
  { name: 'Spinning', type: ClassType.Spinning, day: 'Dimanche', time: '10:00' },
];

export const GYM_SCHEDULE: GymClass[] = RAW_SCHEDULE.map((item, index) => ({
  ...item,
  id: `class-${index}`,
  capacity: CLASS_CAPACITIES[item.type]
}));

export const TRANSLATIONS = {
  fr: {
    nav_home: 'Accueil',
    nav_about: 'À Propos',
    nav_schedule: 'Planning',
    nav_reservations: 'Réservations',
    nav_contact: 'Contact',
    hero_title: 'DÉPASSEZ VOS LIMITES',
    hero_subtitle: 'One More Fit est votre salle de sport de référence pour des cours collectifs dynamiques et un entraînement de haut niveau.',
    view_schedule: 'Voir le planning',
    make_reservation: 'Réserver un cours',
    about_title: 'Notre Mission',
    about_desc: 'Donner à chacun les moyens de réaliser une répétition de plus, un cours de plus, un objectif de plus.',
    trainers_title: 'Nos Coachs',
    testimonials_title: 'Témoignages',
    contact_info: 'Informations de Contact',
    footer_address: 'Beni khalled, Tunisia, 8021',
    footer_email: 'onemorefitnes80@gmail.com',
    footer_phone: '+216 29 248 405',
    spots_left: 'places restantes',
    class_full: 'Cours complet',
    join_waitlist: 'Rejoindre la liste d\'attente',
    reserve_now: 'Réserver maintenant',
    confirm_reservation: 'Confirmer la réservation',
    cancel: 'Annuler',
    login: 'Se connecter',
    guest: 'Mode invité',
    already_reserved: 'Déjà réservé',
    waitlist_success: 'Vous êtes sur la liste d\'attente !',
    reservation_success: 'Réservation confirmée ! Un email de confirmation a été envoyé (simulé).',
    capacity: 'Capacité',
    available: 'Disponible',
  },
  en: {
    nav_home: 'Home',
    nav_about: 'About Us',
    nav_schedule: 'Schedule',
    nav_reservations: 'Reservations',
    nav_contact: 'Contact',
    hero_title: 'PUSH YOUR LIMITS',
    hero_subtitle: 'One More Fit is your go-to gym for high-energy group classes and professional fitness training.',
    view_schedule: 'View Schedule',
    make_reservation: 'Book a Class',
    about_title: 'Our Mission',
    about_desc: 'Empowering individuals to achieve one more fit, one more class, one more goal.',
    trainers_title: 'Our Trainers',
    testimonials_title: 'Testimonials',
    contact_info: 'Contact Information',
    footer_address: 'Beni khalled, Tunisia, 8021',
    footer_email: 'onemorefitnes80@gmail.com',
    footer_phone: '+216 29 248 405',
    spots_left: 'spots left',
    class_full: 'Class full',
    join_waitlist: 'Join waitlist',
    reserve_now: 'Reserve now',
    confirm_reservation: 'Confirm reservation',
    cancel: 'Cancel',
    login: 'Login',
    guest: 'Guest Mode',
    already_reserved: 'Already reserved',
    waitlist_success: 'You are on the waitlist!',
    reservation_success: 'Reservation confirmed! A confirmation email has been sent (simulated).',
    capacity: 'Capacity',
    available: 'Available',
  }
};

export const DAYS_FR_TO_EN: Record<string, string> = {
  'Lundi': 'Monday',
  'Mardi': 'Tuesday',
  'Mercredi': 'Wednesday',
  'Jeudi': 'Thursday',
  'Vendredi': 'Friday',
  'Samedi': 'Saturday',
  'Dimanche': 'Sunday',
};
