import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Cpu } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function ResetPassword() {
    const [email,   setEmail]   = useState('');
    const [sent,    setSent]    = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        setSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4">
                        <Cpu size={28} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Recuperar contraseña</h1>
                </div>
                {sent ? (
                    <div className="text-center text-sm text-gray-600">
                        <p>✅ Revisa tu correo <strong>{email}</strong> para restablecer tu contraseña.</p>
                        <Link to="/login" className="mt-4 inline-block text-brand-600 hover:underline">Volver al login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">Correo electrónico</label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="email" required className="input-field pl-9"
                                    placeholder="usuario@empresa.com"
                                    value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                        <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-2">
                            <ArrowLeft size={14} /> Volver al login
                        </Link>
                    </form>
                )}
            </div>
        </div>
    );
}