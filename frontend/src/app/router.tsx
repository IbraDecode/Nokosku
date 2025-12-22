import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { useAuth } from './auth';
import { Splash } from '../pages/Splash';
import { Welcome } from '../pages/Welcome';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Home } from '../pages/Home';
import { Deposit } from '../pages/Deposit';
import { DepositDetail } from '../pages/DepositDetail';
import { Buy } from '../pages/Buy';
import { Orders } from '../pages/Orders';
import { OrderDetail } from '../pages/OrderDetail';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';
import { Admin } from '../pages/Admin';

function ProtectedRoute({ adminOnly }: { adminOnly?: boolean }) {
  const { token, profile, isProfileLoading } = useAuth();
  if (!token && !isProfileLoading) return <Navigate to="/login" replace />;
  if (adminOnly && profile && !profile.is_admin) return <Navigate to="/home" replace />;
  return <Outlet />;
}

export function AppRoutes() {
  const element = useRoutes([
    { path: '/', element: <Splash /> },
    { path: '/welcome', element: <Welcome /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/home', element: <Home /> },
        { path: '/deposit', element: <Deposit /> },
        { path: '/deposit/:id', element: <DepositDetail /> },
        { path: '/buy', element: <Buy /> },
        { path: '/orders', element: <Orders /> },
        { path: '/orders/:id', element: <OrderDetail /> },
        { path: '/profile', element: <Profile /> },
        { path: '/settings', element: <Settings /> }
      ]
    },
    {
      element: <ProtectedRoute adminOnly />,
      children: [{ path: '/admin', element: <Admin /> }]
    },
    { path: '*', element: <NotFound /> }
  ]);
  return element;
}
