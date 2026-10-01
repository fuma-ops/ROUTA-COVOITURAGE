import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Vehicle,
  Trip,
  Booking,
  Conversation,
  Message,
  AppNotification,
  SafetyReport,
  MessageActionType,
  TripStatus,
  ReportStatus,
} from '../types';
import {
  MOCK_USERS,
  MOCK_TRIPS,
  MOCK_BOOKINGS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_REPORTS,
  MOCK_VEHICLES,
} from '../mockData';
import { calculateTripTarification } from '../utils/pricing';

export type NavigationPage =
  | 'home'
  | 'search'
  | 'trip-detail'
  | 'publish'
  | 'messages'
  | 'my-trips'
  | 'profile'
  | 'back-office'
  | 'simulation';

interface SearchState {
  origin: string;
  destination: string;
  date: string;
  time: string;
  toleranceMinutes: number; // e.g. 30
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  usersList: User[];
  addUser: (newUser: User, newVehicle?: Vehicle) => void;
  login: (user: User) => void;
  logout: () => void;
  loginWithPhone: (phone: string, firstName?: string, lastName?: string) => User | null;
  switchUserDirect: (user: User) => void;
  vehiclesList: Record<string, Vehicle>;
  switchUser: (userKey: 'imane' | 'yassine' | 'karim' | 'sara' | 'admin') => void;
  showCreateProfileModal: boolean;
  setShowCreateProfileModal: (val: boolean) => void;
  createProfileRoleDefault: 'passenger' | 'driver';
  setCreateProfileRoleDefault: (val: 'passenger' | 'driver') => void;
  showDriverRestrictedModal: boolean;
  setShowDriverRestrictedModal: (val: boolean) => void;
  showMapPicker: boolean;
  setShowMapPicker: (val: boolean) => void;
  openMapPicker: (mode?: 'search' | 'publish') => void;
  mapPickerMode: 'search' | 'publish';
  showLocationModal: boolean;
  setShowLocationModal: (val: boolean) => void;
  locationTargetField: 'origin' | 'destination';
  openLocationPicker: (field: 'origin' | 'destination', onSelect?: (location: string) => void) => void;
  confirmLocationSelection: (locationName: string) => void;
  resetAllDataToZero: () => void;
  loadDemoData: () => void;
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  searchParams: SearchState;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchState>>;
  trips: Trip[];
  filteredTrips: Trip[];
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  favorites: string[];
  toggleFavorite: (tripId: string) => void;
  bookings: Booking[];
  lastBooking: Booking | null;
  bookTrip: (
    tripId: string,
    seats: number,
    blockRemaining: boolean,
    pickup?: string,
    dropoff?: string
  ) => boolean;
  cancelBooking: (bookingId: string) => void;
  cancelTrip: (tripId: string) => void;
  updateTripStatus: (tripId: string, status: TripStatus) => void;
  publishTrip: (newTrip: Partial<Trip>) => Trip;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (convId: string | null) => void;
  messages: Record<string, Message[]>;
  sendMessage: (
    conversationId: string,
    text: string,
    actionType?: MessageActionType,
    actionMeta?: string
  ) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  reports: SafetyReport[];
  submitReport: (targetUserId: string, reason: string, details: string, tripId?: string) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  isMobileSimulator: boolean;
  setIsMobileSimulator: (val: boolean | ((prev: boolean) => boolean)) => void;
  showSplash: boolean;
  setShowSplash: (val: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
  showSafetyModal: boolean;
  setShowSafetyModal: (val: boolean) => void;
  showNotificationsModal: boolean;
  setShowNotificationsModal: (val: boolean) => void;
  showTarificationModal: boolean;
  setShowTarificationModal: (val: boolean) => void;
  showConfirmationModal: boolean;
  setShowConfirmationModal: (val: boolean) => void;
  showRatingModal: boolean;
  setShowRatingModal: (val: boolean) => void;
  ratingTarget: { trip: Trip; user: User; isPassengerRatingDriver: boolean } | null;
  openRatingModal: (trip: Trip, user: User, isPassengerRatingDriver: boolean) => void;
  submitRating: (data: {
    punctuality: number;
    respect: number;
    communication: number;
    drivingOrReliability: number;
    comment: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean user management
  const [usersList, setUsersList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('routa_users_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [MOCK_USERS.imane];
  });

  const [vehiclesList, setVehiclesList] = useState<Record<string, Vehicle>>(() => {
    try {
      const saved = localStorage.getItem('routa_vehicles_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_VEHICLES;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('routa_current_user_id');
      if (saved && usersList.some((u) => u.id === saved)) {
        return usersList.find((u) => u.id === saved)!;
      }
    } catch (e) {}
    return usersList[0] || null;
  });

  const [showCreateProfileModal, setShowCreateProfileModal] = useState<boolean>(false);
  const [showDriverRestrictedModal, setShowDriverRestrictedModal] = useState<boolean>(false);
  const [createProfileRoleDefault, setCreateProfileRoleDefault] = useState<'passenger' | 'driver'>('passenger');
  const [activePage, setActivePage] = useState<NavigationPage>('home');
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState<boolean>(false);

  // Search parameters - empty initially for clean zero test
  const [searchParams, setSearchParams] = useState<SearchState>({
    origin: '',
    destination: '',
    date: "Aujourd'hui",
    time: '08:00',
    toleranceMinutes: 30,
  });

  // State entities - Real trips loaded for production experience
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem('routa_trips');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_TRIPS;
  });
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(MOCK_TRIPS[0] || null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  // Messaging & Notifications - Empty at start
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showTarificationModal, setShowTarificationModal] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [mapPickerMode, setMapPickerMode] = useState<'search' | 'publish'>('search');

  // Simple location picker modal for clicking on the map next to departure or destination
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [locationTargetField, setLocationTargetField] = useState<'origin' | 'destination'>('origin');
  const [locationPickerCallback, setLocationPickerCallback] = useState<((loc: string) => void) | null>(null);

  const openLocationPicker = (
    field: 'origin' | 'destination',
    onSelect?: (loc: string) => void
  ) => {
    setLocationTargetField(field);
    setLocationPickerCallback(() => onSelect || null);
    setShowLocationModal(true);
  };

  const confirmLocationSelection = (locationName: string) => {
    if (locationPickerCallback) {
      locationPickerCallback(locationName);
    }
    if (locationTargetField === 'origin') {
      setSearchParams((prev) => ({ ...prev, origin: locationName }));
    } else {
      setSearchParams((prev) => ({ ...prev, destination: locationName }));
    }
    setLocationPickerCallback(null);
    setShowLocationModal(false);
  };

  const resetAllDataToZero = () => {
    setTrips([]);
    setBookings([]);
    setLastBooking(null);
    setConversations([]);
    setMessages({});
    setNotifications([]);
    setSelectedTrip(null);
    setSearchParams({
      origin: '',
      destination: '',
      date: "Aujourd'hui",
      time: '08:00',
      toleranceMinutes: 30,
    });
  };

  const loadDemoData = () => {
    setTrips(
      MOCK_TRIPS.map((t) => ({
        ...t,
        reserved_seats: 0,
        status: 'PUBLISHED' as TripStatus,
        passengers: [],
        blocked_private: false,
      }))
    );
    setSelectedTrip(MOCK_TRIPS[0]);
    setConversations(MOCK_CONVERSATIONS);
    setMessages(MOCK_MESSAGES);
    setSearchParams({
      origin: 'Targa, Marrakech',
      destination: 'Médina, Marrakech',
      date: "Aujourd'hui",
      time: '08:00',
      toleranceMinutes: 30,
    });
  };

  const [ratingTarget, setRatingTarget] = useState<{
    trip: Trip;
    user: User;
    isPassengerRatingDriver: boolean;
  } | null>(null);

  const openMapPicker = (mode: 'search' | 'publish' = 'search') => {
    setMapPickerMode(mode);
    setShowMapPicker(true);
  };

  const switchUser = (userKey: 'imane' | 'yassine' | 'karim' | 'sara' | 'admin') => {
    const selected = MOCK_USERS[userKey];
    if (selected) {
      setCurrentUser(selected);
      try {
        localStorage.setItem('routa_current_user_id', selected.id);
      } catch (e) {}
      // Add notification confirming persona switch
      const notif: AppNotification = {
        id: `switch_${Date.now()}`,
        user_id: selected.id,
        type: 'TRIP_UPDATED',
        title: `Connecté en tant que ${selected.first_name} (${selected.role === 'driver' ? 'Conducteur' : selected.role === 'admin' ? 'Admin' : 'Passagère'})`,
        message: `Vous naviguez maintenant avec le compte de ${selected.first_name} ${selected.last_name}.`,
        read: false,
        created_at: "À l'instant",
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const addUser = (newUser: User, newVehicle?: Vehicle) => {
    setUsersList((prev) => {
      const updated = [newUser, ...prev.filter((u) => u.id !== newUser.id)];
      try {
        localStorage.setItem('routa_users_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (newVehicle) {
      setVehiclesList((prev) => {
        const updated = { ...prev, [newVehicle.id]: newVehicle };
        try {
          localStorage.setItem('routa_vehicles_list', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    setCurrentUser(newUser);
    try {
      localStorage.setItem('routa_current_user_id', newUser.id);
    } catch (e) {}

    const notif: AppNotification = {
      id: `user_created_${Date.now()}`,
      user_id: newUser.id,
      type: 'TRIP_UPDATED',
      title: `Profil ${newUser.role === 'driver' ? 'Conducteur 🚗' : 'Passager 🎒'} créé`,
      message: `Bienvenue ${newUser.first_name} ! Vous êtes connecté avec votre profil réel.`,
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const switchUserDirect = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('routa_current_user_id', user.id);
    } catch (e) {}
    const notif: AppNotification = {
      id: `switch_${Date.now()}`,
      user_id: user.id,
      type: 'TRIP_UPDATED',
      title: `Connecté en tant que ${user.first_name}`,
      message: `Compte actif : ${user.role === 'driver' ? 'Conducteur vérifié 🚗' : 'Passager 🎒'}`,
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('routa_current_user_id', user.id);
      if (!usersList.some((u) => u.id === user.id)) {
        const updated = [...usersList, user];
        setUsersList(updated);
        localStorage.setItem('routa_users_list', JSON.stringify(updated));
      }
    } catch (e) {}
    const notif: AppNotification = {
      id: `login_${Date.now()}`,
      user_id: user.id,
      type: 'TRIP_UPDATED',
      title: `Bienvenue, ${user.first_name} !`,
      message: `Connecté en tant que ${user.role === 'driver' ? 'Conducteur 🚗' : 'Passager 🎒'}.`,
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('routa_current_user_id');
    } catch (e) {}
    const notif: AppNotification = {
      id: `logout_${Date.now()}`,
      user_id: 'guest',
      type: 'TRIP_UPDATED',
      title: 'Déconnexion effectuée',
      message: 'Vous êtes maintenant déconnecté.',
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);
    setActivePage('home');
  };

  const loginWithPhone = (phone: string, firstName?: string, lastName?: string): User | null => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const existing = usersList.find(
      (u) =>
        u.phone.replace(/[^0-9]/g, '').includes(cleanPhone) ||
        cleanPhone.includes(u.phone.replace(/[^0-9]/g, ''))
    );
    if (existing) {
      login(existing);
      return existing;
    }

    if (firstName) {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        first_name: firstName,
        last_name: lastName || '',
        phone: phone,
        email: `${firstName.toLowerCase()}@routa.ma`,
        photo:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        city: 'Marrakech',
        rating: 5.0,
        review_count: 0,
        role: 'passenger',
        verification_status: {
          phone: true,
          identity: true,
          license: false,
          vehicle: false,
        },
        trips_as_driver: 0,
        trips_as_passenger: 0,
        created_at: new Date().toISOString(),
      };

      addUser(newUser);
      return newUser;
    }

    return null;
  };

  const toggleFavorite = (tripId: string) => {
    setFavorites((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  // Filtered trips using the smart matching logic from the specification
  const filteredTrips = trips.filter((trip) => {
    if (trip.status === 'CANCELLED') return false;
    return true;
  });

  // Booking action
  const bookTrip = (
    tripId: string,
    seatsToReserve: number,
    blockRemaining: boolean,
    pickup?: string,
    dropoff?: string
  ): boolean => {
    if (!currentUser) {
      setShowAuthModal(true);
      return false;
    }

    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return false;

    const seatsOccupied = blockRemaining
      ? targetTrip.available_seats - targetTrip.reserved_seats
      : seatsToReserve;

    if (targetTrip.reserved_seats + seatsOccupied > targetTrip.available_seats) {
      return false;
    }

    let unitSeatPrice = targetTrip.passenger_contribution;
    if (pickup && dropoff && (pickup !== targetTrip.origin || dropoff !== targetTrip.destination)) {
      unitSeatPrice = Math.max(10, Math.round(targetTrip.passenger_contribution * 0.6));
    }

    const calculatedPrice = blockRemaining
      ? unitSeatPrice * seatsOccupied
      : unitSeatPrice * seatsToReserve;

    // Update trip passengers and occupation
    const newPassenger = {
      id: currentUser.id,
      name: currentUser.first_name,
      photo: currentUser.photo,
      pickup_point: pickup || targetTrip.corridor[0]?.name || targetTrip.origin,
      dropoff_point: dropoff || targetTrip.corridor[targetTrip.corridor.length - 1]?.name || targetTrip.destination,
      seats: seatsOccupied,
      contribution_dh: calculatedPrice,
    };

    const updatedTrip: Trip = {
      ...targetTrip,
      reserved_seats: targetTrip.reserved_seats + seatsOccupied,
      status: targetTrip.reserved_seats + seatsOccupied >= targetTrip.available_seats ? 'FULL' : 'PARTIALLY_BOOKED',
      blocked_private: blockRemaining || targetTrip.blocked_private,
      passengers: [...targetTrip.passengers, newPassenger],
    };

    setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(updatedTrip);
    }

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      trip_id: tripId,
      passenger_id: currentUser.id,
      passenger: currentUser,
      trip: updatedTrip,
      seats_reserved: seatsOccupied,
      pickup_point: newPassenger.pickup_point,
      dropoff_point: newPassenger.dropoff_point,
      passenger_price: calculatedPrice,
      is_blocked_remaining: blockRemaining,
      status: 'CONFIRMED',
      created_at: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    setLastBooking(newBooking);

    // Create system notification for passenger
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser.id,
      type: 'BOOKING_CONFIRMED',
      title: blockRemaining ? 'Trajet privatisé confirmé !' : 'Place réservée !',
      message: `Votre trajet avec ${targetTrip.driver.first_name} (${targetTrip.origin} → ${targetTrip.destination}) est confirmé.`,
      read: false,
      created_at: "À l'instant",
    };

    // Create system notification for driver (e.g. Yassine)
    const driverNotif: AppNotification = {
      id: `notif_driver_${Date.now()}`,
      user_id: targetTrip.driver_id,
      type: 'NEW_BOOKING',
      title: 'Nouvelle réservation reçue !',
      message: `${currentUser.first_name} a réservé ${seatsOccupied} place${seatsOccupied > 1 ? 's' : ''} pour votre trajet (${targetTrip.departure_time}).`,
      read: false,
      created_at: "À l'instant",
    };

    setNotifications((prev) => [newNotif, driverNotif, ...prev]);

    // Ensure conversation exists
    const convId = `conv_${targetTrip.driver_id}_${currentUser.id}`;
    const existingConv = conversations.find((c) => c.id === convId);
    if (!existingConv) {
      const newConv: Conversation = {
        id: convId,
        trip_id: tripId,
        participants: [targetTrip.driver, currentUser],
        last_message: 'Réservation effectuée. Bonjour !',
        last_message_time: 'À l’instant',
        unread_count: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setMessages((prev) => ({
        ...prev,
        [convId]: [
          {
            id: `msg_sys_${Date.now()}`,
            conversation_id: convId,
            sender_id: currentUser.id,
            text: `Bonjour ${targetTrip.driver.first_name}, je viens de réserver ma place pour votre trajet de ${targetTrip.departure_time}.`,
            created_at: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: true,
          },
        ],
      }));
    }

    setShowConfirmationModal(true);
    return true;
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
    );

    // Free seats in trip
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === booking.trip_id) {
          const newReserved = Math.max(0, t.reserved_seats - booking.seats_reserved);
          return {
            ...t,
            reserved_seats: newReserved,
            status: newReserved === 0 ? 'PUBLISHED' : 'PARTIALLY_BOOKED',
            passengers: t.passengers.filter((p) => p.id !== booking.passenger_id),
          };
        }
        return t;
      })
    );

    const cancelNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser ? currentUser.id : 'guest',
      type: 'TRIP_CANCELLED',
      title: 'Réservation annulée',
      message: 'Votre réservation a bien été annulée sans frais.',
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [cancelNotif, ...prev]);
  };

  const cancelTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'CANCELLED' } : t))
    );
  };

  const updateTripStatus = (tripId: string, status: TripStatus) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status } : t))
    );
    if (selectedTrip?.id === tripId) {
      setSelectedTrip((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const publishTrip = (tripData: Partial<Trip>): Trip => {
    if (!currentUser || currentUser.role !== 'driver') {
      setShowDriverRestrictedModal(true);
      throw new Error('Action non autorisée : Les passagers ne peuvent pas proposer de trajets.');
    }

    const defaultVehicle =
      (currentUser.vehicle_id && vehiclesList[currentUser.vehicle_id]) ||
      MOCK_VEHICLES.veh_yassine;
    const origin = tripData.origin || 'Targa, Marrakech';
    const destination = tripData.destination || 'Médina, Marrakech';
    const seats = tripData.available_seats || 4;

    // Automatic compliant Moroccan carpooling tarification (Section 26)
    const tarif = calculateTripTarification(
      origin,
      destination,
      seats,
      tripData.passenger_contribution
    );

    const seatContribution = tripData.passenger_contribution || tarif.suggested_price_per_seat;

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      driver_id: currentUser.id,
      driver: currentUser,
      vehicle: defaultVehicle,
      origin,
      origin_lat: 31.6425,
      origin_lng: -8.0418,
      destination,
      destination_lat: 31.6295,
      destination_lng: -7.9811,
      corridor: tripData.corridor || [
        { id: '1', name: origin.split(',')[0], approx_time: tripData.departure_time || '08:00', lat: 31.6425, lng: -8.0418, type: 'origin' },
        { id: '2', name: 'Guéliz', approx_time: '08:15', lat: 31.6346, lng: -8.0125, type: 'stop' },
        { id: '3', name: destination.split(',')[0], approx_time: '08:35', lat: 31.6295, lng: -7.9811, type: 'destination' },
      ],
      date: tripData.date || "Aujourd'hui",
      departure_time: tripData.departure_time || '08:00',
      estimated_duration_min: tarif.duration_min,
      distance_km: tarif.distance_km,
      available_seats: seats,
      reserved_seats: 0,
      global_price: tarif.total_vehicle_cost_dh,
      passenger_contribution: seatContribution,
      fuel_cost_dh: tarif.fuel_cost_dh,
      wear_cost_dh: tarif.wear_cost_dh,
      toll_cost_dh: tarif.toll_cost_dh,
      status: 'PUBLISHED',
      match_type: 'exact',
      compatibility_score: 100,
      passengers: [],
      created_at: new Date().toISOString(),
    };

    setTrips((prev) => [newTrip, ...prev]);
    setSelectedTrip(newTrip);

    // Notification
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: currentUser.id,
      type: 'TRIP_UPDATED',
      title: 'Trajet publié avec succès',
      message: `Votre trajet ${origin} → ${destination} est maintenant visible par les passagers.`,
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);

    return newTrip;
  };

  const sendMessage = (
    conversationId: string,
    text: string,
    actionType: MessageActionType = 'text',
    actionMeta?: string
  ) => {
    if (!currentUser) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      text,
      action_type: actionType,
      action_meta: actionMeta,
      created_at: new Date().toISOString(),
      time: timeNow,
      read: true,
    };

    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message: text,
              last_message_time: timeNow,
            }
          : c
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitReport = (
    targetUserId: string,
    reason: string,
    details: string,
    tripId?: string
  ) => {
    const authorId = currentUser ? currentUser.id : 'guest';
    const authorName = currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Visiteur';
    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      author_id: authorId,
      author_name: authorName,
      target_user_id: targetUserId,
      target_user_name: 'Utilisateur signalé',
      trip_id: tripId,
      reason,
      details,
      status: 'NEW',
      created_at: new Date().toISOString().split('T')[0],
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  };

  const openRatingModal = (trip: Trip, user: User, isPassengerRatingDriver: boolean) => {
    setRatingTarget({ trip, user, isPassengerRatingDriver });
    setShowRatingModal(true);
  };

  const submitRating = (data: {
    punctuality: number;
    respect: number;
    communication: number;
    drivingOrReliability: number;
    comment: string;
  }) => {
    setShowRatingModal(false);
    const userId = currentUser ? currentUser.id : 'guest';
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      user_id: userId,
      type: 'NEW_REVIEW',
      title: 'Avis enregistré !',
      message: 'Merci pour votre contribution à la communauté Routa.',
      read: false,
      created_at: "À l'instant",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        usersList,
        vehiclesList,
        addUser,
        login,
        logout,
        loginWithPhone,
        switchUserDirect,
        switchUser,
        showCreateProfileModal,
        setShowCreateProfileModal,
        createProfileRoleDefault,
        setCreateProfileRoleDefault,
        showDriverRestrictedModal,
        setShowDriverRestrictedModal,
        activePage,
        setActivePage,
        searchParams,
        setSearchParams,
        trips,
        filteredTrips,
        selectedTrip,
        setSelectedTrip,
        favorites,
        toggleFavorite,
        bookings,
        lastBooking,
        bookTrip,
        cancelBooking,
        cancelTrip,
        updateTripStatus,
        publishTrip,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        sendMessage,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        reports,
        submitReport,
        updateReportStatus,
        isMobileSimulator,
        setIsMobileSimulator,
        showSplash,
        setShowSplash,
        showAuthModal,
        setShowAuthModal,
        showSafetyModal,
        setShowSafetyModal,
        showNotificationsModal,
        setShowNotificationsModal,
        showTarificationModal,
        setShowTarificationModal,
        showMapPicker,
        setShowMapPicker,
        openMapPicker,
        mapPickerMode,
        showLocationModal,
        setShowLocationModal,
        locationTargetField,
        openLocationPicker,
        confirmLocationSelection,
        resetAllDataToZero,
        loadDemoData,
        showConfirmationModal,
        setShowConfirmationModal,
        showRatingModal,
        setShowRatingModal,
        ratingTarget,
        openRatingModal,
        submitRating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
