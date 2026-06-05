import { useState, type FC } from 'react';
import BasicSalaryConfig from './BasicSalaryConfig';
import ManualSalaryOverride from './ManualSalaryOverride';

type SalaryConfigTab = 'basic' | 'manual';

const tabs: { key: SalaryConfigTab; label: string }[] = [
  { key: 'basic', label: 'Basic Config' },
  { key: 'manual', label: 'Manual Override' },
];

const SalaryConfigPanel: FC = () => {
  const [activeTab, setActiveTab] = useState<SalaryConfigTab>('basic');

  return (
    <section>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Salary Configuration</h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>Manage salary baselines and employee-specific overrides.</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: isActive ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: isActive ? '#FF6B35' : '#A0A0A0',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'basic' ? <BasicSalaryConfig /> : <ManualSalaryOverride />}
    </section>
  );
};

export default SalaryConfigPanel;
