import React, { useState } from 'react';
import { 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  Globe, 
  Layers, 
  Activity, 
  CheckCircle2, 
  X,
  Gauge
} from 'lucide-react';

interface ScalabilityModalProps {
  onClose: () => void;
}

export const ScalabilityModal: React.FC<ScalabilityModalProps> = ({ onClose }) => {
  const [concurrentUsers, setConcurrentUsers] = useState<number>(8500);

  // Scalability math formulas
  const pgbouncerConnections = Math.min(100, Math.ceil(concurrentUsers / 85));
  const redisCacheHitRatio = (98.4 + (concurrentUsers % 5) * 0.1).toFixed(1);
  const webrtcSFUNodes = Math.max(2, Math.ceil(concurrentUsers / 2000));
  const reqPerSecond = (concurrentUsers * 4.2).toFixed(0);
  const avgResponseTimeMs = Math.round(14 + (concurrentUsers / 25000) * 12);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                High-Concurrency System Design
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Platform Scalability Blueprint (10,000+ Concurrent Students)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Interactive Load Simulator */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>Simulated Concurrent Active Traffic</span>
              </div>
              <div className="text-base font-extrabold text-emerald-600 tabular-nums">
                {concurrentUsers.toLocaleString()} Concurrent Students
              </div>
            </div>

            <input
              type="range"
              min={500}
              max={25000}
              step={500}
              value={concurrentUsers}
              onChange={(e) => setConcurrentUsers(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Throughput</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                  {Number(reqPerSecond).toLocaleString()} req/sec
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Avg API Latency</div>
                <div className="text-sm font-bold text-emerald-600 tabular-nums">
                  {avgResponseTimeMs} ms
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">PgBouncer Pool</div>
                <div className="text-sm font-bold text-indigo-600 tabular-nums">
                  {pgbouncerConnections} active
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">WebRTC SFU Nodes</div>
                <div className="text-sm font-bold text-blue-600 tabular-nums">
                  {webrtcSFUNodes} Clusters
                </div>
              </div>
            </div>
          </div>

          {/* 5-Tier Architecture Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Architectural Tiers for Zero-Bottleneck Scalability
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>1. Edge CDN & Anycast Layer</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Global Cloudflare / CloudFront edge cache serves compiled curriculum PDFs, audio phrase waveforms, and SPA assets. Sub-20ms TTFB for learners across Europe, North America, and East Africa without hitting primary web servers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>2. PostgreSQL with PgBouncer Pooling</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Prevents connection exhaustion when 10,000 students browse simultaneously. Transaction-level pooling throttles connections, while Read Replicas handle syllabus and progress queries, reserving Master DB for Daraja M-Pesa webhooks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>3. Redis Cluster & Idempotency Locks</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  In-memory state manages the real-time "I am Ready for Class" queue and prevents double-debiting on Safaricom M-Pesa callbacks using distributed redlock keys.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>4. WebRTC SFU Media Clusters</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  Selective Forwarding Units (SFUs) distribute 1-on-1 and small-group live video/audio tutoring sessions efficiently. Client encryptions remain untouched end-to-end (Insertable Streams / E2EE).
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
