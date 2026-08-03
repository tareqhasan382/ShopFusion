"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { User, MapPin, KeyRound, Mail, ShieldAlert, Pencil, Trash2, Plus } from "lucide-react";

const emptyAddress = {
  label: "",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  isDefault: false,
};

const ProfileClient = ({ user: initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [tab, setTab] = useState("profile");

  const [name, setName] = useState(initialUser.name);
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [avatar, setAvatar] = useState(initialUser.avatar || "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [savingAddress, setSavingAddress] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated.");
        setUser((p) => ({ ...p, name, phone, avatar }));
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const resendVerification = async () => {
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      toast.info(data.message || "Verification email sent.");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const saveAddress = async () => {
    setSavingAddress(true);
    try {
      const method = editingIndex >= 0 ? "PATCH" : "POST";
      const body = editingIndex >= 0 ? { index: editingIndex, address: addressForm } : { address: addressForm };
      const res = await fetch("/api/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingIndex >= 0 ? "Address updated." : "Address added.");
        setUser((p) => ({ ...p, addresses: data.addresses }));
        setAddressForm(emptyAddress);
        setEditingIndex(-1);
      } else {
        toast.error(data.message || "Failed to save address.");
      }
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (index) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Address removed.");
        setUser((p) => ({ ...p, addresses: data.addresses }));
      } else {
        toast.error(data.message || "Failed to remove address.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { key: "addresses", label: "Addresses", icon: <MapPin className="h-4 w-4" /> },
    { key: "password", label: "Password", icon: <KeyRound className="h-4 w-4" /> },
  ];

  const field = "input-field";
  const label = "input-label";

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">My Account</h1>

      {!user.emailVerified && (
        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Your email address isn&apos;t verified yet.
          </p>
          <button
            onClick={resendVerification}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            <Mail className="h-3.5 w-3.5" /> Resend verification email
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div>
          {tab === "profile" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Profile details</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={label}>Full name</label>
                  <input className={field} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className={label}>Email</label>
                  <input className={field} value={user.email} disabled readOnly />
                </div>
                <div>
                  <label className={label}>Phone</label>
                  <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <label className={label}>Avatar URL</label>
                  <input className={field} value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
                </div>
              </div>
              <button onClick={saveProfile} disabled={savingProfile} className="btn-primary mt-6">
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}

          {tab === "addresses" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {user.addresses.map((address, index) => (
                  <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {address.label || address.name}
                          {address.isDefault && (
                            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {address.name} · {address.phone}
                          <br />
                          {address.street}, {address.city} {address.state} {address.postalCode}
                          <br />
                          {address.country}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingIndex(index);
                            setAddressForm({ ...emptyAddress, ...address });
                          }}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Edit address"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAddress(index)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete address"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {(editingIndex >= 0 || user.addresses.length === 0) && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Plus className="h-4 w-4" />
                    {editingIndex >= 0 ? "Edit address" : "Add a new address"}
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={label}>Label (Home / Work)</label>
                      <input className={field} value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>Full name</label>
                      <input className={field} value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>Phone</label>
                      <input className={field} value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>Street address</label>
                      <input className={field} value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>City</label>
                      <input className={field} value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>State / Region</label>
                      <input className={field} value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>Postal code</label>
                      <input className={field} value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} />
                    </div>
                    <div>
                      <label className={label}>Country</label>
                      <input className={field} value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      />
                      Set as default address
                    </label>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <button onClick={saveAddress} disabled={savingAddress} className="btn-primary">
                      {savingAddress ? "Saving…" : editingIndex >= 0 ? "Update address" : "Add address"}
                    </button>
                    {editingIndex >= 0 && (
                      <button
                        onClick={() => {
                          setEditingIndex(-1);
                          setAddressForm(emptyAddress);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "password" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
              <div className="mt-5 grid max-w-md gap-5">
                <div>
                  <label className={label}>Current password</label>
                  <input type="password" className={field} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <div>
                  <label className={label}>New password</label>
                  <input type="password" className={field} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div>
                  <label className={label}>Confirm new password</label>
                  <input type="password" className={field} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
              </div>
              <button onClick={savePassword} disabled={savingPassword} className="btn-primary mt-6">
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;
