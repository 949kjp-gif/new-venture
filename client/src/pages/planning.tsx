import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, Circle, Plus, Trash2, CalendarDays, ClipboardList,
  Building2, Users, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  label: string;
  timeframe: string;
  done: boolean;
}

interface Task {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  assignee: "self" | "partner" | "planner";
  status: "not_started" | "in_progress" | "done";
}

interface VendorBooking {
  id: string;
  category: string;
  vendorName: string;
  status: "searching" | "contacted" | "quoted" | "booked";
  contractSigned: boolean;
  depositPaid: boolean;
}

interface Payment {
  id: string;
  date: string;
  label: string;
  amount: string;
  paid: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMEFRAMES = ["12+ months", "6-12 months", "3-6 months", "1-3 months", "Week of"];

const TIMEFRAME_LABELS: Record<string, string> = {
  "12+ months": "12+ Months Out",
  "6-12 months": "6–12 Months Out",
  "3-6 months": "3–6 Months Out",
  "1-3 months": "1–3 Months Out",
  "Week of": "Week of Wedding",
};

const INIT_MILESTONES: Milestone[] = [
  { id: "m1", label: "Book your venue", timeframe: "12+ months", done: false },
  { id: "m2", label: "Set your total budget", timeframe: "12+ months", done: true },
  { id: "m3", label: "Choose your wedding date", timeframe: "12+ months", done: true },
  { id: "m4", label: "Start your guest list", timeframe: "12+ months", done: false },
  { id: "m5", label: "Get engagement photos taken", timeframe: "12+ months", done: false },
  { id: "m6", label: "Book photographer & videographer", timeframe: "6-12 months", done: false },
  { id: "m7", label: "Book caterer", timeframe: "6-12 months", done: false },
  { id: "m8", label: "Send save-the-dates", timeframe: "6-12 months", done: true },
  { id: "m9", label: "Shop for wedding attire", timeframe: "6-12 months", done: false },
  { id: "m10", label: "Book hair & makeup team", timeframe: "6-12 months", done: false },
  { id: "m11", label: "Book entertainment (band or DJ)", timeframe: "3-6 months", done: false },
  { id: "m12", label: "Book florist & decor", timeframe: "3-6 months", done: false },
  { id: "m13", label: "Finalize guest list & send invitations", timeframe: "3-6 months", done: false },
  { id: "m14", label: "Schedule cake tastings", timeframe: "3-6 months", done: false },
  { id: "m15", label: "Final dress fitting", timeframe: "1-3 months", done: false },
  { id: "m16", label: "Confirm all vendor details", timeframe: "1-3 months", done: false },
  { id: "m17", label: "Create ceremony day-of timeline", timeframe: "1-3 months", done: false },
  { id: "m18", label: "Submit final headcount to caterer", timeframe: "Week of", done: false },
  { id: "m19", label: "Pick up wedding rings", timeframe: "Week of", done: false },
  { id: "m20", label: "Deliver vendor final payments", timeframe: "Week of", done: false },
];

const VENDOR_CATEGORIES_LIST = [
  "Venue", "Catering", "Photography", "Videography",
  "Florals & Decor", "Attire", "Hair & Makeup", "Entertainment",
];

const TASK_CATEGORIES = [
  "General", "Venue", "Catering", "Photography", "Videography",
  "Florals & Decor", "Attire", "Entertainment", "Guests", "Logistics",
];

const BOOKING_STATUS_LABELS: Record<VendorBooking["status"], string> = {
  searching: "Searching",
  contacted: "Contacted",
  quoted: "Quoted",
  booked: "Booked",
};

const BOOKING_STATUS_COLORS: Record<VendorBooking["status"], string> = {
  searching: "bg-muted text-muted-foreground",
  contacted: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  booked: "bg-green-100 text-green-700",
};

const INIT_VENDORS: VendorBooking[] = VENDOR_CATEGORIES_LIST.map((cat, i) => ({
  id: `v${i}`,
  category: cat,
  vendorName: cat === "Photography" ? "Jane Smith Photography" : cat === "Catering" ? "Grand Table Events" : "",
  status: cat === "Photography" ? "booked" : cat === "Catering" ? "quoted" : "searching",
  contractSigned: cat === "Photography",
  depositPaid: cat === "Photography",
}));

const INIT_PAYMENTS: Payment[] = [
  { id: "p1", date: "Mar 15", label: "DJ Final Balance", amount: "$3,000", paid: false },
  { id: "p2", date: "Apr 02", label: "Catering 50% Milestone", amount: "$6,250", paid: false },
  { id: "p3", date: "May 20", label: "Florist Retainer", amount: "$1,500", paid: false },
  { id: "p4", date: "Jun 01", label: "Venue Final Payment", amount: "$12,000", paid: false },
];

// ─── Helper to compute days until wedding ─────────────────────────────────────

const WEDDING_DATE = new Date("2027-06-14");
const daysUntil = Math.ceil((WEDDING_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Planning() {
  const [milestones, setMilestones] = useState<Milestone[]>(INIT_MILESTONES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<VendorBooking[]>(INIT_VENDORS);
  const [payments, setPayments] = useState<Payment[]>(INIT_PAYMENTS);

  // New task form
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Task["assignee"]>("self");

  // New payment form
  const [newPayDate, setNewPayDate] = useState("");
  const [newPayLabel, setNewPayLabel] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  };

  const addTask = () => {
    if (!newTaskName.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newTaskName.trim(),
        category: newTaskCategory,
        dueDate: newTaskDue,
        assignee: newTaskAssignee,
        status: "not_started",
      },
    ]);
    setNewTaskName("");
    setNewTaskDue("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const updateVendor = (id: string, updates: Partial<VendorBooking>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const togglePayment = (id: string) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p)));
  };

  const addPayment = () => {
    if (!newPayLabel.trim() || !newPayDate.trim() || !newPayAmount.trim()) return;
    setPayments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        date: newPayDate.trim(),
        label: newPayLabel.trim(),
        amount: newPayAmount.startsWith("$") ? newPayAmount.trim() : `$${newPayAmount.trim()}`,
        paid: false,
      },
    ]);
    setNewPayDate("");
    setNewPayLabel("");
    setNewPayAmount("");
    setShowAddPayment(false);
  };

  const completedMilestones = milestones.filter((m) => m.done).length;

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">

        {/* ── Header ── */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
            <div>
              <div className="flex items-center gap-2 mb-4 opacity-70">
                <ClipboardList className="w-5 h-5" />
                <span className="text-sm uppercase tracking-wider font-semibold">Wedding Planning Timeline</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Alex & Jordan</h1>
              <p className="text-lg opacity-70 mt-2">June 14, 2027</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold font-serif">{daysUntil}</p>
                <p className="text-xs opacity-60 uppercase tracking-wider mt-1">Days Away</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold font-serif">{completedMilestones}</p>
                <p className="text-xs opacity-60 uppercase tracking-wider mt-1">Done</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold font-serif">{milestones.length - completedMilestones}</p>
                <p className="text-xs opacity-60 uppercase tracking-wider mt-1">Remaining</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* ── Left/Main Column ── */}
          <div className="xl:col-span-2 space-y-10">

            {/* ── Section 1: Milestones ── */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-accent" /> Milestone Checklist
                </h2>
                <Badge variant="secondary">
                  {completedMilestones}/{milestones.length} complete
                </Badge>
              </div>

              {TIMEFRAMES.map((tf) => {
                const items = milestones.filter((m) => m.timeframe === tf);
                if (items.length === 0) return null;
                const doneCount = items.filter((m) => m.done).length;
                return (
                  <div key={tf} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {TIMEFRAME_LABELS[tf]}
                      </h3>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{doneCount}/{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                            milestone.done
                              ? "bg-green-50/50 border-green-200/60 opacity-70"
                              : "bg-card border-border hover:border-primary/30"
                          )}
                          onClick={() => toggleMilestone(milestone.id)}
                        >
                          <Checkbox
                            checked={milestone.done}
                            onCheckedChange={() => toggleMilestone(milestone.id)}
                            className="shrink-0"
                          />
                          <span className={cn(
                            "text-sm font-medium",
                            milestone.done && "line-through text-muted-foreground"
                          )}>
                            {milestone.label}
                          </span>
                          {milestone.done && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ── Section 2: Tasks ── */}
            <section className="space-y-5">
              <h2 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-accent" /> Tasks
              </h2>

              {/* Add task form */}
              <Card className="border-dashed border-2 border-border bg-muted/20">
                <CardContent className="pt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-xs text-muted-foreground">Task Name</Label>
                      <Input
                        placeholder="e.g. Research florists in the area"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") addTask(); }}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Category</Label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <Input
                        placeholder="e.g. March 1"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Assignee</Label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value as Task["assignee"])}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="self">Me</option>
                        <option value="partner">Partner</option>
                        <option value="planner">Planner</option>
                      </select>
                    </div>
                  </div>
                  <Button size="sm" className="w-full rounded-full gap-2" onClick={addTask}>
                    <Plus className="w-4 h-4" /> Add Task
                  </Button>
                </CardContent>
              </Card>

              {/* Task list */}
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm italic">
                  No tasks yet. Add your first task above.
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border bg-card transition-all",
                        task.status === "done" ? "opacity-60 border-border/50" : "border-border hover:border-primary/20"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          task.status === "done" && "line-through text-muted-foreground"
                        )}>
                          {task.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{task.category}</Badge>
                          {task.dueDate && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.dueDate}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {task.assignee === "self" ? "Me" : task.assignee === "partner" ? "Partner" : "Planner"}
                          </span>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task["status"])}
                        className="h-7 rounded-md border border-input bg-background px-2 text-xs shrink-0"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-10">

            {/* ── Section 3: Vendor Booking Status ── */}
            <section className="space-y-5">
              <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" /> Vendor Status
              </h2>
              <div className="space-y-3">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{vendor.category}</span>
                      <select
                        value={vendor.status}
                        onChange={(e) => updateVendor(vendor.id, { status: e.target.value as VendorBooking["status"] })}
                        className={cn(
                          "h-6 rounded-full border-0 px-2 text-[11px] font-bold",
                          BOOKING_STATUS_COLORS[vendor.status]
                        )}
                      >
                        {Object.entries(BOOKING_STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      className="h-8 text-sm"
                      placeholder="Vendor name"
                      value={vendor.vendorName}
                      onChange={(e) => updateVendor(vendor.id, { vendorName: e.target.value })}
                    />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={vendor.contractSigned}
                          onCheckedChange={(v) => updateVendor(vendor.id, { contractSigned: !!v })}
                        />
                        Contract signed
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Checkbox
                          checked={vendor.depositPaid}
                          onCheckedChange={(v) => updateVendor(vendor.id, { depositPaid: !!v })}
                        />
                        Deposit paid
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section 4: Payment Timeline ── */}
            <section className="space-y-5">
              <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Payment Timeline
              </h2>

              <div className="space-y-3 relative">
                <div className="absolute left-2.5 top-4 bottom-4 w-0.5 bg-primary/10" />
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-start gap-4 relative z-10 p-4 rounded-xl border transition-all",
                      p.paid ? "bg-green-50/50 border-green-200/60 opacity-70" : "bg-card border-border"
                    )}
                  >
                    <button
                      onClick={() => togglePayment(p.id)}
                      className="mt-0.5 shrink-0"
                    >
                      {p.paid
                        ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                        : <Circle className="w-5 h-5 text-muted-foreground/40" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", p.paid && "line-through text-muted-foreground")}>
                        {p.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">{p.amount}</span>
                  </div>
                ))}
              </div>

              {showAddPayment ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Date (e.g. Jul 1)" value={newPayDate} onChange={(e) => setNewPayDate(e.target.value)} className="h-8 text-sm" />
                      <Input placeholder="Amount (e.g. 2500)" value={newPayAmount} onChange={(e) => setNewPayAmount(e.target.value)} className="h-8 text-sm" />
                    </div>
                    <Input placeholder="Description" value={newPayLabel} onChange={(e) => setNewPayLabel(e.target.value)} className="h-8 text-sm" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 rounded-full" onClick={addPayment}>Add</Button>
                      <Button size="sm" variant="ghost" className="flex-1 rounded-full" onClick={() => setShowAddPayment(false)}>Cancel</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-xs text-accent hover:bg-accent/10 rounded-full"
                  onClick={() => setShowAddPayment(true)}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Payment
                </Button>
              )}
            </section>
          </div>
        </div>
      </div>
    </Shell>
  );
}
