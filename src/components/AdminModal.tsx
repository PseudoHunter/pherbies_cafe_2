import React, { useState } from 'react';
import {
  X,
  Lock,
  LogOut,
  Settings,
  Cat as CatIcon,
  Coffee,
  Heart,
  Scissors,
  Bell,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  CheckCircle,
  Save,
} from 'lucide-react';
import { AppData, Cat, MenuItem, TnrLog } from '../data/defaultData';
import { useToast } from './Toast';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  onUpdateAppData: (updater: (prev: AppData) => AppData) => void;
  onResetToDefaults: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  appData,
  onUpdateAppData,
  onResetToDefaults,
}) => {
  const { showToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'financials' | 'cats' | 'menu' | 'tnr' | 'announcement'>('financials');

  // Cat Form State for Add / Edit
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catFormData, setCatFormData] = useState<Partial<Cat>>({
    name: '',
    estimatedAge: '1 Year',
    gender: 'Female',
    status: 'Up for Adoption',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    rescueStory: '',
    personality: '',
    favoriteTreat: 'Chicken broth',
    arrivalDate: 'September 2024',
  });

  // Menu Form State for Add / Edit
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [menuFormData, setMenuFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'Coffee & Drinks',
    price: 14.0,
    description: '',
    tags: ['Signature'],
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    available: true,
  });
  const [tagsInput, setTagsInput] = useState('Signature');

  // TNR Form State
  const [editingTnrId, setEditingTnrId] = useState<string | null>(null);
  const [tnrFormData, setTnrFormData] = useState<Partial<TnrLog>>({
    date: 'October 2024',
    location: '',
    catsNeutered: 6,
    notes: '',
    photoUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=600&q=80',
    status: 'Completed',
  });

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'pherbiescute' && password === 'pherbiescafecutie') {
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Admin access granted. Welcome back, Founder!', 'success');
    } else {
      setLoginError('Invalid credentials. Check username & password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    onClose();
  };

  // --- Financials & Targets Handlers ---
  const handleFinancialsChange = (field: string, val: number) => {
    onUpdateAppData((prev) => ({
      ...prev,
      impact: {
        ...prev.impact,
        [field]: val,
      },
    }));
  };

  const handleBreakdownChange = (field: keyof AppData['impact']['breakdown'], val: number) => {
    onUpdateAppData((prev) => ({
      ...prev,
      impact: {
        ...prev.impact,
        breakdown: {
          ...prev.impact.breakdown,
          [field]: val,
        },
      },
    }));
  };

  // --- Announcement Handlers ---
  const handleAnnouncementToggle = (enabled: boolean) => {
    onUpdateAppData((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        enabled,
      },
    }));
  };

  const handleAnnouncementChange = (field: string, val: string) => {
    onUpdateAppData((prev) => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [field]: val,
      },
    }));
  };

  // --- Cats CRUD ---
  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.name?.trim()) {
      showToast('Cat name is required', 'error');
      return;
    }

    if (editingCatId) {
      // Update
      onUpdateAppData((prev) => ({
        ...prev,
        cats: prev.cats.map((c) =>
          c.id === editingCatId ? ({ ...c, ...catFormData } as Cat) : c
        ),
      }));
      showToast(`Updated profile for ${catFormData.name}`, 'success');
      setEditingCatId(null);
    } else {
      // Add
      const newCat: Cat = {
        id: 'cat-' + Date.now(),
        name: catFormData.name || 'Unnamed Cat',
        estimatedAge: catFormData.estimatedAge || '1 Year',
        gender: (catFormData.gender as any) || 'Female',
        status: (catFormData.status as any) || 'Up for Adoption',
        photoUrl: catFormData.photoUrl || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        rescueStory: catFormData.rescueStory || 'Rescued locally.',
        personality: catFormData.personality || 'Sweet and loving.',
        favoriteTreat: catFormData.favoriteTreat || 'Kitten milk',
        arrivalDate: catFormData.arrivalDate || 'Recently',
        medicalNotes: catFormData.medicalNotes,
      };

      onUpdateAppData((prev) => ({
        ...prev,
        cats: [newCat, ...prev.cats],
        impact: {
          ...prev.impact,
          totalCatsRescued: prev.impact.totalCatsRescued + 1,
        },
      }));
      showToast(`Added new resident rescue: ${newCat.name}!`, 'success');
    }

    // Reset form
    setCatFormData({
      name: '',
      estimatedAge: '1 Year',
      gender: 'Female',
      status: 'Up for Adoption',
      photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      rescueStory: '',
      personality: '',
      favoriteTreat: 'Chicken broth',
      arrivalDate: 'September 2024',
    });
  };

  const handleDeleteCat = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the rescue list?`)) {
      onUpdateAppData((prev) => ({
        ...prev,
        cats: prev.cats.filter((c) => c.id !== id),
      }));
      showToast(`Removed ${name}`, 'info');
    }
  };

  // --- Menu CRUD ---
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuFormData.name?.trim()) {
      showToast('Item name is required', 'error');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingMenuId) {
      onUpdateAppData((prev) => ({
        ...prev,
        menu: prev.menu.map((m) =>
          m.id === editingMenuId
            ? ({ ...m, ...menuFormData, tags: tagsArray } as MenuItem)
            : m
        ),
      }));
      showToast(`Updated menu item: ${menuFormData.name}`, 'success');
      setEditingMenuId(null);
    } else {
      const newItem: MenuItem = {
        id: 'menu-' + Date.now(),
        name: menuFormData.name || 'New Item',
        category: (menuFormData.category as any) || 'Coffee & Drinks',
        price: Number(menuFormData.price) || 12,
        description: menuFormData.description || 'Delicious handcrafted cafe item.',
        tags: tagsArray.length > 0 ? tagsArray : ['Special'],
        imageUrl: menuFormData.imageUrl || 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
        available: menuFormData.available ?? true,
      };

      onUpdateAppData((prev) => ({
        ...prev,
        menu: [...prev.menu, newItem],
      }));
      showToast(`Added ${newItem.name} to menu!`, 'success');
    }

    setMenuFormData({
      name: '',
      category: 'Coffee & Drinks',
      price: 14.0,
      description: '',
      tags: ['Signature'],
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
      available: true,
    });
    setTagsInput('Signature');
  };

  const handleDeleteMenu = (id: string, name: string) => {
    if (confirm(`Delete menu item "${name}"?`)) {
      onUpdateAppData((prev) => ({
        ...prev,
        menu: prev.menu.filter((m) => m.id !== id),
      }));
      showToast(`Deleted ${name} from menu`, 'info');
    }
  };

  // --- TNR CRUD ---
  const handleSaveTnr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tnrFormData.location?.trim()) {
      showToast('Location is required', 'error');
      return;
    }

    if (editingTnrId) {
      onUpdateAppData((prev) => ({
        ...prev,
        tnrLogs: prev.tnrLogs.map((t) =>
          t.id === editingTnrId ? ({ ...t, ...tnrFormData } as TnrLog) : t
        ),
      }));
      showToast('Updated TNR mission record', 'success');
      setEditingTnrId(null);
    } else {
      const newTnr: TnrLog = {
        id: 'tnr-' + Date.now(),
        date: tnrFormData.date || 'October 2024',
        location: tnrFormData.location || 'New Colony Area',
        catsNeutered: Number(tnrFormData.catsNeutered) || 4,
        notes: tnrFormData.notes || 'Successfully spayed/neutered and returned.',
        photoUrl: tnrFormData.photoUrl || 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=600&q=80',
        status: (tnrFormData.status as any) || 'Completed',
      };

      onUpdateAppData((prev) => ({
        ...prev,
        tnrLogs: [newTnr, ...prev.tnrLogs],
        impact: {
          ...prev.impact,
          totalTnrCount: prev.impact.totalTnrCount + newTnr.catsNeutered,
        },
      }));
      showToast(`Logged new TNR drive with ${newTnr.catsNeutered} cats!`, 'success');
    }

    setTnrFormData({
      date: 'October 2024',
      location: '',
      catsNeutered: 6,
      notes: '',
      photoUrl: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?auto=format&fit=crop&w=600&q=80',
      status: 'Completed',
    });
  };

  const handleDeleteTnr = (id: string) => {
    if (confirm('Delete this TNR log entry?')) {
      onUpdateAppData((prev) => ({
        ...prev,
        tnrLogs: prev.tnrLogs.filter((t) => t.id !== id),
      }));
      showToast('Deleted TNR log entry', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FFFDF8] rounded-3xl max-w-4xl w-full border border-[#E8E2D5] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#2D3142] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E07A5F] flex items-center justify-center text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title text-xl font-bold">
                  Pherbies Admin Portal
                </h3>
                {isAuthenticated && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                    Live Sync Active
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300">
                Rescue Mission Control & Live Cafe Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Login View */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif-title text-2xl font-bold text-[#2D3142]">
                Founder Sign In
              </h4>
              <p className="text-xs text-[#2D3142]/70 mt-1">
                Enter your authorized credentials to edit monthly targets, cat profiles, menu items, and rescue logs.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#2D3142] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="pherbiescute"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D3142] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-white font-bold text-sm transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  Access Control Panel
                </button>
              </div>

              <div className="p-3 bg-[#F8F5EE] border border-[#E8E2D5] rounded-xl text-[11px] text-[#2D3142]/70">
                <span className="font-bold text-[#2D3142] block">Demo Credentials:</span>
                <span>Username: <code className="font-mono text-[#E07A5F]">pherbiescute</code></span>
                <span className="mx-2">·</span>
                <span>Password: <code className="font-mono text-[#E07A5F]">pherbiescafecutie</code></span>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-[#E8E2D5] bg-[#F8F5EE] px-4 sm:px-6 overflow-x-auto gap-2 shrink-0">
              {[
                { id: 'financials', label: 'Impact & Target', icon: Heart },
                { id: 'cats', label: 'Rescued Cats (CRUD)', icon: CatIcon },
                { id: 'menu', label: 'Cafe Menu (CRUD)', icon: Coffee },
                { id: 'tnr', label: 'TNR Mission Log', icon: Scissors },
                { id: 'announcement', label: 'Broadcast Banner', icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#E07A5F] text-[#E07A5F]'
                        : 'border-transparent text-[#2D3142]/70 hover:text-[#2D3142]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Panel Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: Financials & Target */}
              {activeTab === 'financials' && (
                <div className="space-y-6">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Any adjustment here immediately shifts the public Live Progress Bar and calculations!</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8E2D5] space-y-2">
                      <label className="block text-xs font-bold text-[#2D3142]">
                        Monthly Target Goal (MYR)
                      </label>
                      <input
                        type="number"
                        value={appData.impact.monthlyTarget}
                        onChange={(e) => handleFinancialsChange('monthlyTarget', Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] font-mono font-bold text-lg text-[#2D3142]"
                      />
                      <span className="text-[11px] text-[#2D3142]/60">Default recommendation: RM 3,500</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8E2D5] space-y-2">
                      <label className="block text-xs font-bold text-[#2D3142]">
                        Current Raised So Far (MYR)
                      </label>
                      <input
                        type="number"
                        value={appData.impact.currentRaised}
                        onChange={(e) => handleFinancialsChange('currentRaised', Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] font-mono font-bold text-lg text-[#E07A5F]"
                      />
                      <span className="text-[11px] text-[#2D3142]/60">
                        {Math.round((appData.impact.currentRaised / appData.impact.monthlyTarget) * 100)}% of monthly target
                      </span>
                    </div>
                  </div>

                  {/* Breakdown allocations */}
                  <div className="p-5 rounded-2xl bg-[#F8F5EE] border border-[#E8E2D5] space-y-4">
                    <h4 className="font-serif-title font-bold text-base text-[#2D3142]">
                      Expense Category Allocation Breakdown (MYR)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1 text-[#2D3142]">Vet Bills & Surgeries</label>
                        <input
                          type="number"
                          value={appData.impact.breakdown.vetBills}
                          onChange={(e) => handleBreakdownChange('vetBills', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E2D5] bg-[#FFFDF8] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#2D3142]">Cat Food & Nutrition</label>
                        <input
                          type="number"
                          value={appData.impact.breakdown.catFood}
                          onChange={(e) => handleBreakdownChange('catFood', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E2D5] bg-[#FFFDF8] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#2D3142]">Soy Tofu Cat Litter</label>
                        <input
                          type="number"
                          value={appData.impact.breakdown.tofuLitter}
                          onChange={(e) => handleBreakdownChange('tofuLitter', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E2D5] bg-[#FFFDF8] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-[#2D3142]">Vitamins & Meds</label>
                        <input
                          type="number"
                          value={appData.impact.breakdown.vitamins}
                          onChange={(e) => handleBreakdownChange('vitamins', Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#E8E2D5] bg-[#FFFDF8] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Counters */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#FFFDF8] border border-[#E8E2D5] rounded-xl text-xs">
                      <label className="block font-semibold text-[#2D3142]/80 mb-1">Total Rescued Cats</label>
                      <input
                        type="number"
                        value={appData.impact.totalCatsRescued}
                        onChange={(e) => handleFinancialsChange('totalCatsRescued', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md border font-mono font-bold"
                      />
                    </div>
                    <div className="p-3 bg-[#FFFDF8] border border-[#E8E2D5] rounded-xl text-xs">
                      <label className="block font-semibold text-[#2D3142]/80 mb-1">Total TNR Spays Done</label>
                      <input
                        type="number"
                        value={appData.impact.totalTnrCount}
                        onChange={(e) => handleFinancialsChange('totalTnrCount', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md border font-mono font-bold"
                      />
                    </div>
                    <div className="p-3 bg-[#FFFDF8] border border-[#E8E2D5] rounded-xl text-xs">
                      <label className="block font-semibold text-[#2D3142]/80 mb-1">Colonies Monitored</label>
                      <input
                        type="number"
                        value={appData.impact.activeColoniesMonitored}
                        onChange={(e) => handleFinancialsChange('activeColoniesMonitored', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-md border font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Cats Profiles CRUD */}
              {activeTab === 'cats' && (
                <div className="space-y-6">
                  {/* Cat Add/Edit Form */}
                  <form onSubmit={handleSaveCat} className="p-5 bg-[#F8F5EE] rounded-2xl border border-[#E8E2D5] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif-title font-bold text-base text-[#2D3142]">
                        {editingCatId ? `Edit Cat: ${catFormData.name}` : 'Add New Rescued Cat'}
                      </h4>
                      {editingCatId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(null);
                            setCatFormData({
                              name: '',
                              estimatedAge: '1 Year',
                              gender: 'Female',
                              status: 'Up for Adoption',
                              photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
                              rescueStory: '',
                              personality: '',
                              favoriteTreat: 'Chicken broth',
                              arrivalDate: 'September 2024',
                            });
                          }}
                          className="text-xs text-stone-500 hover:text-stone-800"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Name *</label>
                        <input
                          type="text"
                          required
                          value={catFormData.name || ''}
                          onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Estimated Age</label>
                        <input
                          type="text"
                          value={catFormData.estimatedAge || ''}
                          onChange={(e) => setCatFormData({ ...catFormData, estimatedAge: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Gender</label>
                        <select
                          value={catFormData.gender || 'Female'}
                          onChange={(e) => setCatFormData({ ...catFormData, gender: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Status</label>
                        <select
                          value={catFormData.status || 'Up for Adoption'}
                          onChange={(e) => setCatFormData({ ...catFormData, status: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        >
                          <option value="Permanent Resident">Permanent Resident</option>
                          <option value="Up for Adoption">Up for Adoption</option>
                          <option value="Medical Recovery">Medical Recovery</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">Photo Image URL</label>
                        <input
                          type="url"
                          value={catFormData.photoUrl || ''}
                          onChange={(e) => setCatFormData({ ...catFormData, photoUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold mb-1">Rescue Story</label>
                      <textarea
                        rows={2}
                        value={catFormData.rescueStory || ''}
                        onChange={(e) => setCatFormData({ ...catFormData, rescueStory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        placeholder="Where and how was this furkid saved..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Personality</label>
                        <input
                          type="text"
                          value={catFormData.personality || ''}
                          onChange={(e) => setCatFormData({ ...catFormData, personality: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. Lap lover, gentle purrer"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Favorite Treat</label>
                        <input
                          type="text"
                          value={catFormData.favoriteTreat || ''}
                          onChange={(e) => setCatFormData({ ...catFormData, favoriteTreat: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. Freeze-dried salmon"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#2D3142] text-white text-xs font-semibold hover:bg-[#1e212b] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {editingCatId ? 'Save Cat Profile Updates' : 'Add Rescued Cat'}
                      </button>
                    </div>
                  </form>

                  {/* List of Existing Cats */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#2D3142]">
                      Current Resident Cats ({appData.cats.length})
                    </h5>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {appData.cats.map((cat) => (
                        <div
                          key={cat.id}
                          className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E8E2D5] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={cat.photoUrl}
                              alt={cat.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-bold text-[#2D3142]">{cat.name}</div>
                              <div className="text-[11px] text-[#2D3142]/60">
                                {cat.status} · {cat.gender} · {cat.estimatedAge}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setCatFormData(cat);
                              }}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-[#5A7A6B]"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCat(cat.id, cat.name)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Cafe Menu CRUD */}
              {activeTab === 'menu' && (
                <div className="space-y-6">
                  {/* Form */}
                  <form onSubmit={handleSaveMenu} className="p-5 bg-[#F8F5EE] rounded-2xl border border-[#E8E2D5] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif-title font-bold text-base text-[#2D3142]">
                        {editingMenuId ? `Edit Menu Item: ${menuFormData.name}` : 'Add New Cafe Menu Item'}
                      </h4>
                      {editingMenuId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMenuId(null);
                            setMenuFormData({
                              name: '',
                              category: 'Coffee & Drinks',
                              price: 14.0,
                              description: '',
                              tags: ['Signature'],
                              imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
                              available: true,
                            });
                            setTagsInput('Signature');
                          }}
                          className="text-xs text-stone-500 hover:text-stone-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Item Title *</label>
                        <input
                          type="text"
                          required
                          value={menuFormData.name || ''}
                          onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Category</label>
                        <select
                          value={menuFormData.category || 'Coffee & Drinks'}
                          onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        >
                          <option value="Coffee & Drinks">Coffee & Drinks</option>
                          <option value="Pastries & Mains">Pastries & Mains</option>
                          <option value="Cat Treats">Cat Treats</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Price (MYR)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={menuFormData.price || 0}
                          onChange={(e) => setMenuFormData({ ...menuFormData, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8] font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Tags (Comma-separated)</label>
                        <input
                          type="text"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="e.g. Best Seller, Vegan Option, Chef Pick"
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Photo Image URL</label>
                        <input
                          type="url"
                          value={menuFormData.imageUrl || ''}
                          onChange={(e) => setMenuFormData({ ...menuFormData, imageUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={menuFormData.description || ''}
                        onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="avail"
                        checked={menuFormData.available ?? true}
                        onChange={(e) => setMenuFormData({ ...menuFormData, available: e.target.checked })}
                      />
                      <label htmlFor="avail" className="text-xs font-semibold text-[#2D3142]">
                        Available for ordering today (uncheck if sold out)
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#2D3142] text-white text-xs font-semibold hover:bg-[#1e212b] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {editingMenuId ? 'Save Menu Item' : 'Add to Cafe Menu'}
                      </button>
                    </div>
                  </form>

                  {/* List of items */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#2D3142]">
                      Current Menu Items ({appData.menu.length})
                    </h5>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {appData.menu.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E8E2D5] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-bold text-[#2D3142]">{item.name}</div>
                              <div className="text-[11px] text-[#2D3142]/60">
                                {item.category} · RM {item.price.toFixed(2)} · {item.available ? 'In Stock' : 'Sold Out'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingMenuId(item.id);
                                setMenuFormData(item);
                                setTagsInput(item.tags.join(', '));
                              }}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-[#5A7A6B]"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(item.id, item.name)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: TNR Log */}
              {activeTab === 'tnr' && (
                <div className="space-y-6">
                  {/* Form */}
                  <form onSubmit={handleSaveTnr} className="p-5 bg-[#F8F5EE] rounded-2xl border border-[#E8E2D5] space-y-4">
                    <h4 className="font-serif-title font-bold text-base text-[#2D3142]">
                      {editingTnrId ? 'Edit TNR Mission Record' : 'Record New TNR Spay Mission'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Date / Month</label>
                        <input
                          type="text"
                          required
                          value={tnrFormData.date || ''}
                          onChange={(e) => setTnrFormData({ ...tnrFormData, date: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. October 2024"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Colony / Location</label>
                        <input
                          type="text"
                          required
                          value={tnrFormData.location || ''}
                          onChange={(e) => setTnrFormData({ ...tnrFormData, location: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. Section 17 Petaling Jaya"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Cats Neutered Count</label>
                        <input
                          type="number"
                          value={tnrFormData.catsNeutered || 0}
                          onChange={(e) => setTnrFormData({ ...tnrFormData, catsNeutered: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8] font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Mission Status</label>
                        <select
                          value={tnrFormData.status || 'Completed'}
                          onChange={(e) => setTnrFormData({ ...tnrFormData, status: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Scheduled">Scheduled / Upcoming</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Photo Image URL</label>
                        <input
                          type="url"
                          value={tnrFormData.photoUrl || ''}
                          onChange={(e) => setTnrFormData({ ...tnrFormData, photoUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold mb-1">Mission Notes & Vet Details</label>
                      <textarea
                        rows={2}
                        value={tnrFormData.notes || ''}
                        onChange={(e) => setTnrFormData({ ...tnrFormData, notes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#2D3142] text-white text-xs font-semibold hover:bg-[#1e212b] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save TNR Mission Record
                      </button>
                    </div>
                  </form>

                  {/* Existing Logs */}
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#2D3142]">
                      Logged TNR Operations ({appData.tnrLogs.length})
                    </h5>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {appData.tnrLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E8E2D5] flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-[#2D3142]">{log.location}</div>
                            <div className="text-[11px] text-[#2D3142]/60">
                              {log.date} · {log.catsNeutered} cats · {log.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTnrId(log.id);
                                setTnrFormData(log);
                              }}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-[#5A7A6B]"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTnr(log.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Announcement Banner */}
              {activeTab === 'announcement' && (
                <div className="space-y-5 p-5 bg-[#F8F5EE] rounded-2xl border border-[#E8E2D5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif-title font-bold text-base text-[#2D3142]">
                        Direct Announcement Broadcast Banner
                      </h4>
                      <p className="text-xs text-[#2D3142]/70">
                        Shows at the very top of the website for all visitors.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={appData.announcement.enabled}
                        onChange={(e) => handleAnnouncementToggle(e.target.checked)}
                        className="w-4 h-4 text-[#E07A5F] rounded"
                      />
                      <span className="text-xs font-bold text-[#2D3142]">
                        {appData.announcement.enabled ? 'Active (Visible)' : 'Disabled (Hidden)'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Highlight Badge Word</label>
                      <input
                        type="text"
                        value={appData.announcement.highlightText || ''}
                        onChange={(e) => handleAnnouncementChange('highlightText', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        placeholder="e.g. Urgent Need, Spay Drive, Weekend Special"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Announcement Message Text</label>
                      <textarea
                        rows={2}
                        value={appData.announcement.text}
                        onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                        placeholder="Type the message here..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Action Link Text</label>
                        <input
                          type="text"
                          value={appData.announcement.linkText || ''}
                          onChange={(e) => handleAnnouncementChange('linkText', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. Donate Now, View TNR Log"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Target Section Anchor</label>
                        <input
                          type="text"
                          value={appData.announcement.linkSection || 'impact-tracker'}
                          onChange={(e) => handleAnnouncementChange('linkSection', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border bg-[#FFFDF8]"
                          placeholder="e.g. impact-tracker, tnr-log, cafe-menu"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer with Reset to Defaults */}
            <div className="p-4 bg-[#F2ECE1] border-t border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset all cats, menu items, and impact counters back to pristine default data?')) {
                    onResetToDefaults();
                    showToast('Data reset to default state successfully.', 'info');
                  }
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset To Default Demo Data
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/standalone.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#5A7A6B] hover:text-[#2D3142] underline"
                >
                  View Standalone HTML Version ↗
                </a>
                <span className="text-[11px] text-[#2D3142]/60 hidden sm:inline">
                  Auto-persisted to LocalStorage
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-[#2D3142] text-white text-xs font-semibold hover:bg-[#1a1d27] transition-all cursor-pointer"
                >
                  Close Admin
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
