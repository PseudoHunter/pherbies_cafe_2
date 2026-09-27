/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_DATA,
  AppState,
  CatItem,
  MenuItem,
  MissionItem,
  OrderItem,
  DonationItem,
} from './data/defaultData';
import {
  subscribeToCafeState,
  saveCafeStateToFirestore,
} from './firebase';
import { ImageUploader } from './components/ImageUploader';

const STORAGE_KEY = 'pherbies_cafe_state';

// Quick Preset Images for effortless admin editing
const CAT_IMAGE_PRESETS = [
  { label: 'Orange Tabby', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' },
  { label: 'Calico Cat', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80' },
  { label: 'Black Cat', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80' },
  { label: 'Kitten', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80' },
  { label: 'Fluffy White', url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Grey Shorthair', url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80' },
];

const MENU_IMAGE_PRESETS = [
  { label: 'Latte Art', url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80' },
  { label: 'Matcha Cloud', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80' },
  { label: 'Sourdough Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=500&q=80' },
  { label: 'Croissant / Pastry', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80' },
  { label: 'Cat Treat Feast', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=500&q=80' },
];

const TNR_IMAGE_PRESETS = [
  { label: 'Rescue Drive', url: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Vet Clinic', url: 'https://images.unsplash.com/photo-1628009368231-7bb3cfc38291?auto=format&fit=crop&w=600&q=80' },
  { label: 'Community Colony', url: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=600&q=80' },
];

export default function App() {
  // Application State initialized from localStorage or defaults
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading localStorage:', e);
    }
    return DEFAULT_DATA;
  });

  // Cloud Sync Status: 'connecting' | 'synced' | 'saving' | 'error'
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'saving' | 'error'>('connecting');
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Cart State
  const [cart, setCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Filter for Menu
  const [menuFilter, setMenuFilter] = useState<string>('All');

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin Modal State
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'target' | 'cats' | 'menu' | 'missions' | 'orders'>('target');

  // Clever Secret Admin Access Trigger (Triple-click within 1.2s)
  const secretClickCount = React.useRef(0);
  const secretClickTimer = React.useRef<any>(null);

  const handleSecretTrigger = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (secretClickTimer.current) {
      clearTimeout(secretClickTimer.current);
    }
    secretClickCount.current += 1;
    if (secretClickCount.current >= 3) {
      secretClickCount.current = 0;
      setAdminOpen(true);
      setAdminLoginError(false);
      showToast('🐾 Staff Portal Unlocked');
    } else {
      secretClickTimer.current = setTimeout(() => {
        secretClickCount.current = 0;
      }, 1200);
    }
  };

  // Admin section sub-filters & manual entries
  const [orderFilter, setOrderFilter] = useState<'all' | 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled'>('all');
  const [activeLogSubTab, setActiveLogSubTab] = useState<'orders' | 'donations'>('orders');
  const [manualDonorName, setManualDonorName] = useState('');
  const [manualDonorAmount, setManualDonorAmount] = useState<number>(50);
  const [manualDonorNote, setManualDonorNote] = useState('Direct Bank Transfer');

  // Donation Form State
  const [customAmount, setCustomAmount] = useState<number | string>(50);
  const [donorName, setDonorName] = useState('');
  const [donorNote, setDonorNote] = useState('');

  // Checkout Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderType, setOrderType] = useState('Dine-in at Cafe');

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Synchronize state changes to localStorage and Cloud Firestore
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      setSyncStatus('saving');
      saveCafeStateToFirestore(next)
        .then(() => {
          setSyncStatus('synced');
        })
        .catch((err) => {
          console.error('Failed to sync to Firestore:', err);
          setSyncStatus('error');
        });
      return next;
    });
  };

  // Real-time Firestore synchronization: listening for changes across all devices/servers
  useEffect(() => {
    const unsubscribe = subscribeToCafeState(
      (remoteState) => {
        setAppState(remoteState);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteState));
        } catch (e) {
          console.error('Error writing to localStorage cache:', e);
        }
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Real-time connection notice:', err);
        setSyncStatus('error');
      }
    );

    // Cross-tab storage change listener as immediate local fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setAppState(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A or Ctrl+Shift+P) & #admin hash trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setAdminOpen(true);
        setAdminLoginError(false);
        showToast('🐾 Staff Portal Access');
      }
    };

    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setAdminOpen(true);
        setAdminLoginError(false);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    checkHash();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkHash);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  // Explicit Save to Cloud handler for admin buttons
  const handleForceSave = async () => {
    setIsSavingSection(true);
    setSyncStatus('saving');
    try {
      await saveCafeStateToFirestore(appState);
      setSyncStatus('synced');
      showToast('✅ Saved & live across all devices and servers!');
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      showToast('⚠️ Could not sync changes to Cloud. Retrying automatically...');
    } finally {
      setIsSavingSection(false);
    }
  };

  // Cart Functions
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { item, qty: 1 }];
    });
    setCartOpen(true);
    showToast(`Added "${item.title}" to cart! 🐾`);
  };

  const changeCartQty = (id: number | string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === id) {
            return { ...c, qty: c.qty + delta };
          }
          return c;
        })
        .filter((c) => c.qty > 0);
    });
  };

  const totalCartQty = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartSubtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  // Submit Pre-Order
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Please add items to your cart first!');
      return;
    }
    if (!orderName.trim() || !orderPhone.trim()) {
      showToast('Please enter your name and phone number.');
      return;
    }

    const newOrder: OrderItem = {
      id: Date.now(),
      name: orderName,
      phone: orderPhone,
      type: orderType,
      items: cart.map((c) => ({
        id: c.item.id,
        title: c.item.title,
        price: c.item.price,
        qty: c.qty,
      })),
      subtotal: cartSubtotal,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 50% of profit goes toward cat rescue fund
    const profitContribution = Math.round(cartSubtotal * 0.5);

    updateState((prev) => ({
      ...prev,
      fund: {
        ...prev.fund,
        raised: prev.fund.raised + profitContribution,
      },
      orders: [newOrder, ...(prev.orders || [])],
    }));

    setCart([]);
    setCartOpen(false);
    setOrderName('');
    setOrderPhone('');
    showToast(
      `🎉 Thank you ${newOrder.name}! Order confirmed (RM ${cartSubtotal.toFixed(2)}). RM ${profitContribution} contributed to our Live Rescue Fund!`
    );
  };

  // Submit Direct Donation
  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid donation amount.');
      return;
    }
    const donor = donorName.trim() || 'Anonymous Guardian';
    const note = donorNote.trim() || 'General Rescue Care';

    const newDonation: DonationItem = {
      id: Date.now(),
      donor,
      amount,
      note,
      timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    updateState((prev) => ({
      ...prev,
      fund: {
        ...prev.fund,
        raised: prev.fund.raised + amount,
      },
      donations: [newDonation, ...(prev.donations || [])],
    }));

    setDonorName('');
    setDonorNote('');
    showToast(`❤️ Thank you ${donor}! Your RM ${amount} pledge was added to the live tracker!`);
  };

  const sponsorCat = (catName: string) => {
    setDonorNote(`Sponsorship for ${catName} 🐾`);
    setCustomAmount(50);
    const donateSection = document.getElementById('donate');
    if (donateSection) {
      donateSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Prepared RM50 sponsorship pledge for ${catName}! Complete below.`);
  };

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser === 'pherbiescute' && adminPass === 'pherbiescafecutie') {
      setIsAdminLoggedIn(true);
      setAdminLoginError(false);
      showToast('Staff authenticated! Welcome to Pherbies Admin Portal.');
    } else {
      setAdminLoginError(true);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all data back to original defaults?')) {
      localStorage.removeItem(STORAGE_KEY);
      setAppState(DEFAULT_DATA);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      } catch (err) {
        console.error(err);
      }
      showToast('Data reset to defaults successfully.');
    }
  };

  // Derived Fund percentage
  const targetAmount = appState.fund.target || 3500;
  const raisedAmount = appState.fund.raised || 0;
  const fundPercent = Math.min(Math.round((raisedAmount / targetAmount) * 100), 100);

  // Filtered Menu Items
  const filteredMenu =
    menuFilter === 'All'
      ? appState.menu
      : appState.menu.filter((item) => item.category === menuFilter);

  return (
    <div className="min-h-screen flex flex-col justify-between antialiased selection:bg-[#FF8A8A] selection:text-white bg-[#FFFBF5] text-[#3E2723]">
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#3E2723] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-900/20 text-xs sm:text-sm animate-bounce">
          <span className="text-xl">🐾</span>
          <span>{toastMsg}</span>
          <button
            onClick={() => setToastMsg(null)}
            className="text-white/60 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#FFFBF5]/90 backdrop-blur-md border-b border-amber-900/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo with Secret 3-Click Admin Trigger */}
          <div
            onClick={handleSecretTrigger}
            className="flex items-center gap-2 group cursor-pointer select-none"
            title="Pherbies Cafe"
          >
            <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 inline-block">
              🐾
            </span>
            <div>
              <span className="heading-font text-2xl font-bold text-[#3E2723] tracking-wide block leading-none">
                Pherbies Cafe
              </span>
              <span className="text-[11px] font-medium text-[#E56B6B] tracking-wider uppercase">
                Rescue • TNR • Coffee
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-[#3E2723]/80">
            <a href="#hero" className="hover:text-[#E56B6B] transition-colors">Home</a>
            <a href="#cats" className="hover:text-[#E56B6B] transition-colors">Our Resident Cats</a>
            <a href="#menu" className="hover:text-[#E56B6B] transition-colors">Menu & Pre-Order</a>
            <a href="#mission" className="hover:text-[#E56B6B] transition-colors">TNR & Rescue</a>
            <a href="#donate" className="hover:text-[#E56B6B] transition-colors">Donations</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#donate"
              className="bg-[#FF8A8A] hover:bg-[#E56B6B] text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-brand-pink/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              <i className="fa-solid fa-heart"></i> Support Us
            </a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 bg-[#FFFBF5] border border-[#3E2723]/15 rounded-full hover:bg-amber-100/50 transition-colors cursor-pointer"
              title="View Cart"
            >
              <i className="fa-solid fa-utensils text-[#3E2723]"></i>
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF8A8A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Navigation Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 bg-[#FFFBF5] border border-[#3E2723]/15 rounded-full"
            >
              <i className="fa-solid fa-utensils text-[#3E2723] text-sm"></i>
              {totalCartQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF8A8A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartQty}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3E2723] focus:outline-hidden"
              aria-label="Toggle menu"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFBF5] border-b border-amber-900/10 px-4 pt-2 pb-6 space-y-3">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#3E2723] font-medium border-b border-amber-900/5"
            >
              Home
            </a>
            <a
              href="#cats"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#3E2723] font-medium border-b border-amber-900/5"
            >
              Our Resident Cats
            </a>
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#3E2723] font-medium border-b border-amber-900/5"
            >
              Menu & Pre-Order
            </a>
            <a
              href="#mission"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#3E2723] font-medium border-b border-amber-900/5"
            >
              TNR & Rescue
            </a>
            <a
              href="#donate"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#3E2723] font-medium border-b border-amber-900/5"
            >
              Donations
            </a>
            <a
              href="#donate"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#FF8A8A] text-white py-2.5 rounded-full font-semibold shadow-md"
            >
              Support Rescue Mission
            </a>
          </div>
        )}
      </header>

      <main className="grow">
        {/* HERO SECTION */}
        <section id="hero" className="relative overflow-hidden py-12 md:py-20 lg:py-24 bg-gradient-to-b from-amber-50/50 to-[#FFFBF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1F8E9] text-[#689F38] text-xs font-bold uppercase tracking-wider border border-[#689F38]/20">
                  <i className="fa-solid fa-shield-cat"></i> Rescue Mission Turned Cafe
                </div>
                
                <h1 className="heading-font text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3E2723] leading-tight">
                  Sip Artisanal Coffee. <br className="hidden sm:inline" />
                  <span className="text-[#E56B6B] underline decoration-wavy decoration-[#FF8A8A]/40">
                    Save Stray Lives.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-[#3E2723]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  100% of our sales profit goes directly to funding vet bills, cat food (&quot;makanan&quot;), tofu litter, and vitamins for our {appState.cats.length} resident rescues and neighborhood Trap-Neuter-Return (TNR) operations.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <a
                    href="#menu"
                    className="w-full sm:w-auto text-center bg-[#3E2723] hover:bg-black text-white px-8 py-3.5 rounded-full font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-mug-hot"></i> Explore Menu & Order
                  </a>
                  <a
                    href="#donate"
                    className="w-full sm:w-auto text-center bg-[#FF8A8A] hover:bg-[#E56B6B] text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-brand-pink/20 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-hand-holding-heart"></i> Support Rescue Mission
                  </a>
                </div>

                {/* Key Stats Bar */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-900/10">
                  <div className="p-3 bg-white/60 backdrop-blur-xs rounded-2xl border border-amber-900/5 text-center">
                    <span className="heading-font text-2xl sm:text-3xl font-bold text-[#3E2723] block">
                      {appState.cats.length}
                    </span>
                    <span className="text-xs text-[#3E2723]/70 font-medium">Resident Cats</span>
                  </div>
                  <div className="p-3 bg-white/60 backdrop-blur-xs rounded-2xl border border-amber-900/5 text-center">
                    <span className="heading-font text-2xl sm:text-3xl font-bold text-[#E56B6B] block">
                      RM {(targetAmount / 1000).toFixed(1)}k
                    </span>
                    <span className="text-xs text-[#3E2723]/70 font-medium">Monthly Needs</span>
                  </div>
                  <div className="p-3 bg-white/60 backdrop-blur-xs rounded-2xl border border-amber-900/5 text-center">
                    <span className="heading-font text-2xl sm:text-3xl font-bold text-[#689F38] block">
                      Monthly
                    </span>
                    <span className="text-xs text-[#3E2723]/70 font-medium">TNR Drives</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual & Live Counter Banner */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Main Hero Card */}
                  <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-amber-900/10 rotate-1 transition-transform hover:rotate-0 duration-300">
                    <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-amber-100">
                      <img
                        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80"
                        alt="Pherbies rescued cat"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-amber-900/10 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-[#3E2723]/60 block font-semibold uppercase">
                            Featured Rescue
                          </span>
                          <span className="heading-font font-bold text-[#3E2723] text-base">
                            Oyen - Chief Comfort Officer 🐱
                          </span>
                        </div>
                        <a
                          href="#cats"
                          className="text-xs bg-[#FF8A8A]/10 text-[#E56B6B] px-2.5 py-1 rounded-full font-bold hover:bg-[#FF8A8A] hover:text-white transition-colors"
                        >
                          Meet All
                        </a>
                      </div>
                    </div>

                    {/* Embedded Live Rescue Tracker Widget */}
                    <div className="mt-4 p-4 bg-[#FFF8F0] rounded-2xl border border-amber-900/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3E2723]/70 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Monthly Rescue Fund
                        </span>
                        <span className="text-xs font-extrabold text-[#E56B6B]">{fundPercent}%</span>
                      </div>
                      <div className="w-full bg-amber-200/60 h-3 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-[#FF8A8A] to-[#F59E0B] h-full rounded-full transition-all duration-700"
                          style={{ width: `${fundPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs font-bold text-[#3E2723]">
                        <span>
                          Raised: <span className="text-[#689F38]">RM {raisedAmount.toLocaleString()}</span>
                        </span>
                        <span>
                          Target: <span>RM {targetAmount.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* RESIDENT CATS SECTION */}
        <section id="cats" className="py-16 bg-white border-y border-amber-900/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#E56B6B] font-bold text-xs uppercase tracking-widest block mb-1">
                Meet The Family
              </span>
              <h2 className="heading-font text-3xl sm:text-4xl font-bold text-[#3E2723]">
                Our {appState.cats.length} Rescued Ambassadors 🐾
              </h2>
              <p className="text-[#3E2723]/70 mt-2 text-sm sm:text-base">
                Each resident has a story of survival. Stop by the cafe to share a quiet coffee or cuddle with them!
              </p>
            </div>

            {/* Cats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {appState.cats.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-amber-900/10 overflow-hidden shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="h-56 overflow-hidden relative">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#3E2723] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-amber-900/10">
                        {cat.age}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="heading-font text-xl font-bold text-[#3E2723]">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] bg-[#FF8A8A]/10 text-[#E56B6B] px-2 py-0.5 rounded-md font-bold uppercase">
                          {cat.personality}
                        </span>
                      </div>
                      <p className="text-xs text-[#3E2723]/70 leading-relaxed">
                        {cat.backstory}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => sponsorCat(cat.name)}
                      className="w-full bg-[#FFFBF5] hover:bg-amber-100 text-[#3E2723] border border-amber-900/15 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-heart text-[#E56B6B]"></i> Sponsor {cat.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MENU & ORDERING SECTION */}
        <section id="menu" className="py-16 bg-[#FFFBF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-[#689F38] font-bold text-xs uppercase tracking-widest block mb-1">
                Nourish Yourself & The Kitties
              </span>
              <h2 className="heading-font text-3xl sm:text-4xl font-bold text-[#3E2723]">
                Cafe Menu & Pre-Orders ☕ Pastries
              </h2>
              <p className="text-[#3E2723]/70 mt-2 text-sm">
                Order for pickup or dine-in. 100% of profits go straight to cat food, vitamins & vet bills.
              </p>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {(['All', 'Coffee & Beverages', 'Hot Mains', 'Pastries & Treats'] as const).map((catName) => {
                  const isActive = menuFilter === catName;
                  return (
                    <button
                      key={catName}
                      onClick={() => setMenuFilter(catName)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#3E2723] text-white shadow-sm'
                          : 'bg-white text-[#3E2723] hover:bg-amber-100/50 border border-amber-900/10'
                      }`}
                    >
                      {catName === 'All' ? 'All Items' : catName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-3xl border border-amber-900/10 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 rounded-2xl object-cover shrink-0"
                  />
                  <div className="grow space-y-1">
                    <span className="text-[10px] text-[#689F38] font-bold uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#3E2723] leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#3E2723]/60 line-clamp-2">
                      {item.desc}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-sm text-[#3E2723]">
                        RM {item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-[#FF8A8A] hover:bg-[#E56B6B] text-white px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TNR & RESCUE MISSIONS SECTION */}
        <section id="mission" className="py-16 bg-white border-y border-amber-900/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-[#E56B6B] font-bold text-xs uppercase tracking-widest block mb-1">
                Community Impact
              </span>
              <h2 className="heading-font text-3xl sm:text-4xl font-bold text-[#3E2723]">
                TNR & Rescue Missions 🩺
              </h2>
              <p className="text-[#3E2723]/70 mt-2 text-sm">
                We conduct monthly Trap-Neuter-Return (TNR) operations around the neighborhood to humanely control stray populations.
              </p>
            </div>

            {/* Mission Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {appState.missions.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#FFF8F0] p-5 rounded-3xl border border-amber-900/10 space-y-3"
                >
                  <div className="h-40 rounded-2xl overflow-hidden relative">
                    <img
                      src={m.image}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-[#3E2723] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {m.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#3E2723]/60 font-bold uppercase">
                      {m.date}
                    </span>
                    <h4 className="font-bold text-base text-[#3E2723] leading-tight">
                      {m.title}
                    </h4>
                    <p className="text-xs text-[#3E2723]/70 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DONATION & FUNDRAISING SECTION */}
        <section id="donate" className="py-16 bg-gradient-to-br from-amber-100/40 via-[#FFFBF5] to-amber-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Donation Info & Breakdown */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[#E56B6B] font-bold text-xs uppercase tracking-widest block">
                  Direct Aid
                </span>
                <h2 className="heading-font text-3xl sm:text-4xl font-bold text-[#3E2723]">
                  Where Your Donation Goes 🏥
                </h2>
                <p className="text-[#3E2723]/80 leading-relaxed text-sm sm:text-base">
                  It costs between <strong className="text-[#3E2723]">RM 3,000 to RM 3,500 monthly</strong> to keep our 8 rescues healthy and execute neighborhood TNR programs. Here is our exact monthly cost breakdown:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        <i className="fa-solid fa-user-doctor"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#3E2723]">
                          Vet Bills & Emergency Medical
                        </h4>
                        <span className="text-xs text-[#3E2723]/60">
                          Vaccinations, spaying, injuries
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#3E2723]">~ RM 1,500</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <i className="fa-solid fa-bowl-food"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#3E2723]">
                          Cat Food (&quot;Makanan&quot;) & Kibble
                        </h4>
                        <span className="text-xs text-[#3E2723]/60">
                          Premium kibble + wet food tins
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#3E2723]">~ RM 1,000</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <i className="fa-solid fa-box-open"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#3E2723]">
                          Tofu Litter & Vitamins
                        </h4>
                        <span className="text-xs text-[#3E2723]/60">
                          Eco tofu litter, supplements, deworming
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#3E2723]">~ RM 1,000</span>
                  </div>
                </div>
              </div>

              {/* Donation Form & DuitNow Box */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-xl">
                <h3 className="heading-font text-2xl font-bold text-[#3E2723] mb-1">
                  Make a Direct Contribution
                </h3>
                <p className="text-xs text-[#3E2723]/70 mb-6">
                  Instantly updates our monthly live tracker for all visitors.
                </p>

                <form onSubmit={handleDonationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[#3E2723]/80 mb-2">
                      Select Donation Amount
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[20, 50, 100, 200].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setCustomAmount(amt)}
                          className={`py-2 border rounded-xl text-sm font-bold transition-all cursor-pointer ${
                            Number(customAmount) === amt
                              ? 'border-[#FF8A8A] bg-[#FF8A8A]/10 text-[#E56B6B]'
                              : 'border-amber-900/15 hover:border-[#FF8A8A] hover:text-[#E56B6B]'
                          }`}
                        >
                          RM{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[#3E2723]/80 mb-1">
                      Custom Amount (RM)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 75"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-amber-900/15 focus:outline-hidden focus:ring-2 focus:ring-[#FF8A8A] text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#3E2723]/80 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        placeholder="Aina / Kind Supporter"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-900/15 focus:outline-hidden focus:ring-2 focus:ring-[#FF8A8A] text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-[#3E2723]/80 mb-1">
                        Note / Message
                      </label>
                      <input
                        type="text"
                        placeholder="For Oyen's treats! 🐾"
                        value={donorNote}
                        onChange={(e) => setDonorNote(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-900/15 focus:outline-hidden focus:ring-2 focus:ring-[#FF8A8A] text-sm"
                      />
                    </div>
                  </div>

                  {/* DuitNow QR Placeholder Box */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-900/10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl border border-amber-900/10 shrink-0 flex items-center justify-center">
                      <i className="fa-solid fa-qrcode text-3xl text-[#3E2723]"></i>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-[#3E2723] block">
                        Bank Transfer / DuitNow QR
                      </span>
                      <span className="text-[#3E2723]/70 block">
                        Pherbies Rescue Cafe Enterprise
                      </span>
                      <span className="font-mono text-[#E56B6B] font-bold block mt-0.5">
                        Maybank: 5123 4567 8901
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF8A8A] hover:bg-[#E56B6B] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-pink/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Record & Submit Donation
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER WITH HIDDEN ADMIN ACCESS TRIGGER */}
      <footer className="bg-[#3E2723] text-amber-100/80 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <span className="heading-font text-2xl font-bold text-white tracking-wide">
                  Pherbies Cafe
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm text-amber-100/70">
                A small independent cat rescue turned cafe operation in Malaysia. Every meal ordered or donation made supports {appState.cats.length} resident kitties and neighborhood Trap-Neuter-Return drives.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.threads.net/@pherbiescafe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full text-white hover:bg-[#FF8A8A] transition-colors text-xs flex items-center gap-1.5"
                >
                  <i className="fa-brands fa-threads"></i> Threads (@pherbiescafe)
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/10 rounded-full text-white hover:bg-[#FF8A8A] transition-colors text-xs flex items-center gap-1.5"
                >
                  <i className="fa-brands fa-instagram"></i> Instagram
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#cats" className="hover:text-white transition-colors">Our Resident Cats</a></li>
                <li><a href="#menu" className="hover:text-white transition-colors">Menu Pre-Ordering</a></li>
                <li><a href="#mission" className="hover:text-white transition-colors">TNR & Vet Updates</a></li>
                <li><a href="#donate" className="hover:text-white transition-colors">Direct Support Fund</a></li>
              </ul>
            </div>

            {/* Col 3: Hours & Location */}
            <div>
              <h4 className="font-bold text-white text-sm mb-3 uppercase tracking-wider">
                Visit Us
              </h4>
              <p className="text-xs text-amber-100/70 mb-1">📍 Petaling Jaya / KL, Malaysia</p>
              <p className="text-xs text-amber-100/70 mb-1">⏰ Tue - Sun: 11:00 AM - 9:00 PM</p>
              <p className="text-xs text-amber-100/70">Monday: Rest Day (TNR Clinic Day)</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-amber-100/50 gap-4">
            <p>
              © {new Date().getFullYear()} Pherbies Cafe. Built with{' '}
              <span
                onClick={handleSecretTrigger}
                className="cursor-pointer select-none inline-block hover:scale-125 transition-transform"
                title="Pherbies Rescue"
              >
                ❤️
              </span>{' '}
              for stray cats in Malaysia.
            </p>
            
            {/* Real-time Cloud Status */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-amber-100/60 font-medium">
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                {syncStatus === 'synced' ? 'Cloud Synced' : 'Syncing...'}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* CART / PRE-ORDER MODAL DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end transition-opacity">
          <div className="w-full max-w-md bg-[#FFFBF5] h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-amber-900/10">
                <h3 className="heading-font text-xl font-bold text-[#3E2723] flex items-center gap-2">
                  <i className="fa-solid fa-basket-shopping text-[#E56B6B]"></i> Your Pre-Order Cart
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-[#3E2723]/60 hover:text-[#3E2723] p-1 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="py-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-center text-xs text-[#3E2723]/60 py-8">
                    Your cart is empty. Add some tasty items! 🐾
                  </p>
                ) : (
                  cart.map(({ item, qty }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white rounded-2xl border border-amber-900/10"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-[#3E2723]">{item.title}</h5>
                        <span className="text-[11px] text-[#3E2723]/60">
                          RM {item.price.toFixed(2)} each
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeCartQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-amber-100 text-[#3E2723] font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => changeCartQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-amber-100 text-[#3E2723] font-bold text-xs flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-amber-900/10 pt-4 space-y-3">
              <div className="flex justify-between font-bold text-[#3E2723] text-base">
                <span>Subtotal:</span>
                <span>RM {cartSubtotal.toFixed(2)}</span>
              </div>

              <form onSubmit={handleOrderSubmit} className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-900/15"
                  required
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-900/15"
                  required
                />
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-900/15"
                >
                  <option value="Dine-in at Cafe">Dine-in at Cafe</option>
                  <option value="Self-Pickup Takeaway">Self-Pickup Takeaway</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#3E2723] hover:bg-black text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Confirm & Send Pre-Order
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN & DASHBOARD MODAL */}
      {adminOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          {!isAdminLoggedIn ? (
            /* Step 1: Login Box */
            <div className="bg-white max-w-sm w-full p-6 sm:p-8 rounded-3xl border border-amber-900/10 shadow-2xl space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-amber-100 text-[#3E2723] rounded-2xl mx-auto flex items-center justify-center text-xl font-bold">
                  🔑
                </div>
                <h3 className="heading-font text-2xl font-bold text-[#3E2723]">
                  Pherbies Staff Access
                </h3>
                <p className="text-xs text-[#3E2723]/60">
                  Authorized personnel login to modify live website content.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#3E2723]/70 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Enter staff username"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-900/15 focus:outline-hidden focus:ring-2 focus:ring-[#FF8A8A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#3E2723]/70 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Enter staff password"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-amber-900/15 focus:outline-hidden focus:ring-2 focus:ring-[#FF8A8A]"
                    required
                  />
                </div>

                {adminLoginError && (
                  <div className="text-xs text-red-500 font-bold text-center py-1">
                    Invalid username or password.
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdminOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-amber-900/15 text-xs font-bold text-[#3E2723] hover:bg-amber-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-[#3E2723] text-white text-xs font-bold hover:bg-black shadow-md cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Step 2: Full Admin Management Dashboard for all 5 Sections */
            <div className="bg-[#FFFBF5] max-w-5xl w-full max-h-[92vh] rounded-3xl border border-amber-900/10 shadow-2xl flex flex-col overflow-hidden">
              {/* Topbar with Real-Time Cloud Status */}
              <div className="bg-[#3E2723] text-white px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E56B6B]/20 border border-[#E56B6B]/40 flex items-center justify-center text-xl">
                    🐾
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="heading-font font-bold text-lg sm:text-xl leading-tight">
                        Pherbies Cafe Admin Portal
                      </h3>
                      {syncStatus === 'synced' && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Live Cloud Synced
                        </span>
                      )}
                      {syncStatus === 'saving' && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-spin"></span>
                          Syncing...
                        </span>
                      )}
                      {syncStatus === 'error' && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          ⚠️ Cloud Offline
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-200/80 font-medium">
                      Multi-Device Shared Database • Edits appear live on all visitors' screens
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleForceSave}
                    disabled={isSavingSection}
                    className="text-xs bg-[#FF8A8A] hover:bg-[#E56B6B] text-white px-3.5 py-2 rounded-xl font-bold shadow-md shadow-brand-pink/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Force broadcast current data to all devices"
                  >
                    <i className={`fa-solid ${isSavingSection ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                    <span>{isSavingSection ? 'Saving...' : 'Save & Broadcast'}</span>
                  </button>
                  <button
                    onClick={handleResetToDefaults}
                    className="text-xs bg-white/10 hover:bg-white/20 text-amber-100 px-3 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
                    title="Reset to initial default demo data"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => setAdminOpen(false)}
                    className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close Admin Modal"
                  >
                    <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs - 5 Sections */}
              <div className="bg-amber-100/60 border-b border-amber-900/10 px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto shrink-0 py-1">
                {[
                  { id: 'target', label: '1. Fund Goal', icon: 'fa-bullseye', count: `RM ${appState.fund.raised}` },
                  { id: 'cats', label: '2. Cat Profiles', icon: 'fa-cat', count: appState.cats.length },
                  { id: 'menu', label: '3. Menu Items', icon: 'fa-mug-hot', count: appState.menu.length },
                  { id: 'missions', label: '4. TNR Updates', icon: 'fa-notes-medical', count: appState.missions.length },
                  { id: 'orders', label: '5. Orders & Logs', icon: 'fa-receipt', count: (appState.orders?.length || 0) + (appState.donations?.length || 0) },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`py-2.5 px-3.5 text-xs font-bold rounded-xl cursor-pointer transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeAdminTab === tab.id
                        ? 'bg-white text-[#E56B6B] shadow-xs border border-amber-900/10'
                        : 'text-[#3E2723]/70 hover:text-[#3E2723] hover:bg-white/50'
                    }`}
                  >
                    <i className={`fa-solid ${tab.icon} ${activeAdminTab === tab.id ? 'text-[#E56B6B]' : 'text-[#3E2723]/50'}`}></i>
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      activeAdminTab === tab.id ? 'bg-[#FF8A8A]/15 text-[#E56B6B]' : 'bg-[#3E2723]/10 text-[#3E2723]/70'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Content Panel for 5 Sections */}
              <div className="p-4 sm:p-6 overflow-y-auto grow space-y-6">

                {/* ========================================================= */}
                {/* SECTION 1: Fund Goal                                     */}
                {/* ========================================================= */}
                {activeAdminTab === 'target' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-900/10 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[#3E2723] flex items-center gap-2">
                          <i className="fa-solid fa-bullseye text-[#E56B6B]"></i> Monthly Rescue Fund Goal & Live Tracker
                        </h4>
                        <p className="text-xs text-[#3E2723]/60">
                          Updates the live thermometer, breakdown meters, and percentage on all visitors' devices in real-time.
                        </p>
                      </div>
                      <button
                        onClick={handleForceSave}
                        className="bg-[#689F38] hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <i className="fa-solid fa-check"></i> Save Fund Goal
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-2xl border border-amber-900/10 space-y-2">
                        <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wider">
                          Monthly Goal Target (RM)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#3E2723]/50">RM</span>
                          <input
                            type="number"
                            min="100"
                            step="50"
                            value={appState.fund.target}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              updateState((prev) => ({
                                ...prev,
                                fund: { ...prev.fund, target: val },
                              }));
                            }}
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-amber-900/15 text-sm bg-[#FFFBF5] font-bold text-[#3E2723]"
                          />
                        </div>
                        <p className="text-[11px] text-[#3E2723]/60">
                          Recommended benchmark: RM 3,000 – RM 3,500 covers 8 cats & monthly TNR drives.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-amber-900/10 space-y-2">
                        <label className="block text-xs font-bold text-[#3E2723] uppercase tracking-wider">
                          Current Collected / Raised Amount (RM)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#3E2723]/50">RM</span>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={appState.fund.raised}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              updateState((prev) => ({
                                ...prev,
                                fund: { ...prev.fund, raised: val },
                              }));
                            }}
                            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-amber-900/15 text-sm bg-[#FFFBF5] font-bold text-[#E56B6B]"
                          />
                        </div>
                        <p className="text-[11px] text-[#3E2723]/60">
                          Auto-increments whenever a customer pre-orders (50% profit) or donates online!
                        </p>
                      </div>
                    </div>

                    {/* Live Progress Preview */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-900/10 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#3E2723]">Live Progress Preview</span>
                        <span className="text-[#E56B6B]">{fundPercent}% Achieved (RM {appState.fund.raised} / RM {appState.fund.target})</span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-3.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#FF8A8A] to-[#E56B6B] h-full rounded-full transition-all duration-500"
                          style={{ width: `${fundPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#3E2723]/60">
                        <span>Remaining needed this month: RM {Math.max(0, appState.fund.target - appState.fund.raised)}</span>
                        <span>Status: {fundPercent >= 100 ? '🎉 Monthly Goal Met!' : 'Active Rescue Campaign'}</span>
                      </div>
                    </div>

                    {/* Breakdown Budget Distribution */}
                    <div className="bg-white p-5 rounded-2xl border border-amber-900/10 space-y-3">
                      <h5 className="font-bold text-xs text-[#3E2723] uppercase tracking-wider">
                        Monthly Expense Allocation Breakdown (Target: RM {appState.fund.target})
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-900/10">
                          <span className="text-xl block mb-1">🩺</span>
                          <span className="text-xs font-bold text-[#3E2723] block">Vet Care & Bills</span>
                          <span className="text-[11px] text-[#E56B6B] font-bold">45% (~RM {Math.round(appState.fund.target * 0.45)})</span>
                        </div>
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-900/10">
                          <span className="text-xl block mb-1">🍲</span>
                          <span className="text-xs font-bold text-[#3E2723] block">Cat Food (Wet & Dry)</span>
                          <span className="text-[11px] text-[#E56B6B] font-bold">25% (~RM {Math.round(appState.fund.target * 0.25)})</span>
                        </div>
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-900/10">
                          <span className="text-xl block mb-1">🐾</span>
                          <span className="text-xs font-bold text-[#3E2723] block">Tofu Litter</span>
                          <span className="text-[11px] text-[#E56B6B] font-bold">15% (~RM {Math.round(appState.fund.target * 0.15)})</span>
                        </div>
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-900/10">
                          <span className="text-xl block mb-1">💊</span>
                          <span className="text-xs font-bold text-[#3E2723] block">Vitamins & Meds</span>
                          <span className="text-[11px] text-[#E56B6B] font-bold">15% (~RM {Math.round(appState.fund.target * 0.15)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Adjust Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold text-[#3E2723]/70 mr-1">Quick Adjust:</span>
                      {[
                        { label: '+ RM 50 (Cash Donor)', amount: 50 },
                        { label: '+ RM 100 (Sponsorship)', amount: 100 },
                        { label: '+ RM 500 (Fundraiser)', amount: 500 },
                        { label: '- RM 100 (Vet Bill Paid)', amount: -100 },
                      ].map((adj) => (
                        <button
                          key={adj.label}
                          onClick={() => {
                            updateState((prev) => ({
                              ...prev,
                              fund: {
                                ...prev.fund,
                                raised: Math.max(0, prev.fund.raised + adj.amount),
                              },
                            }));
                            showToast(`Updated fund: ${adj.label}`);
                          }}
                          className="px-3 py-1.5 bg-amber-100/70 hover:bg-amber-200/80 rounded-xl text-xs font-bold text-[#3E2723] border border-amber-900/10 cursor-pointer transition-colors"
                        >
                          {adj.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SECTION 2: Cat Profiles                                  */}
                {/* ========================================================= */}
                {activeAdminTab === 'cats' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-900/10 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[#3E2723] flex items-center gap-2">
                          <i className="fa-solid fa-cat text-[#E56B6B]"></i> Manage Resident Rescue Cats ({appState.cats.length})
                        </h4>
                        <p className="text-xs text-[#3E2723]/60">
                          Edit profiles, statuses, photos, and rescue backstories. Changes update the public gallery immediately.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newCat: CatItem = {
                              id: Date.now(),
                              name: 'New Rescue Kitty',
                              age: '1 Yr',
                              backstory: 'Rescued from local neighborhood during recent TNR operation. Sweet and loving.',
                              personality: 'Friendly, Gentle',
                              status: 'Resident Ambassador',
                              image: CAT_IMAGE_PRESETS[0].url,
                            };
                            updateState((prev) => ({
                              ...prev,
                              cats: [newCat, ...prev.cats],
                            }));
                            showToast('Added new resident cat profile! 🐾');
                          }}
                          className="bg-[#689F38] hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-plus"></i> Add Cat
                        </button>
                        <button
                          onClick={handleForceSave}
                          className="bg-[#3E2723] hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check"></i> Save Cats
                        </button>
                      </div>
                    </div>

                    {/* Cats List */}
                    <div className="space-y-4">
                      {appState.cats.map((cat, idx) => (
                        <div
                          key={cat.id}
                          className="p-4 bg-white rounded-2xl border border-amber-900/10 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {/* Cat Image Preview */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-amber-900/10 shrink-0 bg-amber-50">
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = CAT_IMAGE_PRESETS[0].url;
                                }}
                              />
                            </div>

                            {/* Main Cat Details */}
                            <div className="grow space-y-3 w-full">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Cat Name</label>
                                  <input
                                    type="text"
                                    value={cat.name}
                                    onChange={(e) => {
                                      const copy = [...appState.cats];
                                      copy[idx].name = e.target.value;
                                      updateState((prev) => ({ ...prev, cats: copy }));
                                    }}
                                    placeholder="Cat Name"
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs font-bold bg-[#FFFBF5]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Estimated Age</label>
                                  <input
                                    type="text"
                                    value={cat.age}
                                    onChange={(e) => {
                                      const copy = [...appState.cats];
                                      copy[idx].age = e.target.value;
                                      updateState((prev) => ({ ...prev, cats: copy }));
                                    }}
                                    placeholder="e.g. 2 Yrs or 8 Mos"
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Status Badge</label>
                                  <select
                                    value={cat.status}
                                    onChange={(e) => {
                                      const copy = [...appState.cats];
                                      copy[idx].status = e.target.value;
                                      updateState((prev) => ({ ...prev, cats: copy }));
                                    }}
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs font-semibold bg-[#FFFBF5]"
                                  >
                                    <option value="Resident Ambassador">Resident Ambassador</option>
                                    <option value="Up for Adoption">Up for Adoption</option>
                                    <option value="Medical Recovery">Medical Recovery</option>
                                    <option value="Fostered & Loved">Fostered & Loved</option>
                                    <option value="Senior Resident">Senior Resident</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Personality Traits</label>
                                  <input
                                    type="text"
                                    value={cat.personality}
                                    onChange={(e) => {
                                      const copy = [...appState.cats];
                                      copy[idx].personality = e.target.value;
                                      updateState((prev) => ({ ...prev, cats: copy }));
                                    }}
                                    placeholder="e.g. Playful, Cuddle Bug"
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                  />
                                </div>
                              </div>

                              {/* Direct Device Image Upload */}
                              <div>
                                <ImageUploader
                                  currentImage={cat.image}
                                  onImageChange={(newImg) => {
                                    const copy = [...appState.cats];
                                    copy[idx].image = newImg;
                                    updateState((prev) => ({ ...prev, cats: copy }));
                                    showToast(`Photo updated for ${cat.name}! 📸`);
                                  }}
                                  label="Cat Photo (Direct Device Upload)"
                                  placeholderText="Upload cat photo from your phone or PC"
                                />
                              </div>

                              {/* Quick Photo Selector Buttons */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-[#3E2723]/60 font-semibold mr-1">Or choose sample photo:</span>
                                {CAT_IMAGE_PRESETS.map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => {
                                      const copy = [...appState.cats];
                                      copy[idx].image = p.url;
                                      updateState((prev) => ({ ...prev, cats: copy }));
                                    }}
                                    className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-900/10 px-2 py-0.5 rounded-md text-[#3E2723] cursor-pointer"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>

                              {/* Backstory */}
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Rescue Backstory</label>
                                <textarea
                                  value={cat.backstory}
                                  onChange={(e) => {
                                    const copy = [...appState.cats];
                                    copy[idx].backstory = e.target.value;
                                    updateState((prev) => ({ ...prev, cats: copy }));
                                  }}
                                  rows={2}
                                  className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                  placeholder="Describe how this kitty was rescued and their progress..."
                                />
                              </div>

                              {/* Delete Button */}
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete profile for ${cat.name}?`)) {
                                      updateState((prev) => ({
                                        ...prev,
                                        cats: prev.cats.filter((_, i) => i !== idx),
                                      }));
                                      showToast(`Removed ${cat.name}`);
                                    }
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i> Delete Profile
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SECTION 3: Menu Items                                    */}
                {/* ========================================================= */}
                {activeAdminTab === 'menu' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-900/10 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[#3E2723] flex items-center gap-2">
                          <i className="fa-solid fa-mug-hot text-[#E56B6B]"></i> Manage Cafe Menu & Prices ({appState.menu.length})
                        </h4>
                        <p className="text-xs text-[#3E2723]/60">
                          Edit coffee, mains, and pastries. 50% of menu pre-order profits directly fund cat food and vet bills.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newItem: MenuItem = {
                              id: Date.now(),
                              title: 'New Artisan Special',
                              category: 'Coffee & Beverages',
                              price: 12.0,
                              desc: 'Handcrafted with specialty ingredients and barista love.',
                              image: MENU_IMAGE_PRESETS[0].url,
                            };
                            updateState((prev) => ({
                              ...prev,
                              menu: [newItem, ...prev.menu],
                            }));
                            showToast('Added new menu item!');
                          }}
                          className="bg-[#689F38] hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-plus"></i> Add Menu Item
                        </button>
                        <button
                          onClick={handleForceSave}
                          className="bg-[#3E2723] hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check"></i> Save Menu
                        </button>
                      </div>
                    </div>

                    {/* Menu Category Filter in Admin */}
                    <div className="flex gap-2 pb-1 overflow-x-auto">
                      {['All', 'Coffee & Beverages', 'Hot Mains', 'Pastries & Treats'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setMenuFilter(cat)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                            menuFilter === cat
                              ? 'bg-[#3E2723] text-white border-[#3E2723]'
                              : 'bg-white text-[#3E2723]/70 border-amber-900/10 hover:bg-amber-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Menu Items List */}
                    <div className="space-y-4">
                      {filteredMenu.map((item) => {
                        const originalIdx = appState.menu.findIndex((m) => m.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="p-4 bg-white rounded-2xl border border-amber-900/10 shadow-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                              {/* Photo Preview */}
                              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-amber-900/10 shrink-0 bg-amber-50">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = MENU_IMAGE_PRESETS[0].url;
                                  }}
                                />
                              </div>

                              {/* Form Fields */}
                              <div className="grow space-y-3 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                  <div className="sm:col-span-5">
                                    <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Item Title</label>
                                    <input
                                      type="text"
                                      value={item.title}
                                      onChange={(e) => {
                                        const copy = [...appState.menu];
                                        copy[originalIdx].title = e.target.value;
                                        updateState((prev) => ({ ...prev, menu: copy }));
                                      }}
                                      className="w-full p-2 border border-amber-900/15 rounded-xl text-xs font-bold bg-[#FFFBF5]"
                                    />
                                  </div>

                                  <div className="sm:col-span-4">
                                    <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Category</label>
                                    <select
                                      value={item.category}
                                      onChange={(e) => {
                                        const copy = [...appState.menu];
                                        copy[originalIdx].category = e.target.value as any;
                                        updateState((prev) => ({ ...prev, menu: copy }));
                                      }}
                                      className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                    >
                                      <option value="Coffee & Beverages">Coffee & Beverages</option>
                                      <option value="Hot Mains">Hot Mains</option>
                                      <option value="Pastries & Treats">Pastries & Treats</option>
                                    </select>
                                  </div>

                                  <div className="sm:col-span-3">
                                    <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Price (MYR RM)</label>
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-2 text-xs font-bold text-[#3E2723]/50">RM</span>
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) => {
                                          const copy = [...appState.menu];
                                          copy[originalIdx].price = Math.max(0, parseFloat(e.target.value) || 0);
                                          updateState((prev) => ({ ...prev, menu: copy }));
                                        }}
                                        className="w-full pl-9 pr-2 p-2 border border-amber-900/15 rounded-xl text-xs font-bold font-mono bg-[#FFFBF5]"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Description</label>
                                    <input
                                      type="text"
                                      value={item.desc}
                                      onChange={(e) => {
                                        const copy = [...appState.menu];
                                        copy[originalIdx].desc = e.target.value;
                                        updateState((prev) => ({ ...prev, menu: copy }));
                                      }}
                                      className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                      placeholder="Ingredients or culinary notes..."
                                    />
                                  </div>
                                </div>

                                {/* Direct Device Image Upload */}
                                <div>
                                  <ImageUploader
                                    currentImage={item.image}
                                    onImageChange={(newImg) => {
                                      const copy = [...appState.menu];
                                      copy[originalIdx].image = newImg;
                                      updateState((prev) => ({ ...prev, menu: copy }));
                                      showToast(`Image updated for ${item.title}! 🍽️`);
                                    }}
                                    label="Item Photo (Direct Device Upload)"
                                    placeholderText="Upload food/beverage photo from your device"
                                  />
                                </div>

                                {/* Preset Image Buttons */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] text-[#3E2723]/60 font-semibold mr-1">Or choose sample photo:</span>
                                  {MENU_IMAGE_PRESETS.map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => {
                                        const copy = [...appState.menu];
                                        copy[originalIdx].image = p.url;
                                        updateState((prev) => ({ ...prev, menu: copy }));
                                      }}
                                      className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-900/10 px-2 py-0.5 rounded-md text-[#3E2723] cursor-pointer"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>

                                {/* Delete Item */}
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Delete ${item.title}?`)) {
                                        updateState((prev) => ({
                                          ...prev,
                                          menu: prev.menu.filter((m) => m.id !== item.id),
                                        }));
                                        showToast(`Deleted ${item.title}`);
                                      }
                                    }}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <i className="fa-solid fa-trash-can text-xs"></i> Delete Item
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SECTION 4: TNR Updates                                   */}
                {/* ========================================================= */}
                {activeAdminTab === 'missions' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-900/10 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[#3E2723] flex items-center gap-2">
                          <i className="fa-solid fa-notes-medical text-[#E56B6B]"></i> Manage TNR & Rescue Operations Log ({appState.missions.length})
                        </h4>
                        <p className="text-xs text-[#3E2723]/60">
                          Log neighborhood Trap-Neuter-Return milestones, veterinary procedures, and community rescue missions.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newMission: MissionItem = {
                              id: Date.now(),
                              title: 'New Neighborhood TNR Project',
                              status: 'Scheduled',
                              desc: 'Trapping and neutering community cats to humanely manage population and ensure medical vaccinations.',
                              date: 'Upcoming',
                              image: TNR_IMAGE_PRESETS[0].url,
                            };
                            updateState((prev) => ({
                              ...prev,
                              missions: [newMission, ...prev.missions],
                            }));
                            showToast('Added TNR mission update!');
                          }}
                          className="bg-[#689F38] hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-plus"></i> Add Update
                        </button>
                        <button
                          onClick={handleForceSave}
                          className="bg-[#3E2723] hover:bg-black text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check"></i> Save Updates
                        </button>
                      </div>
                    </div>

                    {/* Missions List */}
                    <div className="space-y-4">
                      {appState.missions.map((m, idx) => (
                        <div
                          key={m.id}
                          className="p-4 bg-white rounded-2xl border border-amber-900/10 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row gap-4 items-start">
                            {/* Mission Image Preview */}
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-amber-900/10 shrink-0 bg-amber-50">
                              <img
                                src={m.image}
                                alt={m.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = TNR_IMAGE_PRESETS[0].url;
                                }}
                              />
                            </div>

                            {/* Details */}
                            <div className="grow space-y-3 w-full">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Mission Title</label>
                                  <input
                                    type="text"
                                    value={m.title}
                                    onChange={(e) => {
                                      const copy = [...appState.missions];
                                      copy[idx].title = e.target.value;
                                      updateState((prev) => ({ ...prev, missions: copy }));
                                    }}
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs font-bold bg-[#FFFBF5]"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Mission Status</label>
                                  <select
                                    value={m.status}
                                    onChange={(e) => {
                                      const copy = [...appState.missions];
                                      copy[idx].status = e.target.value as any;
                                      updateState((prev) => ({ ...prev, missions: copy }));
                                    }}
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs font-semibold bg-[#FFFBF5]"
                                  >
                                    <option value="Completed">Completed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Scheduled">Scheduled</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">Date / Neighborhood Location</label>
                                  <input
                                    type="text"
                                    value={m.date}
                                    onChange={(e) => {
                                      const copy = [...appState.missions];
                                      copy[idx].date = e.target.value;
                                      updateState((prev) => ({ ...prev, missions: copy }));
                                    }}
                                    className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                    placeholder="e.g. October 2026 - PJ Seksyen 14"
                                  />
                                </div>
                              </div>

                              {/* Direct Device Image Upload */}
                              <div>
                                <ImageUploader
                                  currentImage={m.image}
                                  onImageChange={(newImg) => {
                                    const copy = [...appState.missions];
                                    copy[idx].image = newImg;
                                    updateState((prev) => ({ ...prev, missions: copy }));
                                    showToast(`Photo updated for ${m.title}! 🏥`);
                                  }}
                                  label="TNR / Rescue Operation Photo (Direct Device Upload)"
                                  placeholderText="Upload clinic, colony, or rescue photo from your device"
                                />
                              </div>

                              {/* Presets */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-[#3E2723]/60 font-semibold mr-1">Or choose sample photo:</span>
                                {TNR_IMAGE_PRESETS.map((p) => (
                                  <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => {
                                      const copy = [...appState.missions];
                                      copy[idx].image = p.url;
                                      updateState((prev) => ({ ...prev, missions: copy }));
                                    }}
                                    className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-900/10 px-2 py-0.5 rounded-md text-[#3E2723] cursor-pointer"
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>

                              {/* Description / Story */}
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#3E2723]/60 mb-0.5">TNR Operation Impact Story</label>
                                <textarea
                                  value={m.desc}
                                  onChange={(e) => {
                                    const copy = [...appState.missions];
                                    copy[idx].desc = e.target.value;
                                    updateState((prev) => ({ ...prev, missions: copy }));
                                  }}
                                  rows={2}
                                  className="w-full p-2 border border-amber-900/15 rounded-xl text-xs bg-[#FFFBF5]"
                                  placeholder="Details on cats helped, veterinary clinic partnerships, and recovery updates..."
                                />
                              </div>

                              {/* Delete Button */}
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Delete update ${m.title}?`)) {
                                      updateState((prev) => ({
                                        ...prev,
                                        missions: prev.missions.filter((_, i) => i !== idx),
                                      }));
                                      showToast('Deleted TNR update');
                                    }
                                  }}
                                  className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <i className="fa-solid fa-trash-can text-xs"></i> Delete Update
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SECTION 5: Orders & Logs                                 */}
                {/* ========================================================= */}
                {activeAdminTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-900/10 gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[#3E2723] flex items-center gap-2">
                          <i className="fa-solid fa-receipt text-[#E56B6B]"></i> Real-Time Orders & Donation Activity Logs
                        </h4>
                        <p className="text-xs text-[#3E2723]/60">
                          Incoming customer pre-orders and donation pledges sync here in real-time from all visitors across devices.
                        </p>
                      </div>
                      <button
                        onClick={handleForceSave}
                        className="bg-[#689F38] hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <i className="fa-solid fa-check"></i> Save & Sync Logs
                      </button>
                    </div>

                    {/* Analytics Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-900/10">
                        <span className="text-[10px] uppercase font-bold text-[#3E2723]/60 block">Customer Orders</span>
                        <span className="text-xl font-bold text-[#3E2723] block mt-0.5">{appState.orders?.length || 0}</span>
                        <span className="text-[10px] text-[#689F38] font-bold">
                          RM {(appState.orders || []).reduce((acc, o) => acc + o.subtotal, 0).toFixed(2)} total
                        </span>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-900/10">
                        <span className="text-[10px] uppercase font-bold text-[#3E2723]/60 block">Direct Donations</span>
                        <span className="text-xl font-bold text-[#E56B6B] block mt-0.5">{appState.donations?.length || 0}</span>
                        <span className="text-[10px] text-[#E56B6B] font-bold">
                          RM {(appState.donations || []).reduce((acc, d) => acc + d.amount, 0).toFixed(2)} pledged
                        </span>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-900/10">
                        <span className="text-[10px] uppercase font-bold text-[#3E2723]/60 block">50% Order Fund Pool</span>
                        <span className="text-xl font-bold text-[#689F38] block mt-0.5">
                          RM {Math.round((appState.orders || []).reduce((acc, o) => acc + o.subtotal, 0) * 0.5)}
                        </span>
                        <span className="text-[10px] text-[#3E2723]/60 font-semibold">Tied to Cafe Sales</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-900/10">
                        <span className="text-[10px] uppercase font-bold text-[#3E2723]/60 block">Current Fund Raised</span>
                        <span className="text-xl font-bold text-[#3E2723] block mt-0.5">RM {appState.fund.raised}</span>
                        <span className="text-[10px] text-[#E56B6B] font-bold">Goal: RM {appState.fund.target}</span>
                      </div>
                    </div>

                    {/* Sub-tab Switcher: Orders vs Donations */}
                    <div className="flex border-b border-amber-900/10 gap-3">
                      <button
                        onClick={() => setActiveLogSubTab('orders')}
                        className={`pb-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                          activeLogSubTab === 'orders'
                            ? 'border-[#FF8A8A] text-[#E56B6B]'
                            : 'border-transparent text-[#3E2723]/70 hover:text-[#3E2723]'
                        }`}
                      >
                        Customer Pre-Orders ({appState.orders?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveLogSubTab('donations')}
                        className={`pb-2 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                          activeLogSubTab === 'donations'
                            ? 'border-[#FF8A8A] text-[#E56B6B]'
                            : 'border-transparent text-[#3E2723]/70 hover:text-[#3E2723]'
                        }`}
                      >
                        Donation Pledges & Manual Records ({appState.donations?.length || 0})
                      </button>
                    </div>

                    {/* SUBTAB 1: ORDERS */}
                    {activeLogSubTab === 'orders' && (
                      <div className="space-y-3">
                        {/* Order Status Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                          <div className="flex flex-wrap gap-1.5">
                            {['all', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((st) => (
                              <button
                                key={st}
                                onClick={() => setOrderFilter(st as any)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border cursor-pointer ${
                                  orderFilter === st
                                    ? 'bg-[#3E2723] text-white border-[#3E2723]'
                                    : 'bg-white text-[#3E2723]/70 border-amber-900/10 hover:bg-amber-50'
                                }`}
                              >
                                {st === 'all' ? 'All Orders' : st}
                              </button>
                            ))}
                          </div>

                          {(appState.orders?.length || 0) > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm('Clear all orders? This cannot be undone.')) {
                                  updateState((prev) => ({ ...prev, orders: [] }));
                                  showToast('Cleared orders list.');
                                }
                              }}
                              className="text-[11px] text-red-500 hover:text-red-700 font-bold cursor-pointer"
                            >
                              Clear Order History
                            </button>
                          )}
                        </div>

                        {/* Orders List */}
                        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                          {appState.orders && appState.orders.length > 0 ? (
                            appState.orders
                              .filter((o) => (orderFilter === 'all' ? true : (o.status || 'Pending') === orderFilter))
                              .map((o, idx) => (
                                <div
                                  key={o.id}
                                  className="p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-[#3E2723]">{o.name}</span>
                                      <span className="text-[11px] text-[#3E2723]/70 font-mono">({o.phone})</span>
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#3E2723]/80">
                                        {o.type}
                                      </span>
                                      <span className="text-[10px] text-[#3E2723]/50">{o.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-[#3E2723]/80 font-medium">
                                      {o.items?.map((it) => `${it.title} x${it.qty}`).join(', ')}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                    <span className="font-bold text-sm text-[#689F38]">
                                      RM {o.subtotal.toFixed(2)}
                                    </span>

                                    {/* Order Status Selector */}
                                    <select
                                      value={o.status || 'Pending'}
                                      onChange={(e) => {
                                        const copy = [...appState.orders];
                                        copy[idx].status = e.target.value as any;
                                        updateState((prev) => ({ ...prev, orders: copy }));
                                        showToast(`Order status updated to ${e.target.value}`);
                                      }}
                                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-amber-900/15 bg-[#FFFBF5] text-[#3E2723]"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Preparing">Preparing</option>
                                      <option value="Ready">Ready</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>

                                    {/* Delete Order */}
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Delete order for ${o.name}?`)) {
                                          updateState((prev) => ({
                                            ...prev,
                                            orders: prev.orders.filter((_, i) => i !== idx),
                                          }));
                                          showToast('Deleted order record');
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                      title="Delete Order"
                                    >
                                      <i className="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="p-8 text-center bg-white rounded-2xl border border-amber-900/10 text-xs text-[#3E2723]/60 space-y-1">
                              <span className="text-2xl block mb-1">📋</span>
                              <p className="font-bold text-[#3E2723]">No customer orders recorded yet.</p>
                              <p className="text-[11px]">When visitors place pre-orders on the website, they show up here instantly!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 2: DONATIONS & MANUAL ENTRY */}
                    {activeLogSubTab === 'donations' && (
                      <div className="space-y-4">
                        {/* Manual Offline Donation Logger */}
                        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-900/10 space-y-3">
                          <h5 className="font-bold text-xs text-[#3E2723] uppercase tracking-wider flex items-center gap-1.5">
                            <i className="fa-solid fa-plus-circle text-[#E56B6B]"></i> Record Manual / Offline Walk-in Donation
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Donor Name (or Anonymous)"
                              value={manualDonorName}
                              onChange={(e) => setManualDonorName(e.target.value)}
                              className="p-2 border border-amber-900/15 rounded-xl text-xs bg-white"
                            />
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-[#3E2723]/50">RM</span>
                              <input
                                type="number"
                                min="1"
                                placeholder="Amount"
                                value={manualDonorAmount}
                                onChange={(e) => setManualDonorAmount(Math.max(1, Number(e.target.value)))}
                                className="w-full pl-9 pr-2 p-2 border border-amber-900/15 rounded-xl text-xs font-bold bg-white"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Note / Payment Channel (e.g. Maybank QR, Cash)"
                              value={manualDonorNote}
                              onChange={(e) => setManualDonorNote(e.target.value)}
                              className="p-2 border border-amber-900/15 rounded-xl text-xs bg-white"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const amount = Number(manualDonorAmount);
                                if (!amount || amount <= 0) {
                                  showToast('Please enter a valid donation amount.');
                                  return;
                                }
                                const donor = manualDonorName.trim() || 'Anonymous Guardian';
                                const note = manualDonorNote.trim() || 'Offline Direct Contribution';
                                const newDonation: DonationItem = {
                                  id: Date.now(),
                                  donor,
                                  amount,
                                  note,
                                  timestamp: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                                };

                                updateState((prev) => ({
                                  ...prev,
                                  fund: {
                                    ...prev.fund,
                                    raised: prev.fund.raised + amount,
                                  },
                                  donations: [newDonation, ...(prev.donations || [])],
                                }));

                                setManualDonorName('');
                                setManualDonorAmount(50);
                                setManualDonorNote('Direct Bank Transfer');
                                showToast(`Recorded RM ${amount} from ${donor} & updated fund! ❤️`);
                              }}
                              className="bg-[#FF8A8A] hover:bg-[#E56B6B] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                            >
                              + Add & Increment Live Fund
                            </button>
                          </div>
                        </div>

                        {/* Donations List */}
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                          {appState.donations && appState.donations.length > 0 ? (
                            appState.donations.map((d, idx) => (
                              <div
                                key={d.id}
                                className="p-3.5 bg-white rounded-2xl border border-amber-900/10 shadow-xs flex justify-between items-center"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-[#3E2723]">{d.donor}</span>
                                    <span className="text-[10px] text-[#3E2723]/50">• {d.timestamp}</span>
                                  </div>
                                  <span className="block text-[11px] text-[#3E2723]/70">{d.note}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-sm text-[#E56B6B]">
                                    + RM {d.amount}
                                  </span>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Delete donation record of RM ${d.amount} from ${d.donor}?`)) {
                                        updateState((prev) => ({
                                          ...prev,
                                          donations: prev.donations.filter((_, i) => i !== idx),
                                        }));
                                        showToast('Removed donation entry');
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                    title="Delete Entry"
                                  >
                                    <i className="fa-solid fa-trash-can text-xs"></i>
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center bg-white rounded-2xl border border-amber-900/10 text-xs text-[#3E2723]/60 space-y-1">
                              <span className="text-2xl block mb-1">❤️</span>
                              <p className="font-bold text-[#3E2723]">No donation logs recorded yet.</p>
                              <p className="text-[11px]">Direct pledges from visitors or counter logs will appear here.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
