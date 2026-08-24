import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';

import AssetList from './pages/itam/AssetList';
import AssetForm from './pages/itam/AssetForm';
import AssetDetail from './pages/itam/AssetDetail';
import PhoneList from './pages/itam/PhoneList';
import PhoneForm from './pages/itam/PhoneForm';

import TicketList from './pages/helpdesk/TicketList';
import TicketForm from './pages/helpdesk/TicketForm';
import TicketDetail from './pages/helpdesk/TicketDetail';

import ResponsivaList from './pages/responsivas/ResponsivaList';
import ResponsivaForm from './pages/responsivas/ResponsivaForm';

import LicenseList from './pages/licencias/LicenseList';
import LicenseForm from './pages/licencias/LicenseForm';
import MaintenanceLog from './pages/licencias/MaintenanceLog';
import IpManagement from './pages/network/IpManagement';
import CredentialList from './pages/vault/CredentialList';
import MaintenanceList from './pages/maintenance/MaintenanceList';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="assets" element={<AssetList />} />
              <Route path="assets/new" element={<AssetForm />} />
              <Route path="assets/:id" element={<AssetDetail />} />
              <Route path="assets/:id/edit" element={<AssetForm />} />

              <Route path="phones" element={<PhoneList />} />
              <Route path="phones/new" element={<PhoneForm />} />
              <Route path="phones/:id/edit" element={<PhoneForm />} />

              <Route path="tickets" element={<TicketList />} />
              <Route path="tickets/new" element={<TicketForm />} />
              <Route path="tickets/:id" element={<TicketDetail />} />

              <Route path="responsivas" element={<ResponsivaList />} />
              <Route path="responsivas/new" element={<ResponsivaForm />} />

              <Route path="licenses" element={<LicenseList />} />
              <Route path="licenses/new" element={<LicenseForm />} />
              <Route path="network" element={<IpManagement />} />
              <Route path="maintenance" element={<MaintenanceLog />} />
              <Route path="/vault" element={<CredentialList />} />
              <Route path="/maintenance" element={<MaintenanceList />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}