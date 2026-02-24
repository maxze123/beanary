import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { Library, BeanDetail, NewBean, LogShot, Settings, ShotDetail } from './pages';
import { useThemeStore, applyTheme, setupThemeListener } from './stores/themeStore';

function App() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
    const cleanup = setupThemeListener(mode);
    return cleanup;
  }, [mode]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Library />} />
          <Route path="/bean/new" element={<NewBean />} />
          <Route path="/bean/:id" element={<BeanDetail />} />
          <Route path="/bean/:id/shot" element={<LogShot />} />
          <Route path="/bean/:beanId/shot/:shotId" element={<ShotDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
