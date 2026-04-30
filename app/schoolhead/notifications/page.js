"use client";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", message: "", sentTo: "all" });

  // 👉 Dummy data (API removed)
  useEffect(() => {
    setNotifications([
      {
        _id: "1",
        title: "Fee Reminder",
        message: "Aapki fee due hai jaldi jama karein",
        sentTo: "students",
        createdAt: new Date(),
      },
      {
        _id: "2",
        title: "Exam Schedule",
        message: "Mid term exam 5 May se start ho rahe hain",
        sentTo: "parents",
        createdAt: new Date(),
      },
    ]);
  }, []);

  const handleSend = () => {
    if (!formData.title || !formData.message) return alert("Fill all fields");

    const newNotification = {
      _id: Date.now().toString(),
      ...formData,
      createdAt: new Date(),
    };

    setNotifications([newNotification, ...notifications]);
    setShowModal(false);
    setFormData({ title: "", message: "", sentTo: "all" });
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n._id !== id));
  };

  const sentToColors = {
    all: { bg: "#eff6ff", color: "#1e40af" },
    students: { bg: "#d1fae5", color: "#065f46" },
    parents: { bg: "#fef3c7", color: "#92400e" },
    teachers: { bg: "#f3e8ff", color: "#6b21a8" },
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>

      {/* Header (UNCHANGED UI) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Notifications</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Parents aur students ko updates bhejo
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "#0ca678",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          + Send Notification
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>
            Koi notification nahi
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <h3 style={{ margin: 0 }}>{n.title}</h3>

                  <span style={{
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    background: sentToColors[n.sentTo]?.bg,
                    color: sentToColors[n.sentTo]?.color,
                  }}>
                    {n.sentTo}
                  </span>
                </div>

                <p style={{ margin: "6px 0" }}>{n.message}</p>

                <small style={{ color: "#9ca3af" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </small>
              </div>

              <button
                onClick={() => handleDelete(n._id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #fee2e2",
                  background: "#fff",
                  color: "#dc2626",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal (UNCHANGED UI) */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#fff", padding: "28px", borderRadius: "16px", width: "480px" }}>

            <h2>Notification Bhejo</h2>

            <input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={inputStyle}
            />

            <textarea
              placeholder="Message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ ...inputStyle, marginTop: "10px" }}
              rows={4}
            />

            <select
              value={formData.sentTo}
              onChange={(e) => setFormData({ ...formData, sentTo: e.target.value })}
              style={{ ...inputStyle, marginTop: "10px" }}
            >
              <option value="all">Everyone</option>
              <option value="students">Students</option>
              <option value="parents">Parents</option>
              <option value="teachers">Teachers</option>
            </select>

            {/* BUTTONS (same style vibe) */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={handleSend}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#0ca678",
                  color: "#fff",
                  border: "none",
                }}
              >
                Send
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}