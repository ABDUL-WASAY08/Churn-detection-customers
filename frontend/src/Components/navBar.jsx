import { Cpu, Server } from 'lucide-react';

export const Navbar = () => {
  return (
    <nav className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center border-b border-slate-800 shadow-lg">
      <div className="flex items-center gap-3">
        <Cpu className="text-sky-400 w-3 h-3" />
        <h1 className="text-xl font-bold tracking-wide">AI Churn Prediction Platform</h1>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-full text-slate-300 border border-slate-700">
        <Server className="w-4 h-4 text-emerald-400" /> Express Gateway + FastAPI Microservice
      </div>
    </nav>
  );
};