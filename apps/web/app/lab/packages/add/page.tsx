'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, ArrowLeft, Plus, X } from 'lucide-react';

interface Test {
  _id: string;
  testId: string;
  name: string;
  price: number;
}

export default function AddPackagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [labId, setLabId] = useState('');
  const [tests, setTests] = useState<Test[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    testsIncluded: [] as string[],
    features: [''] as string[],
  });

  useEffect(() => {
    const labData = localStorage.getItem('lab');
    if (!labData) {
      router.push('/lab/login');
      return;
    }
    const lab = JSON.parse(labData);
    setLabId(lab.labId);
    loadTests(lab.labId);
  }, [router]);

  const loadTests = async (labId: string) => {
    try {
      const response = await fetch(`http://10.29.34.207:4000/api/labs/${labId}/tests`);
      const data = await response.json();
      if (data.success) {
        setTests(data.tests.filter((t: Test) => t));
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const categories = [
    'Full Body',
    'Heart Health',
    'Diabetes',
    'Thyroid',
    'Women Wellness',
    'Men Wellness',
    'Senior Citizen',
    'Fever Panel',
    'Immunity',
    'Vitamin Profile',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTestToggle = (testId: string) => {
    if (formData.testsIncluded.includes(testId)) {
      setFormData({
        ...formData,
        testsIncluded: formData.testsIncluded.filter(id => id !== testId),
      });
    } else {
      setFormData({
        ...formData,
        testsIncluded: [...formData.testsIncluded, testId],
      });
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.testsIncluded.length === 0) {
      setError('Please select at least one test');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://10.29.34.207:4000/api/labs/${labId}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: parseFloat(formData.originalPrice),
          features: formData.features.filter(f => f.trim()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Package added successfully!');
        router.push('/lab/dashboard');
      } else {
        setError(data.message || 'Failed to add package');
      }
    } catch (error) {
      console.error('Error adding package:', error);
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
            <Package className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Package</h1>
            <p className="text-gray-600">Create a health package with multiple tests</p>
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
                  Package Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="e.g., Full Body Checkup"
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
                  placeholder="Describe what this package includes..."
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
                  placeholder="999"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="2500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tests Included
              </label>
              {tests.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No tests available. Please add tests first before creating packages.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/lab/tests/add')}
                    className="btn btn-primary mt-3"
                  >
                    Add Tests
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {tests.map(test => (
                    <label
                      key={test._id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.testsIncluded.includes(test.testId)}
                        onChange={() => handleTestToggle(test.testId)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{test.name}</p>
                        <p className="text-sm text-gray-600">₹{test.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.testsIncluded.length} test(s)
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Package Features
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="input flex-1"
                      placeholder="e.g., Free home collection"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
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
                disabled={loading || tests.length === 0}
                className="btn btn-primary flex-1"
              >
                {loading ? 'Adding Package...' : 'Add Package'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}
