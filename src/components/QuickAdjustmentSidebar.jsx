import React from 'react';

const QuickAdjustmentSidebar = () => {
  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Quick Adjustment</h3>
        <p className="text-xs text-slate-500">SKU-4022 • High-Performance Drill</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Entry/Exit Tabs */}
        <div className="p-4">
          <div className="flex h-10 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 bg-white dark:bg-slate-700 shadow-sm text-primary text-sm font-semibold transition-all">
              <span>Stock Entry</span>
              <input type="radio" name="action-type" value="entry" className="hidden" defaultChecked/>
            </label>
            <label className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-slate-500 text-sm font-medium transition-all hover:text-slate-700">
              <span>Stock Exit</span>
              <input type="radio" name="action-type" value="exit" className="hidden"/>
            </label>
          </div>
        </div>

        {/* Input Fields */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Quantity</label>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50">
                <span className="material-symbols-outlined">remove</span>
              </button>
              <input type="number" defaultValue="10" className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-center font-bold text-slate-900 dark:text-white focus:ring-primary focus:border-primary"/>
              <button className="w-10 h-10 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
          {/* More fields... */}
        </div>
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
        <button className="w-full py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-primary transition-colors">
          View Full Product Details
        </button>
      </div>
    </aside>
  );
};

export default QuickAdjustmentSidebar;
