import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Users, HeartHandshake, Wallet,
  GraduationCap, Stethoscope, FileText, ChartNoAxesCombined,
  Settings, Search, Bell, ChevronDown, ArrowUpRight,
  ArrowDownRight, Menu, X, Plus, Download, CalendarDays,
  ShieldCheck, Clock3, CheckCircle2, CircleAlert,
  MoreHorizontal, BriefcaseBusiness, UserRound, LogOut
} from "lucide-react";
import {
  personnelAPI,
  healthAPI,
  type PersonnelRecord,
} from "./services/api";
import {
  ResponsiveContainer, AreaChart, Area, XAxis,
  YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from "recharts";

import "./App.css";

const navigation = [
  { name: "Overview", icon: LayoutDashboard, section: "WORKSPACE" },
  { name: "Personnel", icon: Users, section: "WORKSPACE" },
  { name: "Welfare", icon: HeartHandshake, section: "WORKSPACE" },
  { name: "Payroll", icon: Wallet, section: "MANAGEMENT" },
  { name: "Education", icon: GraduationCap, section: "MANAGEMENT" },
  { name: "Medical", icon: Stethoscope, section: "MANAGEMENT" },
  { name: "Documents", icon: FileText, section: "MANAGEMENT" },
  { name: "Reports", icon: ChartNoAxesCombined, section: "SYSTEM" },
  { name: "Settings", icon: Settings, section: "SYSTEM" },
];

// const personnel = [
//   { id: "ADES-001", name: "Aung Min Htet", dept: "Administration", role: "Senior Officer", status: "Active" },
//   { id: "ADES-002", name: "Kyaw Zin Htun", dept: "Finance", role: "Accountant", status: "Active" },
//   { id: "ADES-003", name: "Thiri Aung", dept: "Education", role: "Training Officer", status: "On Leave" },
//   { id: "ADES-004", name: "Min Khant", dept: "Medical", role: "Administrator", status: "Active" },
//   { id: "ADES-005", name: "May Thu", dept: "Administration", role: "HR Officer", status: "Active" },
// ];

const activity = [
  { title: "Personnel record updated", detail: "Administration · ADES-001", time: "10 minutes ago", type: "success" },
  { title: "Leave request submitted", detail: "Education · ADES-003", time: "35 minutes ago", type: "warning" },
  { title: "Document approved", detail: "Finance · DOC-2026-018", time: "1 hour ago", type: "success" },
  { title: "Training record created", detail: "Education · TRN-026", time: "2 hours ago", type: "info" },
];

const monthlyData = [
  { month: "Jun", personnel: 320, welfare: 120 },
  { month: "Jul", personnel: 350, welfare: 145 },
  { month: "Aug", personnel: 370, welfare: 130 },
  { month: "Sep", personnel: 390, welfare: 165 },
  { month: "Oct", personnel: 420, welfare: 180 },
  { month: "Nov", personnel: 450, welfare: 195 },
];

const departmentData = [
  { name: "Admin", value: 85 },
  { name: "Finance", value: 55 },
  { name: "Education", value: 72 },
  { name: "Medical", value: 48 },
  { name: "Other", value: 35 },
];

function App() {
  const [active, setActive] = useState("Overview");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDepartment, setNewDepartment] = useState("Administration");
  const [records, setRecords] = useState<PersonnelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [, setBackendStatus] = useState("Checking");
  // const isActive = p.employment_status === "ACTIVE";

  useEffect(() => {
  let mounted = true;

  async function loadDashboard() {
    try {
      const [data] = await Promise.all([
        personnelAPI.list(),
        healthAPI.check(),
      ]);

      if (mounted) {
        setRecords(data);
        setBackendStatus("Connected");
        setApiError("");
      }
    } catch (error) {
      if (mounted) {
        setBackendStatus("Disconnected");
        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to connect to server"
        );
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadDashboard();

  return () => {
    mounted = false;
  };
}, []);

const filtered = useMemo<PersonnelRecord[]>(() => {
  return records.filter((p) => {
    const matchSearch =
      `${p.employee_code} ${p.full_name} ${p.department} ${p.job_title}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchDepartment =
      department === "All" || p.department === department;

    return matchSearch && matchDepartment;
  });
}, [records, search, department]);

 const addPersonnel = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newName.trim()) return;

  try {
    const record = await personnelAPI.create({
      employee_code: `ADES-${Date.now()}`,
      full_name: newName.trim(),
      department: newDepartment,
      job_title: "Administrative Officer",
    });

    setRecords((prev) => [record, ...prev]);
    setNewName("");
    setShowModal(false);
    setActive("Personnel");
    setApiError("");
  } catch (error) {
    setApiError(
      error instanceof Error
        ? error.message
        : "Unable to save personnel"
    );
  }
};

const exportCSV = () => {
  const rows = [
    ["Employee ID", "Name", "Department", "Position", "Status"],
    ...filtered.map((p) => [
      p.employee_code,
      p.full_name,
      p.department,
      p.job_title,
      p.employment_status,
    ]),
  ];

  const csv = rows
    .map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "ADES-personnel-report.csv";
  link.click();

  URL.revokeObjectURL(url);
};
  const title = active === "Overview" ? "Dashboard Overview" : active;

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={23} /></div>
          <div>
            <div className="brand-name">APEXIVE<span>AI</span></div>
            <div className="brand-sub">DEFENSE ENTERPRISE</div>
          </div>
          <button className="mobile-close icon-btn" onClick={() => setSidebarOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="organization">
          <div className="org-icon"><BriefcaseBusiness size={18} /></div>
          <div className="org-info">
            <strong>ADES Organization</strong>
            <span>Enterprise Workspace</span>
          </div>
          <ChevronDown size={15} />
        </div>

        {["WORKSPACE", "MANAGEMENT", "SYSTEM"].map((section) => (
          <div className="nav-section" key={section}>
            <div className="nav-label">{section}</div>
            {navigation.filter((item) => item.section === section).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className={`nav-item ${active === item.name ? "active" : ""}`}
                  onClick={() => {
                    setActive(item.name);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {item.name === "Welfare" && <span className="nav-count">4</span>}
                </button>
              );
            })}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon"><ShieldCheck size={18} /></div>
            <strong>ADES Secure Platform</strong>
            <p>Administrative workspace for authorized users.</p>
            <span className="secure-status"><span /> System protected</span>
          </div>
          <div className="profile">
            <div className="avatar">AD</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
            <LogOut size={17} className="logout-icon" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="breadcrumb">ADES <span>/</span> {active}</div>
          <div className="topbar-right">
            <div className="system-status"><span /> All systems operational</div>
            <button className="icon-btn notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}>
              <Bell size={19} />
              <span className="notification-dot" />
            </button>
            <div className="top-user">
              <div className="avatar">AD</div>
              <div><strong>Administrator</strong><small>System Admin</small></div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        {notificationsOpen && (
          <div className="notification-panel">
            <div className="panel-heading">
              <strong>Notifications</strong>
              <button className="text-btn" onClick={() => setNotificationsOpen(false)}>Close</button>
            </div>
            <p>4 pending welfare requests need administrative review.</p>
            <p>Monthly personnel report is ready for review.</p>
            <p>System backup status: Demo environment.</p>
          </div>
        )}

        <div className="page-container">
          {apiError && (
  <div className="api-error">
    <CircleAlert size={17} />
    <span>{apiError}</span>
    <button onClick={() => window.location.reload()}>
      Retry
    </button>
  </div>
)}

{loading && (
  <div className="api-loading">
    Connecting to ADES services...
  </div>
)}
          <div className="page-heading">
            <div>
              <div className="eyebrow">ENTERPRISE MANAGEMENT PLATFORM</div>
              <h1>{title}</h1>
              <p>Manage administrative services and organizational resources.</p>
            </div>
            <div className="heading-actions">
              <div className="date-chip"><CalendarDays size={16} /> November 2026</div>
              {active === "Personnel" && (
                <button className="primary-btn" onClick={() => setShowModal(true)}>
                  <Plus size={17} /> Add Personnel
                </button>
              )}
              {active === "Overview" && (
                <button className="secondary-btn" onClick={exportCSV}>
                  <Download size={16} /> Export
                </button>
              )}
            </div>
          </div>

          {active === "Overview" ? (
            <>
              <div className="stats-grid">
                      <StatCard
  label="Total Personnel"
  value={records.length.toLocaleString()}
  change="Live database"
  positive
  icon={<Users />}
/>

<StatCard 
  label="Active Personnel" 
  value={records.filter((p) => p.employment_status === "ACTIVE").length.toLocaleString()} 
  change="+4.5%" 
  positive={true} 
  icon={<UserRound />} 
/>
                <StatCard label="Welfare Requests" value="24" change="12 pending" positive={false} icon={<HeartHandshake />} />
                <StatCard label="Monthly Payroll" value="MMK 48.5M" change="+2.4%" positive icon={<Wallet />} />
              </div>

              <div className="analytics-grid">
                <section className="panel analytics-panel">
                  <div className="panel-header">
                    <div><h3>Organization Overview</h3><p>Personnel and welfare activity trends</p></div>
                    <button className="select-chip">Last 6 months <ChevronDown size={14}/></button>
                  </div>
                  <div className="chart-legend">
                    <span><i className="legend-green" /> Personnel</span>
                    <span><i className="legend-gray" /> Welfare</span>
                  </div>
                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="personnelGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#36c994" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#36c994" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#29333a" strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" stroke="#7c8a91" tickLine={false} axisLine={false}/>
                        <YAxis stroke="#7c8a91" tickLine={false} axisLine={false}/>
                        <Tooltip contentStyle={{background:"#172129",border:"1px solid #33434b",borderRadius:10,color:"#fff"}}/>
                        <Area type="monotone" dataKey="personnel" stroke="#36c994" strokeWidth={2.5} fill="url(#personnelGradient)"/>
                        <Area type="monotone" dataKey="welfare" stroke="#8b9ba4" strokeWidth={2} fill="transparent"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="panel department-panel">
                  <div className="panel-header">
                    <div><h3>Department Distribution</h3><p>Personnel by department</p></div>
                    <MoreHorizontal size={19}/>
                  </div>
                  <div className="department-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={departmentData} layout="vertical">
                        <XAxis type="number" hide/>
                        <YAxis type="category" dataKey="name" stroke="#94a3aa" tickLine={false} axisLine={false} width={75}/>
                        <Tooltip contentStyle={{background:"#172129",border:"1px solid #33434b",borderRadius:10,color:"#fff"}}/>
                        <Bar dataKey="value" fill="#36c994" radius={[0,5,5,0]} barSize={12}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              <div className="bottom-grid">
                <section className="panel personnel-panel">
                  <div className="panel-header">
                    <div><h3>Recent Personnel</h3><p>Latest personnel records</p></div>
                    <button className="text-btn" onClick={() => setActive("Personnel")}>View all <ArrowUpRight size={14}/></button>
                  </div>
                  <PersonnelTable data={records.slice(0, 4)} />
                </section>

                <section className="panel activity-panel">
                  <div className="panel-header">
                    <div><h3>Recent Activity</h3><p>Latest administrative updates</p></div>
                    <MoreHorizontal size={19}/>
                  </div>
                  <div className="activity-list">
                    {activity.map((a, i) => (
                      <div className="activity-item" key={i}>
                        <div className={`activity-icon ${a.type}`}>
                          {a.type === "success" ? <CheckCircle2 size={16}/> :
                           a.type === "warning" ? <CircleAlert size={16}/> : <Clock3 size={16}/>}
                        </div>
                        <div className="activity-info">
                          <strong>{a.title}</strong>
                          <span>{a.detail}</span>
                          <small>{a.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section className="panel module-view">
              <div className="panel-header">
                <div>
                  <h3>{active} Management</h3>
                  <p>Administrative records and workspace</p>
                </div>
                {active === "Personnel" && (
                  <button className="secondary-btn" onClick={exportCSV}>
                    <Download size={16}/> Export CSV
                  </button>
                )}
              </div>
              {active === "Personnel" ? (
                <>
                  <div className="table-controls">
                    <div className="search-box">
                      <Search size={17}/>
                      <input placeholder="Search ID, name, department..." value={search} onChange={e => setSearch(e.target.value)}/>
                    </div>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                      <option>All</option>
                      <option>Administration</option>
                      <option>Finance</option>
                      <option>Education</option>
                      <option>Medical</option>
                    </select>
                  </div>
                  <PersonnelTable data={filtered}/>
                  <div className="table-footer">Showing {filtered.length} of {records.length} records</div>
                </>
              ) : (
                <div className="empty-module">
                  <div className="empty-icon"><ShieldCheck size={28}/></div>
                  <h2>{active} Workspace</h2>
                  <p>This module is included in the ADES roadmap. Its secured backend integration will be implemented in the next development phase.</p>
                  <span className="coming-soon">MODULE FOUNDATION PENDING</span>
                </div>
              )}
            </section>
          )}

          <footer className="footer">
            <span>© 2026 ApexiveAI. All rights reserved.</span>
            <span><ShieldCheck size={13}/> ADES v0.1.0 · Development Preview</span>
          </footer>
        </div>
      </main>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <form className="modal" onSubmit={addPersonnel} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div><h2>Add Personnel</h2><p>Create a demo personnel record</p></div>
              <button type="button" className="icon-btn" onClick={() => setShowModal(false)}><X size={19}/></button>
            </div>
            <label>Full Name</label>
            <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter full name"/>
            <label>Department</label>
            <select value={newDepartment} onChange={e => setNewDepartment(e.target.value)}>
              <option>Administration</option>
              <option>Finance</option>
              <option>Education</option>
              <option>Medical</option>
            </select>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="primary-btn" type="submit"><Plus size={16}/> Create Record</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, change, positive, icon }: {
  label: string; value: string; change: string; positive: boolean; icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      {/* Use the value prop passed into the component */}
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${positive ? "positive" : "neutral"}`}>
        {positive ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
        {change}
        <span> vs previous period</span>
      </div>
    </div>
  );
}

function PersonnelTable({
  data,
}: {
  data: PersonnelRecord[];
}) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>
          <th>PERSONNEL</th><th>DEPARTMENT</th><th>POSITION</th><th>STATUS</th>
        </tr></thead>
        <tbody>
          {data.map(p => (
            <tr key={p.employee_code}>
              <td><div className="person-cell"><div className="person-avatar">{p.full_name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><div><strong>{p.full_name}</strong><small>{p.id}</small></div></div></td>
              <td>{p.department}</td>
              <td>{p.job_title}</td>
              <td><span className={`status ${p.employment_status === "Active" ? "status-active" : "status-leave"}`}><i/>{p.employment_status}</span></td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={4} className="no-results">No matching personnel records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;
