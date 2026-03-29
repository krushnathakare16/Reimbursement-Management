"use client";

import { useState, useEffect } from "react";
import { Plus, Receipt, Search, FileText, Loader2, ScanLine } from "lucide-react";
import Tesseract from "tesseract.js";

export default function EmployeeView({ session }: { session: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(true);

  // Form + OCR states
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: "",
    category: "Meals",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = () => {
    setIsLoadingGrid(true);
    fetch("/api/expenses")
      .then(res => res.json())
      .then(data => {
        if (data.success) setExpenses(data.expenses);
        setIsLoadingGrid(false);
      });
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast image preview for the UI
    const reader = new FileReader();
    reader.onloadend = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    try {
      // Direct integration of the Tesseract WebAssembly Browser Engine
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      setOcrRawText(text);
      
      // Smart hackathon parser logic looking for Totals/Amounts
      const moneyRegex = /(?:total|amount|sum|due|pay).*?\$?\s*([0-9,]+\.[0-9]{2})/i;
      const genericMatch = text.match(/\$([0-9,]+\.[0-9]{2})/);
      
      let amountStr = "";
      if (text.match(moneyRegex)) {
        amountStr = text.match(moneyRegex)![1].replace(/,/g, '');
      } else if (genericMatch) {
         amountStr = genericMatch[1].replace(/,/g, '');
      }

      setFormData(prev => ({
         ...prev, 
         amount: amountStr,
         description: amountStr ? "Auto-Filled via AI Vision Scan" : "Manual review required: AI couldn't decisively locate amount" 
      }));
    } catch (err) {
      console.error(err);
      alert("Error scanning document.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      body: JSON.stringify({
        ...formData,
        ocrRawText,
        receiptUrl: receiptImage ? "Base64 Mock Memory File" : null
      })
    });
    
    setIsSubmitting(false);
    setIsModalOpen(false);
    setFormData({ amount: "", category: "Meals", description: "", date: new Date().toISOString().split('T')[0] });
    setReceiptImage(null);
    setOcrRawText("");
    
    // Refresh the grid seamlessly!
    fetchExpenses();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">My Expenses</h2>
          <p className="text-zinc-400 text-sm mt-1">Submit and intelligently track your reimbursement claims.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          New Expense
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {isLoadingGrid && <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500"/></td></tr>}
              {!isLoadingGrid && expenses.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-zinc-500">You haven't submitted any company expenses yet.</td></tr>
              )}
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{session.user.companyCurrency} {exp.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">{exp.description}</td>
                  <td className="px-6 py-4 text-zinc-400">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-zinc-800 rounded-full text-xs">{exp.category}</span></td>
                  <td className="px-6 py-4 text-center">
                    <button className={`${exp.receiptUrl ? 'text-blue-400 hover:text-blue-300' : 'text-zinc-600 cursor-not-allowed'}`}><FileText className="w-5 h-5 mx-auto" /></button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ScanLine className="w-6 h-6 text-blue-500" /> AI Receipt Extractor
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white pb-1 text-2xl">&times;</button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              
              <div className="relative w-full border-2 border-dashed border-blue-500/30 bg-blue-500/5 rounded-2xl p-8 text-center hover:bg-blue-500/10 transition-colors cursor-pointer group overflow-hidden">
                <input type="file" onChange={handleFileUpload} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                
                {isScanning ? (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-blue-400 font-medium">Tesseract Vision Model processing receipt pixels...</p>
                  </div>
                ) : receiptImage ? (
                  <div className="flex items-center gap-4">
                     <img src={receiptImage} alt="Receipt preview" className="w-20 h-20 object-cover rounded-xl shadow-lg border border-zinc-700" />
                     <div className="text-left">
                        <p className="text-white font-medium">Receipt Attached Successfully</p>
                        <p className="text-green-400 text-sm font-medium mt-1 uppercase text-[10px] tracking-wider bg-green-950 px-2 py-0.5 rounded w-fit">OCR Scanning Completed</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <Receipt className="w-10 h-10 text-blue-500/80 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                    <p className="text-white font-medium mb-1">Click or Drop a Receipt Image Here</p>
                    <p className="text-zinc-400 text-sm">The embedded AI will instantly auto-fill the form for you.</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Cost / Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">{session.user.companyCurrency}</span>
                    <input type="text" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-14 pr-4 py-3 focus:border-blue-500 outline-none transition-colors" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Expense Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none appearance-none">
                    <option>Travel</option><option>Meals</option><option>Office Supplies</option><option>Software & Licenses</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Documentation Note</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Dinner meeting with Microsoft team..." className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors" required />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-zinc-400 font-medium hover:text-white" disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting || isScanning} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {isSubmitting ? "Saving..." : "Submit to Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
