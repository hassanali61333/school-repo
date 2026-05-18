"use client";
import { useState } from "react";


export default function SchoolHeadDashboard() {
const [img , setImg] = useState(null);
console.log("Selected image:", img);
  return (
  <>
<input type="file" onChange={(e) => setImg(e.target.files[0])} />
  </>
  );
}