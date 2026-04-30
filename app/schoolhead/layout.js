"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/schoolhead", icon: "⊞" },
  { label: "Students", href: "/schoolhead/students", icon: "👨‍🎓" },
  { label: "Attendance", href: "/schoolhead/attendance", icon: "📋" },
  { label: "Results", href: "/schoolhead/result", icon: "📝" },
  { label: "Teachers", href: "/schoolhead/teachers", icon: "👨‍🏫" },
  { label: "Staff", href: "/schoolhead/staff", icon: "👷" },
  { label: "Notifications", href: "/schoolhead/notifications", icon: "🔔" },
  { label: "Study Material", href: "/schoolhead/material", icon: "📚" },
  { label: "Reports", href: "/schoolhead/reports", icon: "📊" },
];

export default function SchoolHeadLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>
      <aside style={{
        width: "240px", background: "#1a1f2e", color: "#fff",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #2d3348" }}>
          <div style={{ fontSize: "20px", fontWeight: "700" }}>🎓 EduAdmin</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>School Head Panel</div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", marginBottom: "4px",
                  background: isActive ? "#0ca678" : "transparent",
                  color: isActive ? "#fff" : "#9ca3af",
                  fontSize: "14px", cursor: "pointer",
                }}>
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid #2d3348" }}>
          <button onClick={handleLogout} style={{
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            background: "transparent", border: "1px solid #374151",
            color: "#9ca3af", cursor: "pointer", fontSize: "14px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: "240px", flex: 1, padding: "24px" }}>
        {children}
      </main>
    </div>
  );
}