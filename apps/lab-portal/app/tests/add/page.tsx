'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { TestTube, ArrowLeft } from 'lucide-react';

export default function AddTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labId, setLabId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    sampleType: '',
    turnaroundTime: '',
    preparationRequired: false,
    preparationInstructions: '',
    parameters: '',
  });

  useEffect(() => {
    const labData = localStorage.getItem('lab');
    if (!labData) {
      router.push('/login');
      return;
    }
    const lab = JSON.parse(labData);
    setLabId(lab.labId);
  }, [router]);

  const categories = [
    'Blood Tests',
    'Urine Tests',
    'Radiology',
    'Pathology',
    'Microbiology',
    'Biochemistry',
    'Hematology',
    'Immunology',
    'Cardiology',
    'Diabetes',
    'Thyroid',
    'Liver Function',
    'Kidney Function',
  ];

  const sampleTypes = ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Swab'];
  const turnaroundTimes = ['6 hours', '12 hours', '24 hours', '48 hours', '72 hours', '1 week'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/labs/${labId}/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
          parameters: formData.parameters.split(',').map(p => p.trim()).filter(p => p),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Test added successfully!');
        router.push('/dashboard');
      } else {
        setError(data.message || 'Failed to add test');
      }
    } catch (error) {
      console.error('Error adding test:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <TestTube className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Test</h1>
            <p className="text-gray-600">Add a new diagnostic test to your laboratory</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g., Complete Blood Count (CBC)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="input"
                  placeholder="Describe what this test measures..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Type
                </label>
                <select
                  name="sampleType"
                  value={formData.sampleType}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Sample Type</option>
                  {sampleTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) - Optional
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turnaround Time
                </label>
                <select
                  name="turnaroundTime"
                  value={formData.turnaroundTime}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Time</option>
                  {turnaroundTimes.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="preparationRequired"
                    checked={formData.preparationRequired}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Preparation Required (e.g., fasting)
                  </span>
                </label>
              </div>

              {formData.preparationRequired && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Instructions
                  </label>
                  <textarea
                    name="preparationInstructions"
                    value={formData.preparationInstructions}
                    onChange={handleChange}
                    rows={3}
                    className="input"
                    placeholder="e.g., Fasting for 8-12 hours required"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parameters (comma-separated)
                </label>
                <input
                  type="text"
                  name="parameters"
                  value={formData.parameters}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., RBC, WBC, Platelets, Hemoglobin"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter parameters separated by commas
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Adding Test...' : 'Add Test'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
