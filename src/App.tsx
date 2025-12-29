/**
 * App Component (T044)
 * Main application with tab navigation state management
 * FR-027: ダークテーマのUIを提供
 */

import { CSSProperties, useState } from 'react';
import { theme } from './styles/theme';
import { TabBar } from './components/shared/TabBar';
import { RecordScreen } from './components/workout/RecordScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { LibraryScreen } from './components/library/LibraryScreen';

type Tab = 'record' | 'history' | 'library';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('record');

  const appStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background, // FR-027: Dark theme (black background)
    color: theme.colors.textPrimary,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
    position: 'relative',
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  } as CSSProperties;

  const renderScreen = () => {
    switch (activeTab) {
      case 'record':
        return <RecordScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'library':
        return <LibraryScreen />;
      default:
        return <RecordScreen />;
    }
  };

  return (
    <div style={appStyle}>
      {renderScreen()}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
