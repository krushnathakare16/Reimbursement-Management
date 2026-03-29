"use client";

import { useState } from "react";
import { Plus, Receipt, Search, FileText } from "lucide-react";

export default function EmployeeView({ session }: { session: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([
    { id: "1", amount: "$120.00", desc: "Client Dinner", date: "2026-03-29", category: "Meals", status: "PENDING", approver: "Manager Jane" },
    { id: "2", amount: "$500.00", desc: "Flight to NYC", date: "2026-03-25", category: "Travel", status: "APPROVED", approver: "HR Dept" },
  ]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Expenses</h2>
          <p className="text-zinc-400 text-sm mt-1">Submit and track your reimbursement claims.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Expense
        </button>
      </div>

      {/* Grid Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                <th className="px-6 py-4 font-semibold">Approver</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{exp.amount}</td>
                  <td className="px-6 py-4">{exp.desc}</td>
                  <td className="px-6 py-4 text-zinc-400">{exp.date}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-zinc-800 rounded-full text-xs">{exp.category}</span></td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-400 hover:text-blue-300"><FileText className="w-5 h-5 mx-auto" /></button>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{exp.approver}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exp.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-6 h-6 text-blue-500" />
                Submit New Expense
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white pb-1 text-2xl">&times;</button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              {/* OCR Scanner Box (Mocked for UI visualization) */}
              <div className="w-full border-2 border-dashed border-zinc-700 rounded-2xl p-8 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                <Receipt className="w-10 h-10 text-zinc-600 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
                <p className="text-white font-medium mb-1">Upload Receipt Image (OCR Auto-Fill)</p>
                <p className="text-zinc-500 text-sm">Drag & drop or click to browse. Tesseract will extract the receipt data.</p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Amount</label>
                  <input type="text" placeholder="0.00" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Category</label>
                  <select className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3">
                    <option>Travel</option><option>Meals</option><option>Supplies</option><option>Software</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Description</label>
                <input type="text" placeholder="Lunch with client..." className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-zinc-400 font-medium hover:text-white">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg">Submit Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
