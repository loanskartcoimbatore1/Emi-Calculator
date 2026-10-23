import {
  CurrencyCode,
  CurrencyConfig,
  LoanInput,
  PrepaymentConfig,
  AmortizationMonth,
  AmortizationYear,
  FullLoanResult,
  LoanComparisonSummary,
} from '../types/loan';

export type { CurrencyCode, CurrencyConfig };

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', ratePlaceholder: 6.5 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', ratePlaceholder: 8.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE', ratePlaceholder: 3.8 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', ratePlaceholder: 5.2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', ratePlaceholder: 5.9 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', ratePlaceholder: 6.2 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', ratePlaceholder: 3.9 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE', ratePlaceholder: 4.5 },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `${config.symbol}${Math.round(amount).toLocaleString()}`;
  }
}

export function formatCurrencyPrecise(amount: number, currency: CurrencyCode = 'USD'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0.00';
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCompactNumber(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  if (currency === 'INR') {
    if (amount >= 10000000) return `${config.symbol}${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `${config.symbol}${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `${config.symbol}${(amount / 1000).toFixed(1)} k`;
    return `${config.symbol}${Math.round(amount)}`;
  }
  if (amount >= 1000000) return `${config.symbol}${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${config.symbol}${(amount / 1000).toFixed(1)}k`;
  return `${config.symbol}${Math.round(amount)}`;
}

export function calculateStandardEmi(principal: number, annualRate: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRate <= 0) return principal / totalMonths;
  const monthlyRate = annualRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return isFinite(emi) ? emi : 0;
}

export function parseDate(dateStr: string): Date {
  const [yearStr, monthStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = (parseInt(monthStr, 10) || 1) - 1;
  return new Date(year, month, 1);
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function computeLoanAmortization(
  input: LoanInput,
  prepayment: PrepaymentConfig
): FullLoanResult {
  const totalMonths = Math.max(1, input.tenureYears * 12 + input.tenureMonths);
  const principal = Math.max(1, input.principal);
  const annualRate = Math.max(0, input.annualRate);
  const monthlyRate = annualRate / 12 / 100;
  const startDate = parseDate(input.startDate);

  // 1. Compute Base Loan Without Prepayment
  const baseEmi = calculateStandardEmi(principal, annualRate, totalMonths);
  let baseBalance = principal;
  let baseCumulativeInterest = 0;
  let baseCumulativePrincipal = 0;
  const originalSchedule: AmortizationMonth[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const opening = baseBalance;
    const interest = monthlyRate > 0 ? opening * monthlyRate : 0;
    let scheduledPrincipal = baseEmi - interest;

    if (scheduledPrincipal > opening || m === totalMonths) {
      scheduledPrincipal = opening;
    }

    const scheduledPayment = scheduledPrincipal + interest;
    baseBalance = Math.max(0, opening - scheduledPrincipal);
    baseCumulativeInterest += interest;
    baseCumulativePrincipal += scheduledPrincipal;

    const monthDate = addMonths(startDate, m - 1);

    originalSchedule.push({
      monthIndex: m,
      dateStr: formatMonthYear(monthDate),
      year: monthDate.getFullYear(),
      monthInYear: monthDate.getMonth() + 1,
      openingBalance: opening,
      scheduledEmi: scheduledPayment,
      principal: scheduledPrincipal,
      interest: interest,
      extraPrepayment: 0,
      totalPayment: scheduledPayment,
      closingBalance: baseBalance,
      cumulativePrincipal: baseCumulativePrincipal,
      cumulativeInterest: baseCumulativeInterest,
      cumulativePrepayment: 0,
      loanRemainingPercent: principal > 0 ? (baseBalance / principal) * 100 : 0,
    });

    if (baseBalance <= 0) break;
  }

  const originalTotalInterest = baseCumulativeInterest;
  const originalTotalPayment = principal + originalTotalInterest;
  const originalPayoffDate = formatMonthYear(addMonths(startDate, totalMonths - 1));

  // 2. Compute Schedule With Prepayments
  let prepayBalance = principal;
  let prepayCumulativeInterest = 0;
  let prepayCumulativePrincipal = 0;
  let totalPrepaymentMade = 0;
  const prepaySchedule: AmortizationMonth[] = [];

  let currentEmi = baseEmi;
  const maxIterations = totalMonths * 2; // safeguards
  let m = 1;

  while (prepayBalance > 0.01 && m <= maxIterations) {
    const opening = prepayBalance;
    const monthDate = addMonths(startDate, m - 1);
    const monthInYear = monthDate.getMonth() + 1;
    const interest = monthlyRate > 0 ? opening * monthlyRate : 0;

    // Check if prepayment is configured and active
    let extraPrepay = 0;
    if (prepayment.enabled) {
      // 1. Recurring monthly extra
      if (prepayment.recurringMonthlyEnabled && m >= (prepayment.recurringStartMonth || 1)) {
        extraPrepay += Math.max(0, prepayment.recurringMonthlyAmount);
      }

      // 2. Recurring quarterly extra (every 3 months, e.g. months 3, 6, 9, 12...)
      if (prepayment.recurringQuarterlyEnabled) {
        const qStart = prepayment.recurringQuarterlyStartMonth || 3;
        if (m >= qStart && (m - qStart) % 3 === 0) {
          extraPrepay += Math.max(0, prepayment.recurringQuarterlyAmount);
        }
      }

      // 3. Recurring half-yearly / off-yearly extra (every 6 months, e.g. months 6, 12, 18, 24...)
      if (prepayment.recurringHalfYearlyEnabled) {
        const hStart = prepayment.recurringHalfYearlyStartMonth || 6;
        if (m >= hStart && (m - hStart) % 6 === 0) {
          extraPrepay += Math.max(0, prepayment.recurringHalfYearlyAmount);
        }
      }

      // 4. Recurring yearly extra (every 12 months)
      if (prepayment.recurringYearlyEnabled) {
        if (m >= 12 && m % 12 === 0) {
          extraPrepay += Math.max(0, prepayment.recurringYearlyAmount);
        }
      }

      // 5. One-time lump sum
      if (prepayment.oneTimeEnabled && prepayment.oneTimeMonth === m) {
        extraPrepay += Math.max(0, prepayment.oneTimeAmount);
      }

      // 6. Custom scheduled milestones
      if (prepayment.customPayments && prepayment.customPayments.length > 0) {
        for (const cp of prepayment.customPayments) {
          if (cp.month === m) {
            extraPrepay += Math.max(0, cp.amount);
          }
        }
      }
    }

    // Regular principal portion
    let scheduledPrincipal = Math.max(0, currentEmi - interest);
    if (scheduledPrincipal > opening) {
      scheduledPrincipal = opening;
    }

    // Prepayment caps at remaining principal after regular principal
    const remainingBeforePrepay = Math.max(0, opening - scheduledPrincipal);
    if (extraPrepay > remainingBeforePrepay) {
      extraPrepay = remainingBeforePrepay;
    }

    const totalPrincipal = scheduledPrincipal + extraPrepay;
    const closing = Math.max(0, opening - totalPrincipal);
    const scheduledPayment = scheduledPrincipal + interest;
    const totalMonthPayment = scheduledPayment + extraPrepay;

    prepayBalance = closing;
    prepayCumulativeInterest += interest;
    prepayCumulativePrincipal += totalPrincipal;
    totalPrepaymentMade += extraPrepay;

    prepaySchedule.push({
      monthIndex: m,
      dateStr: formatMonthYear(monthDate),
      year: monthDate.getFullYear(),
      monthInYear: monthInYear,
      openingBalance: opening,
      scheduledEmi: scheduledPayment,
      principal: totalPrincipal,
      interest: interest,
      extraPrepayment: extraPrepay,
      totalPayment: totalMonthPayment,
      closingBalance: closing,
      cumulativePrincipal: prepayCumulativePrincipal,
      cumulativeInterest: prepayCumulativeInterest,
      cumulativePrepayment: totalPrepaymentMade,
      loanRemainingPercent: principal > 0 ? (closing / principal) * 100 : 0,
    });

    if (closing <= 0.01) {
      break;
    }

    // If strategy is "reduce-emi", and extra prepayment was made, recalculate EMI for remaining months
    if (prepayment.enabled && prepayment.strategy === 'reduce-emi' && extraPrepay > 0) {
      const remainingTenure = totalMonths - m;
      if (remainingTenure > 0) {
        currentEmi = calculateStandardEmi(closing, annualRate, remainingTenure);
      }
    }

    m++;
  }

  const revisedTenureMonths = prepaySchedule.length;
  const revisedTotalInterest = prepayCumulativeInterest;
  const revisedTotalPayment = principal + revisedTotalInterest;
  const interestSaved = Math.max(0, originalTotalInterest - revisedTotalInterest);
  const timeSavedMonths = Math.max(0, totalMonths - revisedTenureMonths);
  const timeSavedYears = Math.floor(timeSavedMonths / 12);
  const remainingMonthsPart = timeSavedMonths % 12;

  const revisedPayoffDate =
    prepaySchedule.length > 0
      ? prepaySchedule[prepaySchedule.length - 1].dateStr
      : originalPayoffDate;

  const percentageInterestSaved =
    originalTotalInterest > 0 ? (interestSaved / originalTotalInterest) * 100 : 0;

  const savingsRatio =
    totalPrepaymentMade > 0 ? interestSaved / totalPrepaymentMade : 0;

  // 3. Aggregate into Yearly Schedule
  const yearlyMap = new Map<number, AmortizationMonth[]>();
  for (const row of prepaySchedule) {
    if (!yearlyMap.has(row.year)) {
      yearlyMap.set(row.year, []);
    }
    yearlyMap.get(row.year)!.push(row);
  }

  const yearlySchedule: AmortizationYear[] = [];
  let yearIdx = 1;
  yearlyMap.forEach((months, calendarYear) => {
    const openingBalance = months[0].openingBalance;
    const closingBalance = months[months.length - 1].closingBalance;
    const totalScheduledEmi = months.reduce((acc, r) => acc + r.scheduledEmi, 0);
    const principalPaid = months.reduce((acc, r) => acc + r.principal, 0);
    const interestPaid = months.reduce((acc, r) => acc + r.interest, 0);
    const extraPrepayment = months.reduce((acc, r) => acc + r.extraPrepayment, 0);
    const totalPayment = months.reduce((acc, r) => acc + r.totalPayment, 0);

    yearlySchedule.push({
      yearIndex: yearIdx++,
      calendarYear,
      openingBalance,
      totalScheduledEmi,
      principalPaid,
      interestPaid,
      extraPrepayment,
      totalPayment,
      closingBalance,
      months,
    });
  });

  const summary: LoanComparisonSummary = {
    originalMonthlyEmi: baseEmi,
    originalTotalInterest,
    originalTotalPayment,
    originalTenureMonths: totalMonths,
    originalPayoffDate,

    withPrepaymentEmi: currentEmi,
    revisedTotalInterest,
    revisedTotalPayment,
    totalPrepaymentMade,
    revisedTenureMonths,
    revisedPayoffDate,

    interestSaved,
    timeSavedMonths,
    timeSavedYears,
    remainingMonthsPart,
    percentageInterestSaved,
    savingsRatio,
  };

  return {
    summary,
    originalSchedule,
    prepaymentSchedule: prepaySchedule,
    yearlySchedule,
  };
}

export interface RateSensitivityItem {
  rateDelta: number;
  rate: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  emiDifference: number;
}

export function calculateRateSensitivity(principal: number, baseRate: number, tenureMonths: number): RateSensitivityItem[] {
  const deltas = [-2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0];
  const baseEmi = calculateStandardEmi(principal, baseRate, tenureMonths);

  return deltas
    .map((delta) => {
      const rate = Math.max(0.1, +(baseRate + delta).toFixed(2));
      const emi = calculateStandardEmi(principal, rate, tenureMonths);
      const totalInterest = Math.max(0, emi * tenureMonths - principal);
      return {
        rateDelta: delta,
        rate,
        monthlyEmi: emi,
        totalInterest,
        totalPayment: principal + totalInterest,
        emiDifference: emi - baseEmi,
      };
    })
    .filter((item, idx, arr) => {
      // Remove duplicate rates if clamped to 0.1
      return arr.findIndex((x) => x.rate === item.rate) === idx;
    });
}

export function exportScheduleToCsv(schedule: AmortizationMonth[], loanName = 'Loan_Amortization_Schedule'): void {
  const headers = [
    'Month #',
    'Date',
    'Opening Balance',
    'Scheduled EMI',
    'Principal Paid',
    'Interest Paid',
    'Extra Prepayment',
    'Total Paid',
    'Closing Balance',
    'Cumulative Principal',
    'Cumulative Interest',
    'Remaining Balance %',
  ];

  const rows = schedule.map((r) => [
    r.monthIndex,
    r.dateStr,
    r.openingBalance.toFixed(2),
    r.scheduledEmi.toFixed(2),
    r.principal.toFixed(2),
    r.interest.toFixed(2),
    r.extraPrepayment.toFixed(2),
    r.totalPayment.toFixed(2),
    r.closingBalance.toFixed(2),
    r.cumulativePrincipal.toFixed(2),
    r.cumulativeInterest.toFixed(2),
    r.loanRemainingPercent.toFixed(1) + '%',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${loanName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
