import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { Library, BeanDetail, NewBean, LogShot, Settings } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Library />} />
          <Route path="/bean/new" element={<NewBean />} />
          <Route path="/bean/:id" element={<BeanDetail />} />
          <Route path="/bean/:id/shot" element={<LogShot />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
