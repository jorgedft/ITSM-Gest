import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ onMenuToggle }) {
    const { profile } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-10">
            <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar..."
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64" />
            </div>
            <div className="flex items-center gap-3 ml-auto">
                <button className="relative p-2 rounded-lg hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
                        {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-gray-900 leading-tight">{profile?.full_name}</p>
                        <p className="text-gray-500 text-xs capitalize">{profile?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}