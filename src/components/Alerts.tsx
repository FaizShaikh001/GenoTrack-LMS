import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Activity, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Alert = {
  id: string;
  sample_id: string;
  message: string;
  level: string;
  timestamp: string;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">System Alerts</h2>
          <p className="text-zinc-500 mt-1">Real-time anomaly detection and TAT warnings.</p>
        </div>
        <div className="bg-rose-100 text-rose-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {alerts.length} Active Alerts
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-12 text-center flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
          <h3 className="text-lg font-medium text-emerald-900">All Systems Nominal</h3>
          <p className="text-emerald-700 mt-2">No TAT breaches or anomalies detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden flex">
              <div className="bg-rose-500 w-2 flex-shrink-0"></div>
              <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-start mb-4 sm:mb-0">
                  <div className="bg-rose-100 p-3 rounded-full mr-4 flex-shrink-0">
                    <Activity className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="font-mono font-bold text-zinc-900 mr-3">{alert.sample_id}</span>
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-sm">{alert.message}</p>
                    <div className="flex items-center mt-3 text-xs text-zinc-500 font-medium">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Detected {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col space-x-3 sm:space-x-0 sm:space-y-3">
                  <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                    Investigate
                  </button>
                  <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
