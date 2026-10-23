import React, { useState, useMemo, useEffect } from 'react';
import {
  CurrencyCode,
  LoanInput,
  PrepaymentConfig,
  SavedScenario,
} from './types/loan';
import {
  computeLoanAmortization,
  exportScheduleToCsv,
  formatCurrency,
} from './utils/calculations';
import { Header } from './components/Header';
import { LoanInputSection } from './components/LoanInputSection';
import { PrepaymentManager } from './components/PrepaymentManager';
import { ResultsSummary } from './components/ResultsSummary';
import { PayoffChart } from './components/PayoffChart';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { RateSensitivity } from './components/RateSensitivity';
import { LoanComparisonView } from './components/LoanComparisonModal';
import { SavedScenariosDrawer } from './components/SavedScenariosDrawer';
import {
  Calculator,
  Calendar,
  PiggyBank,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  Bookmark,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'loanskart_saved_scenarios_v1';
const PREFS_KEY = 'loanskart_user_prefs_v1';

export default function App() {
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, '0')}`;

  // Currency (defaulting to INR or saved preference)
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'amortization' | 'sensitivity' | 'compare'
  >('calculator');

  // Loan Input State
  const [loanInput, setLoanInput] = useState<LoanInput>({
    principal: 2500000,
    annualRate: 8.5,
    tenureYears: 20,
    tenureMonths: 0,
    startDate: currentMonthStr,
    loanType: 'home',
  });

  // Prepayment Configuration State
  const [prepayment, setPrepayment] = useState<PrepaymentConfig>({
    enabled: true,
    strategy: 'reduce-tenure',
    activeFrequency: 'monthly',
    recurringMonthlyEnabled: true,
    recurringMonthlyAmount: 250,
    recurringStartMonth: 1,
    recurringQuarterlyEnabled: false,
    recurringQuarterlyAmount: 1000,
    recurringQuarterlyStartMonth: 3,
    recurringHalfYearlyEnabled: false,
    recurringHalfYearlyAmount: 2500,
    recurringHalfYearlyStartMonth: 6,
    recurringYearlyEnabled: false,
    recurringYearlyAmount: 5000,
    recurringYearlyMonth: 12,
    oneTimeEnabled: false,
    oneTimeAmount: 10000,
    oneTimeMonth: 12,
    customPayments: [],
  });

  // Saved Scenarios in localStorage
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved scenarios and currency on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('equiloan_saved_scenarios_v1');
      if (stored) {
        setSavedScenarios(JSON.parse(stored));
      }
      const prefs = localStorage.getItem(PREFS_KEY) || localStorage.getItem('equiloan_user_prefs_v1');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        if (parsed.currency) setCurrency(parsed.currency);
      }
    } catch (e) {
      console.warn('Failed to load local storage:', e);
    }
  }, []);

  // Save currency change to localStorage
  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ currency: newCurr }));
    } catch (e) {
      console.warn('Failed to save currency:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Memoized Loan & Prepayment Calculation
  const loanResult = useMemo(() => {
    return computeLoanAmortization(loanInput, prepayment);
  }, [loanInput, prepayment]);

  const { summary, originalSchedule, prepaymentSchedule, yearlySchedule } =
    loanResult;

  const totalLoanMonths =
    loanInput.tenureYears * 12 + loanInput.tenureMonths;

  // Actions
  const handleSaveScenario = (name: string) => {
    const newScenario: SavedScenario = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      createdAt: new Date().toISOString(),
      input: { ...loanInput },
      prepayment: { ...prepayment },
      currency,
      summary: { ...summary },
    };
    const updated = [newScenario, ...savedScenarios];
    setSavedScenarios(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save scenario:', e);
    }
    showToast(`"${name}" saved to your loan plans!`);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete scenario:', e);
    }
    showToast('Plan deleted.');
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setLoanInput(scenario.input);
    setPrepayment(scenario.prepayment);
    if (scenario.currency) setCurrency(scenario.currency);
    showToast(`Loaded "${scenario.name}".`);
  };

  const handleExportCsv = () => {
    const activeSchedule =
      prepayment.enabled && summary.interestSaved > 0
        ? prepaymentSchedule
        : originalSchedule;
    exportScheduleToCsv(activeSchedule, `Loan_Schedule_${loanInput.loanType}`);
    showToast('Amortization schedule downloaded as CSV.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={handleCurrencyChange}
        savedCount={savedScenarios.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
        {/* Tab 1: Core Calculator & Prepayment Management */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Top Grid: Input Controls & Results Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Loan Inputs & Prepayment Setup (7 cols on large screens) */}
              <div className="lg:col-span-7 space-y-6">
                <LoanInputSection
                  input={loanInput}
                  onChange={setLoanInput}
                  currency={currency}
                />

                <PrepaymentManager
                  prepayment={prepayment}
                  onChange={setPrepayment}
                  currency={currency}
                  totalLoanMonths={totalLoanMonths}
                  startDateStr={loanInput.startDate}
                  interestSaved={summary.interestSaved}
                  timeSavedMonths={summary.timeSavedMonths}
                  newPayoffDate={summary.revisedPayoffDate}
                  originalPayoffDate={summary.originalPayoffDate}
                  totalPrepaymentMade={summary.totalPrepaymentMade}
                />
              </div>

              {/* Right Column: Sticky on Laptop / Desktop (5 cols on large screens) */}
              <div id="results-section" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                <ResultsSummary
                  summary={summary}
                  currency={currency}
                  prepayment={prepayment}
                  principal={loanInput.principal}
                />

                <PayoffChart
                  originalSchedule={originalSchedule}
                  prepaymentSchedule={prepaymentSchedule}
                  currency={currency}
                  isPrepayActive={
                    prepayment.enabled &&
                    (summary.interestSaved > 0 || summary.timeSavedMonths > 0)
                  }
                  principal={loanInput.principal}
                />
              </div>
            </div>

            {/* Quick Preview of Amortization Schedule */}
            <div className="pt-4">
              <AmortizationSchedule
                yearlySchedule={yearlySchedule}
                fullSchedule={
                  prepayment.enabled ? prepaymentSchedule : originalSchedule
                }
                currency={currency}
                isPrepayActive={
                  prepayment.enabled &&
                  (summary.interestSaved > 0 || summary.timeSavedMonths > 0)
                }
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Amortization Schedule Tab */}
        {activeTab === 'amortization' && (
          <div className="space-y-6">
            <ResultsSummary
              summary={summary}
              currency={currency}
              prepayment={prepayment}
              principal={loanInput.principal}
            />

            <AmortizationSchedule
              yearlySchedule={yearlySchedule}
              fullSchedule={
                prepayment.enabled ? prepaymentSchedule : originalSchedule
              }
              currency={currency}
              isPrepayActive={
                prepayment.enabled &&
                (summary.interestSaved > 0 || summary.timeSavedMonths > 0)
              }
            />
          </div>
        )}

        {/* Tab 3: Interest Rate Sensitivity Stress Test */}
        {activeTab === 'sensitivity' && (
          <div className="space-y-6">
            <RateSensitivity input={loanInput} currency={currency} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-white border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Why Prepayment Protects Against Rising Rates
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In a rising interest rate environment, banks increase either your monthly EMI or extend your loan tenure. Every extra dollar or rupee you pay toward the principal directly diminishes the balance subject to compounding interest, acting as an automatic hedge against future rate hikes.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Prepayment Strategy Recommendation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  For home loans with tenures over 15 years, reducing tenure rather than reducing EMI saves up to 4x more interest. If cash flow is tight, reducing EMI offers instant breathing room without refinancing fees.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Loan Comparison Matrix */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <LoanComparisonView
              currentInput={loanInput}
              currentPrepayment={prepayment}
              currency={currency}
            />
          </div>
        )}
      </main>

      {/* Mobile Floating Quick Summary Bar (Only visible on mobile, hidden on laptop/desktop) */}
      {activeTab === 'calculator' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">
                Monthly EMI
              </div>
              <div className="font-extrabold font-mono text-slate-900 text-sm">
                {formatCurrency(
                  prepayment.enabled && prepayment.strategy === 'reduce-emi'
                    ? summary.withPrepaymentEmi
                    : summary.originalMonthlyEmi,
                  currency
                )}
              </div>
            </div>

            {summary.interestSaved > 0 && (
              <div className="border-l border-slate-200 pl-3">
                <div className="text-[10px] uppercase font-bold text-emerald-700">
                  Interest Saved
                </div>
                <div className="font-extrabold font-mono text-emerald-700 text-sm">
                  {formatCurrency(summary.interestSaved, currency)}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('results-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3 py-1.5 min-h-[36px] text-xs font-semibold text-white bg-indigo-600 active:bg-indigo-700 rounded-lg shadow-xs whitespace-nowrap"
          >
            View Details
          </button>
        </div>
      )}

      {/* Saved Scenarios Drawer */}
      <SavedScenariosDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        scenarios={savedScenarios}
        onLoadScenario={handleLoadScenario}
        onDeleteScenario={handleDeleteScenario}
        onSaveCurrent={handleSaveScenario}
        currency={currency}
      />

      {/* Clean Financial Suite Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Loanskart</span>
            <span>·</span>
            <span>Smart EMI & Prepayment Calculator</span>
          </div>
          <div className="text-center sm:text-right text-slate-400">
            For estimation and financial planning purposes only. Compounding schedules may vary slightly per lender.
          </div>
        </div>
      </footer>
    </div>
  );
}
