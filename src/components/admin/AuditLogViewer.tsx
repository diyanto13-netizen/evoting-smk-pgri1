import React, { useState } from 'react';
import { useVoting } from '../../context/VotingContext';
import { ShieldCheck, Search, Filter, Clock, User } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useVoting();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.userType === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Log Audit & Keamanan Sistem
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan riwayat aktivitas login, pembukaan bilik, dan enkripsi suara digital tanpa melanggar prinsip LUBER
          </p>
        </div>

        {/* Filter Type */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          {['ALL', 'SYSTEM', 'ADMIN', 'OPERATOR', 'STUDENT'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === t
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'ALL'
                ? 'Semua'
                : t === 'SYSTEM'
                ? 'Sistem'
                : t === 'ADMIN'
                ? 'Admin'
                : t === 'OPERATOR'
                ? 'Operator'
                : 'Siswa'}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
        {filteredLogs.map((log) => {
          const userColor =
            log.userType === 'SYSTEM'
              ? 'bg-purple-100 text-purple-800 border-purple-200'
              : log.userType === 'ADMIN'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : log.userType === 'OPERATOR'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';

          return (
            <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                <Clock className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    {log.action}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${userColor}`}>
                    {log.userType}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {log.details}
                </p>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada riwayat log yang cocok dengan filter.
          </div>
        )}
      </div>
    </div>
  );
};
