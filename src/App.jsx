import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AppProvider, useApp } from '@/lib/store';
import ScrollToTop from './components/ScrollToTop';
import { PeriodProvider } from '@/lib/period';
import { FiltersProvider } from '@/lib/filters';
import Layout from '@/components/Layout';
import SignIn from '@/pages/SignIn';
import Dashboard from '@/pages/Dashboard';
import Add from '@/pages/Add';
import Transactions from '@/pages/Transactions';
import Reports from '@/pages/Reports';
import Categories from '@/pages/Categories';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';

const Gate = () => {
  const { user, loaded } = useApp();
  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary" />
      </div>
    );
  }
  // ACC-01 / ACC-08: UI-level sign-in gate
  if (!user) return <SignIn />;
  return (
    <PeriodProvider>
      <FiltersProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<Add />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </FiltersProvider>
    </PeriodProvider>
  );
};

function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <AppProvider>
          <Gate />
        </AppProvider>
      </Router>
      <Toaster />
    </>
  )
}

export default App