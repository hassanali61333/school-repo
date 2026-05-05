"use client";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from 'react-redux';

export default function SuperAdminLayout({ children }) {
  const hasSchools = useSelector((state) => state.schools.hasSchools);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handlelogout = () => {
    localStorage.removeItem("handlelogout");
    localStorage.removeItem("AdminID");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f9", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 99, display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: "240px", background: "#1a1f2e", color: "#fff",
        display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: "transform 0.3s ease",
      }}
        className={sidebarOpen ? "sidebar sidebar-open" : "sidebar"}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #2d3348", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>🎓 EduAdmin</div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Super Admin Panel</div>
          </div>
          {/* Close btn — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-btn"
            style={{
              background: "none", border: "none", color: "#9ca3af",
              fontSize: "20px", cursor: "pointer", display: "none",
            }}
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {getNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
              onClick={() => setSidebarOpen(false)}
            >
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px", marginBottom: "4px",
                background: "transparent", color: "#9ca3af",
                fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
              }}>
                <span>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid #2d3348" }}>
          <button
            style={{
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

      {/* ── Main ── */}
      <main className="main-content" style={{ marginLeft: "240px", flex: 1, padding: "24px" }}>

        {/* Mobile topbar */}
        <div
          className="mobile-topbar"
          style={{
            display: "none", alignItems: "center", gap: "12px",
            marginBottom: "16px", background: "#1a1f2e",
            padding: "12px 16px", borderRadius: "10px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none", border: "none", color: "#fff",
              fontSize: "22px", cursor: "pointer", lineHeight: 1,
            }}
          >
            ☰
          </button>
          <span style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>🎓 EduAdmin</span>
        </div>

        {children}
      </main>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-close-btn {
            display: block !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}