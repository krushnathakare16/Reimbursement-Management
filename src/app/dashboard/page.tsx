import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import EmployeeView from "@/components/dashboard/EmployeeView";
import ManagerView from "@/components/dashboard/ManagerView";
import AdminView from "@/components/dashboard/AdminView";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic Render based on Role */}
      {session.user.role === "EMPLOYEE" && <EmployeeView session={session} />}
      
      {(session.user.role === "MANAGER" || session.user.role === "FINANCE" || session.user.role === "CFO") && <ManagerView session={session} />}
      
      {session.user.role === "ADMIN" && (
        <div className="space-y-12">
          {/* Admin has access to both the Rules Config and their own personal Employee View (Optional) */}
          <AdminView session={session} />
          
          <div className="pt-8 border-t border-zinc-800">
            <h2 className="text-xl font-semibold text-white mb-4">Your Own Expenses (Admin)</h2>
            <EmployeeView session={session} />
          </div>
        </div>
      )}

    </div>
  );
}
