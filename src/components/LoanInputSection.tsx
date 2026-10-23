import React from 'react';
import { LoanInput, LoanType, CurrencyCode } from '../types/loan';
import { formatCurrency, CURRENCIES } from '../utils/calculations';
import { Home, Car, User, GraduationCap, SlidersHorizontal, Calendar } from 'lucide-react';

interface LoanInputSectionProps {
  input: LoanInput;
  onChange: (updated: LoanInput) => void;
  currency: CurrencyCode;
}

export const LoanInputSection: React.FC<LoanInputSectionProps> = ({
  input,
  onChange,
  currency,
}) => {
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  const applyPreset = (type: LoanType) => {
    switch (type) {
      case 'home':
        onChange({
          ...input,
          loanType: 'home',
          principal: currency === 'INR' ? 4000000 : 350000,
          annualRate: currency === 'INR' ? 8.5 : 6.75,
          tenureYears: 20,
          tenureMonths: 0,
        });
        break;
      case 'car':
        onChange({
          ...input,
          loanType: 'car',
          principal: currency === 'INR' ? 1000000 : 35000,
          annualRate: currency === 'INR' ? 9.2 : 6.25,
          tenureYears: 5,
          tenureMonths: 0,
        });
        break;
      case 'personal':
        onChange({
          ...input,
          loanType: 'personal',
          principal: currency === 'INR' ? 300000 : 15000,
          annualRate: currency === 'INR' ? 12.5 : 10.99,
          tenureYears: 3,
          tenureMonths: 0,
        });
        break;
      case 'education':
        onChange({
          ...input,
          loanType: 'education',
          principal: currency === 'INR' ? 1500000 : 50000,
          annualRate: currency === 'INR' ? 9.5 : 5.8,
          tenureYears: 10,
          tenureMonths: 0,
        });
        break;
      case 'custom':
        onChange({ ...input, loanType: 'custom' });
        break;
    }
  };

  const handlePrincipalChange = (val: number) => {
    onChange({ ...input, principal: Math.max(0, val) });
  };

  const adjustPrincipal = (delta: number) => {
    onChange({ ...input, principal: Math.max(1000, input.principal + delta) });
  };

  // Slider bounds based on currency and loan type
  const maxPrincipal =
    currency === 'INR'
      ? Math.max(20000000, input.principal * 1.5)
      : Math.max(1500000, input.principal * 1.5);

  const presetList: { type: LoanType; label: string; icon: React.ReactNode }[] = [
    { type: 'home', label: 'Home Loan', icon: <Home className="w-3.5 h-3.5" /> },
    { type: 'car', label: 'Auto Loan', icon: <Car className="w-3.5 h-3.5" /> },
    { type: 'personal', label: 'Personal', icon: <User className="w-3.5 h-3.5" /> },
    { type: 'education', label: 'Education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { type: 'custom', label: 'Custom', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      {/* Header and Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Loan Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">Specify principal amount, interest rate, and term duration</p>
        </div>

        {/* Loan Type Presets (Smooth horizontal scroll on mobile, flex wrap on tablet/laptop) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200/60 overflow-x-auto no-scrollbar sm:flex-wrap">
          {presetList.map((preset) => {
            const isActive = input.loanType === preset.type;
            return (
              <button
                key={preset.type}
                type="button"
                onClick={() => applyPreset(preset.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {preset.icon}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6 pt-4 sm:pt-5">
        {/* Principal Amount */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label htmlFor="principal-amount-input" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Loan Amount
            </label>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => adjustPrincipal(currency === 'INR' ? 100000 : 10000)}
                className="min-h-[30px] px-2.5 py-1 rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                +{currency === 'INR' ? '1 Lakh' : '10k'}
              </button>
              <button
                type="button"
                onClick={() => adjustPrincipal(currency === 'INR' ? 500000 : 50000)}
                className="min-h-[30px] px-2.5 py-1 rounded-md text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                +{currency === 'INR' ? '5 Lakh' : '50k'}
              </button>
            </div>
          </div>

          <div className="relative rounded-lg shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <span className="text-slate-500 font-bold text-base sm:text-lg">{currencySymbol}</span>
            </div>
            <input
              id="principal-amount-input"
              type="number"
              min="1000"
              step="1000"
              value={input.principal || ''}
              onChange={(e) => handlePrincipalChange(Number(e.target.value))}
              className="block w-full rounded-lg border border-slate-300 pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              placeholder="100000"
            />
          </div>

          <div className="mt-3">
            <div className="py-1">
              <input
                type="range"
                min="5000"
                max={maxPrincipal}
                step="5000"
                value={input.principal}
                onChange={(e) => handlePrincipalChange(Number(e.target.value))}
                aria-label="Loan amount slider"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono tabular-nums mt-1">
              <span>{formatCurrency(5000, currency)}</span>
              <span className="font-semibold text-slate-700">{formatCurrency(input.principal, currency)}</span>
              <span>{formatCurrency(maxPrincipal, currency)}</span>
            </div>
          </div>
        </div>

        {/* Rate & Tenure Grid (1 col on mobile, 2 cols on laptop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Annual Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="interest-rate-input" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Interest Rate (% p.a.)
              </label>
              <span className="text-xs font-mono font-semibold text-indigo-700">
                {input.annualRate.toFixed(2)}% / yr
              </span>
            </div>

            <div className="relative rounded-lg shadow-xs">
              <input
                id="interest-rate-input"
                type="number"
                min="0.1"
                max="30"
                step="0.05"
                value={input.annualRate || ''}
                onChange={(e) => onChange({ ...input, annualRate: Number(e.target.value) })}
                className="block w-full rounded-lg border border-slate-300 pl-3.5 pr-8 py-2.5 text-base font-semibold text-slate-900 font-mono tabular-nums focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                placeholder="7.5"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-slate-400 font-medium text-xs">%</span>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.1"
                  value={input.annualRate}
                  onChange={(e) => onChange({ ...input, annualRate: Number(e.target.value) })}
                  aria-label="Interest rate slider"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                <span>1%</span>
                <span>12%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tenure-years-input" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Loan Tenure
              </label>
              <span className="text-xs font-mono font-semibold text-indigo-700">
                {input.tenureYears * 12 + input.tenureMonths} Months Total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="relative rounded-lg shadow-xs">
                  <input
                    id="tenure-years-input"
                    type="number"
                    min="1"
                    max="40"
                    value={input.tenureYears}
                    onChange={(e) => onChange({ ...input, tenureYears: Math.max(1, Number(e.target.value)) })}
                    className="block w-full rounded-lg border border-slate-300 pl-3 pr-11 py-2.5 text-base font-semibold text-slate-900 font-mono tabular-nums focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <span className="text-slate-500 text-xs font-medium">Yrs</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative rounded-lg shadow-xs">
                  <label className="sr-only" htmlFor="tenure-months-input">Tenure Months</label>
                  <input
                    id="tenure-months-input"
                    type="number"
                    min="0"
                    max="11"
                    value={input.tenureMonths}
                    onChange={(e) => onChange({ ...input, tenureMonths: Math.max(0, Math.min(11, Number(e.target.value))) })}
                    className="block w-full rounded-lg border border-slate-300 pl-3 pr-11 py-2.5 text-base font-semibold text-slate-900 font-mono tabular-nums focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                    <span className="text-slate-500 text-xs font-medium">Mos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2.5">
              <div className="py-1">
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={input.tenureYears}
                  onChange={(e) => onChange({ ...input, tenureYears: Number(e.target.value) })}
                  aria-label="Tenure in years slider"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums mt-1">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Date Selector */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-medium">Loan Start Month / First EMI:</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="sr-only" htmlFor="loan-start-date">Loan Start Date</label>
            <input
              id="loan-start-date"
              type="month"
              value={input.startDate}
              onChange={(e) => onChange({ ...input, startDate: e.target.value })}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
