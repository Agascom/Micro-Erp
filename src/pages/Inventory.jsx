import React from 'react';
import QuickAdjustmentSidebar from '../components/QuickAdjustmentSidebar';

const Inventory = () => {
  return (
    <>
      <section className="flex-1 flex flex-col overflow-y-auto px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and adjust your global stock levels in real-time.</p>
        </div>

      {/* Tabs / Filter */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-8">
          <a href="#" className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-2">
            <p className="text-sm font-bold">All Products</p>
          </a>
          <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 hover:text-slate-800 dark:hover:text-slate-200">
            <p className="text-sm font-medium">Low Stock</p>
          </a>
          <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 hover:text-slate-800 dark:hover:text-slate-200">
            <p className="text-sm font-medium">Out of Stock</p>
          </a>
          <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 pb-3 pt-2 hover:text-slate-800 dark:hover:text-slate-200">
            <p className="text-sm font-medium">Archived</p>
          </a>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Level</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Threshold</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Row 1: Selected State */}
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer bg-primary/5 border-l-4 border-l-primary">
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">SKU-4022</td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900 dark:text-white">High-Performance Drill</span>
                  <span className="text-xs text-slate-500">DeWalt Professional Series</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Power Tools</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-primary rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">85</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">20</td>
              <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">OK</span></td>
            </tr>
            {/* More rows... */}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing 1 to 4 of 128 products</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50">Previous</button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50">Next</button>
        </div>
      </div>
    </section>
    <QuickAdjustmentSidebar />
    </>
  );
};

export default Inventory;
