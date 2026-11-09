import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
const App = lazy(() => import('./App.jsx'));

// Lazy load the Admin Panel bundle so standard portfolio visitors never download admin code
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

async function start() {
if (!/^\/admin(?:\/|$)/.test(location.pathname)) {
  const {loadPublished} = await import('./data/published');
  await loadPublished();
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin Dashboard: Appears strictly and exclusively under /admin */}
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div
                  style={{
                    height: '100vh',
                    background: '#0c0d0f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#e68a2e',
                    fontFamily: 'sans-serif',
                    fontSize: '14px',
                  }}
                >
                  Loading Shinobi Admin...
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />

        {/* Public Portfolio (3D Konoha Village & 2D Mode): Appears on all regular URLs */}
        <Route path="/*" element={<Suspense fallback={null}><App /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

}
start();
