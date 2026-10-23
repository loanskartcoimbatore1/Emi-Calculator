import React, { useState } from 'react';
import { LoanInput, CurrencyCode, PrepaymentConfig } from '../types/loan';
import {
  computeLoanAmortization,
  formatCurrency,
  CURRENCIES,
} from '../utils/calculations';
import { Scale, Plus, Trash2, Check, ArrowRight } from 'lucide-react';

interface LoanComparisonModalProps {
  currentInput: LoanInput;
  currentPrepayment: PrepaymentConfig;
  currency: CurrencyCode;
}

interface Offer {
  id: string;
  name: string;
  principal: number;
  rate: number;
  years: number;
  prepayMonthly: number;
}

export const LoanComparisonView: React.FC<LoanComparisonModalProps> = ({
  currentInput,
  currentPrepayment,
  currency,
}) => {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'current',
      name: 'Current Plan (With Prepayment)',
      principal: currentInput.principal,
      rate: currentInput.annualRate,
      years: currentInput.tenureYears,
      prepayMonthly: currentPrepayment.enabled && currentPrepayment.recurringMonthlyEnabled
        ? currentPrepayment.recurringMonthlyAmount
        : 0,
    },
    {
      id: 'bank-b',
      name: 'Shorter 15-Year Term',
      principal: currentInput.principal,
      rate: Math.max(0.5, currentInput.annualRate - 0.5),
      years: 15,
      prepayMonthly: 0,
    },
    {
      id: 'bank-c',
      name: 'Aggressive Prepay Plan',
      principal: currentInput.principal,
      rate: currentInput.annualRate,
      years: currentInput.tenureYears,
      prepayMonthly: currency === 'INR' ? 10000 : 350,
    },
  ]);

  const updateOffer = (id: string, updates: Partial<Offer>) => {
    setOffers(offers.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const addOffer = () => {
    if (offers.length >= 4) return;
    const newOffer: Offer = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Scenario ${offers.length + 1}`,
      principal: currentInput.principal,
      rate: currentInput.annualRate,
      years: currentInput.tenureYears,
      prepayMonthly: 150,
    };
    setOffers([...offers, newOffer]);
  };

  const removeOffer = (id: string) => {
    if (offers.length <= 2) return;
    setOffers(offers.filter((o) => o.id !== id));
  };

  // Compute results for each offer
  const calculatedOffers = offers.map((offer) => {
    const input: LoanInput = {
      principal: offer.principal,
      annualRate: offer.rate,
      tenureYears: offer.years,
      tenureMonths: 0,
      startDate: currentInput.startDate,
      loanType: 'custom',
    };
    const prepay: PrepaymentConfig = {
      enabled: offer.prepayMonthly > 0,
      strategy: 'reduce-tenure',
      activeFrequency: 'monthly',
      recurringMonthlyEnabled: offer.prepayMonthly > 0,
      recurringMonthlyAmount: offer.prepayMonthly,
      recurringStartMonth: 1,
      recurringQuarterlyEnabled: false,
      recurringQuarterlyAmount: 0,
      recurringQuarterlyStartMonth: 3,
      recurringHalfYearlyEnabled: false,
      recurringHalfYearlyAmount: 0,
      recurringHalfYearlyStartMonth: 6,
      recurringYearlyEnabled: false,
      recurringYearlyAmount: 0,
      recurringYearlyMonth: 12,
      oneTimeEnabled: false,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
      customPayments: [],
    };
    const res = computeLoanAmortization(input, prepay);
    return {
      offer,
      res,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Loan Comparison Matrix</h2>
            <span className="text-xs text-slate-500 font-mono">({offers.length} Offers)</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare different lender interest rates, tenures, and monthly prepayment strategies side-by-side
          </p>
        </div>

        {offers.length < 4 && (
          <button
            type="button"
            onClick={addOffer}
            className="min-h-[34px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Scenario</span>
          </button>
        )}
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {calculatedOffers.map(({ offer, res }, idx) => {
          const isWinner =
            res.summary.revisedTotalInterest ===
            Math.min(...calculatedOffers.map((o) => o.res.summary.revisedTotalInterest));

          return (
            <div
              key={offer.id}
              className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
                isWinner
                  ? 'border-emerald-500 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={offer.name}
                      onChange={(e) => updateOffer(offer.id, { name: e.target.value })}
                      className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none w-full"
                    />
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-0.5">
                        <Check className="w-3 h-3" /> Lowest Total Cost
                      </span>
                    )}
                  </div>
                  {offers.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOffer(offer.id)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Offer Input Controls */}
                <div className="space-y-2.5 text-xs pb-4 border-b border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-500" htmlFor={`offer-principal-${offer.id}`}>Principal</label>
                    <input
                      id={`offer-principal-${offer.id}`}
                      type="number"
                      step="5000"
                      value={offer.principal}
                      onChange={(e) =>
                        updateOffer(offer.id, { principal: Number(e.target.value) })
                      }
                      className="w-28 text-right font-mono font-bold text-slate-900 rounded border border-slate-200 px-2 py-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-slate-500" htmlFor={`offer-rate-${offer.id}`}>Rate (%)</label>
                    <input
                      id={`offer-rate-${offer.id}`}
                      type="number"
                      step="0.1"
                      value={offer.rate}
                      onChange={(e) => updateOffer(offer.id, { rate: Number(e.target.value) })}
                      className="w-20 text-right font-mono font-bold text-slate-900 rounded border border-slate-200 px-2 py-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-slate-500" htmlFor={`offer-tenure-${offer.id}`}>Term (Years)</label>
                    <input
                      id={`offer-tenure-${offer.id}`}
                      type="number"
                      min="1"
                      max="40"
                      value={offer.years}
                      onChange={(e) => updateOffer(offer.id, { years: Number(e.target.value) })}
                      className="w-20 text-right font-mono font-bold text-slate-900 rounded border border-slate-200 px-2 py-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-slate-500" htmlFor={`offer-prepay-${offer.id}`}>Extra Prepay/Mo</label>
                    <input
                      id={`offer-prepay-${offer.id}`}
                      type="number"
                      step="50"
                      value={offer.prepayMonthly}
                      onChange={(e) =>
                        updateOffer(offer.id, { prepayMonthly: Number(e.target.value) })
                      }
                      className="w-24 text-right font-mono font-bold text-emerald-700 rounded border border-slate-200 px-2 py-0.5"
                    />
                  </div>
                </div>

                {/* Offer Results Card */}
                <div className="pt-4 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Monthly EMI:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(res.summary.originalMonthlyEmi, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Total Interest:</span>
                    <span className={`font-bold ${isWinner ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {formatCurrency(res.summary.revisedTotalInterest, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Effective Tenure:</span>
                    <span className="font-bold text-slate-900">
                      {Math.floor(res.summary.revisedTenureMonths / 12)}y {res.summary.revisedTenureMonths % 12}m
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans">Total Outlay:</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(res.summary.revisedTotalPayment, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {res.summary.interestSaved > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-emerald-800 font-medium">
                  Saves {formatCurrency(res.summary.interestSaved, currency)} and cuts term by{' '}
                  {Math.floor(res.summary.timeSavedMonths / 12)}y {res.summary.timeSavedMonths % 12}m
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
