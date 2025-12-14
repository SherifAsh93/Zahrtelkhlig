import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../supabaseClient';
import { Order } from '../types';

// Inline SVGs
const IconX = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const IconUser = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPackage = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9.75"/></svg>;
const IconLogOut = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

const Spinner = () => (
    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
);

export const UserProfile: React.FC = () => {
    const { isProfileOpen, setIsProfileOpen, user, signOut } = useStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isProfileOpen && user) {
            fetchUserOrders();
        }
    }, [isProfileOpen, user]);

    const fetchUserOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('Orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isProfileOpen) return null;

    if (!user) {
        setIsProfileOpen(false);
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-2xl animate-scale-in h-[85vh] flex flex-col md:flex-row overflow-hidden">
                
                {/* Sidebar Info */}
                <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between md:justify-center mb-6">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-600 text-3xl font-bold">
                            {user.full_name.charAt(0)}
                        </div>
                        <button onClick={() => setIsProfileOpen(false)} className="md:hidden p-2 text-gray-500">
                            <IconX className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="text-center md:text-left space-y-4 flex-grow">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.full_name}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span className="font-medium">{user.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">City</span>
                                <span className="font-medium">{user.city}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500 block mb-1">Address</span>
                                <span className="font-medium">{user.address}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={signOut}
                        className="mt-6 w-full flex items-center justify-center gap-2 p-3 text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold"
                    >
                        <IconLogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>

                {/* Orders Content */}
                <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-900">
                     <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <IconPackage className="w-6 h-6 text-primary-600" />
                            My Orders
                        </h3>
                        <button onClick={() => setIsProfileOpen(false)} className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <IconX className="w-6 h-6" />
                        </button>
                     </div>

                     <div className="flex-grow overflow-y-auto p-6">
                        {loading ? (
                            <div className="py-12"><Spinner /></div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <IconPackage className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>You haven't placed any orders yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase font-bold">Order ID</span>
                                                <p className="font-mono font-bold">#{order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 uppercase font-bold">Date</span>
                                                <p className="text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize
                                                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-primary-600 text-lg">{order.total_amount} EGP</span>
                                            </div>
                                            
                                            {/* Order Items Preview */}
                                            <div className="space-y-2">
                                                {order.items && order.items.map((item, idx) => (
                                                    <div key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                        <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x</span>
                                                        <span className="truncate">{item.nameEn}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};