"use client";

import { Check, X, FileText } from "lucide-react";
import { useState } from "react";

export default function ManagerView({ session }: { session: any }) {
  // Mocking the pending approvals pipeline
  const [approvals, setApprovals] = useState([
    { id: "req_1", applicant: "John Doe", amount: "$350.00", category: "Office Supplies", status: "Requires Approval" },
    { id: "req_2", applicant: "Sarah Smith", amount: "$150.00", category: "Meals", status: "Requires Approval" },
  ]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setApprovals(approvals.filter(a => a.id !== id));
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Approvals for review</h2>
        <p className="text-zinc-400 text-sm mt-1">Review expenses securely routed to you by the platform's multi-level flow.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Applicant Name</th>
                <th className="px-6 py-4 font-semibold">Cost</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Comments</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {approvals.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{req.applicant}</td>
                  <td className="px-6 py-4 font-medium text-blue-400">{req.amount}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-zinc-800 rounded-full text-xs">{req.category}</span></td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors"><FileText className="w-5 h-5 mx-auto" /></button>
                  </td>
                  <td className="px-6 py-4 text-orange-400 text-xs font-semibold">{req.status}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      placeholder="Optional notes..." 
                      className="bg-zinc-800/50 border border-zinc-700 text-white rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-blue-500 w-40 text-sm"
                    />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approve')}
                      className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border border-green-500/20"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'reject')}
                      className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border border-red-500/20"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
              {approvals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    You're all caught up! No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
