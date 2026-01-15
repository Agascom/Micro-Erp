import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const InventoryLayout = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-primary">
            <div className="size-6">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">ERP Inventory</h2>
          </div>
          <label className="flex flex-col min-w-40 h-10 max-w-lg">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-slate-500 flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input className="form-input flex w-full min-w-0 flex-1 border-none bg-slate-100 dark:bg-slate-800 focus:ring-0 focus:outline-none h-full placeholder:text-slate-500 px-4 rounded-r-lg text-sm font-normal" placeholder="Search products, SKUs, or categories..." value=""/>
            </div>
          </label>
        </div>
        <div className="flex gap-3">
          <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold gap-2">
            <span className="material-symbols-outlined">add</span>
            <span className="truncate">Add Product</span>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Mini Sidebar Navigation */}
        <aside className="w-16 flex flex-col items-center py-6 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 gap-6">
          <NavLink to="/inventory" className={({isActive}) => `p-2 rounded-lg ${isActive ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary transition-colors cursor-pointer'}`}>
            <span className="material-symbols-outlined">inventory_2</span>
          </NavLink>
          <NavLink to="/sales" className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">shopping_cart</span>
          </NavLink>
          <NavLink to="/hr" className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">group</span>
          </NavLink>
          <NavLink to="/finance" className="p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </NavLink>
          <div className="mt-auto p-2 text-slate-400 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">settings</span>
          </div>
        </aside>

        <Outlet />
      </main>
    </div>
  );
};

export default InventoryLayout;
