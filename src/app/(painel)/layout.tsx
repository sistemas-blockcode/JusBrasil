import Sidebar from "@/components/ui/sidebar";
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      
      <Sidebar />

      <div className="flex-1 bg-gray-100 p-6">
        {children}
      </div>
    </div>
  );
}
