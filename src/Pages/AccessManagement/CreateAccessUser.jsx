

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Check, Info, RotateCw, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "../Stays/Rooms/Room_Shared";
import "./AccessManagement.css";
// import PermissionMatrix from "./PermissionMatrix";
import {
  fetchUserById,
  createUserWithAccess,
  updateUserWithAccess,
} from "./services/accessManagementApi";
import useBreakpoint from "./useBreakpoint";
import PermissionMatrix, { isLocked, fullPerm, allowedActions, sanitizePerm } from "./PermissionMatrix";


const EMPTY_PERM = { view: false, create: false, update: false, delete: false, export: false };
const MODULES = ["invoice", "customers", "departments", "room_booking", "access_management", "audit_logs"];
const buildEmptyPermissions = () =>
  MODULES.reduce((acc, m) => ({ ...acc, [m]: { ...EMPTY_PERM } }), {});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile

export default function CreateAccessUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { push: toast, ToastHost } = useToast();
  const bp = useBreakpoint();

  const isEditMode = Boolean(id || location.pathname.includes("/edit"));
  const targetUserId = id || new URLSearchParams(location.search).get("id") || "";

  const [fetchingUser, setFetchingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userRole, setUserRole] = useState("standard"); // 'standard' | 'admin'

  const [errors, setErrors] = useState({});

  const [permissions, setPermissions] = useState(buildEmptyPermissions());
  const [standardPermissions, setStandardPermissions] = useState(buildEmptyPermissions());

  // ---------- Validation ----------
  const validateField = (field, value, extra = {}) => {
    switch (field) {
      case "firstName":
        if (!value.trim()) return "First name is required.";
        if (value.trim().length < 2) return "First name must be at least 2 characters.";
        return "";
      case "lastName":
        if (!value.trim()) return "Last name is required.";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address.";
        return "";
      case "mobile": {
        const digits = value.replace(/[^0-9]/g, "");
        if (!digits) return "Mobile number is required.";
        if (digits.length !== 10) return "Mobile number must be 10 digits.";
        if (!MOBILE_REGEX.test(digits)) return "Enter a valid mobile number (starts with 6-9).";
        return "";
      }
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm the password.";
        if (value !== (extra.password ?? password)) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const setFieldError = (field, message) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });

  const validateAll = () => {
    const next = {};
    const check = (field, value, extra) => {
      const msg = validateField(field, value, extra);
      if (msg) next[field] = msg;
    };

    check("firstName", firstName);
    check("lastName", lastName);

    if (!isEditMode) {
      check("email", email);
      check("mobile", mobile);
      check("password", password);
      check("confirmPassword", confirmPassword, { password });
    }

    setErrors(next);
    return next;
  };

  const handleBlur = (field, value, extra) => {
    setFieldError(field, validateField(field, value, extra));
  };

  // live re-validate only if that field already has an error
  const liveValidate = (field, value, extra) => {
    if (errors[field]) setFieldError(field, validateField(field, value, extra));
  };

  // Edit mode: load user
  useEffect(() => {
    if (isEditMode && targetUserId) {
      const loadUser = async () => {
        setFetchingUser(true);
        try {
          const user = await fetchUserById(targetUserId);
          if (user) {
            setFirstName(user.name || "");
            setLastName(user.last_name || "");
            setEmail(user.email || "");
            setMobile(user.raw_mobile || (user.mobile ? user.mobile.replace("+91 ", "") : ""));
            setUserRole(user.user_type === "admin" ? "admin" : "standard");

            if (user.access_module_list && user.access_module_list.length > 0) {
              const loadedPerms = {};
              user.access_module_list.forEach((m) => {
                // loadedPerms[m.module_name] = {
                //   view: Boolean(m.view || m.create || m.update || m.delete || m.export),
                //   create: Boolean(m.create),
                //   update: Boolean(m.update),
                //   delete: Boolean(m.delete),
                //   export: Boolean(m.export),
                // };
                loadedPerms[m.module_name] = sanitizePerm(m.module_name, {
  view: m.view || m.create || m.update || m.delete || m.export,
  create: m.create, update: m.update, delete: m.delete, export: m.export,
});
              });
              setPermissions((prev) => ({ ...prev, ...loadedPerms }));
              setStandardPermissions((prev) => ({ ...prev, ...loadedPerms }));
            }
          }
        } catch (err) {
          console.error("Error loading user for edit:", err);
          toast("We couldn’t load this user’s details.", "error");
        } finally {
          setFetchingUser(false);
        }
      };

      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, targetUserId]);

  const isPasswordMatch =
    password !== "" && confirmPassword !== "" && password === confirmPassword;

  const { selectedModulesCount, totalScopesEnabled, securityTier, totalModules, maxScopes } =
    useMemo(() => {
      let scopes = 0;
      let selectedModules = 0;
      const modules = Object.keys(permissions);
      const totalModules = modules.length;
      // const maxScopes = totalModules * 5;
      const maxScopes = modules.reduce((n, m) => n + allowedActions(m).length, 0);

      modules.forEach((mod) => {
        const p = permissions[mod];
        const count = [p.view, p.create, p.update, p.delete, p.export].filter(Boolean).length;
        scopes += count;
        if (count > 0) selectedModules++;
      });

      let tier = "Custom Operator";
      if (userRole === "admin" || scopes === maxScopes) {
        tier = "Full Administrator";
      } else if (scopes === 0) {
        tier = "No Grants Assigned";
      } else if (scopes <= 5) {
        tier = "Restricted Viewer";
      }

      return {
        selectedModulesCount: selectedModules,
        totalScopesEnabled: scopes,
        securityTier: tier,
        totalModules,
        maxScopes,
      };
    }, [permissions, userRole]);

  const handlePermissionChange = (moduleId, field, value) => {
    if (isLocked(moduleId, field)) return;
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [field]: value,
          ...(value && field !== "view" ? { view: true } : {}),
        },
      };

      if (userRole === "standard") {
        setStandardPermissions(updated);
      }

      return updated;
    });
  };

  // const handleSelectAll = () => {
  //   const updated = {};
  //   Object.keys(permissions).forEach((mod) => {
  //     updated[mod] = { view: true, create: true, update: true, delete: true, export: true };
  //   });
  //   setPermissions(updated);
  // };

  const handleSelectAll = () => {
  const updated = {};
  Object.keys(permissions).forEach((mod) => {
    updated[mod] = fullPerm(mod);
  });
  setPermissions(updated);
};
  const handleClearAll = () => {
    const updated = {};
    Object.keys(permissions).forEach((mod) => {
      updated[mod] = { ...EMPTY_PERM };
    });
    setPermissions(updated);
  };

  const handleRoleSelect = (role) => {
    if (role === "admin" && userRole !== "admin") {
      setStandardPermissions(permissions);
      handleSelectAll();
    } else if (role === "standard" && userRole === "admin") {
      setPermissions(standardPermissions);
    }
    setUserRole(role);
  };

  const cleanMobile = mobile.replace(/[^0-9]/g, "");

  // Step 1: validate, then (create mode) ask for confirmation
  const handleSave = (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    const found = validateAll();
    if (Object.keys(found).length > 0) {
      toast("Please fix the highlighted fields.", "error");
      setTimeout(() => {
        const el = document.querySelector(".am-input.am-input-error");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 50);
      return;
    }

    if (isEditMode) {
      submitToApi();
    } else {
      setShowConfirm(true);
    }
  };

  // Step 2: actual API call
  const submitToApi = async () => {
    // const accessModuleList = Object.keys(permissions).map((modKey) => ({
    //   module_name: modKey,
    //   view: Boolean(permissions[modKey]?.view),
    //   create: Boolean(permissions[modKey]?.create),
    //   update: Boolean(permissions[modKey]?.update),
    //   delete: Boolean(permissions[modKey]?.delete),
    //   export: Boolean(permissions[modKey]?.export),
    // }));

    const accessModuleList = Object.keys(permissions).map((modKey) => ({
  module_name: modKey,
  ...sanitizePerm(modKey, permissions[modKey]),
}));

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const payload = {
          user_id: targetUserId,
          name: firstName.trim(),
          last_name: lastName.trim(),
          access_module_list: accessModuleList,
        };

        await updateUserWithAccess(payload);
        toast("User updated successfully. Permissions were saved.", "success");
      } else {
        const payload = {
          name: firstName.trim(),
          last_name: lastName.trim(),
          user_type: userRole === "admin" ? "admin" : "user1",
          email: email.trim(),
          password,
          mobile: cleanMobile,
          access_module_list: accessModuleList,
        };

        await createUserWithAccess(payload);
        toast("User created successfully. Access permissions were assigned.", "success");
      }

      setShowConfirm(false);
      setTimeout(() => {
        navigate("/access-management");
      }, 1200);
    } catch (err) {
      console.error("Save error:", err);
      setShowConfirm(false);
      if (isEditMode) {
        toast("We couldn’t update this user. No changes were saved.", "error");
      } else {
        toast("We couldn’t create this user. Please review the details and try again.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? (
      <div className="am-field-error" role="alert">
        <AlertTriangle size={12} />
        <span>{errors[name]}</span>
      </div>
    ) : null;

  return (
    <div className="am-container">
      <ToastHost />

      {/* Confirm-before-create modal */}
      {showConfirm && (
        <div className="am-modal-overlay" onClick={() => !isSubmitting && setShowConfirm(false)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <div className="am-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 className="am-modal-title">Double-check before creating</h3>
            <p className="am-modal-text">
              Email and mobile number <strong>can’t be changed</strong> after the account is
              created. Please confirm they are correct.
            </p>

            <div className="am-modal-details">
              <div className="am-modal-row">
                <span className="am-modal-label">Email</span>
                <span className="am-modal-value">
                  {email.trim()} <Lock size={12} />
                </span>
              </div>
              <div className="am-modal-row">
                <span className="am-modal-label">Mobile</span>
                <span className="am-modal-value">
                  {cleanMobile} <Lock size={12} />
                </span>
              </div>
            </div>

            <div className="am-modal-actions">
              <button
                type="button"
                className="am-btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                className="am-btn-primary"
                onClick={submitToApi}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RotateCw size={14} className="am-spinner" /> Creating...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Confirm & Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="am-header">
        <div className="am-header-back">
          <button
            type="button"
            className="am-btn-outline"
            style={{ padding: "8px 10px", marginTop: "2px" }}
            onClick={() => navigate("/access-management")}
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="am-page-title">
              {isEditMode ? "Edit User Privileges" : "Create User Privileges"}
            </h1>
          </div>
        </div>

        <div className="am-header-actions am-hide-touch">
          <button
            type="button"
            className="am-btn-outline"
            onClick={() => navigate("/access-management")}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="am-btn-primary"
            onClick={handleSave}
            disabled={isSubmitting || fetchingUser}
          >
            {isSubmitting && isEditMode ? (
              <>
                <RotateCw size={14} className="am-spinner" />
                Updating...
              </>
            ) : isEditMode ? (
              "Update Privileges"
            ) : (
              "Save User & Permissions"
            )}
          </button>
        </div>
      </div>

      {fetchingUser ? (
        <div
          className="am-form-card"
          style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}
        >
          <RotateCw size={24} color="#2563eb" className="am-spinner" style={{ marginBottom: 10 }} />
          <p>Loading user details...</p>
        </div>
      ) : (
        <div className="am-form-layout">
          {/* TABLET: sticky summary strip */}
          {bp === "tablet" && (
            <div className="am-tab-strip">
              <div className="am-tab-strip-stats">
                <div className="am-tab-stat">
                  <span>Modules</span>
                  <strong>
                    {selectedModulesCount}/{totalModules}
                  </strong>
                </div>
                <div className="am-tab-stat">
                  <span>Scopes</span>
                  <strong>
                    {totalScopesEnabled}/{maxScopes}
                  </strong>
                </div>
                <div className="am-tab-stat wide">
                  <span>Security Tier</span>
                  <strong>{securityTier}</strong>
                </div>
              </div>
              <div className="am-tab-strip-actions">
                <button
                  type="button"
                  className="am-btn-outline"
                  onClick={() => navigate("/access-management")}
                  disabled={isSubmitting}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="am-btn-primary"
                  onClick={handleSave}
                  disabled={isSubmitting || fetchingUser}
                >
                  <Check size={15} />
                  {isEditMode ? "Update" : "Create"}
                </button>
              </div>
            </div>
          )}

          {/* Left Form Content */}
          <div>
            {/* 1. User Information */}
            <div className="am-form-card">
              <div className="am-form-section-header">
                <div className="am-step-num">1</div>
                <div className="am-form-section-title">User Information</div>
              </div>

              {/* Create-mode awareness banner */}
              {!isEditMode && (
                <div className="am-warn-banner">
                  <AlertTriangle size={16} className="am-warn-banner-icon" />
                  <div>
                    <div className="am-warn-banner-title">Heads up before you create</div>
                    <div className="am-warn-banner-text">
                      Email and mobile number become the user’s permanent login identity. They{" "}
                      <strong>can’t be edited</strong> once the account is created, so please
                      enter them carefully.
                    </div>
                  </div>
                </div>
              )}

              {/* Edit-mode lock banner */}
              {isEditMode && (
                <div className="am-lock-banner">
                  <Lock size={16} className="am-lock-banner-icon" />
                  <div>
                    <div className="am-lock-banner-title">Email & mobile number are locked</div>
                    <div className="am-lock-banner-text">
                      These are the user’s login identity and can’t be changed after the account
                      is created. You can still update the name and permissions.
                    </div>
                  </div>
                </div>
              )}

              <div className="am-form-grid">
                {/* First Name */}
                <div className="am-form-group">
                  <label className="am-label">
                    First Name <span className="am-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`am-input ${errors.firstName ? "am-input-error" : ""}`}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      liveValidate("firstName", e.target.value);
                    }}
                    onBlur={(e) => handleBlur("firstName", e.target.value)}
                    placeholder="Enter First Name"
                  />
                  <FieldError name="firstName" />
                </div>

                {/* Last Name */}
                <div className="am-form-group">
                  <label className="am-label">
                    Last Name <span className="am-required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`am-input ${errors.lastName ? "am-input-error" : ""}`}
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      liveValidate("lastName", e.target.value);
                    }}
                    onBlur={(e) => handleBlur("lastName", e.target.value)}
                    placeholder="Enter Last Name"
                  />
                  <FieldError name="lastName" />
                </div>

                {/* Email Address */}
                <div className="am-form-group">
                  <label className="am-label">
                    Email Address{" "}
                    {isEditMode ? (
                      <span className="am-locked-tag">
                        <Lock size={10} /> Locked
                      </span>
                    ) : (
                      <span className="am-required">*</span>
                    )}
                  </label>
                  <div className={`am-locked-wrap ${isEditMode ? "is-locked" : ""}`}>
                    <input
                      type="email"
                      className={`am-input ${errors.email ? "am-input-error" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        liveValidate("email", e.target.value);
                      }}
                      onBlur={(e) => !isEditMode && handleBlur("email", e.target.value)}
                      placeholder="Enter Email"
                      disabled={isEditMode}
                      title={isEditMode ? "Email can’t be changed after account creation" : ""}
                    />
                    {isEditMode && <Lock size={14} className="am-lock-icon" />}
                  </div>
                  {errors.email ? (
                    <FieldError name="email" />
                  ) : (
                    <div className={`am-field-hint ${!isEditMode ? "is-warn" : ""}`}>
                      <Info size={12} />
                      {isEditMode
                        ? "Email can’t be changed once the account is created."
                        : "Can’t be changed after the account is created."}
                    </div>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="am-form-group">
                  <label className="am-label">
                    Mobile Number{" "}
                    {isEditMode ? (
                      <span className="am-locked-tag">
                        <Lock size={10} /> Locked
                      </span>
                    ) : (
                      <span className="am-required">*</span>
                    )}
                  </label>
                  <div className={`am-locked-wrap ${isEditMode ? "is-locked" : ""}`}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={isEditMode ? undefined : 10}
                      className={`am-input ${errors.mobile ? "am-input-error" : ""}`}
                      value={mobile}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
                        setMobile(v);
                        liveValidate("mobile", v);
                      }}
                      onBlur={(e) => !isEditMode && handleBlur("mobile", e.target.value)}
                      placeholder="Enter Mobile No"
                      disabled={isEditMode}
                      title={isEditMode ? "Mobile number can’t be changed after account creation" : ""}
                    />
                    {isEditMode && <Lock size={14} className="am-lock-icon" />}
                  </div>
                  {errors.mobile ? (
                    <FieldError name="mobile" />
                  ) : (
                    <div className={`am-field-hint ${!isEditMode ? "is-warn" : ""}`}>
                      <Info size={12} />
                      {isEditMode
                        ? "Mobile number can’t be changed once the account is created."
                        : "Can’t be changed after the account is created."}
                    </div>
                  )}
                </div>

                {/* Password fields only on Create */}
                {!isEditMode && (
                  <>
                    <div className="am-form-group">
                      <label className="am-label">
                        Password <span className="am-required">*</span>
                      </label>
                      <div className="am-input-with-action">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`am-input ${errors.password ? "am-input-error" : ""}`}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            liveValidate("password", e.target.value);
                            if (confirmPassword) {
                              setFieldError(
                                "confirmPassword",
                                validateField("confirmPassword", confirmPassword, {
                                  password: e.target.value,
                                })
                              );
                            }
                          }}
                          onBlur={(e) => handleBlur("password", e.target.value)}
                          placeholder="Enter password"
                        />
                        <button
                          type="button"
                          className="am-input-icon-btn"
                          onClick={() => setShowPassword((p) => !p)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError name="password" />
                    </div>

                    <div className="am-form-group">
                      <label className="am-label">
                        Confirm Password <span className="am-required">*</span>
                      </label>
                      <div className="am-input-with-action">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className={`am-input ${errors.confirmPassword ? "am-input-error" : ""}`}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            liveValidate("confirmPassword", e.target.value);
                          }}
                          onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                          placeholder="Confirm password"
                        />
                        {isPasswordMatch && password !== "" && (
                          <span className="am-match-tag">MATCH</span>
                        )}
                        <button
                          type="button"
                          className="am-input-icon-btn"
                          style={{ right: isPasswordMatch ? "64px" : "10px" }}
                          onClick={() => setShowConfirmPassword((p) => !p)}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <FieldError name="confirmPassword" />
                    </div>
                  </>
                )}
              </div>

              {/* User Type Role */}
              <div>
                <label className="am-label" style={{ marginBottom: 10, display: "block" }}>
                  User Access
                </label>
                <div className="am-roles-grid">
                  <div
                    className={`am-role-card ${userRole === "standard" ? "selected" : ""}`}
                    onClick={() => handleRoleSelect("standard")}
                  >
                    <div className="am-radio-circle">
                      {userRole === "standard" && <div className="am-radio-dot" />}
                    </div>
                    <div>
                      <div className="am-role-title">Standard User</div>
                      <div className="am-role-desc">
                        Custom access based on assigned permissions.
                      </div>
                    </div>
                  </div>

                  <div
                    className={`am-role-card ${userRole === "admin" ? "selected" : ""}`}
                    onClick={() => handleRoleSelect("admin")}
                  >
                    <div className="am-radio-circle">
                      {userRole === "admin" && <div className="am-radio-dot" />}
                    </div>
                    <div>
                      <div className="am-role-title">Administrator</div>
                      <div className="am-role-desc">
                        Full access to all modules and settings.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Module Permissions Matrix */}
            <PermissionMatrix
              permissions={permissions}
              onChange={handlePermissionChange}
              onSelectAll={handleSelectAll}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Sticky Summary Sidebar (desktop only) */}
          {bp === "desktop" && (
            <div>
              <div className="am-summary-sidebar-card">
                <h3 className="am-summary-sidebar-title">Live Access Scope Summary</h3>

                <div className="am-summary-row">
                  <span>Selected Modules:</span>
                  <span className="am-summary-val">
                    {selectedModulesCount} of {totalModules}
                  </span>
                </div>

                <div className="am-summary-row">
                  <span>Total Scopes Enabled:</span>
                  <span className="am-summary-val">
                    {totalScopesEnabled} / {maxScopes}
                  </span>
                </div>

                <div className="am-summary-row">
                  <span>Calculated Security Tier:</span>
                  <span
                    className="am-role-badge am-role-user"
                    style={{ fontSize: "11.5px", padding: "3px 10px" }}
                  >
                    {securityTier}
                  </span>
                </div>

                <div className="am-notice-box">
                  <Info size={18} className="am-notice-icon" />
                  <div>
                    <div className="am-notice-title">Audit Notice</div>
                    <div className="am-notice-text">
                      All permission assignments create an immutable timestamped entry in the audit
                      history logs.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="am-btn-primary am-btn-full"
                  onClick={handleSave}
                  disabled={isSubmitting || fetchingUser}
                >
                  {isSubmitting && isEditMode ? (
                    <>
                      <RotateCw size={15} className="am-spinner" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      {isEditMode ? "Apply Privileges" : "Create Account"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="am-btn-outline am-btn-full"
                  onClick={() => navigate("/access-management")}
                  disabled={isSubmitting}
                >
                  Discard Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MOBILE: sticky bottom bar */}
      {bp === "mobile" && !fetchingUser && (
        <div className="am-mobile-bar">
          <div className="am-mobile-bar-info">
            <strong>
              {totalScopesEnabled}/{maxScopes}
            </strong>{" "}
            scopes
            <span> · {selectedModulesCount} modules</span>
          </div>
          <div className="am-mobile-bar-btns">
            <button
              type="button"
              className="am-btn-outline"
              onClick={() => navigate("/access-management")}
              disabled={isSubmitting}
            >
              Discard
            </button>
            <button
              type="button"
              className="am-btn-primary"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}