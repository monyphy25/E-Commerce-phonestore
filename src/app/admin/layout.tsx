import AdminSidebar from "@/components/AdminSidebar";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import AdminGuard from "./AdminGuard";

export const metadata = { title: "Admin — PhoneStore" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("demo_user_role")?.value;
  const emailCookie = cookieStore.get("demo_user_email")?.value;

  let isAdmin = false;

  if (roleCookie === "ADMIN" || (emailCookie && emailCookie.toLowerCase().includes("admin"))) {
    isAdmin = true;
  } else if (user) {
    if (user.email?.toLowerCase().includes("admin")) {
      isAdmin = true;
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role?.toUpperCase() === "ADMIN") {
        isAdmin = true;
      }
    }
  }

  return (
    <AdminGuard user={user} isAdmin={isAdmin}>
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="p-4 sm:p-6 md:p-10 flex-1 w-full">
            {children}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
