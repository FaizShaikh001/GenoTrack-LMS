import { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

const STAGES = [
  'Accessioning',
  'DNA Extraction',
  'Library Prep',
  'Sequencing',
  'Bioinformatics',
  'Reporting',
  'Dispatch'
];

export default function Dashboard() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/samples/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSamples(samples.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-zinc-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center text-zinc-500 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Active Samples</h3>
          </div>
          <p className="text-3xl font-semibold text-zinc-900">
            {samples.filter(s => s.status !== 'Dispatch').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center text-rose-500 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <h3 className="font-medium">STAT / Urgent</h3>
          </div>
          <p className="text-3xl font-semibold text-zinc-900">
            {samples.filter(s => s.priority_level >= 80 && s.status !== 'Dispatch').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center text-emerald-500 mb-2">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Completed Today</h3>
          </div>
          <p className="text-3xl font-semibold text-zinc-900">
            {samples.filter(s => s.status === 'Dispatch').length}
          </p>
        </div>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div key={stage} className="flex-shrink-0 w-80 bg-zinc-100/50 rounded-xl border border-zinc-200 p-4 flex flex-col h-[calc(100vh-16rem)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-zinc-800">{stage}</h3>
              <span className="bg-zinc-200 text-zinc-600 text-xs font-semibold px-2 py-1 rounded-full">
                {samples.filter(s => s.status === stage).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {samples.filter(s => s.status === stage).map(sample => (
                <div 
                  key={sample.id} 
                  className={`bg-white p-4 rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                    sample.priority_level >= 80 ? 'border-rose-200 border-l-4 border-l-rose-500' : 'border-zinc-200'
                  }`}
                  onClick={() => {
                    const currentIndex = STAGES.indexOf(stage);
                    if (currentIndex < STAGES.length - 1) {
                      updateStatus(sample.id, STAGES[currentIndex + 1]);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-semibold text-zinc-500">{sample.id}</span>
                    {sample.priority_level >= 80 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        STAT
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-zinc-900 text-sm mb-1">{sample.test_ordered}</h4>
                  <div className="text-xs text-zinc-500 flex justify-between items-center mt-3">
                    <span>{sample.sample_type}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(sample.expected_completion), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
