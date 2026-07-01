import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import Budget from './pages/Budget';
import { ThemeProvider } from './context/ThemeContext';


function App() {
  return (
  <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="goals" element={<Goals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="budgets" element={<Budget />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;
