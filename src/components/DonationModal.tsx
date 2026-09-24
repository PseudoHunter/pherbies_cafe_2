import React, { useState } from 'react';
import { X, Heart, Copy, Check, QrCode, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { Cat, AppData, DonationPledge } from '../data/defaultData';
import { useToast } from './Toast';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsoredCat?: Cat | null;
  appData: AppData;
  onDonationSuccess: (pledge: DonationPledge, targetCategory: string) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  sponsoredCat,
  appData,
  onDonationSuccess,
}) => {
  const { showToast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pledge' | 'bank' | 'qr'>('pledge');

  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [categoryPref, setCategoryPref] = useState<'vetBills' | 'catFood' | 'tofuLitter' | 'vitamins'>('vetBills');
  const [message, setMessage] = useState(
    sponsoredCat ? `Dedicated to sweet ${sponsoredCat.name}'s recovery!` : ''
  );

  if (!isOpen) return null;

  const quickPledges = [
    { label: 'RM 15', val: 15, desc: '1 Can Recovery Food' },
    { label: 'RM 35', val: 35, desc: '1 Bag Natural Tofu Litter' },
    { label: 'RM 50', val: 50, desc: 'Monthly Vitamin Boost' },
    { label: 'RM 150', val: 150, desc: 'Full TNR Spay Surgery' },
  ];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      showToast('Please enter a valid donation amount', 'error');
      return;
    }

    const newPledge: DonationPledge = {
      id: 'pledge-' + Date.now(),
      donorName: isAnonymous ? 'Anonymous Kitty Lover' : (donorName.trim() || 'Kind Guardian'),
      amount: finalAmount,
      message: message.trim(),
      date: 'Just now',
      isAnonymous,
    };

    onDonationSuccess(newPledge, categoryPref);
    showToast(
      `Heartfelt thank you! RM ${finalAmount} pledged to Pherbies Rescue.`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#FFFDF8] rounded-3xl max-w-xl w-full border border-[#E8E2D5] shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#F8F5EE] border-b border-[#E8E2D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-[#E07A5F]" />
            </div>
            <div>
              <h3 className="font-serif-title text-xl font-bold text-[#2D3142]">
                Support Pherbies Rescue Mission
              </h3>
              <p className="text-xs text-[#2D3142]/70">
                100% directly funds vet bills, food & neighborhood TNR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-[#2D3142]/70 hover:text-[#2D3142] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D5] bg-[#FFFDF8] px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pledge')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'pledge'
                ? 'border-[#E07A5F] text-[#E07A5F]'
                : 'border-transparent text-[#2D3142]/60 hover:text-[#2D3142]'
            }`}
          >
            Quick Online Pledge
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'bank'
                ? 'border-[#E07A5F] text-[#E07A5F]'
                : 'border-transparent text-[#2D3142]/60 hover:text-[#2D3142]'
            }`}
          >
            Maybank Direct Transfer
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'qr'
                ? 'border-[#E07A5F] text-[#E07A5F]'
                : 'border-transparent text-[#2D3142]/60 hover:text-[#2D3142]'
            }`}
          >
            DuitNow / Touch 'n Go QR
          </button>
        </div>

        {/* Tab 1: Quick Online Pledge Form */}
        {activeTab === 'pledge' && (
          <form onSubmit={handlePledgeSubmit} className="p-6 space-y-5">
            {sponsoredCat && (
              <div className="p-3 bg-[#E07A5F]/10 rounded-xl border border-[#E07A5F]/20 text-xs text-[#2D3142] flex items-center gap-2.5">
                <img
                  src={sponsoredCat.photoUrl}
                  alt={sponsoredCat.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  Sponsoring medical & food care for <strong>{sponsoredCat.name}</strong> ({sponsoredCat.status})
                </div>
              </div>
            )}

            {/* Quick Amount Options */}
            <div>
              <label className="block text-xs font-bold text-[#2D3142] mb-2 uppercase tracking-wider">
                Select Pledge Amount (MYR)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {quickPledges.map((qp) => {
                  const isSelected = amount === qp.val && !customAmount;
                  return (
                    <button
                      key={qp.val}
                      type="button"
                      onClick={() => {
                        setAmount(qp.val);
                        setCustomAmount('');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center ${
                        isSelected
                          ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F] font-bold shadow-xs'
                          : 'border-[#E8E2D5] bg-[#FFFDF8] text-[#2D3142] hover:border-[#7A9A8B]'
                      }`}
                    >
                      <span className="text-sm font-extrabold">{qp.label}</span>
                      <span className="text-[10px] text-[#2D3142]/60 mt-0.5 leading-tight">
                        {qp.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom amount */}
              <div className="mt-2.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#2D3142]/60">
                    RM
                  </span>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="Or enter custom amount (e.g. 200)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      if (e.target.value) setAmount(0);
                    }}
                    className="w-full pl-11 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
                  />
                </div>
              </div>
            </div>

            {/* Category Preference */}
            <div>
              <label className="block text-xs font-bold text-[#2D3142] mb-1.5 uppercase tracking-wider">
                Direct Funds To
              </label>
              <select
                value={categoryPref}
                onChange={(e) => setCategoryPref(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-xs sm:text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
              >
                <option value="vetBills">Emergency Vet Bills & Spay/Neuter (Highest Priority)</option>
                <option value="catFood">Nutritious Food & Recovery Mousse</option>
                <option value="tofuLitter">Dust-Free Tofu Litter Supply</option>
                <option value="vitamins">Vitamins, Joint Support & Eye Drops</option>
              </select>
            </div>

            {/* Donor Name & Anonymous Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#2D3142]">
                  Your Name (or Nickname)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#2D3142]/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-[#E07A5F] focus:ring-0"
                  />
                  <span>Post anonymously</span>
                </label>
              </div>
              <input
                type="text"
                disabled={isAnonymous}
                placeholder="e.g. Maya & Daniel"
                value={isAnonymous ? '' : donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-xs sm:text-sm text-[#2D3142] disabled:bg-stone-100 disabled:text-stone-400 focus:outline-hidden focus:border-[#7A9A8B]"
              />
            </div>

            {/* Heartfelt Note */}
            <div>
              <label className="block text-xs font-bold text-[#2D3142] mb-1">
                Heartfelt Encouragement Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Keep healing little warriors! Sending warm purrs."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FFFDF8] text-xs sm:text-sm text-[#2D3142] focus:outline-hidden focus:border-[#7A9A8B]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-[#E07A5F] hover:bg-[#C9664C] text-white font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-white/20" />
                Confirm Pledge of RM {customAmount || amount}
              </button>
              <p className="text-[11px] text-[#2D3142]/60 text-center mt-2">
                Instantly updates our live monthly impact tracker progress bar!
              </p>
            </div>
          </form>
        )}

        {/* Tab 2: Bank Direct Transfer */}
        {activeTab === 'bank' && (
          <div className="p-6 space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-[#F8F5EE] rounded-2xl border border-[#E8E2D5] space-y-3">
              <div className="flex items-center gap-2 text-[#5A7A6B] font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Official Rescue Account (Malaysia)
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center py-1.5 border-b border-[#E8E2D5]">
                  <span className="text-[#2D3142]/60 font-sans">Bank Name:</span>
                  <span className="font-bold text-[#2D3142]">Maybank (Malayan Banking Berhad)</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-[#E8E2D5]">
                  <span className="text-[#2D3142]/60 font-sans">Account Name:</span>
                  <span className="font-bold text-[#2D3142]">PHERBIES CAFE ENTERPRISE</span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#2D3142]/60 font-sans">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E07A5F] text-base">5123 4567 8901</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('512345678901', 'Account Number')}
                      className="p-1 rounded-md bg-[#FFFDF8] border border-[#E8E2D5] hover:bg-stone-100 text-[#2D3142] transition-colors"
                      title="Copy Account Number"
                    >
                      {copiedField === 'Account Number' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <strong>Transfer Reference:</strong>
              <p>Please include "PHERBIES RESCUE" or the specific cat's name in your transfer recipient reference.</p>
              <p>WhatsApp your receipt to our rescue hotline for official acknowledgment: +60 12-345 6789.</p>
            </div>
          </div>
        )}

        {/* Tab 3: DuitNow / Touch 'n Go QR */}
        {activeTab === 'qr' && (
          <div className="p-6 text-center space-y-4">
            <div className="max-w-xs mx-auto p-5 bg-[#FFFDF8] rounded-2xl border-2 border-[#E07A5F]/30 shadow-md">
              <div className="flex items-center justify-between mb-3 border-b border-[#E8E2D5] pb-2">
                <span className="text-xs font-bold text-[#E07A5F]">DuitNow QR</span>
                <span className="text-[11px] font-semibold text-[#5A7A6B]">Touch 'n Go & All MY Banks</span>
              </div>

              {/* Realistic QR representation */}
              <div className="w-48 h-48 mx-auto bg-stone-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative">
                <QrCode className="w-36 h-36 text-white" />
                <div className="text-[9px] font-mono tracking-widest text-[#E8E2D5] uppercase mt-1">
                  PHERBIES CAFE RESCUE
                </div>
              </div>

              <div className="mt-3 text-xs text-[#2D3142]">
                <div className="font-bold">Scan with any Malaysian Banking App</div>
                <div className="text-[11px] text-[#2D3142]/60 mt-0.5">
                  Maybank MAE, CIMB OCTO, Touch 'n Go eWallet, GrabPay
                </div>
              </div>
            </div>

            <p className="text-xs text-[#2D3142]/70 max-w-sm mx-auto">
              Screenshots or saved QR can be scanned directly in your eWallet app.
              All funds go toward this month's RM {appData.impact.monthlyTarget.toLocaleString()} medical and food target.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
