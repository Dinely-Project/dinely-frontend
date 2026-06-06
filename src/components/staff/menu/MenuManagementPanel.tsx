import React, { useState } from 'react';
import MenuCategoriesPanel from './MenuCategoriesPanel';
import MenuItemsPanel from './MenuItemsPanel';

type MenuTab = 'categories' | 'items';

const MenuManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MenuTab>('categories');

  return (
    <section className="glass-card p-6">
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'categories'
              ? 'bg-[#FF6B35] text-white shadow-[0_8px_24px_rgba(255,107,53,0.3)]'
              : 'border border-white/10 text-white/70 hover:border-white/30 hover:text-white'
          }`}
        >
          Categories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'items'
              ? 'bg-[#FF6B35] text-white shadow-[0_8px_24px_rgba(255,107,53,0.3)]'
              : 'border border-white/10 text-white/70 hover:border-white/30 hover:text-white'
          }`}
        >
          Menu Items
        </button>
      </div>

      {activeTab === 'categories' ? <MenuCategoriesPanel /> : <MenuItemsPanel />}
    </section>
  );
};

export default MenuManagementPanel;
