







import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccess } from "../services/AccessContext";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheckCircle, 
  FiXCircle, 
  FiShield
} from "react-icons/fi";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { refresh } = useAccess(); 
  // ── Toast state ──
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const showToast = (type, title, message) => {
    setToast({ type, title, message, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.id ? current : null));
    }, 3200);
  };

  // const saveAndRedirect = async (data) => {
  //   localStorage.setItem("access_token", data.token);
  //   localStorage.setItem("user_id", data.user_id);
  //   localStorage.setItem("user_type", data.user_type);
  //   await refresh(); 

  //   showToast("success", "Login Successful", "Redirecting to admin dashboard...");
  //   setTimeout(() => {
  //     if (data.user_type === "admin") navigate("/");
  //     else navigate("/");
  //   }, 1000);
  // };


  const saveAndRedirect = async (data) => {
  localStorage.setItem("access_token", data.token);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("user_type", data.user_type);

  await refresh();

  showToast("success", "Login Successful", "Redirecting to dashboard...");
  setTimeout(() => navigate("/", { replace: true }), 600);
};

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = " Email is required";
    if (!password.trim()) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: username,
        password,
      });
      const { data, success, message, error } = res.data;
      if (!success) throw new Error(error || message);

      await saveAndRedirect(data); 
    } catch (err) {
      showToast(
        "error",
        "Login Failed",
        err.response?.data?.error || err.response?.data?.message || err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) return Swal.fire("Error", "Please enter email", "warning");
    Swal.fire({ title: "Checking...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await axios.post(`${API_BASE_URL}/forgot-password/`, { email });
      Swal.fire({ icon: "success", title: "Success", text: res.data.msg || "Reset link sent to email" });
      setForgotMode(false);
      setEmail("");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.msg || "User not found" });
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');

        :root {
          --val-font: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          --val-black: #000000;
          --val-black-hover: #1a1a1a;
          --val-text-main: #18181b;
          --val-text-muted: #71717a;
          --val-border: #e4e4e7;
          --val-error: #ef4444;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow-x: hidden; font-family: var(--val-font); }

        /* ── Fullscreen Split Layout ── */
        .val-page-container {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          background-color: #ffffff;
          overflow: hidden;
        }

        /* ── LEFT SIDE: Sage Green Container ── */
        .val-hero-section {
          width: 52%;
          position: relative;
          background: linear-gradient(135deg, #3d5346 0%, #3d5346 45%, #3d5346 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 56px; 
          color: #ffffff;
        }

        /* Ambient Lighting Gradient Overlay */
        .val-sage-ambient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%);
          z-index: 1;
          pointer-events: none;
        }

        /* Floating Silk Wave SVG Layer */
        .val-silk-container {
          position: absolute;
          inset: -15%;
          z-index: 2;
          pointer-events: none;
          animation: valSilkMotionReversed 14s ease-in-out infinite alternate;
        }

        .val-silk-svg {
          width: 100%;
          height: 100%;
        }

        @keyframes valSilkMotionReversed {
          0% { transform: scale(1) translate(0, 0) rotate(0deg); }
          50% { transform: scale(1.04) translate(2%, -2%) rotate(-1.5deg); }
          100% { transform: scale(0.98) translate(-1.5%, 1.5%) rotate(1deg); }
        }

        /* Bottom Quote Content */
        .val-hero-body {
          max-width: 480px;
          z-index: 5;
          margin-bottom: 20px;
        }

        .val-hero-quote {
          font-size: 23px;
          font-weight: 200;
          font-style: italic;
          line-height: 1.45;
          letter-spacing: -0.3px;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
        }

        /* ── RIGHT SIDE: Admin Login Form ── */
        .val-login-section {
          width: 48%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 48px;
          background: #ffffff;
          z-index: 10;
          position: relative;
        }

        .val-form-content {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
        }

        /* Centered & Responsive Logo Header */
        .val-form-brand {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 24px;
          width: 100%;
        }

        .val-form-logo {
          width: 150px;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .val-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--val-text-main);
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .val-subtitle {
          font-size: 13.5px;
          color: var(--val-text-muted);
          margin-bottom: 32px;
          line-height: 1.4;
        }

        .val-field-group {
          margin-bottom: 22px;
        }

        .val-label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: #27272a;
          margin-bottom: 8px;
        }

        .val-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .val-input-icon {
          position: absolute;
          left: 16px;
          color: #a1a1aa;
          font-size: 18px;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .val-input {
          width: 100%;
          height: 48px;
          background: #ffffff;
          border: 1.5px solid var(--val-border);
          border-radius: 10px;
          padding: 0 44px 0 46px;
          font-size: 14.5px;
          font-family: inherit;
          color: var(--val-text-main);
          outline: none;
          transition: all 0.2s ease;
        }

        .val-input::placeholder {
          color: #a1a1aa;
          font-weight: 400;
        }

        .val-input:focus {
          border-color: #000000;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
        }

        .val-input-wrapper:focus-within .val-input-icon {
          color: #18181b;
        }

        .val-input.error {
          border-color: var(--val-error);
          background: #fff8f8;
        }

        .val-eye-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #a1a1aa;
          font-size: 18px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .val-eye-toggle:hover { color: #18181b; }

        .val-error-text {
          font-size: 12px;
          color: var(--val-error);
          margin-top: 6px;
          font-weight: 600;
        }

        .val-forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 4px;
          margin-bottom: 24px;
        }

        .val-forgot-btn {
          font-size: 13px;
          font-weight: 600;
          color: #000000;
          background: none;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .val-forgot-btn:hover { opacity: 0.7; text-decoration: underline; }

        /* Solid Black Button */
        .val-submit-btn {
          width: 100%;
          height: 48px;
          background: var(--val-black);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .val-submit-btn:hover:not(:disabled) {
          background: var(--val-black-hover);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }

        .val-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .val-form-footer {
          margin-top: 36px;
          text-align: center;
          font-size: 12.5px;
          color: var(--val-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Modal overlay */
        .val-overlay {
          position: fixed; inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          padding: 16px;
        }
        .val-modal {
          background: #ffffff;
          border-radius: 20px;
          padding: 36px 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .val-modal h3 { font-size: 20px; font-weight: 700; color: var(--val-text-main); margin-bottom: 8px; }
        .val-modal p { font-size: 13.5px; color: var(--val-text-muted); margin-bottom: 24px; line-height: 1.5; }

        /* Toast Stack */
        .val-toast-stack {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 350px;
          pointer-events: none;
        }
        .val-toast {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #ffffff;
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
          border-left: 4px solid var(--val-black);
        }
        .val-toast.error { border-left-color: var(--val-error); }
        .val-toast-icon { flex-shrink: 0; margin-top: 1px; color: var(--val-black); }
        .val-toast.error .val-toast-icon { color: var(--val-error); }
        .val-toast-title { font-size: 14px; font-weight: 700; color: var(--val-text-main); }
        .val-toast.error .val-toast-title { color: var(--val-error); }
        .val-toast-message { font-size: 12.5px; color: var(--val-text-muted); margin-top: 2px; line-height: 1.4; }
        .val-toast-close {
          background: none; border: none; cursor: pointer; color: var(--val-text-muted);
          font-size: 16px; line-height: 1; padding: 0; margin-left: auto; flex-shrink: 0;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .val-hero-quote { font-size: 22px; }
          .val-hero-section { width: 48%; padding: 40px; }
          .val-login-section { width: 52%; padding: 40px 32px; }
        }

        @media (max-width: 768px) {
          .val-page-container { flex-direction: column; min-height: 100vh; overflow-y: auto; }
          .val-hero-section { width: 100%; min-height: 240px; padding: 36px 24px; }
          .val-login-section { width: 100%; padding: 40px 24px; }
          .val-hero-quote { font-size: 19px; }
          .val-form-logo { width: 130px; }
        }
      `}</style>

      <div className="val-page-container">

        {/* ── LEFT SIDE: Sage Green Hero Section ── */}
        <div className="val-hero-section">
          <div className="val-sage-ambient" />

          {/* SVG Abstract Flowing Fabric / Silk Wave Ribbons */}
          <div className="val-silk-container">
            <svg className="val-silk-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <defs>
                <linearGradient id="silkGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#d5e8dc" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#769881" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="silkGrad2" x1="0%" y1="20%" x2="100%" y2="80%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#bee0c8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#55755e" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d="M -50 150 C 350 250, 250 650, 1000 750 L 1000 920 C 400 520, 650 420, -50 280 Z"
                fill="url(#silkGrad1)"
              />
              <path
                d="M -100 80 C 300 320, 480 600, 1000 880 L 1000 1020 C 420 600, 620 480, -100 220 Z"
                fill="url(#silkGrad2)"
              />
              <path
                d="M -30 220 C 380 290, 680 430, 1030 790"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M -10 260 C 400 330, 700 470, 1010 830"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          {/* Italicized Quote */}
          <div className="val-hero-body">
            <motion.p 
              className="val-hero-quote"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              "Simplifying medical stay accommodation billing and invoice management for patients with precision and care."
            </motion.p>
          </div>
        </div>

        {/* ── RIGHT SIDE: Admin Login Form ── */}
        <div className="val-login-section">
          
          <motion.div 
            className="val-form-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Centered Responsive Logo Header */}
            <div className="val-form-brand">
              <img
                src="/loginlog.png"
                alt="Valli Stay"
                className="val-form-logo"
              />
            </div>

            <h1 className="val-title">Welcome Back</h1>
            <p className="val-subtitle">Sign in to your Vallistay account to manage guest billing</p>

            {/* Admin Email Input */}
            <div className="val-field-group">
              <label className="val-label"> Email</label>
              <div className="val-input-wrapper">
                <FiMail className="val-input-icon" />
                <input
                  className={`val-input${errors.username ? " error" : ""}`}
                  type="email"
                  placeholder="Enter Your Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>
              {errors.username && <p className="val-error-text">{errors.username}</p>}
            </div>

            {/* Password Input */}
            <div className="val-field-group">
              <label className="val-label">Password</label>
              <div className="val-input-wrapper">
                <FiLock className="val-input-icon" />
                <input
                  className={`val-input${errors.password ? " error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  className="val-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="val-error-text">{errors.password}</p>}
            </div>

            <div className="val-forgot-row"></div>

            {/* Solid Black Button */}
            <motion.button
              className="val-submit-btn"
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>

            <div className="val-form-footer">
              <FiShield size={13} /> Vallistay Invoicing &copy; {new Date().getFullYear()}
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <AnimatePresence>
        {forgotMode && (
          <motion.div
            className="val-overlay"
            onClick={() => { setForgotMode(false); setEmail(""); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="val-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3>Reset Password</h3>
              <p>Enter your registered administrator email address to receive a password reset link.</p>

              <div className="val-field-group" style={{ marginBottom: 24 }}>
                <label className="val-label">Admin Email Address</label>
                <div className="val-input-wrapper">
                  <FiMail className="val-input-icon" />
                  <input
                    className="val-input"
                    type="email"
                    placeholder="you@vallistay.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    autoFocus
                  />
                </div>
              </div>

              <button className="val-submit-btn" onClick={handleForgotPassword}>
                Send Reset Link
              </button>

              <p style={{ marginTop: 20, textAlign: "center" }}>
                <button className="val-forgot-btn" onClick={() => { setForgotMode(false); setEmail(""); }}>
                  &larr; Back to Login
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP-RIGHT TOAST NOTIFICATION ── */}
      <div className="val-toast-stack">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className={`val-toast${toast.type === "error" ? " error" : ""}`}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <span className="val-toast-icon">
                {toast.type === "error" ? <FiXCircle size={20} /> : <FiCheckCircle size={20} />}
              </span>
              <div>
                <div className="val-toast-title">{toast.title}</div>
                {toast.message && <div className="val-toast-message">{toast.message}</div>}
              </div>
              <button className="val-toast-close" onClick={() => setToast(null)}>&#10005;</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}