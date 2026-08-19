import { useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Gauge,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { trainDataStore } from '../zustand/traningdataState';

const STATUS_META = {
  idle:       { label: 'Idle',           color: 'bg-slate-100 text-slate-600 border-slate-300', icon: Clock },
  processing: { label: 'Processing',     color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Loader2, spin: true },
  queued:     { label: 'Queued',         color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
  completed:  { label: 'Completed',      color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 },
  failed:     { label: 'Failed',         color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

export const StatusCard = () => {
  const {
    response,
    status,
    statusLoading,
    tree,
    treeLoading,
    getStatus,
    getTree,
  } = trainDataStore();

  // Restore state from the ML engine on mount / after training
  useEffect(() => {
    if (response) {
      getStatus();
      const timer = setInterval(() => getStatus(), 2500);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [response, getStatus]);

  // Load the tree once training finishes
  useEffect(() => {
    const st = status?.status ?? '';
    if (st.startsWith('completed')) {
      getTree();
    }
  }, [status?.status, getTree]);

  // Restore the current status once on mount (e.g. page refresh)
  useEffect(() => {
    if (!response) getStatus();
  }, [response, getStatus]);

  const normalize = (st) => {
    if (!st) return 'idle';
    if (typeof st === 'string' && st.startsWith('failed')) return 'failed';
    return st;
  };

  const meta = STATUS_META[normalize(status?.status)] || STATUS_META.idle;
  const StatusIcon = meta.icon;
  const isProcessing = normalize(status?.status) === 'processing';
  const accuracy =
    typeof status?.accuracy === 'number' ? Math.min(100, Math.max(0, status.accuracy)) : null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-500" />
          <h2 className="text-lg font-semibold text-slate-800">Training Status</h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.color}`}
          >
            {meta.spin ? (
              <StatusIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <StatusIcon className="w-3.5 h-3.5" />
            )}
            {meta.label}
          </span>

          <button
            onClick={() => getStatus()}
            disabled={statusLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!response && !status ? (
        <div className="flex items-center gap-3 text-sm text-slate-400 py-6 justify-center">
          <Clock className="w-4 h-4" />
          Submit a dataset URL above to start training.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Accuracy */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <Gauge className="w-4 h-4 text-emerald-500" />
                Accuracy
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {accuracy !== null ? `${status.accuracy}%` : '--'}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000"
                style={{ width: accuracy !== null ? `${accuracy}%` : '0%' }}
              />
            </div>
          </div>

          {/* Total rows */}
          <div className="rounded-lg border border-slate-200 p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              <Database className="w-4 h-4 text-sky-500" />
              Total Rows
            </div>
            <span className="text-sm font-bold text-slate-800">
              {status?.totalRows ? status.totalRows.toLocaleString() : '--'}
            </span>
          </div>

          {/* Tree state */}
          <div className="rounded-lg border border-slate-200 p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              {treeLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
              ) : (
                <Activity className="w-4 h-4 text-violet-500" />
              )}
              Decision Tree
            </div>
            <span className="text-sm font-bold text-slate-800">
              {tree ? 'Ready to visualize' : isProcessing ? 'Training…' : 'Not available'}
            </span>
          </div>
        </div>
      )}

      {!response && status && normalize(status.status) === 'failed' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4" />
          {status.status}
        </div>
      )}
    </div>
  );
};