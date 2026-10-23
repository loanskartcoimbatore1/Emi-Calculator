import React from 'react';
import { LoanComparisonSummary, CurrencyCode, PrepaymentConfig } from '../types/loan';
import { formatCurrency, formatCompactNumber } from '../utils/calculations';
import {
  TrendingDown,
  CalendarCheck,
  PiggyBank,
  CheckCircle2,
  Clock,
  ArrowDownRight,
} from 'lucide-react';

interface ResultsSummaryProps {
  summary: LoanComparisonSummary;
  currency: CurrencyCode;
  prepayment: PrepaymentConfig;
  principal: number;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  summary,
  currency,
  prepayment,
  principal,
}) => {
  const isPrepayActive =
    prepayment.enabled && (summary.interestSaved > 0 || summary.timeSavedMonths > 0);

  // Donut chart calculations
  const totalOutlay = isPrepayActive
    ? summary.revisedTotalPayment
    : summary.originalTotalPayment;
  const totalInterest = isPrepayActive
    ? summary.revisedTotalInterest
    : summary.originalTotalInterest;
  const principalPercent = totalOutlay > 0 ? (principal / totalOutlay) * 100 : 0;
  const interestPercent = totalOutlay > 0 ? (totalInterest / totalOutlay) * 100 : 0;

  // SVG Donut parameters
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = (interestPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Financial Outcome
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated monthly installments, total interest, and prepayment yield
          </p>
        </div>

        {isPrepayActive && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
            <PiggyBank className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Savings Applied</span>
          </div>
        )}
      </div>

      {/* Hero KPI Grid (1 col on mobile, 2 on tablet, 3 on laptop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-5">
        {/* Monthly EMI Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Monthly EMI</span>
            <span className="font-mono text-[11px]">per month</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(
              isPrepayActive && prepayment.strategy === 'reduce-emi'
                ? summary.withPrepaymentEmi
                : summary.originalMonthlyEmi,
              currency
            )}
          </div>

          {isPrepayActive && prepayment.strategy === 'reduce-emi' && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              <span>Reduced from {formatCurrency(summary.originalMonthlyEmi, currency)}/mo</span>
            </div>
          )}

          {isPrepayActive && prepayment.strategy === 'reduce-tenure' && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Regular EMI remains constant</span>
            </div>
          )}

          {!isPrepayActive && (
            <p className="text-[11px] text-slate-500 mt-2">
              Standard equated monthly installment
            </p>
          )}
        </div>

        {/* Total Interest Payable Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Interest</span>
            <span className="font-mono text-[11px]">
              {interestPercent.toFixed(1)}% of total
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalInterest, currency)}
          </div>

          {isPrepayActive ? (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <TrendingDown className="w-3.5 h-3.5 shrink-0" />
              <span>Down from {formatCurrency(summary.originalTotalInterest, currency)}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 mt-2">
              Cost of borrowing over entire tenure
            </p>
          )}
        </div>

        {/* Total Loan Cost / Payoff Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Loan Outlay</span>
            <span className="font-mono text-[11px]">Principal + Interest</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalOutlay, currency)}
          </div>

          <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              Payoff:{' '}
              <strong className="font-semibold text-slate-900">
                {isPrepayActive ? summary.revisedPayoffDate : summary.originalPayoffDate}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Prepayment Spotlight Showcase (When Active) */}
      {isPrepayActive && (
        <div className="mt-5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-300/80 p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prepayment Benefit Breakdown</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
                {formatCurrency(summary.interestSaved, currency)} Total Interest Saved
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                By investing an additional {formatCurrency(summary.totalPrepaymentMade, currency)} through early prepayments, you reduce your interest expense by{' '}
                <strong className="font-bold">{summary.percentageInterestSaved.toFixed(1)}%</strong>.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              {/* Term Saved Box */}
              {prepayment.strategy === 'reduce-tenure' && (
                <div className="flex-1 sm:flex-initial bg-white/90 backdrop-blur-xs px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-emerald-200/90 shadow-2xs">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Term Shortened By</div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-900 font-mono">
                    {summary.timeSavedYears > 0 ? `${summary.timeSavedYears} Yrs ` : ''}
                    {summary.remainingMonthsPart > 0 ? `${summary.remainingMonthsPart} Mos` : ''}
                    {summary.timeSavedYears === 0 && summary.remainingMonthsPart === 0 ? '0 Mos' : ''}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {summary.revisedTenureMonths}m instead of {summary.originalTenureMonths}m
                  </div>
                </div>
              )}

              {/* Prepayment Multiplier Box */}
              <div className="flex-1 sm:flex-initial bg-white/90 backdrop-blur-xs px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-emerald-200/90 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Savings Multiplier</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-900 font-mono">
                  {summary.savingsRatio.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Interest saved per unit prepaid
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Composition Breakdown (Donut + Progress Bar) */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
        {/* Visual Donut Chart */}
        <div className="md:col-span-5 flex items-center gap-4 sm:gap-5 justify-center md:justify-start">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-200"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-indigo-600 transition-all duration-500"
                strokeWidth="14"
                strokeDasharray={`${principalStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-amber-500 transition-all duration-500"
                strokeWidth="14"
                strokeDasharray={`${interestStroke} ${circumference}`}
                strokeDashoffset={-principalStroke}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-slate-500">Principal</span>
              <span className="text-xs font-bold text-slate-800 font-mono">
                {principalPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-indigo-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-slate-500 text-[11px]">Principal Loan</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(principal, currency)} ({principalPercent.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-slate-500 text-[11px]">Interest Expense</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(totalInterest, currency)} ({interestPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Stacked Progress Bar & Comparison Table */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Capital Distribution</span>
            <span className="font-mono text-slate-500 text-[11px]">
              Total: {formatCurrency(totalOutlay, currency)}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${principalPercent}%` }}
              className="bg-indigo-600 h-full transition-all duration-500"
              title={`Principal: ${principalPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${interestPercent}%` }}
              className="bg-amber-500 h-full transition-all duration-500"
              title={`Interest: ${interestPercent.toFixed(1)}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Original Loan Term</div>
              <div className="font-bold text-slate-900 font-mono">
                {Math.floor(summary.originalTenureMonths / 12)} Yrs {summary.originalTenureMonths % 12} Mos
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{summary.originalPayoffDate}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
              <div className="text-[11px] text-slate-500">Effective Payoff Term</div>
              <div className={`font-bold font-mono ${isPrepayActive ? 'text-emerald-700' : 'text-slate-900'}`}>
                {Math.floor(summary.revisedTenureMonths / 12)} Yrs {summary.revisedTenureMonths % 12} Mos
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{summary.revisedPayoffDate}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
