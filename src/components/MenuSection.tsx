import React, { useState } from 'react';
import { Coffee, Utensils, Sparkles, Plus, Check, ShoppingBag, X } from 'lucide-react';
import { MenuItem } from '../data/defaultData';
import { useToast } from './Toast';

interface MenuSectionProps {
  menuItems: MenuItem[];
  onReserveWithOrder: (selectedItems: { item: MenuItem; quantity: number }[]) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ menuItems, onReserveWithOrder }) => {
  const [activeTab, setActiveTab] = useState<'Coffee & Drinks' | 'Pastries & Mains' | 'Cat Treats'>('Coffee & Drinks');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderTray, setOrderTray] = useState<{ [id: string]: number }>({});
  const { showToast } = useToast();

  const categories: Array<'Coffee & Drinks' | 'Pastries & Mains' | 'Cat Treats'> = [
    'Coffee & Drinks',
    'Pastries & Mains',
    'Cat Treats',
  ];

  const filteredItems = menuItems.filter((item) => {
    const matchesTab = item.category === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && (searchQuery === '' || matchesSearch);
  });

  const addToTray = (item: MenuItem) => {
    setOrderTray((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    showToast(`Added "${item.name}" to your reservation tray!`, 'success');
  };

  const removeFromTray = (itemId: string) => {
    setOrderTray((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const trayTotal = Object.entries(orderTray).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const trayCount = Object.values(orderTray).reduce((sum, qty) => sum + qty, 0);

  const handleCheckoutTray = () => {
    const selected = Object.entries(orderTray)
      .map(([id, quantity]) => {
        const item = menuItems.find((m) => m.id === id);
        return item ? { item, quantity } : null;
      })
      .filter((x): x is { item: MenuItem; quantity: number } => x !== null);

    onReserveWithOrder(selected);
  };

  return (
    <section id="cafe-menu" className="py-16 sm:py-24 bg-[#F8F5EE] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#5A7A6B] uppercase mb-1 flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5 text-[#7A9A8B]" /> Artisan Cafe & Kitchen
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#2D3142] tracking-tight">
              Savor With A Purpose
            </h2>
            <p className="text-sm sm:text-base text-[#2D3142]/75 mt-2 max-w-2xl">
              100% of cafe profits directly support the medical bills, food, and rescue operations of our furry residents.
              Crafted with local Malaysian ingredients and love.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search drinks, toasties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FFFDF8] border border-[#E8E2D5] text-xs sm:text-sm text-[#2D3142] placeholder-[#2D3142]/40 focus:outline-hidden focus:border-[#7A9A8B] transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E8E2D5] pb-4 mb-8 overflow-x-auto">
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2D3142] text-white shadow-xs'
                    : 'bg-[#FFFDF8] text-[#2D3142]/75 hover:text-[#2D3142] border border-[#E8E2D5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFDF8] rounded-3xl border border-[#E8E2D5] overflow-hidden flex flex-col justify-between hover:border-[#7A9A8B]/60 hover:shadow-sm transition-all duration-300"
            >
              <div>
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/80 px-3 py-1 rounded-md">
                        Sold Out Today
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-serif-title text-lg font-bold text-[#2D3142] leading-snug">
                      {item.name}
                    </h3>
                    <span className="font-mono font-bold text-base text-[#E07A5F] shrink-0">
                      RM {item.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Clean unboxed tags (Zero-pill discipline) */}
                  <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-[#5A7A6B] font-semibold mb-2.5">
                    {item.tags.map((tag, i) => (
                      <React.Fragment key={tag}>
                        <span>{tag}</span>
                        {i < item.tags.length - 1 && <span className="text-stone-300">·</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <p className="text-xs text-[#2D3142]/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Add Button */}
              <div className="px-5 pb-5 pt-2">
                <button
                  disabled={!item.available}
                  onClick={() => addToTray(item)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    item.available
                      ? 'bg-[#F2ECE1] hover:bg-[#E8E0D2] text-[#2D3142] active:scale-98'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {orderTray[item.id] ? `Add More (${orderTray[item.id]} in Tray)` : 'Add to Dine-in / Order Tray'}
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-[#FFFDF8] rounded-3xl border border-dashed border-[#E8E2D5]">
            <p className="text-sm font-medium text-[#2D3142]/70">
              No menu items match your search. Try searching something else!
            </p>
          </div>
        )}

        {/* Floating Order / Table Tray Bar if items added */}
        {trayCount > 0 && (
          <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-40 max-w-md w-full bg-[#2D3142] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E07A5F] flex items-center justify-center text-white shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-stone-300">
                  {trayCount} {trayCount === 1 ? 'item' : 'items'} in table tray
                </div>
                <div className="font-mono font-bold text-base text-white">
                  RM {trayTotal.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckoutTray}
                className="px-4 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#C9664C] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                Proceed to Book / Order
              </button>
              <button
                onClick={() => setOrderTray({})}
                className="p-2 text-stone-400 hover:text-white transition-colors"
                title="Clear tray"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
