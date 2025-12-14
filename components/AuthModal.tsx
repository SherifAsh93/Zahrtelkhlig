import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabaseClient';

// Inline SVGs
const IconX = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconMail = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const IconLock = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconUser = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

export const AuthModal: React.FC = () => {
    const { isAuthModalOpen, setIsAuthModalOpen, language } = useStore();
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        city: ''
    });

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });
                if (error) throw error;
                setIsAuthModalOpen(false); // Success
            } else {
                // SIGN UP
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName, // Meta data
                        }
                    }
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Create Profile Record
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: authData.user.id,
                            email: formData.email,
                            full_name: formData.fullName,
                            phone: formData.phone,
                            address: formData.address,
                            city: formData.city
                        }]);
                    
                    if (profileError) {
                        console.error("Profile creation failed:", profileError);
                        // Optional: Retry logic or alert
                    }
                }
                
                alert("Account created successfully! You can now login.");
                setView('login');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="text-xl font-bold">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    <button onClick={() => setIsAuthModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <IconX className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <IconX className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Signup Extra Fields */}
                        {view === 'signup' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                                    <div className="relative">
                                        <IconUser className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="text" 
                                            required 
                                            className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                                    <div className="relative">
                                        <IconPhone className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                        <input 
                                            type="tel" 
                                            required 
                                            className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="01xxxxxxxxx"
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                            <div className="relative">
                                <IconMail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Password</label>
                            <div className="relative">
                                <IconLock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                                <input 
                                    type="password" 
                                    required 
                                    minLength={6}
                                    className="w-full pl-10 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        {view === 'signup' && (
                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">City</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Cairo"
                                        value={formData.city}
                                        onChange={e => setFormData({...formData, city: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Address</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Street 123"
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                             </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-600/20 transition-all flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? <Spinner /> : (view === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {view === 'login' ? (
                            <p>Don't have an account? <button onClick={() => setView('signup')} className="text-primary-600 font-bold hover:underline">Sign Up</button></p>
                        ) : (
                            <p>Already have an account? <button onClick={() => setView('login')} className="text-primary-600 font-bold hover:underline">Login</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};