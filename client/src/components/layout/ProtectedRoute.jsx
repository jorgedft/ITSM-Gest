import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                    <p className="text-sm text-gray-500">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}