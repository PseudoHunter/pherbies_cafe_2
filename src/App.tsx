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

const STORAGE_KEY = 'pherbies_cafe_state';

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

  // Synchronize state changes to localStorage
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return next;
    });
  };

  // Cross-tab synchronization
  useEffect(() => {
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
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
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
          </a>

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
            <p>© {new Date().getFullYear()} Pherbies Cafe. Built with ❤️ for stray cats in Malaysia.</p>
            
            {/* DISCRETELY HIDDEN ADMIN TRIGGER */}
            <div className="flex items-center gap-2">
              <span>Crafted for Cat Welfare</span>
              <button
                onClick={() => {
                  setAdminOpen(true);
                  setAdminLoginError(false);
                }}
                title="Staff Portal"
                className="text-amber-100/20 hover:text-amber-100/60 transition-colors focus:outline-hidden text-[10px] ml-2 cursor-pointer"
              >
                <i className="fa-solid fa-lock text-[8px]"></i> ⚙️
              </button>
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
                    placeholder="pherbiescute"
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
                    placeholder="••••••••••••••••"
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

                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-900/10 text-[10px] text-[#3E2723]/70 text-center">
                  Demo credentials: <span className="font-mono text-[#E56B6B]">pherbiescute</span> / <span className="font-mono text-[#E56B6B]">pherbiescafecutie</span>
                </div>
              </form>
            </div>
          ) : (
            /* Step 2: Full Admin Management Dashboard */
            <div className="bg-[#FFFBF5] max-w-5xl w-full max-h-[90vh] rounded-3xl border border-amber-900/10 shadow-2xl flex flex-col overflow-hidden">
              {/* Topbar */}
              <div className="bg-[#3E2723] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🐾</span>
                  <div>
                    <h3 className="heading-font font-bold text-lg leading-tight">
                      Pherbies Cafe Admin Portal
                    </h3>
                    <span className="text-[10px] text-amber-200/80 uppercase font-semibold tracking-wider">
                      Live Shared State Editor
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetToDefaults}
                    className="text-xs bg-amber-800/60 hover:bg-amber-800 text-amber-100 px-3 py-1.5 rounded-lg border border-amber-700/50 transition-colors cursor-pointer"
                  >
                    Reset All Defaults
                  </button>
                  <button
                    onClick={() => setAdminOpen(false)}
                    className="text-white/70 hover:text-white p-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>
              </div>

              {/* Nav Tabs */}
              <div className="bg-amber-100/50 border-b border-amber-900/10 px-6 flex gap-2 overflow-x-auto shrink-0">
                {[
                  { id: 'target', label: 'Fund Goal' },
                  { id: 'cats', label: 'Cat Profiles' },
                  { id: 'menu', label: 'Menu Items' },
                  { id: 'missions', label: 'TNR Updates' },
                  { id: 'orders', label: 'Orders & Logs' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id as any)}
                    className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                      activeAdminTab === tab.id
                        ? 'border-[#FF8A8A] text-[#E56B6B]'
                        : 'border-transparent text-[#3E2723]/70 hover:text-[#3E2723]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="p-6 overflow-y-auto grow space-y-6">
                {/* TAB 1: Fund Goal */}
                {activeAdminTab === 'target' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base text-[#3E2723] border-b border-amber-900/10 pb-2">
                      Edit Monthly Rescue Goal & Tracker
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#3E2723]/80 mb-1">
                          Monthly Target Amount (RM)
                        </label>
                        <input
                          type="number"
                          value={appState.fund.target}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateState((prev) => ({
                              ...prev,
                              fund: { ...prev.fund, target: val },
                            }));
                          }}
                          className="w-full p-2.5 rounded-xl border border-amber-900/15 text-sm bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3E2723]/80 mb-1">
                          Current Collected Amount (RM)
                        </label>
                        <input
                          type="number"
                          value={appState.fund.raised}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateState((prev) => ({
                              ...prev,
                              fund: { ...prev.fund, raised: val },
                            }));
                          }}
                          className="w-full p-2.5 rounded-xl border border-amber-900/15 text-sm bg-white font-bold text-[#E56B6B]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[#3E2723]/60">
                      Changes immediately update the hero progress bar and calculations!
                    </p>
                  </div>
                )}

                {/* TAB 2: Cat Profiles */}
                {activeAdminTab === 'cats' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-900/10 pb-2">
                      <h4 className="font-bold text-base text-[#3E2723]">Manage Resident Cats</h4>
                      <button
                        onClick={() => {
                          const newCat: CatItem = {
                            id: Date.now(),
                            name: 'New Rescue',
                            age: '1 Yr',
                            backstory: 'Saved from street conditions.',
                            personality: 'Friendly',
                            status: 'Resident Ambassador',
                            image:
                              'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
                          };
                          updateState((prev) => ({
                            ...prev,
                            cats: [...prev.cats, newCat],
                          }));
                          showToast('Added new resident cat!');
                        }}
                        className="bg-[#689F38] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        + Add Cat
                      </button>
                    </div>

                    <div className="space-y-3">
                      {appState.cats.map((cat, idx) => (
                        <div
                          key={cat.id}
                          className="p-3 bg-white rounded-xl border border-amber-900/10 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={cat.name}
                              onChange={(e) => {
                                const copy = [...appState.cats];
                                copy[idx].name = e.target.value;
                                updateState((prev) => ({ ...prev, cats: copy }));
                              }}
                              placeholder="Cat Name"
                              className="p-2 border rounded-sm text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={cat.age}
                              onChange={(e) => {
                                const copy = [...appState.cats];
                                copy[idx].age = e.target.value;
                                updateState((prev) => ({ ...prev, cats: copy }));
                              }}
                              placeholder="Age"
                              className="p-2 border rounded-sm text-xs"
                            />
                            <input
                              type="text"
                              value={cat.personality}
                              onChange={(e) => {
                                const copy = [...appState.cats];
                                copy[idx].personality = e.target.value;
                                updateState((prev) => ({ ...prev, cats: copy }));
                              }}
                              placeholder="Personality"
                              className="p-2 border rounded-sm text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={cat.image}
                              onChange={(e) => {
                                const copy = [...appState.cats];
                                copy[idx].image = e.target.value;
                                updateState((prev) => ({ ...prev, cats: copy }));
                              }}
                              placeholder="Image URL"
                              className="sm:col-span-3 p-2 border rounded-sm text-xs"
                            />
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${cat.name}?`)) {
                                  updateState((prev) => ({
                                    ...prev,
                                    cats: prev.cats.filter((_, i) => i !== idx),
                                  }));
                                  showToast(`Removed ${cat.name}`);
                                }
                              }}
                              className="bg-red-500 text-white p-2 rounded-sm text-xs font-bold hover:bg-red-600 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                          <textarea
                            value={cat.backstory}
                            onChange={(e) => {
                              const copy = [...appState.cats];
                              copy[idx].backstory = e.target.value;
                              updateState((prev) => ({ ...prev, cats: copy }));
                            }}
                            className="w-full p-2 border rounded-sm text-xs"
                            rows={2}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: Menu Items */}
                {activeAdminTab === 'menu' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-900/10 pb-2">
                      <h4 className="font-bold text-base text-[#3E2723]">Manage Cafe Menu</h4>
                      <button
                        onClick={() => {
                          const newItem: MenuItem = {
                            id: Date.now(),
                            title: 'New Special',
                            category: 'Coffee & Beverages',
                            price: 12.0,
                            desc: 'Freshly prepared cafe delight.',
                            image:
                              'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
                          };
                          updateState((prev) => ({
                            ...prev,
                            menu: [...prev.menu, newItem],
                          }));
                          showToast('Added new menu item!');
                        }}
                        className="bg-[#689F38] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {appState.menu.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white rounded-xl border border-amber-900/10 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                        >
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const copy = [...appState.menu];
                              copy[idx].title = e.target.value;
                              updateState((prev) => ({ ...prev, menu: copy }));
                            }}
                            className="sm:col-span-4 p-2 border rounded-sm text-xs font-bold"
                          />
                          <select
                            value={item.category}
                            onChange={(e) => {
                              const copy = [...appState.menu];
                              copy[idx].category = e.target.value as any;
                              updateState((prev) => ({ ...prev, menu: copy }));
                            }}
                            className="sm:col-span-3 p-2 border rounded-sm text-xs"
                          >
                            <option value="Coffee & Beverages">Coffee & Beverages</option>
                            <option value="Hot Mains">Hot Mains</option>
                            <option value="Pastries & Treats">Pastries & Treats</option>
                          </select>
                          <input
                            type="number"
                            step="0.5"
                            value={item.price}
                            onChange={(e) => {
                              const copy = [...appState.menu];
                              copy[idx].price = parseFloat(e.target.value) || 0;
                              updateState((prev) => ({ ...prev, menu: copy }));
                            }}
                            className="sm:col-span-2 p-2 border rounded-sm text-xs font-bold font-mono"
                          />
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${item.title}?`)) {
                                updateState((prev) => ({
                                  ...prev,
                                  menu: prev.menu.filter((_, i) => i !== idx),
                                }));
                                showToast(`Deleted ${item.title}`);
                              }
                            }}
                            className="sm:col-span-3 bg-red-500 text-white p-2 rounded-sm text-xs font-bold hover:bg-red-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TNR Missions */}
                {activeAdminTab === 'missions' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-amber-900/10 pb-2">
                      <h4 className="font-bold text-base text-[#3E2723]">
                        Manage Rescue Updates & TNR Projects
                      </h4>
                      <button
                        onClick={() => {
                          const newMission: MissionItem = {
                            id: Date.now(),
                            title: 'New TNR Mission Drive',
                            status: 'Scheduled',
                            desc: 'Community cat TNR operation planned.',
                            date: 'Upcoming',
                            image:
                              'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=600&q=80',
                          };
                          updateState((prev) => ({
                            ...prev,
                            missions: [...prev.missions, newMission],
                          }));
                          showToast('Added mission update!');
                        }}
                        className="bg-[#689F38] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        + Add Update
                      </button>
                    </div>

                    <div className="space-y-3">
                      {appState.missions.map((m, idx) => (
                        <div
                          key={m.id}
                          className="p-3 bg-white rounded-xl border border-amber-900/10 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={m.title}
                              onChange={(e) => {
                                const copy = [...appState.missions];
                                copy[idx].title = e.target.value;
                                updateState((prev) => ({ ...prev, missions: copy }));
                              }}
                              className="p-2 border rounded-sm text-xs font-bold"
                            />
                            <select
                              value={m.status}
                              onChange={(e) => {
                                const copy = [...appState.missions];
                                copy[idx].status = e.target.value as any;
                                updateState((prev) => ({ ...prev, missions: copy }));
                              }}
                              className="p-2 border rounded-sm text-xs"
                            >
                              <option value="Completed">Completed</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Scheduled">Scheduled</option>
                            </select>
                            <input
                              type="text"
                              value={m.date}
                              onChange={(e) => {
                                const copy = [...appState.missions];
                                copy[idx].date = e.target.value;
                                updateState((prev) => ({ ...prev, missions: copy }));
                              }}
                              className="p-2 border rounded-sm text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={m.image}
                              onChange={(e) => {
                                const copy = [...appState.missions];
                                copy[idx].image = e.target.value;
                                updateState((prev) => ({ ...prev, missions: copy }));
                              }}
                              className="w-full p-2 border rounded-sm text-xs"
                              placeholder="Image URL"
                            />
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${m.title}?`)) {
                                  updateState((prev) => ({
                                    ...prev,
                                    missions: prev.missions.filter((_, i) => i !== idx),
                                  }));
                                  showToast('Deleted mission update');
                                }
                              }}
                              className="bg-red-500 text-white px-3 p-2 rounded-sm text-xs font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 5: Orders & Logs */}
                {activeAdminTab === 'orders' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-base text-[#3E2723] border-b border-amber-900/10 pb-2">
                      Pre-Orders & Donation Activity Logs
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-xs font-bold text-[#3E2723] uppercase mb-2">
                          Customer Pre-Orders ({appState.orders?.length || 0})
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-white rounded-xl border border-amber-900/10 text-xs">
                          {appState.orders && appState.orders.length > 0 ? (
                            appState.orders.map((o) => (
                              <div
                                key={o.id}
                                className="p-2 border-b border-amber-900/10 flex justify-between items-start"
                              >
                                <div>
                                  <span className="font-bold text-[#3E2723]">
                                    {o.name} ({o.phone})
                                  </span>
                                  <span className="block text-[10px] text-[#3E2723]/60">
                                    {o.type} • {o.timestamp}
                                  </span>
                                  <span className="block text-[10px] text-[#3E2723]/75">
                                    {o.items?.map((it) => `${it.title} x${it.qty}`).join(', ')}
                                  </span>
                                </div>
                                <span className="font-bold text-[#689F38]">
                                  RM {o.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[#3E2723]/50 p-2 text-center">
                              No customer orders recorded yet.
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-[#3E2723] uppercase mb-2">
                          Donation Activity ({appState.donations?.length || 0})
                        </h5>
                        <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-white rounded-xl border border-amber-900/10 text-xs">
                          {appState.donations && appState.donations.length > 0 ? (
                            appState.donations.map((d) => (
                              <div
                                key={d.id}
                                className="p-2 border-b border-amber-900/10 flex justify-between items-start"
                              >
                                <div>
                                  <span className="font-bold text-[#3E2723]">{d.donor}</span>
                                  <span className="block text-[10px] text-[#3E2723]/60">
                                    {d.note} • {d.timestamp}
                                  </span>
                                </div>
                                <span className="font-bold text-[#E56B6B]">
                                  + RM {d.amount}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[#3E2723]/50 p-2 text-center">
                              No direct donations logged yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
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
