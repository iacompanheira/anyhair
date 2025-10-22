import { useState, useEffect } from 'react';
import type { View, DashboardView } from '../types';

interface RouterState {
  view: View;
  dashboardView: DashboardView;
}

const parseHash = (): RouterState => {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts[0] === 'dashboard') {
    return {
      view: 'dashboard',
      dashboardView: (parts[1] as DashboardView) || 'main',
    };
  }
  
  // A simple map for top-level routes
  const viewMap: { [key: string]: View } = {
    'login': 'login',
    'confirmation': 'confirmation',
    'appointments': 'appointments',
    'history': 'history',
    'subscription': 'subscription',
    'store': 'store',
    'profile': 'profile',
  };
  
  const view = viewMap[parts[0]] || 'home';

  return {
    view,
    dashboardView: 'main', // Default dashboard view when not in dashboard
  };
};

export const useRouter = (): RouterState => {
  const [routerState, setRouterState] = useState<RouterState>(parseHash());

  useEffect(() => {
    const handleHashChange = () => {
        window.scrollTo(0, 0);
        setRouterState(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return routerState;
};