// src/pages/errors/CompleteOrganizationPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Building2, ArrowRight, AlertCircle } from 'lucide-react';

export const CompleteOrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    industry: '',
    employeeCount: ''
  });

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Real Estate',
    'Construction',
    'Retail',
    'Manufacturing',
    'Transportation',
    'Government',
    'Non-profit',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: formData.organizationName,
          slug: formData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          industry: formData.industry,
          employee_count: parseInt(formData.employeeCount) || 0
        }])
        .select()
        .single();

      if (orgError) throw orgError;

      // Update user with organization
      const { error: userError } = await supabase
        .from('users')
        .update({ organization_id: org.id })
        .eq('id', user?.id);

      if (userError) throw userError;

      // Create onboarding progress
      await supabase.from('onboarding_progress').insert([{
        user_id: user?.id,
        organization_id: org.id,
        current_step: 0,
        steps_completed: '[]',
        steps_skipped: '[]'
      }]);

      // Refresh user data
      await supabase.auth.refreshSession();
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Organization</h1>
          <p className="text-gray-600 mt-2">Set up your company to start using WorkSphere AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Organization Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Acme Inc."
                required
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Select your industry"
                required
              >
                <option value="">Select industry</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Employee Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees
              </label>
              <input
                type="number"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="50"
                min="1"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
