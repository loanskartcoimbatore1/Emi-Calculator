import React from 'react';
import { CurrencyCode } from '../types/loan';
import { CURRENCIES } from '../utils/calculations';
import { Bookmark, Download, Landmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'amortization' | 'sensitivity' | 'compare';
  setActiveTab: (tab: 'calculator' | 'amortization' | 'sensitivity' | 'compare') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  savedCount,
  onOpenSaved,
  onExportCsv,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-8 h-14 sm:h-16">
          {/* Zone 1: Brand wordmark (responsive text) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-600/30 shrink-0">
              <Landmark className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <a
              href="/"
              className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 truncate"
              title="Loanskart Smart EMI Calculator"
            >
              <span>Loanskart</span>{' '}
              <span className="font-semibold text-indigo-600 hidden xs:inline sm:inline">
                Smart EMI
              </span>
              <span className="font-semibold text-indigo-600 hidden md:inline">
                {' '}Calculator
              </span>
            </a>
          </div>

          {/* Zone 2: Desktop Navigation Links (Laptop / Desktop) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'calculator'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Loan & Prepayment
              {activeTab === 'calculator' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('amortization')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'amortization'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Amortization Schedule
              {activeTab === 'amortization' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('sensitivity')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'sensitivity'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Rate Stress Test
              {activeTab === 'sensitivity' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`transition-colors whitespace-nowrap py-1 relative ${
                activeTab === 'compare'
                  ? 'text-indigo-600 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Loan Comparison
              {activeTab === 'compare' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          </nav>

          {/* Zone 3: Currency & Actions (Touch friendly on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currency Selector */}
            <div className="relative">
              <label className="sr-only" htmlFor="currency-select">
                Currency
              </label>
              <select
                id="currency-select"
                value={currency}
                aria-label="Select currency"
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {(Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]).map((c) => (
                  <option key={c} value={c}>
                    {c} ({CURRENCIES[c].symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Saved Scenarios Button */}
            <button
              onClick={onOpenSaved}
              className="h-8 sm:h-9 flex items-center gap-1 px-2 sm:px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Saved Loan Plans"
            >
              <Bookmark className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="hidden xs:inline sm:inline">Saved</span>
              <span className="font-mono text-[11px] font-bold text-slate-900 bg-white/80 px-1 rounded">
                {savedCount}
              </span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={onExportCsv}
              className="h-8 sm:h-9 flex items-center gap-1 px-2.5 sm:px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
              title="Export Amortization Schedule to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Touch targets >= 44px) */}
        <div className="md:hidden flex items-center gap-1 py-1 overflow-x-auto border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Loan & Prepay
          </button>

          <button
            onClick={() => setActiveTab('amortization')}
            className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'amortization'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Amortization
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'sensitivity'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rate Sensitivity
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`min-h-[40px] px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'compare'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compare Loans
          </button>
        </div>
      </div>
    </header>
  );
};
