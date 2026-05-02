// "use client";
// import { useEffect, useState } from "react";
// // import { getAllMaterial, uploadMaterial, deleteMaterial } from "@/app/services/schoolService.js";

// const fileIcons = { pdf: "📕", doc: "📘", docx: "📘", ppt: "📙", pptx: "📙", default: "📄" };

// export default function StudyMaterialPage() {
//   const [materials, setMaterials] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({ title: "", description: "", class: "", subject: "" });
//   const [file, setFile] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user")) : null;

//   useEffect(() => { fetchMaterials(); }, []);

//   const fetchMaterials = async () => {
//     try {
//       const res = await getAllMaterial(user?.schoolId);
//       if (res.data.success) setMaterials(res.data.materials);
//     } catch (err) { console.log(err.message); }
//     finally { setLoading(false); }
//   };

//   const handleUpload = async () => {
//     if (!formData.title || !file) { alert("Title aur File zaroor select karo"); return; }
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       Object.entries({ ...formData, schoolId: user?.schoolId, uploadedBy: user?._id }).forEach(([k, v]) => fd.append(k, v));
//       fd.append("file", file);
//       const res = await uploadMaterial(fd);
//       if (res.data.success) { fetchMaterials(); setShowModal(false); setFormData({ title: "", description: "", class: "", subject: "" }); setFile(null); }
//       else alert(res.data.message || "Error aaya");
//     } catch (err) { alert("Upload error"); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete karna chahte ho?")) return;
//     const res = await deleteMaterial(id);
//     if (res.data.success) fetchMaterials();
//   };

//   const getIcon = (type) => fileIcons[type?.toLowerCase()] || fileIcons.default;
//   const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box" };

//   return (
//     <div>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
//         <div>
//           <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Study Material</h1>
//           <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>PDF, Docs upload karo</p>
//         </div>
//         <button onClick={() => setShowModal(true)} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//           + Upload Material
//         </button>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
//         {loading ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#9ca3af" }}>Loading...</div>
//           : materials.length === 0 ? <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>Koi material upload nahi hua</div>
//             : materials.map(m => (
//               <div key={m._id} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
//                 <div style={{ fontSize: "36px", marginBottom: "12px" }}>{getIcon(m.fileType)}</div>
//                 <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#111827", margin: "0 0 4px" }}>{m.title}</h3>
//                 {m.description && <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px" }}>{m.description}</p>}
//                 <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
//                   {m.class && <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", background: "#eff6ff", color: "#1e40af" }}>Class {m.class}</span>}
//                   {m.subject && <span style={{ padding: "3px 8px", borderRadius: "6px", fontSize: "11px", background: "#f3e8ff", color: "#6b21a8" }}>{m.subject}</span>}
//                 </div>
//                 <div style={{ display: "flex", gap: "8px" }}>
//                   <a href={m.fileUrl} target="_blank" rel="noreferrer" style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", textAlign: "center", textDecoration: "none", color: "#374151" }}>
//                     👁️ View
//                   </a>
//                   <button onClick={() => handleDelete(m._id)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", fontSize: "13px", color: "#dc2626" }}>
//                     🗑️ Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//       </div>

//       {showModal && (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
//           <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", width: "480px" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
//               <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Material Upload Karo</h2>
//               <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
//               {[
//                 { label: "Title *", key: "title", placeholder: "Chapter 5 Notes" },
//                 { label: "Class", key: "class", placeholder: "6" },
//                 { label: "Subject", key: "subject", placeholder: "Science" },
//                 { label: "Description", key: "description", placeholder: "Short description..." },
//               ].map(f => (
//                 <div key={f.key}>
//                   <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>{f.label}</label>
//                   <input placeholder={f.placeholder} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} style={inputStyle} />
//                 </div>
//               ))}
//               <div>
//                 <label style={{ fontSize: "13px", color: "#374151", fontWeight: "500", display: "block", marginBottom: "6px" }}>File Upload * (PDF, DOC)</label>
//                 <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => setFile(e.target.files[0])}
//                   style={{ ...inputStyle, padding: "8px" }} />
//                 {file && <p style={{ fontSize: "12px", color: "#0ca678", marginTop: "4px" }}>✅ {file.name}</p>}
//               </div>
//             </div>
//             <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
//               <button onClick={handleUpload} disabled={saving} style={{ flex: 1, padding: "12px", borderRadius: "8px", background: "#0ca678", color: "#fff", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
//                 {saving ? "Uploading..." : "📤 Upload"}
//               </button>
//               <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }