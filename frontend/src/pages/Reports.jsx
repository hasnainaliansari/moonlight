// src/pages/Reports.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // default last 30 days
  useEffect(() => {
    const today = new Date();
    const t = today.toISOString().slice(0, 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const f = fromDate.toISOString().slice(0, 10);
    setFrom(f);
    setTo(t);
    loadRevenue(f, t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRevenue = async (fromDate, toDate) => {
    try {
      setLoading(true);
      const res = await api.get("/invoices");
      const invoices = res.data.invoices || res.data;

      const start = fromDate ? new Date(fromDate) : null;
      const end = toDate ? new Date(toDate) : null;
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      const map = {};

      invoices.forEach((inv) => {
        if (inv.status !== "paid") return;

        const rawDate = inv.paidAt || inv.updatedAt || inv.createdAt;
        if (!rawDate) return;

        const d = new Date(rawDate);
        if (start && d < start) return;
        if (end && d > end) return;

        const key = d.toISOString().slice(0, 10);
        map[key] = (map[key] || 0) + Number(inv.totalAmount || 0);
      });

      const sorted = Object.entries(map)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, total]) => ({ date, total }));

      setRows(sorted);
    } catch (err) {
      console.error("Revenue load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadRevenue(from, to);
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Reports</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Revenue by date range (calculated from paid invoices).
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-end",
          marginBottom: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}
          >
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}
          >
            To
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={primaryBtn}
        >
          {loading ? "Loading…" : "Apply"}
        </button>
      </form>

      {loading ? (
        <div>Loading revenue…</div>
      ) : rows.length === 0 ? (
        <div style={{ fontSize: 13, color: "#9ca3af" }}>
          No paid invoices in this range.
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            fontSize: 13,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #1f2937" }}>
              <Th>Date</Th>
              <Th>Total revenue</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.date}
                style={{ borderBottom: "1px solid #111827" }}
              >
                <Td>{r.date}</Td>
                <Td>${r.total}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid rgba(148,163,184,0.4)",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
  fontSize: 13,
};

const primaryBtn = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(to right, #22c55e, #22d3ee, #6366f1)",
  color: "#0f172a",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function Th({ children }) {
  return (
    <th style={{ padding: "8px 6px", textAlign: "left", fontWeight: 500 }}>
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td style={{ padding: "6px 6px" }}>{children}</td>;
}

export default Reports;
