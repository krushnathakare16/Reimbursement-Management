"use client";

import { Save, Users, Zap, Percent, ShieldCheck, Trash2, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import UserManagement from "./UserManagement";
import ManagerView from "./ManagerView";

export default function AdminView({ session }: { session: any }) {
  const [rules, setRules] = useState<string[]>(["MANAGER", "FINANCE"]);
  const [isSaving, setIsSaving] = useState(false);
  const [newRuleSelection, setNewRuleSelection] = useState("CFO");

  useEffect(() => {
    fetch('/api/admin/rules')
      .then(res => res.json())
      .then(data => {
        if (data.rule) {
           setRules(JSON.parse(data.rule.configJson).sequence);
        }
      });
  }, []);

  const handleAddStep = () => {
    if (!rules.includes(newRuleSelection)) {
      setRules([...rules, newRuleSelection]);
    } else {
      alert(`The ${newRuleSelection} phase is already in your global pipeline sequence!`);
    }
  };

  const handleRemoveStep = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    await fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sequence: rules })
    });
    setIsSaving(false);
    alert("Global Approval Structure saved securely deployed to Database!");
  };

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
              <div key={idx} className="relative z-10">
                <div className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl flex justify-between items-center transition-all group-hover:border-blue-500/30">
                    <div>
                      <p className="text-white font-medium">{rule} Review Phase</p>
                      <p className="text-xs text-zinc-500">System Role Map: {rule}</p>
                    </div>
                    <button onClick={() => handleRemoveStep(idx)} className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                       <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Connector Line */}
                {idx !== rules.length - 1 && (
                  <div className="w-px h-6 bg-zinc-700 ml-4 my-1"></div>
                )}
              </div>
            ))}
            
            <div className="flex items-center gap-4 w-full pt-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <select 
                value={newRuleSelection} 
                onChange={(e) => setNewRuleSelection(e.target.value)} 
                className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none font-medium flex-1 max-w-[200px]"
              >
                <option value="MANAGER">Manager Level</option>
                <option value="FINANCE">Finance Dept</option>
                <option value="CFO">CFO / Director</option>
                <option value="ADMIN">System Administrator</option>
              </select>
              <button 
                onClick={handleAddStep} 
                className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border border-zinc-700"
              >
                Append Step
              </button>
            </div>
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
            <button onClick={saveConfiguration} disabled={isSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2 transition-all">
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Global Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-zinc-800">
        <UserManagement session={session} />
      </div>

      {/* Renders all broadcasted expenses for Global Admin Override / Approval */}
      <div className="pt-12 border-t border-zinc-800">
        <ManagerView session={session} />
      </div>
    </div>
  );
}
