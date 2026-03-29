"use client";

import { useState, useEffect } from "react";
import { Plus, Receipt, Search, FileText, Loader2, ScanLine, DollarSign } from "lucide-react";
import Tesseract from "tesseract.js";

export default function EmployeeView({ session }: { session: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(true);

  // Form states
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrRawText, setOcrRawText] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  
  // Real world currencies fetched natively
  const [globalCurrencies, setGlobalCurrencies] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    amount: "",
    currency: session.user.companyCurrency,
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
    
    // Fetch all active Country currencies to supply the drop-down
    fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
      .then(res => res.json())
      .then(data => {
        const currSet = new Set<string>();
        data.forEach((country: any) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach(c => currSet.add(c));
          }
        });
        setGlobalCurrencies(Array.from(currSet).sort());
      })
      .catch(err => console.error("Error fetching currencies:", err));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);

    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      setOcrRawText(text);
      
      // 🚀 ADVANCED OCR ALGORITHM (Best-Effort Machine Logic) 🚀
      // The prompt requires extracting specific fields: Date, Description, Merchant Name, Category, Amount
      
      const lowerText = text.toLowerCase();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      
      // 1. Merchant / Restaurant Name (Usually the very first thick line on a receipt)
      const scannedMerchant = lines.length > 0 ? lines[0].toUpperCase() : "Unknown Vendor";

      // 2. Amount Extraction (Hunting for Totals)
      const moneyRegex = /(?:total|amount|sum|change due|pay).*?\$?\s*([0-9,]+\.[0-9]{2})/i;
      const genericMatch = text.match(/\$?([0-9,]+\.[0-9]{2})/);
      let amountStr = "";
      if (text.match(moneyRegex)) {
        amountStr = text.match(moneyRegex)![1].replace(/,/g, '');
      } else if (genericMatch) {
         amountStr = genericMatch[1].replace(/,/g, '');
      }

      // 3. Date Extraction (Standard mm/dd/yyyy or dd-mm-yyyy)
      const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
      const dateMatch = text.match(dateRegex);
      let dateStr = new Date().toISOString().split('T')[0];
      if (dateMatch) {
         try { dateStr = new Date(dateMatch[1]).toISOString().split('T')[0]; } catch(e) {}
      }

      // 4. Keyword-based Categorization (Expense Type)
      let guessedCategory = "Office Supplies";
      if (lowerText.match(/(restaurant|cafe|food|dining|lunch|burger|pizza|kitchen|grill|steak|coffee|tip )/)) {
        guessedCategory = "Meals";
      } else if (lowerText.match(/(flight|hotel|airbnb|taxi|uber|lyft|airline|airport|transit|ticket)/)) {
        guessedCategory = "Travel";
      } else if (lowerText.match(/(software|subscription|aws|cloud|github|adobe|microsoft|domain)/)) {
        guessedCategory = "Software & Licenses";
      }

      setFormData(prev => ({
         ...prev, 
         amount: amountStr,
         category: guessedCategory,
         date: dateStr,
         description: `Receipt from ${scannedMerchant}` 
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
    setFormData({ amount: "", currency: session.user.companyCurrency, category: "Meals", description: "", date: new Date().toISOString().split('T')[0] });
    setReceiptImage(null);
    setOcrRawText("");
    
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
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
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
                <th className="px-6 py-4 font-semibold">Native Amount</th>
                <th className="px-6 py-4 font-semibold">Converted Base</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
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
                  <td className="px-6 py-4 font-medium text-white">
                    {exp.currency} {exp.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-400">
                    {exp.currency !== session.user.companyCurrency && (
                      <span className="text-xs text-zinc-500 mr-2">≈</span>
                    )}
                    {session.user.companyCurrency} {exp.convertedAmount?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                     <button onClick={() => setSelectedExpense(exp)} className="text-left whitespace-normal break-words min-w-[200px] text-blue-400 hover:text-blue-300 hover:underline underline-offset-4 transition-colors font-medium">
                        {exp.description}
                     </button>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className="px-3 py-1 bg-zinc-800 rounded-full text-xs truncate">{exp.category}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          exp.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          exp.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                       }`}>
                         {exp.status}
                       </span>
                       
                       {/* Render any parsed Manager / Admin Comments cleanly beneath the Status Badge */}
                       {exp.approvalRequests && exp.approvalRequests.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1">
                             {exp.approvalRequests.map((req: any, i: number) => req.comments && req.comments.trim() !== '' ? (
                                <div key={i} className="text-[11px] text-zinc-400 max-w-[180px] leading-tight text-right break-words bg-zinc-800/50 p-1.5 rounded-lg border border-zinc-700/50">
                                  <span className="font-semibold text-zinc-300">💬 {req.approver?.name || req.approver?.role}:</span><br/> "{req.comments}"
                                </div>
                             ) : null)}
                          </div>
                       )}
                    </div>
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
                        <p className="text-green-400 text-sm font-medium mt-1 uppercase tracking-wider bg-green-950 px-2 py-0.5 rounded w-fit">OCR Scanning Completed</p>
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

              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Foreign Currency</label>
                  <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none appearance-none">
                    <option value={session.user.companyCurrency}>{session.user.companyCurrency} (Company Base)</option>
                    {globalCurrencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Cost / Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium"><DollarSign className="w-4 h-4"/></span>
                    <input type="text" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-10 pr-4 py-3 focus:border-blue-500 outline-none transition-colors" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Expense Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none appearance-none">
                    <option>Travel</option><option>Meals</option><option>Office Supplies</option><option>Software & Licenses</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Documentation Note</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Dinner meeting with Microsoft team..." className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-colors" required />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-zinc-400 font-medium hover:text-white" disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting || isScanning} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  {isSubmitting ? "Converting..." : "Submit to Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-500" /> Digital Receipt Record
              </h3>
              <button onClick={() => setSelectedExpense(null)} className="text-zinc-500 hover:text-white pb-1 text-2xl">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-zinc-800/30 p-5 rounded-2xl border border-zinc-800">
                 <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date of Transaction</label>
                    <p className="text-lg font-medium text-white">{new Date(selectedExpense.date).toLocaleDateString()}</p>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Expense Category</label>
                    <p className="text-lg font-medium text-white">{selectedExpense.category}</p>
                 </div>
                 <div className="col-span-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Documented Description & Merchant</label>
                    <p className="text-lg font-medium text-white">{selectedExpense.description}</p>
                 </div>
              </div>

              {selectedExpense.ocrRawText && (
                <div className="animate-in fade-in duration-500">
                   <label className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                     <ScanLine className="w-4 h-4" /> AI OCR Raw Extraction Data
                   </label>
                   <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-[11px] font-mono text-zinc-400 h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                      {selectedExpense.ocrRawText}
                   </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
               <button onClick={() => setSelectedExpense(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl font-medium transition-colors">Close Viewer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
