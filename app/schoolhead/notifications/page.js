"use client";
import { useEffect, useState } from "react";
import { getAllNotifications, sendNotification, deleteNotification } from "@/app/services/schoolService.js";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", sentTo: "all" });
  const [saving, setSaving] = useState(false);

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications(user?.schoolId);
      if (res.data.success) setNotifications(res.data.notifications);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.message) { alert("Title aur Message zaroor likho"); return; }
    setSaving(true);
    try {
      const res = await sendNotification({ ...formData, schoolId: user?.schoolId, sentBy: user?._id });
      if (res.data.success) { fetchNotifications(); setShowModal(false); setFormData({ title: "", message: "", sentTo: "all" }); }
      else alert(res.data.message || "Error aaya");
    } catch (err) { alert("Server error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete karna chahte ho?")) return;
    const res = await deleteNotification(id);
    if (res.data.success) fetchNotifications();
  };

  const sentToColors = { all: { bg: "#eff6ff", color: "#1e40af" }, students: { bg: "#d1fae5", color: "#065f46" }, parents: { bg: "#fef3c7", color: "#92400e" }, teachers: { bg: "#f3e8ff", color: "#6b21a8" } };
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Notifications</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Parents aur students ko updates bhejo</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          + Send Notification
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Loading...</div>
          : notifications.length === 0 ? <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>Koi notification nahi bheji gayi</div>
            : notifications.map(n => (
              <div key={n._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🔔</span>
                    <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: 0 }}>{n.title}</h3>
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", background: sentToColors[n.sentTo]?.bg, color: sentToColors[n.sentTo]?.color, textTransform: "capitalize" }}>
                      {n.sentTo}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px" }}>{n.message}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{new Date(n.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <button onClick={() => handleDelete(n._id)} style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "12px", color: "#dc2626", marginLeft: "16px" }}>🗑️</button>
              </div>
            ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Notification Bhejo</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Title *</label>
                <input placeholder="Fee reminder, Exam schedule..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Message *</label>
                <textarea placeholder="Notification ka detail likhein..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4}
                  style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>Send To</label>
                <select value={formData.sentTo} onChange={e => setFormData({ ...formData, sentTo: e.target.value })} style={inputStyle}>
                  <option value="all">Everyone</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="teachers">Teachers</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSend} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
                {saving ? "Sending..." : "🔔 Send"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}