import React, { useState } from 'react';
import { SavedScenario, CurrencyCode } from '../types/loan';
import { formatCurrency } from '../utils/calculations';
import { X, Trash2, ArrowUpRight, Plus, BookmarkCheck, Calendar } from 'lucide-react';

interface SavedScenariosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: SavedScenario[];
  onLoadScenario: (scenario: SavedScenario) => void;
  onDeleteScenario: (id: string) => void;
  onSaveCurrent: (name: string) => void;
  currency: CurrencyCode;
}

export const SavedScenariosDrawer: React.FC<SavedScenariosDrawerProps> = ({
  isOpen,
  onClose,
  scenarios,
  onLoadScenario,
  onDeleteScenario,
  onSaveCurrent,
  currency,
}) => {
  const [newScenarioName, setNewScenarioName] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenarioName.trim()) return;
    onSaveCurrent(newScenarioName.trim());
    setNewScenarioName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Saved Loan Plans</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Form */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Save Current Calculation
          </h3>
          <form onSubmit={handleSave} className="flex gap-2">
            <label className="sr-only" htmlFor="scenario-name-input">Plan Name</label>
            <input
              id="scenario-name-input"
              type="text"
              placeholder="e.g. Dream House 20Y + $250 extra"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              type="submit"
              disabled={!newScenarioName.trim()}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shrink-0"
            >
              Save Plan
            </button>
          </form>
        </div>

        {/* Saved List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {scenarios.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p>No saved loan scenarios yet.</p>
              <p className="mt-1">Give your current setup a name above to save and compare later.</p>
            </div>
          ) : (
            scenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sc.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(sc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteScenario(sc.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 font-sans block">Amount</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(sc.input.principal, sc.currency || currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-sans block">Rate / Term</span>
                    <span className="font-bold text-slate-800">
                      {sc.input.annualRate}% · {sc.input.tenureYears}y
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-sans block">Monthly EMI</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(sc.summary.originalMonthlyEmi, sc.currency || currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-sans block">Interest Saved</span>
                    <span className="font-bold text-emerald-700">
                      {sc.summary.interestSaved > 0
                        ? formatCurrency(sc.summary.interestSaved, sc.currency || currency)
                        : '—'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLoadScenario(sc);
                    onClose();
                  }}
                  className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Load into Calculator</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
