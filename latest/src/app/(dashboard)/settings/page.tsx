"use client";

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUser } from '@/hooks/useUser';
import { deleteAccount } from '@/api/UserAPI';
import { toast } from '@/lib/toast';

export default function SettingsPage() {
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Set userDataLoading to false once user data is available
  useEffect(() => {
    if (user) {
      setUserDataLoading(false);
    }
  }, [user]);

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      setLoading(true);
      try {
        await deleteAccount();
        logout();
        toast.success('Account deleted successfully.');
      } catch (error) {
        toast.error('Failed to delete account.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Show loading state while user data is being fetched
  if (userDataLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  // If still no user data after loading (user not logged in)
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-center">You need to be logged in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold">Settings</h2>

      <section>
        <h3 className="text-lg font-semibold">User Information</h3>
        <div className="mt-4">
          <label>Name</label>
          <input 
            type="text" 
            defaultValue={`${user.FirstName || ''} ${user.LastName || ''}`} 
            className="input input-bordered w-full mt-1" 
          />
        </div>
        <div className="mt-4">
          <label>Email</label>
          <input 
            type="email" 
            defaultValue={user.Email || ''} 
            className="input input-bordered w-full mt-1" 
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold">Theme</h3>
        <ThemeToggle />
      </section>

      <section>
        <h3 className="text-lg font-semibold">Account Actions</h3>
        <button
          className="btn btn-error mt-4"
          onClick={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </section>
    </div>
  );
}