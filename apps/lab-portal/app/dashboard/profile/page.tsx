'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Phone, Mail } from 'lucide-react';

export default function ProfilePage() {
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [lab, setLab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Forms
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '', description: ''
  });

  useEffect(() => {
    fetchLab();
  }, []);

  const fetchLab = async () => {
    try {
      const u = localStorage.getItem('labUser');
      if (!u) return;
      const parsed = JSON.parse(u);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${parsed.labId}`);
      const data = await res.json();
      if (data.success) {
        setLab(data.lab);
        setFormData({
          name: data.lab.name || '',
          phone: data.lab.phone || '',
          address: data.lab.address || '',
          city: data.lab.city || '',
          state: data.lab.state || '',
          pincode: data.lab.pincode || '',
          description: data.lab.description || ''
        });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const u = localStorage.getItem('labUser');
      if (!u) return;
      const parsed = JSON.parse(u);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${parsed.labId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Lab Profile</h1>
          <p className="text-sm text-gray-500">Manage your laboratory's public details and contact information.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 text-blue-600 font-medium">
            <Building2 className="w-5 h-5"/> Basic Details
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium leading-none text-gray-700">Lab Name</label>
              <input name="name" value={formData.name} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="text-sm font-medium leading-none text-gray-700">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 text-blue-600 font-medium">
            <Phone className="w-5 h-5"/> Contact & Location
          </div>
          <div className="space-y-4">
             <div>
              <label className="text-sm font-medium leading-none text-gray-700">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div>
              <label className="text-sm font-medium leading-none text-gray-700">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="text-sm font-medium leading-none text-gray-700">City</label>
                <input name="city" value={formData.city} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-medium leading-none text-gray-700">State</label>
                <input name="state" value={formData.state} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <div className="col-span-1">
                <label className="text-sm font-medium leading-none text-gray-700">Pincode</label>
                <input name="pincode" value={formData.pincode} onChange={handleChange} className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
