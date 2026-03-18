import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "./hooks/useToast";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

function AppLayout() {
  return (
    <div className="flex min-h-screen font-sans antialiased text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  );
}