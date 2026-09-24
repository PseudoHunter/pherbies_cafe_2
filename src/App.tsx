/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Hero } from './components/Hero';
import { ImpactTracker } from './components/ImpactTracker';
import { CatGallery } from './components/CatGallery';
import { CatModal } from './components/CatModal';
import { MenuSection } from './components/MenuSection';
import { TnrSection } from './components/TnrSection';
import { ReservationSection } from './components/ReservationSection';
import { DonationModal } from './components/DonationModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { DEFAULT_APP_DATA, AppData, Cat, MenuItem, DonationPledge } from './data/defaultData';

const LOCAL_STORAGE_KEY = 'pherbies_cafe_data_v1';

function PherbiesApp() {
  // Central App Data State with LocalStorage persistence
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load stored data:', e);
    }
    return DEFAULT_APP_DATA;
  });

  // Modals & Interactive States
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [sponsoredCat, setSponsoredCat] = useState<Cat | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [preselectedItems, setPreselectedItems] = useState<{ item: MenuItem; quantity: number }[]>([]);

  const { showToast } = useToast();

  // Save to LocalStorage whenever appData changes
  const updateAppData = (updater: (prev: AppData) => AppData) => {
    setAppData((prev) => {
      const updated = updater(prev);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist to localStorage:', e);
      }
      return updated;
    });
  };

  const handleResetToDefaults = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_APP_DATA));
    } catch (e) {
      console.error(e);
    }
    setAppData(DEFAULT_APP_DATA);
  };

  // Donation Success Handler (updates progress bar & pledges in real time)
  const handleDonationSuccess = (pledge: DonationPledge, targetCategory: string) => {
    updateAppData((prev) => {
      const newRaised = prev.impact.currentRaised + pledge.amount;
      const breakdown = { ...prev.impact.breakdown };

      // Distribute amount to preferred category
      if (targetCategory === 'vetBills') {
        breakdown.vetBills += pledge.amount;
      } else if (targetCategory === 'catFood') {
        breakdown.catFood += pledge.amount;
      } else if (targetCategory === 'tofuLitter') {
        breakdown.tofuLitter += pledge.amount;
      } else if (targetCategory === 'vitamins') {
        breakdown.vitamins += pledge.amount;
      }

      return {
        ...prev,
        impact: {
          ...prev.impact,
          currentRaised: newRaised,
          breakdown,
        },
        recentDonations: [pledge, ...prev.recentDonations],
      };
    });
  };

  // Actions from Cat Cards
  const handleOpenCatDetail = (cat: Cat) => {
    setSelectedCat(cat);
  };

  const handleSponsorCat = (cat: Cat) => {
    setSponsoredCat(cat);
    setSelectedCat(null);
    setDonationModalOpen(true);
  };

  const handleAdoptInquiry = (cat: Cat) => {
    setSelectedCat(null);
    showToast(`Adoption form initiated for ${cat.name}! Check reservation section below.`, 'info');
    const el = document.getElementById('reservations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Actions from Menu Tray
  const handleReserveWithOrder = (items: { item: MenuItem; quantity: number }[]) => {
    setPreselectedItems(items);
    showToast(`Items attached to reservation! Complete your booking details below.`, 'success');
    const el = document.getElementById('reservations');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] text-[#2D3142] overflow-x-hidden">
      {/* 1. Direct Announcement Broadcast Banner */}
      <AnnouncementBanner announcement={appData.announcement} />

      {/* 2. Sticky Navbar */}
      <Navbar
        onOpenDonation={() => {
          setSponsoredCat(null);
          setDonationModalOpen(true);
        }}
        onOpenReservation={() => {
          const el = document.getElementById('reservations');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 3. Hero Section with Dual Mission Intro */}
        <Hero
          appData={appData}
          onOpenDonation={() => {
            setSponsoredCat(null);
            setDonationModalOpen(true);
          }}
          onOpenReservation={() => {
            const el = document.getElementById('reservations');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Live Impact Tracker (Donation Progress Bar & Breakdowns) */}
        <ImpactTracker
          appData={appData}
          onOpenDonation={() => {
            setSponsoredCat(null);
            setDonationModalOpen(true);
          }}
        />

        {/* 5. Resident Rescue Cats Gallery */}
        <CatGallery
          cats={appData.cats}
          onSelectCat={handleOpenCatDetail}
          onSponsorCat={handleSponsorCat}
        />

        {/* 6. Cafe Menu Section (Coffee, Pastries, Cat Treats) */}
        <MenuSection
          menuItems={appData.menu}
          onReserveWithOrder={handleReserveWithOrder}
        />

        {/* 7. Rescue Operations & Monthly TNR Log */}
        <TnrSection
          appData={appData}
          onOpenDonation={() => {
            setSponsoredCat(null);
            setDonationModalOpen(true);
          }}
        />

        {/* 8. Online Order / Reservation / Contact Form */}
        <ReservationSection
          preselectedItems={preselectedItems}
          onClearPreselected={() => setPreselectedItems([])}
        />
      </main>

      {/* 9. Footer with Hidden Admin Trigger */}
      <Footer
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenDonation={() => {
          setSponsoredCat(null);
          setDonationModalOpen(true);
        }}
        onOpenReservation={() => {
          const el = document.getElementById('reservations');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      {/* Cat Details Modal */}
      <CatModal
        cat={selectedCat}
        onClose={() => setSelectedCat(null)}
        onSponsor={handleSponsorCat}
        onAdoptInquiry={handleAdoptInquiry}
      />

      {/* Direct Donation & Support Modal */}
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
        sponsoredCat={sponsoredCat}
        appData={appData}
        onDonationSuccess={handleDonationSuccess}
      />

      {/* Dynamic Hidden Admin Portal */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        appData={appData}
        onUpdateAppData={updateAppData}
        onResetToDefaults={handleResetToDefaults}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PherbiesApp />
    </ToastProvider>
  );
}
