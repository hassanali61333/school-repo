"use client";
import Link from "next/link";
import { useSelector } from 'react-redux';

export default function SuperAdminLayout({ children }) {
  const hasSchools = useSelector((state) => state.schools.hasSchools);
  
  const getNavItems = () => {
    const items = [
      { label: "Dashboard", href: "/superAdmin", icon: "⊞" },
      { label: "Add Schools", href: "/superAdmin/schools", icon: "🏫" },
      { label: "All school", href: "/superAdmin/allschool", icon: "🏫" },
      { label: "Add Head", href: "/superAdmin/addhead", icon: "👨‍🏫" }

    ];
    
  
    
    items.push({ label: "Reports", href: "/superAdmin/reports", icon: "📊" });
    
    return items;
  };

  const handlelogout=()=>{
    localStorage.removeItem("handlelogout");
    localStorage.removeItem("AdminID")
  }
  
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: "240px", background: "#1a1f2e", color: "#fff",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #2d3348" }}>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>🎓 EduAdmin</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Super Admin Panel</div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {getNavItems().map((item) => {
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px", borderRadius: "8px", marginBottom: "4px",
                  background: "transparent",
                  color: "#9ca3af",
                  fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                }}>
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout (UI only) */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #2d3348" }}>
          <button style={{
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            background: "transparent", border: "1px solid #374151",
            color: "#9ca3af", cursor: "pointer", fontSize: "14px",
            display: "flex", alignItems: "center", gap: "8px",
          }}
          onClick={handlelogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <main style={{ marginLeft: "240px", flex: 1, padding: "24px" }}>
        {children}
      </main>
    </div>
  );
}