"use client";

import { Save, Users, Zap, Percent, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function AdminView({ session }: { session: any }) {
  const [rules, setRules] = useState([
    { id: 1, name: "HR", role: "Manager", type: "sequence" },
    { id: 2, name: "Finance", role: "Finance", type: "sequence" },
  ]);

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-500" /> Administrative Controls
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Configure advanced conditional flows and multi-level sequences for your company.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sequence Builder Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Users className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-white mb-6">Approval Rules Structure</h3>
          
          <div className="space-y-4 relative">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="relative z-10">
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl flex justify-between items-center transition-all group-hover:border-zinc-600">
                    <div>
                      <p className="text-white font-medium">{rule.name} Review</p>
                      <p className="text-xs text-zinc-500">Assigned: {rule.role}</p>
                    </div>
                  </div>
                </div>
                {/* Connector Line */}
                {idx !== rules.length - 1 && (
                  <div className="w-px h-6 bg-zinc-700 ml-4 my-1"></div>
                )}
              </div>
            ))}
            
            <div className="w-px h-6 bg-zinc-700 ml-4 my-1"></div>
            
            <button className="flex items-center gap-4 w-full group">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 flex items-center justify-center text-zinc-400 shrink-0 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors">
                +
              </div>
              <span className="text-zinc-400 font-medium group-hover:text-blue-400 transition-colors">Add Next Approver Step</span>
            </button>
          </div>
        </div>

        {/* Conditional Rules Panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Zap className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-bold text-white mb-6">Dynamic Conditions</h3>

          <div className="space-y-6">
            <div className="bg-zinc-800/30 border border-zinc-700/50 p-5 rounded-xl">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-800" defaultChecked />
                <div>
                  <p className="text-white font-medium text-sm">Percentage Override Flow</p>
                  <p className="text-zinc-400 text-xs mt-1">If the specified percentage of assigned approvers agree, bypass remaining sequence.</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm font-bold text-zinc-300">Rule requires:</span>
                    <div className="relative w-24">
                      <input type="number" defaultValue={60} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-3 pr-8 py-2 text-white text-sm" />
                      <Percent className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </label>
            </div>

            <div className="bg-zinc-800/30 border border-zinc-700/50 p-5 rounded-xl opacity-50">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-700" />
                <div>
                  <p className="text-white font-medium text-sm">Specific Director Override</p>
                  <p className="text-zinc-400 text-xs mt-1">If the CEO or CFO approves, immediately mark status as APPROVED bypassing others.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all">
              <Save className="w-5 h-5" /> Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
