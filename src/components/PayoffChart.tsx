import React, { useState, useRef } from 'react';
import { AmortizationMonth, CurrencyCode } from '../types/loan';
import { formatCurrency, formatCompactNumber } from '../utils/calculations';

interface PayoffChartProps {
  originalSchedule: AmortizationMonth[];
  prepaymentSchedule: AmortizationMonth[];
  currency: CurrencyCode;
  isPrepayActive: boolean;
  principal: number;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  originalSchedule,
  prepaymentSchedule,
  currency,
  isPrepayActive,
  principal,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!originalSchedule || originalSchedule.length === 0) return null;

  // Chart Dimensions
  const width = 800;
  const height = 320;
  const padding = { top: 20, right: 25, bottom: 40, left: 65 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxMonths = originalSchedule.length;
  const maxBalance = principal;

  // Coordinate scales
  const getX = (monthIdx: number) => padding.left + (monthIdx / maxMonths) * innerWidth;
  const getY = (balance: number) =>
    padding.top + innerHeight - (Math.max(0, balance) / maxBalance) * innerHeight;

  // Path generator
  const generatePath = (schedule: AmortizationMonth[]) => {
    if (schedule.length === 0) return '';
    let d = `M ${getX(0)} ${getY(principal)}`;
    for (let i = 0; i < schedule.length; i++) {
      const row = schedule[i];
      d += ` L ${getX(row.monthIndex)} ${getY(row.closingBalance)}`;
    }
    return d;
  };

  const originalPath = generatePath(originalSchedule);
  const prepayPath = generatePath(prepaymentSchedule);

  // Gradient area under prepay curve
  const generateArea = (schedule: AmortizationMonth[]) => {
    if (schedule.length === 0) return '';
    let d = `M ${getX(0)} ${getY(principal)}`;
    for (let i = 0; i < schedule.length; i++) {
      const row = schedule[i];
      d += ` L ${getX(row.monthIndex)} ${getY(row.closingBalance)}`;
    }
    const lastMonth = schedule[schedule.length - 1].monthIndex;
    d += ` L ${getX(lastMonth)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
    return d;
  };

  const prepayArea = generateArea(isPrepayActive ? prepaymentSchedule : originalSchedule);

  // Interaction handlers (Both Mouse for Laptop and Touch for Mobile)
  const calculateMonthIndexFromClientX = (clientX: number, target: SVGSVGElement) => {
    const rect = target.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const svgX = (mouseX / rect.width) * width;

    if (svgX < padding.left || svgX > width - padding.right) {
      return null;
    }

    const ratio = (svgX - padding.left) / innerWidth;
    const monthIndex = Math.round(ratio * maxMonths);
    return Math.max(1, Math.min(maxMonths, monthIndex));
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = calculateMonthIndexFromClientX(e.clientX, e.currentTarget);
    setHoverIdx(idx);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length > 0) {
      const idx = calculateMonthIndexFromClientX(e.touches[0].clientX, e.currentTarget);
      setHoverIdx(idx);
    }
  };

  const handleInteractionEnd = () => {
    setHoverIdx(null);
  };

  const currentOrigRow = hoverIdx
    ? originalSchedule[Math.min(hoverIdx - 1, originalSchedule.length - 1)]
    : null;
  const currentPrepayRow = hoverIdx
    ? prepaymentSchedule[Math.min(hoverIdx - 1, prepaymentSchedule.length - 1)]
    : null;

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: principal * pct,
    y: getY(principal * pct),
  }));

  // X-axis ticks (years)
  const totalYears = Math.ceil(maxMonths / 12);
  const yearStep = totalYears <= 5 ? 1 : totalYears <= 15 ? 2 : 5;
  const xTicks: { month: number; label: string; x: number }[] = [];
  for (let yr = 0; yr <= totalYears; yr += yearStep) {
    const m = yr * 12;
    if (m <= maxMonths) {
      xTicks.push({
        month: m,
        label: yr === 0 ? 'Start' : `Yr ${yr}`,
        x: getX(m),
      });
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Loan Balance Payoff Trajectory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare outstanding principal reduction over time with and without prepayment
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed border-slate-500" />
            <span>Scheduled</span>
          </div>
          {isPrepayActive && (
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-3 h-1 bg-emerald-600 rounded-full" />
              <span>With Prepayment</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Chart with Touch Support */}
      <div ref={containerRef} className="relative mt-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none touch-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleInteractionEnd}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleInteractionEnd}
        >
          <defs>
            <linearGradient id="prepayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-500 font-mono font-medium"
              >
                {formatCompactNumber(tick.val, currency)}
              </text>
            </g>
          ))}

          {/* X axis ticks */}
          {xTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x}
                y1={padding.top + innerHeight}
                x2={tick.x}
                y2={padding.top + innerHeight + 6}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={tick.x}
                y={padding.top + innerHeight + 18}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-mono"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Fill area under curve */}
          <path d={prepayArea} fill="url(#prepayGradient)" />

          {/* Scheduled Path (Original) */}
          <path
            d={originalPath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray={isPrepayActive ? '4 4' : 'none'}
          />

          {/* Prepayment Path */}
          {isPrepayActive && (
            <path
              d={prepayPath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Early Debt Freedom Marker */}
          {isPrepayActive && prepaymentSchedule.length < originalSchedule.length && (
            <g>
              <line
                x1={getX(prepaymentSchedule.length)}
                y1={padding.top}
                x2={getX(prepaymentSchedule.length)}
                y2={padding.top + innerHeight}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(prepaymentSchedule.length)}
                cy={getY(0)}
                r="4.5"
                fill="#059669"
              />
            </g>
          )}

          {/* Hover Crosshair & Tooltip */}
          {hoverIdx && (
            <g>
              <line
                x1={getX(hoverIdx)}
                y1={padding.top}
                x2={getX(hoverIdx)}
                y2={padding.top + innerHeight}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {currentOrigRow && (
                <circle
                  cx={getX(hoverIdx)}
                  cy={getY(currentOrigRow.closingBalance)}
                  r="4"
                  fill="#94a3b8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}

              {isPrepayActive && currentPrepayRow && (
                <circle
                  cx={getX(hoverIdx)}
                  cy={getY(currentPrepayRow.closingBalance)}
                  r="5"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Mobile touch hint when not touching */}
        {!hoverIdx && (
          <div className="sm:hidden text-center text-[10px] text-slate-400 mt-1">
            Tap or drag across graph to inspect month & balance
          </div>
        )}

        {/* Floating Tooltip Card (Mobile-friendly stacked & laptop horizontal) */}
        {hoverIdx && currentOrigRow && (
          <div className="mt-3 p-3 rounded-lg bg-slate-900 text-white text-xs font-mono shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-300">
                Month {hoverIdx} ({currentOrigRow.dateStr})
              </span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-300 text-[11px] hidden xs:inline sm:inline">
                Paid: {formatCurrency(currentOrigRow.cumulativePrincipal, currency)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <div className="text-slate-300">
                Scheduled:{' '}
                <span className="text-white font-bold">
                  {formatCurrency(currentOrigRow.closingBalance, currency)}
                </span>
              </div>

              {isPrepayActive && currentPrepayRow && (
                <div className="text-emerald-300 font-semibold">
                  With Prepay:{' '}
                  <span className="text-emerald-400 font-bold">
                    {formatCurrency(currentPrepayRow.closingBalance, currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
