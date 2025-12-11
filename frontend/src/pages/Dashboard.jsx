import { useEffect, useState } from "react";
import api from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const cardContainerStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(148,163,184,0.3)",
  background:
    "radial-gradient(circle at top left, rgba(34,197,94,0.12), transparent 55%) #020617",
  boxSizing: "border-box",
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // summary + revenue (last 30 days)
        const today = new Date();
        const to = today.toISOString().slice(0, 10);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        const from = fromDate.toISOString().slice(0, 10);

        const [summaryRes, revenueRes] = await Promise.all([
          api.get("/reports/summary"),
          api.get(`/reports/revenue?from=${from}&to=${to}`),
        ]);

        setData(summaryRes.data);

        const rawPoints = revenueRes.data?.points || [];
        const mapped = rawPoints.map((p) => ({
          date: p._id,
          total: p.total,
        }));
        setRevenuePoints(mapped);
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading dashboard…</div>;
  if (!data) return <div>Could not load dashboard.</div>;

  const occupancyData = [
    { name: "Occupied", value: data.occupiedRooms || 0 },
    { name: "Available", value: data.availableRooms || 0 },
  ];

  const todayData = [
    { name: "Check-ins", value: data.todaysCheckIns || 0 },
    { name: "Check-outs", value: data.todaysCheckOuts || 0 },
  ];

  return (
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Dashboard overview</h1>
      <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>
        Quick snapshot of today&apos;s hotel performance.
      </p>

      {/* Top summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 18,
          minWidth: 0,
        }}
      >
        <Card title="Total rooms" value={data.totalRooms} />
        <Card title="Occupied" value={data.occupiedRooms} />
        <Card title="Available" value={data.availableRooms} />
        <Card title="Occupancy" value={`${data.occupancyRate}%`} />
        <Card title="Today check-ins" value={data.todaysCheckIns} />
        <Card title="Today check-outs" value={data.todaysCheckOuts} />
        <Card title="Total revenue" value={`$${data.totalRevenue}`} />
        <Card title="Unpaid invoices" value={data.unpaidInvoices} />
      </div>

      {/* Charts area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2.1fr) minmax(0, 1.3fr)",
          gap: 16,
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        {/* Revenue line chart */}
        <div style={{ minHeight: 260, minWidth: 0 }}>
          <RevenueChart data={revenuePoints} />
        </div>

        {/* Occupancy + Today movement charts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 0,
          }}
        >
          <OccupancyChart
            data={occupancyData}
            occupancyRate={data.occupancyRate}
          />
          <TodayMovementChart data={todayData} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardContainerStyle}>
      <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function RevenueChart({ data }) {
  return (
    <div style={{ ...cardContainerStyle, height: "100%" }}>
      <div
        style={{
          fontSize: 13,
          color: "#9ca3af",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Revenue (last 30 days)</span>
        <span style={{ fontSize: 11, color: "#6b7280" }}>
          Source: paid invoices
        </span>
      </div>
      {!data || data.length === 0 ? (
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          No paid invoices in this period.
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickMargin={6}
              />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #374151",
                  fontSize: 11,
                }}
                labelStyle={{ color: "#e5e7eb" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function OccupancyChart({ data, occupancyRate }) {
  return (
    <div style={{ ...cardContainerStyle, height: "100%" }}>
      <div
        style={{
          fontSize: 13,
          color: "#9ca3af",
          marginBottom: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Room occupancy</span>
        <span style={{ fontSize: 11, color: "#a5b4fc" }}>
          {occupancyRate}% occupied
        </span>
      </div>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #374151",
                fontSize: 11,
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            <Bar
              dataKey="value"
              name="Rooms"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TodayMovementChart({ data }) {
  return (
    <div style={{ ...cardContainerStyle, height: "100%" }}>
      <div
        style={{
          fontSize: 13,
          color: "#9ca3af",
          marginBottom: 8,
        }}
      >
        Today&apos;s movements
      </div>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #374151",
                fontSize: 11,
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;
