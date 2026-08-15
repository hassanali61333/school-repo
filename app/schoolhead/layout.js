"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/schoolhead", icon: "⊞" },
  { label: "Students", href: "/schoolhead/students", icon: "👨‍🎓" },
  { label: "Teachers", href: "/schoolhead/teachers", icon: "👨‍🏫" },
  { label: "Staff", href: "/schoolhead/staff", icon: "👷" },
  { label: "Payroll", href: "/schoolhead/payroll", icon: "👷" },

 
  { label: "Expenses", href: "/schoolhead/reports", icon: "📊" },
  { label: "admission", href: "/schoolhead/admission", icon: "📊" },
  { label: "contact", href: "/schoolhead/contact", icon: "📊" },
  { label: "School Timing", href: "/schoolhead/schTiming", icon: "📊" },
  { label: "class Timing", href: "/schoolhead/classstime", icon: "📊" },
];

export default function SchoolHeadLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
        w-64 bg-gray-900 text-white flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:z-auto
      `}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2"> 
        
       <Image src="/images/logo.jpeg" alt="Logo" width={50} height={40} /> 
          <div className="text-xl font-bold d-flex"> StudyProAI</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">School Head Panel</div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                <div className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1 text-sm cursor-pointer
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-teal-600 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}>
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button onClick={handleLogout} className="
            w-full px-3 py-2.5 rounded-lg
            bg-transparent border border-gray-700
            text-gray-400 hover:text-white hover:border-gray-600
            cursor-pointer text-sm flex items-center gap-2
            transition-colors duration-200
          ">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header with toggle button */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="
                p-2 rounded-lg hover:bg-gray-100 transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-500
                lg:hidden
              "
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-800">
              School Head Dashboard
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}