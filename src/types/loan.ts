export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  ratePlaceholder: number;
}

export type LoanType = 'home' | 'car' | 'personal' | 'education' | 'custom';

export interface LoanInput {
  principal: number;
  annualRate: number; // in percentage, e.g. 8.5
  tenureYears: number;
  tenureMonths: number;
  startDate: string; // YYYY-MM
  loanType: LoanType;
}

export type PrepaymentStrategy = 'reduce-tenure' | 'reduce-emi';

export interface CustomPrepayment {
  id: string;
  month: number; // 1-indexed
  amount: number;
  note?: string;
}

export type PrepaymentFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'custom';

export interface PrepaymentConfig {
  enabled: boolean;
  strategy: PrepaymentStrategy;
  activeFrequency?: PrepaymentFrequency;

  // 1. Recurring monthly extra
  recurringMonthlyEnabled: boolean;
  recurringMonthlyAmount: number;
  recurringStartMonth: number;

  // 2. Recurring quarterly extra (Every 3 months)
  recurringQuarterlyEnabled: boolean;
  recurringQuarterlyAmount: number;
  recurringQuarterlyStartMonth: number; // e.g., month 3

  // 3. Recurring half-yearly / off-yearly extra (Every 6 months)
  recurringHalfYearlyEnabled: boolean;
  recurringHalfYearlyAmount: number;
  recurringHalfYearlyStartMonth: number; // e.g., month 6

  // 4. Recurring annual / yearly extra (Every 12 months)
  recurringYearlyEnabled: boolean;
  recurringYearlyAmount: number;
  recurringYearlyMonth: number; // 1 to 12, default 12 (every December or anniversary)

  // 5. One-time lump sum
  oneTimeEnabled: boolean;
  oneTimeAmount: number;
  oneTimeMonth: number; // e.g., month 12

  // 6. Custom scheduled lump sums
  customPayments: CustomPrepayment[];
}

export interface AmortizationMonth {
  monthIndex: number;
  dateStr: string;
  year: number;
  monthInYear: number;
  openingBalance: number;
  scheduledEmi: number;
  principal: number;
  interest: number;
  extraPrepayment: number;
  totalPayment: number;
  closingBalance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  cumulativePrepayment: number;
  loanRemainingPercent: number;
}

export interface AmortizationYear {
  yearIndex: number;
  calendarYear: number;
  openingBalance: number;
  totalScheduledEmi: number;
  principalPaid: number;
  interestPaid: number;
  extraPrepayment: number;
  totalPayment: number;
  closingBalance: number;
  months: AmortizationMonth[];
}

export interface LoanComparisonSummary {
  originalMonthlyEmi: number;
  originalTotalInterest: number;
  originalTotalPayment: number;
  originalTenureMonths: number;
  originalPayoffDate: string;

  withPrepaymentEmi: number; // initial or adjusted
  revisedTotalInterest: number;
  revisedTotalPayment: number;
  totalPrepaymentMade: number;
  revisedTenureMonths: number;
  revisedPayoffDate: string;

  interestSaved: number;
  timeSavedMonths: number;
  timeSavedYears: number;
  remainingMonthsPart: number;
  percentageInterestSaved: number;
  savingsRatio: number; // interest saved per 1 unit extra prepaid
}

export interface FullLoanResult {
  summary: LoanComparisonSummary;
  originalSchedule: AmortizationMonth[];
  prepaymentSchedule: AmortizationMonth[];
  yearlySchedule: AmortizationYear[];
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  input: LoanInput;
  prepayment: PrepaymentConfig;
  currency: CurrencyCode;
  summary: LoanComparisonSummary;
}
