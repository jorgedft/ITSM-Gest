import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const { signIn }  = useAuth();
    const navigate    = useNavigate();
    const [apiError, setApiError]   = useState('');
    const [loading,  setLoading]    = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async ({ email, password }) => {
        try {
            setApiError(''); setLoading(true);
            await signIn(email, password);
            navigate('/dashboard', { replace: true });
        } catch (e) {
            setApiError(e.message || 'Credenciales inválidas');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center
                        bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        {/* Contenedor del Logo de la Empresa */}
                        <div className="inline-flex items-center justify-center mb-4">
                            <img 
                                src="/logo.png" 
                                alt="Logo Empresa" 
                                className="h-16 w-auto object-contain" 
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">ITSM — Gestión TI</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Departamento de Tecnología
                        </p>
                    </div>

                    {apiError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200
                                        text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
                            <AlertCircle size={16} className="shrink-0" />
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="label">Correo electrónico</label>
                            <div className="relative">
                                <Mail size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" className="input-field pl-9"
                                    placeholder="usuario@empresa.com"
                                    {...register('email', { required: 'Requerido' })} />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Contraseña</label>
                            <div className="relative">
                                <Lock size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="password" className="input-field pl-9"
                                    placeholder="••••••••"
                                    {...register('password', { required: 'Requerido' })} />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Link to="/reset-password"
                                className="text-xs text-brand-600 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading
                                ? <span className="h-4 w-4 animate-spin rounded-full
                                                   border-2 border-white border-t-transparent" />
                                : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} Departamento de TI TREGGO — Todos los derechos reservados
                </p>
            </div>
        </div>
    );
}