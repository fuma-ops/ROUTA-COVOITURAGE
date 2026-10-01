/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeHero } from './components/HomeHero';
import { SearchResults } from './components/SearchResults';
import { TripDetail } from './components/TripDetail';
import { PublishTripModal } from './components/PublishTripModal';
import { ChatView } from './components/ChatView';
import { MyTripsView } from './components/MyTripsView';
import { ProfileView } from './components/ProfileView';
import { BackOfficeView } from './components/BackOfficeView';
import { SimulationEngineView } from './components/SimulationEngineView';
import { SafetyModal } from './components/SafetyModal';
import { RatingModal } from './components/RatingModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { SplashModal } from './components/SplashModal';
import { SponsoredBanner } from './components/SponsoredBanner';
import { NotificationsModal } from './components/NotificationsModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { TarificationModal } from './components/TarificationModal';
import { CreateProfileModal } from './components/CreateProfileModal';
import { DriverRestrictedModal } from './components/DriverRestrictedModal';
import { WelcomeGateway } from './components/WelcomeGateway';

const MainContent: React.FC = () => {
  const { activePage } = useApp();

  return (
    <main className="flex-1">
      {activePage === 'home' && (
        <>
          <HomeHero />
          <SponsoredBanner />
        </>
      )}

      {activePage === 'search' && (
        <>
          <SearchResults />
          <SponsoredBanner />
        </>
      )}

      {activePage === 'trip-detail' && <TripDetail />}

      {activePage === 'publish' && <PublishTripModal />}

      {activePage === 'messages' && <ChatView />}

      {activePage === 'my-trips' && <MyTripsView />}

      {activePage === 'profile' && <ProfileView />}

      {activePage === 'back-office' && <BackOfficeView />}

      {activePage === 'simulation' && <SimulationEngineView />}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const { currentUser, activePage } = useApp();

  // If user is disconnected, only display the Welcome / Onboarding Splash Gateway
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AuthModal />
        <CreateProfileModal />
        <WelcomeGateway />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* App Guide Modal (Accessible from Profile menu) */}
      <SplashModal />

      {/* Global Modals */}
      <AuthModal />
      <SafetyModal />
      <RatingModal />
      <BookingConfirmationModal />
      <NotificationsModal />
      <LocationPickerModal />
      <TarificationModal />
      <CreateProfileModal />
      <DriverRestrictedModal />

      <Navbar />
      <MainContent />
      {activePage !== 'messages' && <BottomNav />}

      {/* Clean Footer on desktop */}
      <footer className="hidden md:block bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#9E113E] text-base font-display">
              Routa
            </span>
            <span>— Covoiturage National au Maroc</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Marrakech · Casablanca · Rabat · Tanger · Agadir · Fès</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} Routa Maroc. Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}
