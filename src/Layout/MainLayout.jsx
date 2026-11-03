import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import Navbar from "../navbar/Navbar";
import { useAccess } from "../services/AccessContext";


function FullPageLoader() {
  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      background: "#fff", zIndex: 99999,
    }}>
      <img src="/Logo_32F32 px .png" alt="" style={{ height: 60, objectFit: "contain" }} />
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #E5E7EB", borderTopColor: "#4584E5",
        animation: "mlspin 0.8s linear infinite",
      }} />
      <style>{`@keyframes mlspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MainLayout() {
  const { loading } = useAccess();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 992);
  const [collapsed, setCollapsed] = useState(false);


  
  // ── Resize handler ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) setIsSidebarOpen(prev => !prev);
    else setCollapsed(prev => !prev);
  };

  const sidebarWidth = collapsed ? 58 : 216;

  const sidebarProps = {
    isOpen: isSidebarOpen,
    collapsed,
    setIsOpen: setIsSidebarOpen,
    setCollapsed,
  };
if (loading) return <FullPageLoader />;  
  return (
    <>
      {isSidebarOpen && isMobile && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
        />
      )}

      <div style={{ minHeight: "100vh", background: "#f7f7fb" }}>
        <Sidebar {...sidebarProps} />

        <div
          style={{
            marginLeft: isMobile ? 0 : sidebarWidth,
            transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar toggleSidebar={toggleSidebar} />
          <div style={{ flex: 1, padding: 10 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}