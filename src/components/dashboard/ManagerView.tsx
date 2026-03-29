"use client";

import { Check, X, FileText, Loader2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

export default function ManagerView({ session }: { session: any }) {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = () => {
    setIsLoading(true);
    fetch("/api/manager/approvals")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setApprovals(data.requests);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setProcessingId(id);
    // Find any comments the manager typed inside the synthetic state input
    const commentInput = document.getElementById(`comment-${id}`) as HTMLInputElement;
    const comments = commentInput?.value || "";

    await fetch("/api/manager/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, action, comments })
    });
    
    // Remove it from the local DOM array instantly
    setApprovals(approvals.filter(a => a.id !== id));
    setProcessingId(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Approvals for review</h2>
        <p className="text-zinc-400 text-sm mt-1">Review expenses securely routed to you by the platform's multi-level flow.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Applicant Name</th>
                <th className="px-6 py-4 font-semibold">Native Cost</th>
                <th className="px-6 py-4 font-semibold">Base (Company)</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                <th className="px-6 py-4 font-semibold">Sys Status</th>
                <th className="px-6 py-4 font-semibold">Comments</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoading && <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/></td></tr>}
              {!isLoading && approvals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium text-lg">
                    You're all caught up! No pending approvals.
                  </td>
                </tr>
              )}
              {approvals.map((req) => (
                <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex flex-col">
                      <span>{req.expense.submitter?.name || "Employee"}</span>
                      <span className="text-xs text-zinc-500 font-normal">{req.expense.submitter?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-300">
                    {req.expense.currency} {req.expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-400">
                    {session.user.companyCurrency} {req.expense.convertedAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className={`${req.expense.receiptUrl ? 'text-blue-400 hover:text-blue-300' : 'text-zinc-600'} transition-colors`}><FileText className="w-5 h-5 mx-auto" /></button>
                  </td>
                  <td className="px-6 py-4 text-orange-400 text-xs font-semibold">{req.status}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        id={`comment-${req.id}`}
                        type="text" 
                        placeholder="Optional notes..." 
                        className="bg-zinc-800/50 border border-zinc-700 text-white rounded-lg pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 w-48 text-sm outline-none transition-all"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'APPROVED')}
                      disabled={processingId === req.id}
                      className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border border-green-500/20 disabled:opacity-50"
                    >
                      {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4" />} Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'REJECTED')}
                      disabled={processingId === req.id}
                      className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border border-red-500/20 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
