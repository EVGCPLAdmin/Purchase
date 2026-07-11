import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AccessProvider } from './context/AccessContext'
import { SettingsProvider } from './context/SettingsContext'
import { AppLayout } from './components/layout/AppLayout'
import { RequirePermission } from './components/RequirePermission'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { PurchasePage } from './pages/Purchase/PurchasePage'
import { StoresPage } from './pages/Stores/StoresPage'
import { AdminPage } from './pages/Admin/AdminPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { DeveloperConfigPage } from './pages/Config/DeveloperConfigPage'

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AccessProvider>
          <HashRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route
                  path="/"
                  element={
                    <RequirePermission permission="dashboard:view">
                      <DashboardPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/purchase"
                  element={
                    <RequirePermission permission="purchase:view">
                      <PurchasePage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/stores"
                  element={
                    <RequirePermission permission="stores:view">
                      <StoresPage />
                    </RequirePermission>
                  }
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route
                  path="/admin"
                  element={
                    <RequirePermission permission="admin:access">
                      <AdminPage />
                    </RequirePermission>
                  }
                />
                <Route
                  path="/config"
                  element={
                    <RequirePermission permission="config:access">
                      <DeveloperConfigPage />
                    </RequirePermission>
                  }
                />
              </Route>
            </Routes>
          </HashRouter>
        </AccessProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
