import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { AppLayout } from './components/AppLayout';
import AuthWrapper from './components/AuthWrapper';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Members from './pages/Members';
import Expenses from './pages/Expenses';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Agenda from './pages/Agenda';
import Commissions from './pages/Commissions';
import Goals from './pages/Goals';
import AdminDashboard from './pages/AdminDashboard';
import { getCurrentUser } from './lib/auth';

export default function App() {
  return (
    <AppProvider>
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="leads" element={<Leads />} />
              <Route path="vendas" element={<Sales />} />
              <Route path="metas" element={<Goals />} />
              <Route path="comissoes" element={<Commissions />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="despesas" element={<Expenses />} />
              <Route path="membros" element={<Members />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthWrapper>
    </AppProvider>
  );
}

