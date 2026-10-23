import React from 'react';
import { CurrencyCode, LoanInput } from '../types/loan';
import { calculateRateSensitivity, formatCurrency, formatCompactNumber } from '../utils/calculations';
import { ShieldAlert, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RateSensitivityProps {
  input: LoanInput;
  currency: CurrencyCode;
}

export const RateSensitivity: React.FC<RateSensitivityProps> = ({ input, currency }) => {
  const totalMonths = input.tenureYears * 12 + input.tenureMonths;
  const items = calculateRateSensitivity(input.principal, input.annualRate, totalMonths);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Interest Rate Sensitivity & Stress Test</h2>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Base: {input.annualRate.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model how floating benchmark rate fluctuations will impact your monthly installment and total repayment
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left text-xs border-collapse min-w-[550px] sm:min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Rate Change</th>
              <th className="py-2.5 px-3">Effective Rate</th>
              <th className="py-2.5 px-3 text-right">Monthly EMI</th>
              <th className="py-2.5 px-3 text-right">Monthly Difference</th>
              <th className="py-2.5 px-3 text-right">Total Interest</th>
              <th className="py-2.5 px-3 text-right">Total Outlay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((row) => {
              const isBase = row.rateDelta === 0;
              const isIncrease = row.rateDelta > 0;
              const isDecrease = row.rateDelta < 0;

              return (
                <tr
                  key={row.rateDelta}
                  className={`transition-colors font-mono ${
                    isBase
                      ? 'bg-indigo-50/70 font-semibold text-slate-900 border-y border-indigo-200'
                      : 'hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    {isBase ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-bold font-sans">
                        Current Rate
                      </span>
                    ) : isIncrease ? (
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{row.rateDelta.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        {row.rateDelta.toFixed(1)}%
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-bold">
                    {row.rate.toFixed(2)}%
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold tabular-nums">
                    {formatCurrency(row.monthlyEmi, currency)}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums">
                    {isBase ? (
                      <span className="text-slate-400 font-sans text-[11px]">Baseline</span>
                    ) : isIncrease ? (
                      <span className="text-red-600 font-medium">
                        +{formatCurrency(row.emiDifference, currency)}/mo
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        -{formatCurrency(Math.abs(row.emiDifference), currency)}/mo
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                    {formatCurrency(row.totalInterest, currency)}
                  </td>

                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                    {formatCurrency(row.totalPayment, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Risk Management Tip:</span> If interest rates rise by 1.0%, your monthly installment increases by{' '}
          <strong className="font-bold font-mono">
            {formatCurrency(
              (items.find((x) => x.rateDelta === 1)?.emiDifference || 0),
              currency
            )}
          </strong>
          . Prepaying just an extra small portion early shields against long-term rate hikes by shrinking your compounding principal.
        </div>
      </div>
    </div>
  );
};
