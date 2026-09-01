import { useState } from 'react'
import BinaryGame from './components/BinaryGame.jsx'
import BinaryHelper from './components/BinaryHelper.jsx'
import SubnetExplorer from './components/SubnetExplorer.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { useTheme } from './hooks/useTheme.js'

const TABS = [
  { id: 'helper', label: 'Helper' },
  { id: 'subnet', label: 'Subnet' },
  { id: 'game', label: 'Game' },
]

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('helper')

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-800 transition-colors dark:bg-zinc-950 dark:text-zinc-200">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-8 sm:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Binary Helper
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              8-bit place values for subnetting
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <div
          role="tablist"
          aria-label="Sections"
          className="mb-6 inline-flex self-start rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-5 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <main className="flex-1">
          <div className={activeTab === 'helper' ? '' : 'hidden'}>
            <BinaryHelper />
          </div>
          <div className={activeTab === 'subnet' ? '' : 'hidden'}>
            <SubnetExplorer />
          </div>
          <div className={activeTab === 'game' ? '' : 'hidden'}>
            <BinaryGame />
          </div>
        </main>
      </div>
    </div>
  )
}
