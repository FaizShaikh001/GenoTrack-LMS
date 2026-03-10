import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle } from 'lucide-react';

export default function AddSample() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    sample_type: 'Blood',
    test_ordered: 'Clinical WES',
    priority_level: 10
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to create sample');
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-zinc-200">
        <h2 className="text-xl font-semibold text-zinc-900">Accession New Sample</h2>
        <p className="mt-1 text-sm text-zinc-500">Enter sample details to begin tracking in the LIMS.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="patient_id" className="block text-sm font-medium text-zinc-700">Patient ID</label>
            <input
              type="text"
              id="patient_id"
              required
              value={formData.patient_id}
              onChange={e => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
              placeholder="e.g., PAT-12345"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sample_type" className="block text-sm font-medium text-zinc-700">Sample Type</label>
            <select
              id="sample_type"
              value={formData.sample_type}
              onChange={e => setFormData({ ...formData, sample_type: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow bg-white"
            >
              <option value="Blood">Blood</option>
              <option value="Saliva">Saliva</option>
              <option value="FFPE">FFPE</option>
              <option value="Amniotic_Fluid">Amniotic Fluid</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="test_ordered" className="block text-sm font-medium text-zinc-700">Test Ordered</label>
            <select
              id="test_ordered"
              value={formData.test_ordered}
              onChange={e => setFormData({ ...formData, test_ordered: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow bg-white"
            >
              <option value="Clinical WES">Clinical WES</option>
              <option value="Clinical WGS">Clinical WGS</option>
              <option value="Targeted Panel">Targeted Panel</option>
              <option value="NICU Rapid WGS">NICU Rapid WGS</option>
              <option value="Oncology Panel">Oncology Panel</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="priority_level" className="block text-sm font-medium text-zinc-700">Priority Level</label>
            <select
              id="priority_level"
              value={formData.priority_level}
              onChange={e => setFormData({ ...formData, priority_level: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow bg-white"
            >
              <option value={10}>Routine (10)</option>
              <option value={50}>Elevated (50)</option>
              <option value={80}>Urgent (80)</option>
              <option value={100}>STAT / Rapid (100)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Sample
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
