import React, { useState } from 'react';
import { AmortizationMonth, AmortizationYear, CurrencyCode } from '../types/loan';
import { formatCurrency, exportScheduleToCsv } from '../utils/calculations';
import { ChevronDown, ChevronRight, Download, Search, MoveHorizontal } from 'lucide-react';

interface AmortizationScheduleProps {
  yearlySchedule: AmortizationYear[];
  fullSchedule: AmortizationMonth[];
  currency: CurrencyCode;
  isPrepayActive: boolean;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  yearlySchedule,
  fullSchedule,
  currency,
  isPrepayActive,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({ 1: true });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleYear = (yearIndex: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [yearIndex]: !prev[yearIndex],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    yearlySchedule.forEach((y) => {
      all[y.yearIndex] = true;
    });
    setExpandedYears(all);
  };

  const collapseAll = () => {
    setExpandedYears({});
  };

  const filteredMonthly = fullSchedule.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.monthIndex.toString().includes(query) ||
      r.dateStr.toLowerCase().includes(query) ||
      r.year.toString().includes(query)
    );
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      {/* Table Controls (Responsive stacking) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Amortization Schedule
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              ({fullSchedule.length} Payments)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full principal, interest, and prepayment ledger breakdown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly Summary
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 min-h-[34px] text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Months
            </button>
          </div>

          {viewMode === 'yearly' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <button
                onClick={expandAll}
                className="p-1 hover:text-slate-900 hover:underline min-h-[34px] flex items-center"
              >
                Expand All
              </button>
              <span>·</span>
              <button
                onClick={collapseAll}
                className="p-1 hover:text-slate-900 hover:underline min-h-[34px] flex items-center"
              >
                Collapse
              </button>
            </div>
          )}

          {viewMode === 'monthly' && (
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search month..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 w-full sm:w-40 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>
          )}

          <button
            onClick={() => exportScheduleToCsv(fullSchedule)}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Scroll Hint */}
      <div className="sm:hidden flex items-center justify-end gap-1 text-[11px] text-slate-400 pt-2 pb-1">
        <MoveHorizontal className="w-3.5 h-3.5" />
        <span>Swipe horizontally to view full table</span>
      </div>

      {/* Table View: Yearly Expandable Accordion */}
      {viewMode === 'yearly' && (
        <div className="mt-2 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs border-collapse min-w-[650px] sm:min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 w-10"></th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                <th className="py-2.5 px-3 text-right">Principal Paid</th>
                <th className="py-2.5 px-3 text-right">Interest Paid</th>
                {isPrepayActive && <th className="py-2.5 px-3 text-right text-emerald-700">Prepayment</th>}
                <th className="py-2.5 px-3 text-right">Total Payment</th>
                <th className="py-2.5 px-3 text-right">Closing Bal.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yearlySchedule.map((yr) => {
                const isExpanded = !!expandedYears[yr.yearIndex];
                return (
                  <React.Fragment key={yr.yearIndex}>
                    {/* Year Row */}
                    <tr
                      onClick={() => toggleYear(yr.yearIndex)}
                      className="hover:bg-slate-50/80 cursor-pointer font-medium transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-400">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        Year {yr.yearIndex}{' '}
                        <span className="text-slate-400 font-normal font-mono">({yr.calendarYear})</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                        {formatCurrency(yr.openingBalance, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-indigo-700 whitespace-nowrap">
                        {formatCurrency(yr.principalPaid, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-amber-700 whitespace-nowrap">
                        {formatCurrency(yr.interestPaid, currency)}
                      </td>
                      {isPrepayActive && (
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold whitespace-nowrap">
                          {yr.extraPrepayment > 0 ? formatCurrency(yr.extraPrepayment, currency) : '—'}
                        </td>
                      )}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 font-bold whitespace-nowrap">
                        {formatCurrency(yr.totalPayment, currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {formatCurrency(yr.closingBalance, currency)}
                      </td>
                    </tr>

                    {/* Sub-Months when expanded */}
                    {isExpanded &&
                      yr.months.map((m) => (
                        <tr
                          key={m.monthIndex}
                          className="bg-slate-50/50 hover:bg-slate-100/60 text-[11px] text-slate-600 transition-colors"
                        >
                          <td className="py-2 px-3 text-center text-slate-400 font-mono">
                            {m.monthIndex}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 pl-6 whitespace-nowrap">
                            {m.dateStr}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                            {formatCurrency(m.openingBalance, currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-indigo-600 whitespace-nowrap">
                            {formatCurrency(m.principal, currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-amber-600 whitespace-nowrap">
                            {formatCurrency(m.interest, currency)}
                          </td>
                          {isPrepayActive && (
                            <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-600 font-semibold whitespace-nowrap">
                              {m.extraPrepayment > 0 ? formatCurrency(m.extraPrepayment, currency) : '—'}
                            </td>
                          )}
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                            {formatCurrency(m.totalPayment, currency)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-slate-700 whitespace-nowrap">
                            {formatCurrency(m.closingBalance, currency)}
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table View: All Months Flat List */}
      {viewMode === 'monthly' && (
        <div className="mt-2 overflow-x-auto max-h-[500px] -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs border-collapse min-w-[700px] sm:min-w-full">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider z-10">
              <tr>
                <th className="py-2.5 px-3">Mo. #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                <th className="py-2.5 px-3 text-right">EMI</th>
                <th className="py-2.5 px-3 text-right">Principal</th>
                <th className="py-2.5 px-3 text-right">Interest</th>
                {isPrepayActive && <th className="py-2.5 px-3 text-right text-emerald-700">Prepayment</th>}
                <th className="py-2.5 px-3 text-right">Total Paid</th>
                <th className="py-2.5 px-3 text-right">Closing Bal.</th>
                <th className="py-2.5 px-3 text-right">% Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMonthly.map((m) => (
                <tr
                  key={m.monthIndex}
                  className={`hover:bg-slate-50 transition-colors ${
                    m.extraPrepayment > 0 ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-slate-500">{m.monthIndex}</td>
                  <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">{m.dateStr}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {formatCurrency(m.openingBalance, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {formatCurrency(m.scheduledEmi, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-indigo-700 whitespace-nowrap">
                    {formatCurrency(m.principal, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-amber-700 whitespace-nowrap">
                    {formatCurrency(m.interest, currency)}
                  </td>
                  {isPrepayActive && (
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-700 font-bold whitespace-nowrap">
                      {m.extraPrepayment > 0 ? formatCurrency(m.extraPrepayment, currency) : '—'}
                    </td>
                  )}
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(m.totalPayment, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                    {formatCurrency(m.closingBalance, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                    {m.loanRemainingPercent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
