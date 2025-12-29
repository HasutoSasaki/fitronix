/**
 * TabBar Component (T043)
 * TDD Green Phase - 仮実装 (Fake It)
 * Bottom navigation bar with 3 tabs
 */

import { CSSProperties } from 'react';
import { theme } from '../../styles/theme';
import { TabItem } from './TabItem';

export interface TabBarProps {
  activeTab: 'record' | 'history' | 'library';
  onTabChange: (tab: 'record' | 'history' | 'library') => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const containerStyle: CSSProperties = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    backgroundColor: theme.colors.surface,
    borderTop: `1px solid ${theme.colors.border}`,
    padding: `${theme.spacing.xs} 0`,
    paddingBottom: `calc(${theme.spacing.xs} + env(safe-area-inset-bottom))`,
    zIndex: 100,
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
  } as CSSProperties;

  // SVG icons for better visual clarity
  const RecordIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );

  const HistoryIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  );

  const LibraryIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );

  return (
    <nav
      style={containerStyle}
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <TabItem
        icon={RecordIcon}
        label="記録"
        isActive={activeTab === 'record'}
        onClick={() => {
          onTabChange('record');
        }}
      />
      <TabItem
        icon={HistoryIcon}
        label="履歴"
        isActive={activeTab === 'history'}
        onClick={() => {
          onTabChange('history');
        }}
      />
      <TabItem
        icon={LibraryIcon}
        label="ライブラリ"
        isActive={activeTab === 'library'}
        onClick={() => {
          onTabChange('library');
        }}
      />
    </nav>
  );
}
