"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield, Users, Mail, Loader2, Network } from "lucide-react";

export default function UserManagement({ session }: { session: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    managerId: ""
  });

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        }
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = { ...formData };
      if (!payload.managerId) delete payload.managerId; // Nullify if empty
      
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Failed to create user");
      } else {
        setIsModalOpen(false);
        setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", managerId: "" });
        fetchUsers();
      }
    } catch(err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const managers = users.filter(u => u.role !== "EMPLOYEE");

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" /> Organization Users
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Add Employees and assign their specific Management hierarchy.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          Invite Associate
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">System Role</th>
                <th className="px-6 py-4 font-semibold">Reports To (Manager)</th>
                <th className="px-6 py-4 font-semibold">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        {u.name ? u.name[0] : u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                      u.role === 'CFO' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                      u.role === 'FINANCE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      u.role === 'MANAGER' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                       value={u.managerId || ""}
                       onChange={async (e) => {
                          const newBoss = e.target.value;
                          await fetch("/api/admin/users", {
                             method: "PUT",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ userId: u.id, managerId: newBoss })
                          });
                          fetchUsers(); // Refresh Grid to show new topology
                       }}
                       className="bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg px-3 py-1.5 focus:border-blue-500 hover:border-blue-500/50 outline-none appearance-none text-xs w-full max-w-[220px] transition-colors cursor-pointer"
                    >
                       <option value="">-- No Direct Link (Uses Global Rule) --</option>
                       {managers.filter(m => m.id !== u.id).map(m => (
                          <option key={m.id} value={m.id}>{m.name || m.email} ({m.role})</option>
                       ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500"><Loader2 className="w-5 h-5 animate-spin mx-auto"/></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-500" /> System Authorization
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white pb-1 text-2xl">&times;</button>
            </div>
            
            <form className="p-6 space-y-5" onSubmit={handleSubmit}>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Display Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="jane@company.com" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl pl-9 pr-4 py-3 focus:border-blue-500 outline-none" required />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Assign Access Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none appearance-none">
                  <option value="EMPLOYEE">Standard Employee (Submits Expenses)</option>
                  <option value="MANAGER">Manager (Step 1 Approvals)</option>
                  <option value="FINANCE">Finance Dept (Step 2 Approvals)</option>
                  <option value="CFO">CFO / Director (Step 3 Approvals)</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              {formData.role !== "ADMIN" && (
                <div className="animate-in fade-in zoom-in-95 duration-200 bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                  <label className="text-sm font-medium text-blue-300 block mb-2 flex items-center gap-2">
                    <Network className="w-4 h-4" /> Node Assignment: Reports To (Dynamic Flow)
                  </label>
                  <select value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full bg-zinc-950/80 border border-blue-500/30 text-white rounded-xl px-4 py-3 focus:border-blue-400 outline-none appearance-none font-medium">
                    <option value="">No Direct Superior (Uses Global Sequence: Step 1 → Finance → CFO)</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>Assign to: {m.name || m.email} - ({m.role})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-blue-400/80 mt-2 font-medium">
                    This creates the crystal-clear sequence. If selected, the expense is <b>first</b> sent to this specific person's node before continuing to the global Finance/CFO pipeline.
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-zinc-300 block mb-2">Temporary Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:border-blue-500 outline-none" required />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-zinc-400 font-medium hover:text-white" disabled={isSubmitting}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy User Identity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
