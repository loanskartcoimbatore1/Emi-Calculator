import React, { useState } from 'react';
import {
  PrepaymentConfig,
  PrepaymentStrategy,
  CustomPrepayment,
  CurrencyCode,
  PrepaymentFrequency,
} from '../types/loan';
import {
  formatCurrency,
  CURRENCIES,
  parseDate,
  addMonths,
  formatMonthYear,
} from '../utils/calculations';
import {
  Sparkles,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Zap,
  TrendingDown,
  ArrowRight,
  Repeat,
  Check,
} from 'lucide-react';

interface PrepaymentManagerProps {
  prepayment: PrepaymentConfig;
  onChange: (updated: PrepaymentConfig) => void;
  currency: CurrencyCode;
  totalLoanMonths: number;
  startDateStr: string;
  interestSaved: number;
  timeSavedMonths: number;
  newPayoffDate: string;
  originalPayoffDate: string;
  totalPrepaymentMade: number;
}

export const PrepaymentManager: React.FC<PrepaymentManagerProps> = ({
  prepayment,
  onChange,
  currency,
  totalLoanMonths,
  startDateStr,
  interestSaved,
  timeSavedMonths,
  newPayoffDate,
  originalPayoffDate,
  totalPrepaymentMade,
}) => {
  const currencySymbol = CURRENCIES[currency]?.symbol || '$';
  const startDate = parseDate(startDateStr);

  const [activeSegment, setActiveSegment] = useState<PrepaymentFrequency>(
    prepayment.activeFrequency || 'monthly'
  );

  const setSegment = (freq: PrepaymentFrequency) => {
    setActiveSegment(freq);
    onChange({ ...prepayment, activeFrequency: freq });
  };

  // Helper to format month
  const getMonthDateLabel = (m: number) => {
    const d = addMonths(startDate, m - 1);
    return `Month ${m} (${formatMonthYear(d)})`;
  };

  const handleMasterToggle = () => {
    onChange({
      ...prepayment,
      enabled: !prepayment.enabled,
    });
  };

  const setStrategy = (strategy: PrepaymentStrategy) => {
    onChange({ ...prepayment, strategy });
  };

  // Add custom payment
  const addCustomPayment = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const defaultMonth = Math.min(12, totalLoanMonths);
    const defaultAmount = currency === 'INR' ? 50000 : 2000;
    const newPayments: CustomPrepayment[] = [
      ...(prepayment.customPayments || []),
      {
        id: newId,
        month: defaultMonth,
        amount: defaultAmount,
        note: `Prepayment at Month ${defaultMonth}`,
      },
    ];
    onChange({ ...prepayment, customPayments: newPayments });
  };

  const removeCustomPayment = (id: string) => {
    const filtered = (prepayment.customPayments || []).filter((p) => p.id !== id);
    onChange({ ...prepayment, customPayments: filtered });
  };

  const updateCustomPayment = (id: string, updates: Partial<CustomPrepayment>) => {
    const updated = (prepayment.customPayments || []).map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    onChange({ ...prepayment, customPayments: updated });
  };

  const timeSavedYears = Math.floor(timeSavedMonths / 12);
  const timeSavedRemainingMonths = timeSavedMonths % 12;

  // Segment configuration tabs
  const segments: {
    id: PrepaymentFrequency;
    label: string;
    subLabel: string;
    isEnabled: boolean;
  }[] = [
    {
      id: 'monthly',
      label: 'Monthly',
      subLabel: 'Every Month',
      isEnabled: prepayment.recurringMonthlyEnabled,
    },
    {
      id: 'quarterly',
      label: 'Quarterly',
      subLabel: 'Every 3 Mos',
      isEnabled: prepayment.recurringQuarterlyEnabled,
    },
    {
      id: 'half-yearly',
      label: 'Half-Yearly',
      subLabel: 'Every 6 Mos',
      isEnabled: prepayment.recurringHalfYearlyEnabled,
    },
    {
      id: 'yearly',
      label: 'Yearly',
      subLabel: 'Annual (12M)',
      isEnabled: prepayment.recurringYearlyEnabled,
    },
    {
      id: 'one-time',
      label: 'One-Time',
      subLabel: 'Lump Sum',
      isEnabled: prepayment.oneTimeEnabled,
    },
    {
      id: 'custom',
      label: 'Custom',
      subLabel: 'Milestones',
      isEnabled: (prepayment.customPayments || []).length > 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      {/* Header & Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Prepayment Simulator
              </h2>
              {prepayment.enabled && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate Monthly, Quarterly, Half-Yearly, and Annual early payments
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMasterToggle}
          className={`min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
            prepayment.enabled
              ? 'bg-slate-900 text-white hover:bg-slate-800'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/10'
          }`}
        >
          {prepayment.enabled ? 'Disable Prepayment' : 'Enable Prepayment'}
        </button>
      </div>

      {prepayment.enabled && (
        <div className="mt-5 space-y-6">
          {/* Strategy Selection: Reduce Tenure vs Reduce EMI */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-2">
              Prepayment Impact Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStrategy('reduce-tenure')}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all min-h-[50px] ${
                  prepayment.strategy === 'reduce-tenure'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Reduce Loan Tenure (Recommended)
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                    Max Savings
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep regular EMI constant and finish the loan years ahead of schedule.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStrategy('reduce-emi')}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all min-h-[50px] ${
                  prepayment.strategy === 'reduce-emi'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">Reduce Monthly EMI</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                    Lower EMI
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Keep original maturity date and lower subsequent monthly installments immediately.
                </p>
              </button>
            </div>
          </div>

          {/* Segment-Wise Prepayment Frequency Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Prepayment Frequency Segments
              </label>
              <div className="text-[11px] text-slate-500 hidden sm:block">
                Select frequency to set amounts & timing
              </div>
            </div>

            {/* Segmented Control Bar: Horizontal swipe on mobile, clean grid on laptop */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-6">
              {segments.map((seg) => {
                const isActive = activeSegment === seg.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => setSegment(seg.id)}
                    className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-lg text-xs transition-all shrink-0 sm:shrink min-w-[85px] sm:min-w-0 min-h-[44px] ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="whitespace-nowrap">{seg.label}</span>
                      {seg.isEnabled && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                          title="Active"
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal whitespace-nowrap">
                      {seg.subLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Segment Detailed Panel */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            {/* SEGMENT 1: MONTHLY */}
            {activeSegment === 'monthly' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      id="enable-monthly"
                      type="checkbox"
                      checked={prepayment.recurringMonthlyEnabled}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringMonthlyEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="enable-monthly"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      Monthly Prepayment (Extra Every Month)
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    Paid along with regular monthly EMI
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recurring-monthly-amount"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Extra Monthly Amount
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-bold text-sm">
                          {currencySymbol}
                        </span>
                      </div>
                      <input
                        id="recurring-monthly-amount"
                        type="number"
                        min="10"
                        step="50"
                        value={prepayment.recurringMonthlyAmount || ''}
                        onChange={(e) =>
                          onChange({
                            ...prepayment,
                            recurringMonthlyEnabled: true,
                            recurringMonthlyAmount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        placeholder="250"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[100, 250, 500, 1000].map((preset) => {
                        const val = currency === 'INR' ? preset * 50 : preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...prepayment,
                                recurringMonthlyEnabled: true,
                                recurringMonthlyAmount: val,
                              })
                            }
                            className="min-h-[30px] px-2.5 py-1 text-[11px] font-mono rounded-md bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                          >
                            +{formatCurrency(val, currency)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="recurring-start-month"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Start Month
                    </label>
                    <select
                      id="recurring-start-month"
                      value={prepayment.recurringStartMonth || 1}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringStartMonth: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      {Array.from(
                        { length: Math.min(24, totalLoanMonths) },
                        (_, i) => i + 1
                      ).map((m) => (
                        <option key={m} value={m}>
                          {getMonthDateLabel(m)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Will add this extra amount to every EMI until the loan is fully paid off.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT 2: QUARTERLY */}
            {activeSegment === 'quarterly' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      id="enable-quarterly"
                      type="checkbox"
                      checked={prepayment.recurringQuarterlyEnabled}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringQuarterlyEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="enable-quarterly"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      Quarterly Prepayment (Every 3 Months)
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    Paid 4 times a year (Months 3, 6, 9, 12...)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recurring-quarterly-amount"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Quarterly Prepayment Amount
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-bold text-sm">
                          {currencySymbol}
                        </span>
                      </div>
                      <input
                        id="recurring-quarterly-amount"
                        type="number"
                        min="50"
                        step="100"
                        value={prepayment.recurringQuarterlyAmount || ''}
                        onChange={(e) =>
                          onChange({
                            ...prepayment,
                            recurringQuarterlyEnabled: true,
                            recurringQuarterlyAmount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        placeholder="1000"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[500, 1000, 2000, 5000].map((preset) => {
                        const val = currency === 'INR' ? preset * 30 : preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...prepayment,
                                recurringQuarterlyEnabled: true,
                                recurringQuarterlyAmount: val,
                              })
                            }
                            className="min-h-[30px] px-2.5 py-1 text-[11px] font-mono rounded-md bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                          >
                            +{formatCurrency(val, currency)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="recurring-quarterly-start"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      First Quarterly Payment Month
                    </label>
                    <select
                      id="recurring-quarterly-start"
                      value={prepayment.recurringQuarterlyStartMonth || 3}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringQuarterlyStartMonth: Number(e.target.value),
                        })
                      }
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      <option value={3}>Month 3 (Q1 End: Months 3, 6, 9, 12...)</option>
                      <option value={1}>Month 1 (Immediate: Months 1, 4, 7, 10...)</option>
                      <option value={6}>Month 6 (Mid-Year Start: Months 6, 9, 12...)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Ideal for quarterly incentives, dividends, or performance milestones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT 3: HALF-YEARLY / OFF-YEARLY */}
            {activeSegment === 'half-yearly' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      id="enable-half-yearly"
                      type="checkbox"
                      checked={prepayment.recurringHalfYearlyEnabled}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringHalfYearlyEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="enable-half-yearly"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      Half-Yearly / Off-Yearly Prepayment (Every 6 Months)
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    Paid twice a year (Months 6, 12, 18, 24...)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recurring-half-yearly-amount"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Half-Yearly Prepayment Amount
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-bold text-sm">
                          {currencySymbol}
                        </span>
                      </div>
                      <input
                        id="recurring-half-yearly-amount"
                        type="number"
                        min="100"
                        step="500"
                        value={prepayment.recurringHalfYearlyAmount || ''}
                        onChange={(e) =>
                          onChange({
                            ...prepayment,
                            recurringHalfYearlyEnabled: true,
                            recurringHalfYearlyAmount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        placeholder="2500"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[1000, 2500, 5000, 10000].map((preset) => {
                        const val = currency === 'INR' ? preset * 25 : preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...prepayment,
                                recurringHalfYearlyEnabled: true,
                                recurringHalfYearlyAmount: val,
                              })
                            }
                            className="min-h-[30px] px-2.5 py-1 text-[11px] font-mono rounded-md bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                          >
                            +{formatCurrency(val, currency)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="recurring-half-yearly-start"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      First Half-Yearly Payment Month
                    </label>
                    <select
                      id="recurring-half-yearly-start"
                      value={prepayment.recurringHalfYearlyStartMonth || 6}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringHalfYearlyStartMonth: Number(e.target.value),
                        })
                      }
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      <option value={6}>Month 6 (Mid-Year: Months 6, 12, 18, 24...)</option>
                      <option value={3}>Month 3 (Quarterly Offset: Months 3, 9, 15...)</option>
                      <option value={12}>Month 12 (Year 1 End: Months 12, 18, 24...)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Great for biannual appraisal bonuses or semi-annual surplus allocations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT 4: YEARLY / ANNUAL */}
            {activeSegment === 'yearly' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      id="enable-yearly"
                      type="checkbox"
                      checked={prepayment.recurringYearlyEnabled}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringYearlyEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="enable-yearly"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      Yearly / Annual Prepayment (Every 12 Months)
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    Paid once each year (Months 12, 24, 36...)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="recurring-yearly-amount"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Annual Prepayment Amount
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-bold text-sm">
                          {currencySymbol}
                        </span>
                      </div>
                      <input
                        id="recurring-yearly-amount"
                        type="number"
                        min="200"
                        step="1000"
                        value={prepayment.recurringYearlyAmount || ''}
                        onChange={(e) =>
                          onChange({
                            ...prepayment,
                            recurringYearlyEnabled: true,
                            recurringYearlyAmount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        placeholder="5000"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[2500, 5000, 10000, 20000].map((preset) => {
                        const val = currency === 'INR' ? preset * 20 : preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...prepayment,
                                recurringYearlyEnabled: true,
                                recurringYearlyAmount: val,
                              })
                            }
                            className="min-h-[30px] px-2.5 py-1 text-[11px] font-mono rounded-md bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                          >
                            +{formatCurrency(val, currency)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="recurring-yearly-timing"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Annual Payment Timing
                    </label>
                    <select
                      id="recurring-yearly-timing"
                      value={prepayment.recurringYearlyMonth || 12}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          recurringYearlyMonth: Number(e.target.value),
                        })
                      }
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value={12}>Every 12th Month (Year-End / Anniversary)</option>
                      <option value={3}>Every March (Financial Year-End / Tax Refund)</option>
                      <option value={6}>Every June (Mid-Year)</option>
                      <option value={10}>Every October (Festive / Autumn Bonus)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Aligns with annual performance bonuses, tax returns, or fixed deposit maturities.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT 5: ONE-TIME */}
            {activeSegment === 'one-time' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <input
                      id="enable-lump"
                      type="checkbox"
                      checked={prepayment.oneTimeEnabled}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          oneTimeEnabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label
                      htmlFor="enable-lump"
                      className="text-xs font-bold text-slate-900 cursor-pointer"
                    >
                      One-Time Lump Sum Prepayment
                    </label>
                  </div>
                  <span className="text-xs text-slate-500">
                    Single capital injection into principal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="one-time-amount"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Lump Sum Amount
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 font-bold text-sm">
                          {currencySymbol}
                        </span>
                      </div>
                      <input
                        id="one-time-amount"
                        type="number"
                        min="500"
                        step="1000"
                        value={prepayment.oneTimeAmount || ''}
                        onChange={(e) =>
                          onChange({
                            ...prepayment,
                            oneTimeEnabled: true,
                            oneTimeAmount: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-base font-semibold font-mono tabular-nums text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 bg-white"
                        placeholder="10000"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[2000, 5000, 10000, 25000].map((preset) => {
                        const val = currency === 'INR' ? preset * 25 : preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() =>
                              onChange({
                                ...prepayment,
                                oneTimeEnabled: true,
                                oneTimeAmount: val,
                              })
                            }
                            className="min-h-[30px] px-2.5 py-1 text-[11px] font-mono rounded-md bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
                          >
                            +{formatCurrency(val, currency)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="one-time-month"
                      className="text-xs font-semibold text-slate-700 block mb-1.5"
                    >
                      Apply in Loan Month
                    </label>
                    <select
                      id="one-time-month"
                      value={prepayment.oneTimeMonth || 12}
                      onChange={(e) =>
                        onChange({
                          ...prepayment,
                          oneTimeMonth: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                    >
                      {Array.from(
                        { length: Math.min(60, totalLoanMonths) },
                        (_, i) => i + 1
                      ).map((m) => (
                        <option key={m} value={m}>
                          {getMonthDateLabel(m)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Single capital payment directly knocks off outstanding loan principal in that month.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEGMENT 6: CUSTOM */}
            {activeSegment === 'custom' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Custom Milestone Schedule
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Add ad-hoc prepayments at specific target months in your loan timeline
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomPayment}
                    className="min-h-[34px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {(!prepayment.customPayments || prepayment.customPayments.length === 0) ? (
                  <div className="text-center py-6 bg-white rounded-lg border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500">
                      No custom milestone payments configured yet.
                    </p>
                    <button
                      type="button"
                      onClick={addCustomPayment}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                    >
                      Click here to add your first custom milestone
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {prepayment.customPayments.map((cp) => (
                      <div
                        key={cp.id}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200"
                      >
                        <div className="w-full sm:w-32">
                          <label
                            className="sr-only"
                            htmlFor={`custom-payment-month-${cp.id}`}
                          >
                            Milestone Month
                          </label>
                          <select
                            id={`custom-payment-month-${cp.id}`}
                            value={cp.month}
                            onChange={(e) =>
                              updateCustomPayment(cp.id, {
                                month: Number(e.target.value),
                              })
                            }
                            className="w-full text-xs font-mono font-medium rounded-lg border border-slate-200 py-2 px-2 text-slate-700 bg-white"
                          >
                            {Array.from({ length: totalLoanMonths }, (_, i) => i + 1).map(
                              (m) => (
                                <option key={m} value={m}>
                                  Mo. {m}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <div className="relative flex-1">
                          <label
                            className="sr-only"
                            htmlFor={`custom-payment-amount-${cp.id}`}
                          >
                            Milestone Amount
                          </label>
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                            <span className="text-slate-400 font-bold text-xs">
                              {currencySymbol}
                            </span>
                          </div>
                          <input
                            id={`custom-payment-amount-${cp.id}`}
                            type="number"
                            min="100"
                            step="500"
                            value={cp.amount}
                            onChange={(e) =>
                              updateCustomPayment(cp.id, {
                                amount: Math.max(0, Number(e.target.value)),
                              })
                            }
                            className="w-full pl-6 pr-2 py-2 text-xs font-mono font-semibold rounded-lg border border-slate-200 bg-white"
                            placeholder="Amount"
                          />
                        </div>

                        <div className="w-full sm:w-48">
                          <label
                            className="sr-only"
                            htmlFor={`custom-payment-note-${cp.id}`}
                          >
                            Milestone Note
                          </label>
                          <input
                            id={`custom-payment-note-${cp.id}`}
                            type="text"
                            value={cp.note || ''}
                            onChange={(e) =>
                              updateCustomPayment(cp.id, { note: e.target.value })
                            }
                            className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                            placeholder="e.g. Tax return, Bonus"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeCustomPayment(cp.id)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors self-end sm:self-center"
                          title="Remove milestone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Real-Time Impact Teaser Banner (Fully responsive on mobile and laptop) */}
          <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/90 p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex flex-wrap items-center gap-1.5">
                    <span>Prepayment Impact Calculated</span>
                    <span className="text-emerald-700 hidden xs:inline">·</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      Total Extra Paid: {formatCurrency(totalPrepaymentMade, currency)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    {prepayment.strategy === 'reduce-tenure' ? (
                      <>
                        You will save{' '}
                        <strong className="font-bold underline decoration-emerald-500">
                          {formatCurrency(interestSaved, currency)}
                        </strong>{' '}
                        in interest and become debt-free{' '}
                        <strong>
                          {timeSavedYears > 0 ? `${timeSavedYears} yrs ` : ''}
                          {timeSavedRemainingMonths > 0
                            ? `${timeSavedRemainingMonths} mos`
                            : ''}
                          {timeSavedYears === 0 && timeSavedRemainingMonths === 0
                            ? 'faster'
                            : ' earlier'}
                        </strong>
                        !
                      </>
                    ) : (
                      <>
                        You will save{' '}
                        <strong className="font-bold">
                          {formatCurrency(interestSaved, currency)}
                        </strong>{' '}
                        in interest while lowering your recurring monthly payment!
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto bg-white/90 px-3.5 py-2 rounded-lg border border-emerald-200 text-xs shrink-0 justify-between sm:justify-start">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">
                    New Payoff Date
                  </div>
                  <div className="font-bold font-mono text-emerald-700 text-sm">
                    {newPayoffDate}
                  </div>
                </div>
                <div className="text-slate-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="text-right sm:text-left text-slate-400">
                  <div className="text-[10px] uppercase font-medium">Original</div>
                  <div className="font-mono text-xs line-through">
                    {originalPayoffDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
