import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

// Eagerly load the main chat page (critical path)
import ChatPage from './pages/ChatPage';

// Lazy-load all secondary pages — code split for fast initial load
// Named exports need `.then(m => ({ default: m.PageName }))`
const RWV1SuperPage = lazy(() => import('./pages/RWV1SuperPage').then(m => ({ default: m.RWV1SuperPage })));
const WhaleCodePage = lazy(() => import('./pages/WhaleCodePage').then(m => ({ default: m.WhaleCodePage })));
const BuildWhalePage = lazy(() => import('./pages/BuildWhalePage').then(m => ({ default: m.BuildWhalePage })));
const HowToBuildPage = lazy(() => import('./pages/HowToBuildPage').then(m => ({ default: m.HowToBuildPage })));
const PlanningPage = lazy(() => import('./pages/PlanningPage').then(m => ({ default: m.PlanningPage })));
const TimetablePage = lazy(() => import('./pages/TimetablePage').then(m => ({ default: m.TimetablePage })));
const RWIntelligencePage = lazy(() => import('./pages/RWIntelligencePage').then(m => ({ default: m.RWIntelligencePage })));
const WebSecretPage = lazy(() => import('./pages/WebSecretPage').then(m => ({ default: m.WebSecretPage })));
const HackMasterPage = lazy(() => import('./pages/HackMasterPage').then(m => ({ default: m.HackMasterPage })));
const WorldSecretsPage = lazy(() => import('./pages/WorldSecretsPage').then(m => ({ default: m.WorldSecretsPage })));
const ZipWhalePage = lazy(() => import('./pages/ZipWhalePage').then(m => ({ default: m.ZipWhalePage })));
const NanoRedWhalePage = lazy(() => import('./pages/NanoRedWhalePage').then(m => ({ default: m.NanoRedWhalePage })));
const APISettingsPage = lazy(() => import('./pages/APISettingsPage').then(m => ({ default: m.APISettingsPage })));
const UICustomizationPage = lazy(() => import('./pages/UICustomizationPage'));

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  { name: 'Red Whale', path: '/', element: <ChatPage /> },
  { name: 'RW V1 SUPER', path: '/rw-v1-super', element: <RWV1SuperPage /> },
  { name: 'Whale Code V1', path: '/whale-code', element: <WhaleCodePage /> },
  { name: 'Build Whale V1', path: '/build-whale', element: <BuildWhalePage /> },
  { name: 'How To Build', path: '/how-to-build', element: <HowToBuildPage /> },
  { name: 'Planning Model', path: '/planning', element: <PlanningPage /> },
  { name: 'Timetable Model', path: '/timetable', element: <TimetablePage /> },
  { name: 'RW Intelligence', path: '/rw-intelligence', element: <RWIntelligencePage /> },
  { name: 'Web Secret', path: '/web-secret', element: <WebSecretPage /> },
  { name: 'Hack Master', path: '/hack-master', element: <HackMasterPage /> },
  { name: 'World Secrets', path: '/world-secrets', element: <WorldSecretsPage /> },
  { name: 'ZIP WHALE', path: '/zip-whale', element: <ZipWhalePage /> },
  { name: 'NANO RED WHALE', path: '/nano-red-whale', element: <NanoRedWhalePage /> },
  { name: 'API Settings', path: '/api-settings', element: <APISettingsPage />, visible: false },
  { name: 'UI Customization', path: '/ui-customization', element: <UICustomizationPage />, visible: false },
];

export default routes;

// Simple loading spinner for Suspense fallback
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
