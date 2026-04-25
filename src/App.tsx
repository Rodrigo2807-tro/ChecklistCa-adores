/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useStore } from './store/useStore';
import { getThemeColors } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AddOrderProxy } from './components/AddOrderProxy';
import { OrderList } from './components/OrderList';
import { HistoryView } from './components/HistoryView';
import { SeparationMode } from './components/SeparationMode';
import { PackagingMode } from './components/PackagingMode';
import { Products } from './components/Products';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useStore();

  const themeColors = getThemeColors(settings.colorTheme || 'Artesanal Marrom');
  
  const themeStyles = {
    '--theme-border': themeColors.border,
    '--theme-bg': themeColors.bg,
    '--theme-bg-light': themeColors.bg.replace('0.06', '0.02').replace('0.1', '0.03'),
  } as React.CSSProperties;

  // Auto-close menu when tab changes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'add_order':
        return <AddOrderProxy setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrderList setActiveTab={setActiveTab} />;
      case 'separation': return <SeparationMode />;
      case 'packaging': return <PackagingMode />;
      case 'history': return <HistoryView setActiveTab={setActiveTab} />;
      case 'products': return <Products setActiveTab={setActiveTab} />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default:
        return <div>Em breve</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-stone-50/50 overflow-hidden font-sans text-stone-900" style={themeStyles}>
      
      {/* Mobile drawer overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - responsive */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-stone-200 z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="logo-text text-xl font-semibold tracking-wide drop-shadow-sm flex items-center gap-1.5">
              <span>Caçadores da</span>
              <span className="text-lg mt-[-2px]">Arte</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-8 relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
