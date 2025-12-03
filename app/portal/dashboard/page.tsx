// app/portal/dashboard/page.tsx
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/portal/login');
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8">Welcome back, {user.email}</h1>
          <div className="bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Your CuraCore Licenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-100 p-6 rounded-lg text-center">
                <p className="text-4xl font-bold">12</p>
                <p className="text-gray-700">Total Purchased</p>
              </div>
              <div className="bg-green-100 p-6 rounded-lg text-center">
                <p className="text-4xl font-bold">8</p>
                <p className="text-gray-700">Active Licenses</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded-lg text-center">
                <p className="text-4xl font-bold">4</p>
                <p className="text-gray-700">Available</p>
              </div>
            </div>
            <button className="mt-8 bg-blue-900 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-blue-800">
              Activate New License
            </button>
          </div>
        </div>
      </div>
    </>
  );
}