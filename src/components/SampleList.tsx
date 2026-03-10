import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search, Filter, MoreHorizontal } from 'lucide-react';

type Sample = {
  id: string;
  patient_id: string;
  sample_type: string;
  test_ordered: string;
  priority_level: number;
  status: string;
  received_at: string;
  expected_completion: string;
};

export default function SampleList() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/samples')
      .then(res => res.json())
      .then(data => {
        setSamples(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredSamples = samples.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.test_ordered.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-lg font-semibold text-zinc-900">All Samples</h2>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search ID, Patient, Test..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Sample ID</th>
              <th className="px-6 py-4">Patient ID</th>
              <th className="px-6 py-4">Test Ordered</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Received</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">Loading samples...</td>
              </tr>
            ) : filteredSamples.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">No samples found</td>
              </tr>
            ) : (
              filteredSamples.map(sample => (
                <tr key={sample.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-zinc-900">{sample.id}</td>
                  <td className="px-6 py-4">{sample.patient_id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-800">{sample.test_ordered}</td>
                  <td className="px-6 py-4">{sample.sample_type}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {sample.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sample.priority_level >= 80 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        STAT
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Routine
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(sample.received_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
