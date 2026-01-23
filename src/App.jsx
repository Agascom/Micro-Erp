// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Clients from './pages/Clients';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Employees from './pages/Employees';
import Payslips from './pages/Payslips';
import Stock from './pages/Stock';

// New Modules
import Attendance from './pages/Attendance';
import Roles from './pages/Roles';
import Appointments from './pages/Appointments';
import FollowUps from './pages/FollowUps';
import FollowUpDetails from './pages/FollowUpDetails';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Expenses from './pages/Expenses';
import Accounting from './pages/Accounting';

// New Feature Modules
import KpiDashboard from './pages/KpiDashboard';
import Objectives from './pages/Objectives';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Contracts from './pages/Contracts';
import Subscriptions from './pages/Subscriptions';
import Warehouses from './pages/Warehouses';
import Companies from './pages/Companies';
import AuditLogs from './pages/AuditLogs';
import ApiKeys from './pages/ApiKeys';
import Users from './pages/Users';

// Client Portal
import ClientLogin from './pages/ClientLogin';
import ClientLayout from './layouts/ClientLayout';
import ClientDashboard from './pages/ClientDashboard';

import './App.css';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/client-login" element={<ClientLogin />} />

                        {/* Client Protected Routes */}
                        <Route
                            path="/client"
                            element={
                                <ProtectedRoute clientOnly={true}>
                                    <ClientLayout />
                                </ProtectedRoute>
                            }>
                            <Route path="dashboard" element={<ClientDashboard />} />
                            <Route index element={<Navigate to="/client/dashboard" replace />} />
                        </Route>

                        {/* Protected Routes (Admin/Employee) */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <MainLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="products" element={<Products />} />
                            <Route path="categories" element={<Categories />} />
                            <Route path="clients" element={<Clients />} />
                            <Route path="quotes" element={<Quotes />} />
                            <Route path="invoices" element={<Invoices />} />
                            <Route path="employees" element={<Employees />} />
                            <Route path="payslips" element={<Payslips />} />
                            <Route path="stock" element={<Stock />} />
                            
                            {/* RH */}
                            <Route path="attendance" element={<Attendance />} />
                            <Route path="roles" element={<Roles />} />

                            {/* CRM */}
                            <Route path="appointments" element={<Appointments />} />
                            <Route path="follow-ups" element={<FollowUps />} />
                            <Route path="follow-ups/:id" element={<FollowUpDetails />} />

                            {/* Achats & Stock */}
                            <Route path="suppliers" element={<Suppliers />} />
                            <Route path="purchase-orders" element={<PurchaseOrders />} />

                            {/* Projets */}
                            <Route path="projects" element={<Projects />} />
                            <Route path="projects/:id" element={<ProjectDetails />} />

                            {/* Finance */}
                            <Route path="expenses" element={<Expenses />} />
                            <Route path="accounting" element={<Accounting />} />

                            {/* NEW FEATURES */}
                            {/* KPIs & Objectifs */}
                            <Route path="kpi" element={<KpiDashboard />} />
                            <Route path="kpi/objectives" element={<Objectives />} />

                            {/* Paiements */}
                            <Route path="payments" element={<Payments />} />

                            {/* Rapports */}
                            <Route path="reports" element={<Reports />} />

                            {/* Contrats & Abonnements */}
                            <Route path="contracts" element={<Contracts />} />
                            <Route path="subscriptions" element={<Subscriptions />} />

                            {/* Inventaire Avancé */}
                            <Route path="warehouses" element={<Warehouses />} />

                            {/* Multi-Entreprise */}
                            <Route path="companies" element={<Companies />} />

                            {/* Audit & Administration */}
                            <Route path="audit" element={<AuditLogs />} />
                            <Route path="api-keys" element={<ApiKeys />} />
                            <Route path="users" element={<Users />} />
                        </Route>

                        {/* Catch all - redirect to dashboard */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
