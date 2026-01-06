'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#BBDEFB] flex items-center justify-center p-4">
                <div className="animate-pulse text-[#66BB6A] text-xl">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#BBDEFB] pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-[#2E7D32]">Profile</h1>
                    <p className="text-[#757575] mt-1">Manage your Career Quest account</p>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#66BB6A] to-[#42A5F5] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#2E7D32]">{session.user?.name || 'User'}</h2>
                            <p className="text-[#757575]">{session.user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-[#2E7D32] mb-3">Account Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-[#757575]">Name</span>
                                <span className="font-medium text-[#2E7D32]">{session.user?.name || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-[#757575]">Email</span>
                                <span className="font-medium text-[#2E7D32]">{session.user?.email || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-[#757575]">User ID</span>
                                <span className="font-medium text-[#2E7D32] truncate max-w-[200px]">
                                    {session.user?.id || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Progress Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-[#2E7D32] mb-4">Career Progress</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-[#2E7D32]">0</div>
                            <div className="text-sm text-[#757575] mt-1">Domains Explored</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-[#1976D2]">0</div>
                            <div className="text-sm text-[#757575] mt-1">Skills Assessed</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/domain-explorer')}
                        className="w-full bg-gradient-to-r from-[#66BB6A] to-[#42A5F5] text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                        Explore Domains
                    </button>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full bg-white text-[#D32F2F] border-2 border-[#D32F2F] font-semibold py-4 px-6 rounded-xl hover:bg-[#FFEBEE] transition-all duration-300"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
