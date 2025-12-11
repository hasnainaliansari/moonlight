// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const [form, setForm] = useState({
    hotelName: "",
    hotelEmail: "",
    hotelPhone: "",
    hotelAddress: "",
    city: "",
    country: "",
    taxRate: "",
    currencyCode: "",
    invoicePrefix: "",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setSavedMessage("");

      const res = await api.get("/settings");

      // Controller can return either:
      //  { settings: {...} } OR plain object
      const data = res.data.settings || res.data || {};

      setForm({
        hotelName: data.hotelName || "",
        hotelEmail: data.hotelEmail || "",
        hotelPhone: data.hotelPhone || "",
        hotelAddress: data.hotelAddress || "",
        city: data.city || "",
        country: data.country || "",
        taxRate:
          typeof data.taxRate === "number"
            ? String(data.taxRate)
            : data.taxRate || "",
        currencyCode: data.currencyCode || "USD",
        invoicePrefix: data.invoicePrefix || "INV-",
      });
    } catch (err) {
      console.error("Load settings error", err);
      setError(
        err.response?.data?.message || "Failed to load hotel settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSavedMessage("");

    try {
      setSaving(true);

      const payload = {
        ...form,
        taxRate: form.taxRate === "" ? 0 : Number(form.taxRate),
      };

      await api.put("/settings", payload);

      setSavedMessage("Settings saved successfully.");
    } catch (err) {
      console.error("Save settings error", err);
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Hotel Settings</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Configure hotel information, tax and invoice defaults.
      </p>

      <div
        style={{
          maxWidth: 720,
          padding: 18,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,0.3)",
          background: "#020617",
        }}
      >
        {loading ? (
          <div style={{ fontSize: 14 }}>Loading settings…</div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 14 }}
          >
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "#fecaca",
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "rgba(127,29,29,0.4)",
                }}
              >
                {error}
              </div>
            )}

            {savedMessage && (
              <div
                style={{
                  fontSize: 13,
                  color: "#bbf7d0",
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "rgba(22,101,52,0.4)",
                }}
              >
                {savedMessage}
              </div>
            )}

            {/* Hotel info */}
            <SectionTitle title="Hotel information" />

            <TwoCols>
              <Field label="Hotel name">
                <input
                  name="hotelName"
                  value={form.hotelName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="Hotel email">
                <input
                  name="hotelEmail"
                  type="email"
                  value={form.hotelEmail}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
            </TwoCols>

            <TwoCols>
              <Field label="Phone">
                <input
                  name="hotelPhone"
                  value={form.hotelPhone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="Address">
                <input
                  name="hotelAddress"
                  value={form.hotelAddress}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
            </TwoCols>

            <TwoCols>
              <Field label="City">
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="Country">
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
            </TwoCols>

            {/* Billing / tax */}
            <SectionTitle title="Billing & tax" />

            <TwoCols>
              <Field label="Currency code">
                <input
                  name="currencyCode"
                  value={form.currencyCode}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="USD, PKR, EUR…"
                />
              </Field>
              <Field label="Tax rate (%)">
                <input
                  name="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.taxRate}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="0"
                />
              </Field>
            </TwoCols>

            {/* Invoice defaults */}
            <SectionTitle title="Invoice defaults" />

            <TwoCols>
              <Field label="Invoice prefix">
                <input
                  name="invoicePrefix"
                  value={form.invoicePrefix}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="INV-, MLH-, etc."
                />
              </Field>
              <div />
            </TwoCols>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
                  color: "#0f172a",
                  fontWeight: 600,
                  cursor: saving ? "wait" : "pointer",
                  fontSize: 14,
                }}
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ marginTop: 6, marginBottom: 2 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600 }}>{title}</h2>
    </div>
  );
}

function TwoCols({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.4)",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 13,
};

export default Settings;
