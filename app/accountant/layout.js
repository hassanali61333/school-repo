"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/accountant", icon: "⊞" },
  { label: "Fees Collection", href: "/accountant/fee", icon: "💰" },
  { label: "Expenses", href: "/accountant/expenses", icon: "📉" },
  { label: "Salary", href: "/accountant/salary", icon: "💵" },
];

export default function AccountantLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">

      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white fixed top-0 left-0 bottom-0 flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">🎓 EduAdmin</h1>
          <p className="text-xs text-gray-400 mt-1">Accountant Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition
                    ${
                      isActive
                        ? "bg-yellow-500 text-white"
                        : "text-gray-400 hover:bg-gray-800"
                    }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-60 flex-1 p-6">
        {children}
      </main>
    </div>
  );
}