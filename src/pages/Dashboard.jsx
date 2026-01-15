import React from 'react';

const Dashboard = () => {
  return (
    <>
      {/* Breadcrumbs & Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Main</a>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Dashboard</span>
          </nav>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Operational Overview</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            <span>This Month</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats/KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">Monthly Revenue</p>
                <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-lg">monetization_on</span>
            </div>
            <p className="text-2xl font-bold">$124,500.00</p>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-emerald-600 text-xs font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +12.5%</span>
                <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
            </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">Unpaid Invoices</p>
                <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-1.5 rounded-lg text-lg">receipt_long</span>
            </div>
            <p className="text-2xl font-bold">18 Pending</p>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-rose-600 text-xs font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +5.2%</span>
                <span className="text-[10px] text-slate-400 font-medium">$42,800 total</span>
            </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">Stock Alerts</p>
                <span className="material-symbols-outlined text-rose-500 bg-rose-500/10 p-1.5 rounded-lg text-lg">inventory</span>
            </div>
            <p className="text-2xl font-bold">12 Items</p>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-rose-600 text-xs font-bold flex items-center">Critical Status</span>
                <span className="text-[10px] text-slate-400 font-medium">8 out of stock</span>
            </div>
        </div>
        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-slate-500">Attendance</p>
                <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg text-lg">how_to_reg</span>
            </div>
            <p className="text-2xl font-bold">94.2%</p>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-emerald-600 text-xs font-bold flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +2.1%</span>
                <span className="text-[10px] text-slate-400 font-medium">312 checked in</span>
            </div>
        </div>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Critical Stock Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Critical Stock &amp; Alerts</h3>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded uppercase tracking-wide">Action Required</span>
                </div>
                <button className="text-primary text-xs font-bold hover:underline">View Inventory</button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-3">Item Name</th>
                            <th className="px-6 py-3">SKU</th>
                            <th className="px-6 py-3">In Stock</th>
                            <th className="px-6 py-3">Threshold</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Table Rows */}
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Enterprise Router X-200</td>
                            <td className="px-6 py-4 text-slate-500">HW-482-990</td>
                            <td className="px-6 py-4">2 units</td>
                            <td className="px-6 py-4">10 units</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-rose-100 text-rose-600 uppercase">Critical Low</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary font-semibold hover:text-primary/80">Restock</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">4K Monitor Panel 27"</td>
                            <td className="px-6 py-4 text-slate-500">MN-112-441</td>
                            <td className="px-6 py-4">0 units</td>
                            <td className="px-6 py-4">5 units</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">Out of Stock</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary font-semibold hover:text-primary/80">Restock</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Wireless Keyboard Layout V2</td>
                            <td className="px-6 py-4 text-slate-500">AC-009-122</td>
                            <td className="px-6 py-4">8 units</td>
                            <td className="px-6 py-4">15 units</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Low Stock</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary font-semibold hover:text-primary/80">Restock</button></td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">Standard NVMe SSD 1TB</td>
                            <td className="px-6 py-4 text-slate-500">ST-223-X09</td>
                            <td className="px-6 py-4">12 units</td>
                            <td className="px-6 py-4">25 units</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Low Stock</span></td>
                            <td className="px-6 py-4 text-right"><button className="text-primary font-semibold hover:text-primary/80">Restock</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Activities/To-Do */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Recent Activities</h3>
                <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                </button>
            </div>
            {/* Activity List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Activity Item 1 */}
                <div className="flex gap-4">
                    <div className="relative">
                        <div className="size-8 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">groups</span>
                        </div>
                        <div className="absolute top-8 left-4 w-[1px] h-10 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Human Resources</p>
                        <p className="text-sm font-semibold">New Leave Request: Maria S.</p>
                        <p className="text-xs text-slate-500">Requested 5 days starting Oct 12.</p>
                        <div className="flex gap-2 mt-2">
                            <button className="text-[10px] px-3 py-1 bg-primary text-white font-bold rounded-lg">Approve</button>
                            <button className="text-[10px] px-3 py-1 border border-slate-200 dark:border-slate-700 font-bold rounded-lg">Details</button>
                        </div>
                    </div>
                </div>
                {/* Activity Item 2 */}
                <div className="flex gap-4">
                    <div className="relative">
                        <div className="size-8 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">shopping_bag</span>
                        </div>
                        <div className="absolute top-8 left-4 w-[1px] h-10 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sales</p>
                        <p className="text-sm font-semibold">Large Order Completed</p>
                        <p className="text-xs text-slate-500">Order #ORD-7719 for Global-Tech Int.</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1">Value: $18,200.00</p>
                    </div>
                </div>
                {/* Activity Item 3 */}
                <div className="flex gap-4">
                    <div className="relative">
                        <div className="size-8 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">payments</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Finance</p>
                        <p className="text-sm font-semibold">Quarterly Tax Reminder</p>
                        <p className="text-xs text-slate-500">Submission due in 3 business days.</p>
                        <p className="text-[10px] text-slate-400 font-medium italic mt-1">Assigned to: Finance Team</p>
                    </div>
                </div>
            </div>
            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">View All Activities</button>
            </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
