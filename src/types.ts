export type UserRole = 'passenger' | 'driver' | 'admin';

export interface VerificationStatus {
  phone: boolean;
  identity: boolean;
  license: boolean;
  vehicle: boolean;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  photo: string;
  city: string;
  rating: number;
  review_count: number;
  role: UserRole;
  verification_status: VerificationStatus;
  trips_as_driver: number;
  trips_as_passenger: number;
  created_at: string;
  vehicle_id?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  color: string;
  year: number;
  plate: string; // e.g. "12345 | A | 6"
  seats: number;
  verified: boolean;
  photo?: string;
}

export type TripStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PARTIALLY_BOOKED'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CorridorStop {
  id: string;
  name: string;
  approx_time: string;
  lat: number;
  lng: number;
  type: 'origin' | 'stop' | 'destination';
}

export interface TripPassenger {
  id: string;
  name: string;
  photo: string;
  pickup_point: string;
  dropoff_point: string;
  seats: number;
  contribution_dh: number;
}

export interface Trip {
  id: string;
  driver_id: string;
  driver: User;
  vehicle: Vehicle;
  origin: string;
  origin_lat: number;
  origin_lng: number;
  destination: string;
  destination_lat: number;
  destination_lng: number;
  corridor: CorridorStop[];
  date: string; // e.g. "Aujourd'hui", "Demain", "2026-10-02"
  departure_time: string; // e.g. "08:00"
  estimated_duration_min: number;
  distance_km: number;
  available_seats: number;
  reserved_seats: number;
  global_price: number; // in MAD / DH: coût global estimé du véhicule
  passenger_contribution: number; // in MAD / DH: prix équitable par place / passager
  fuel_cost_dh?: number;
  wear_cost_dh?: number;
  toll_cost_dh?: number;
  status: TripStatus;
  match_type: 'exact' | 'compatible' | 'nearby';
  compatibility_score: number; // internal score 0-100
  passengers: TripPassenger[];
  blocked_private?: boolean;
  created_at: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  passenger: User;
  trip: Trip;
  seats_reserved: number;
  pickup_point: string;
  dropoff_point: string;
  passenger_price: number;
  is_blocked_remaining?: boolean;
  status: BookingStatus;
  created_at: string;
}

export interface Review {
  id: string;
  trip_id: string;
  author_id: string;
  author_name: string;
  author_photo: string;
  target_user_id: string;
  target_user_name: string;
  rating: number;
  punctuality: number;
  respect: number;
  communication: number;
  driving_or_reliability: number;
  comment: string;
  created_at: string;
}

export type MessageActionType =
  | 'text'
  | 'send_location'
  | 'arrived'
  | 'late'
  | 'confirm_meeting';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  action_type?: MessageActionType;
  action_meta?: string;
  created_at: string;
  time: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  trip_id: string;
  participants: User[];
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export type NotificationType =
  | 'NEW_BOOKING'
  | 'BOOKING_CONFIRMED'
  | 'NEW_PASSENGER'
  | 'NEW_MESSAGE'
  | 'TRIP_REMINDER'
  | 'TRIP_UPDATED'
  | 'TRIP_CANCELLED'
  | 'NEW_REVIEW'
  | 'REPORT_UPDATE';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_link?: string;
}

export type ReportStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface SafetyReport {
  id: string;
  author_id: string;
  author_name: string;
  target_user_id: string;
  target_user_name: string;
  trip_id?: string;
  reason: string;
  details: string;
  status: ReportStatus;
  created_at: string;
}
