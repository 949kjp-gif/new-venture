import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, Circle, Plus, Trash2, CalendarDays, ClipboardList,
  Building2, Users, Clock, ArrowRight, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  label: string;
  timeframe: string;
  done: boolean;
  targetDate?: string;
}

interface Task {
  id: string;
  name: string;
  category: string;
  dueDate: string;
  assignee: "self" | "partner" | "planner";
  status: "not_started" | "in_progress" | "done";
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

const TASK_CATEGORIES = [
  "General", "Venue", "Catering", "Photography", "Videography",
  "Florals & Decor", "Attire", "Entertainment", "Guests", "Logistics",
];

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
  const { user, isDemoMode } = useAuth();
  const useApi = !!user && !isDemoMode;
  const seededRef = useRef(false);

  // ── Milestones ───────────────────────────────────────────────────────────
  const { data: apiMilestones = [] } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
    enabled: useApi,
  });
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>(INIT_MILESTONES);
  const milestones: Milestone[] = useApi ? apiMilestones : localMilestones;

  const createMilestoneMutation = useMutation({
    mutationFn: (data: object | object[]) =>
      apiRequest("POST", "/api/milestones", data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }),
  });
  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) =>
      apiRequest("PATCH", `/api/milestones/${id}`, data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }),
  });
  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/milestones/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/milestones"] }),
  });

  // Seed milestones on first load if empty
  useEffect(() => {
    if (useApi && !seededRef.current && apiMilestones.length === 0) {
      seededRef.current = true;
      const seedData = INIT_MILESTONES.map((m, i) => ({
        label: m.label,
        timeframe: m.timeframe,
        done: m.done,
        sortOrder: i,
      }));
      createMilestoneMutation.mutate(seedData);
    }
  }, [useApi, apiMilestones.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Planning Tasks ───────────────────────────────────────────────────────
  const { data: apiTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/planning-tasks"],
    enabled: useApi,
  });
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const tasks: Task[] = useApi ? apiTasks : localTasks;

  const createTaskMutation = useMutation({
    mutationFn: (data: object) =>
      apiRequest("POST", "/api/planning-tasks", data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/planning-tasks"] }),
  });
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) =>
      apiRequest("PUT", `/api/planning-tasks/${id}`, data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/planning-tasks"] }),
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/planning-tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/planning-tasks"] }),
  });

  // ── Payments ─────────────────────────────────────────────────────────────
  const { data: apiPayments = [] } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: useApi,
  });
  const [localPayments, setLocalPayments] = useState<Payment[]>(INIT_PAYMENTS);
  const payments: Payment[] = useApi ? apiPayments : localPayments;

  const createPaymentMutation = useMutation({
    mutationFn: (data: object | object[]) =>
      apiRequest("POST", "/api/payments", data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payments"] }),
  });
  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: unknown }) =>
      apiRequest("PUT", `/api/payments/${id}`, data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/payments"] }),
  });

  const seededPaymentsRef = useRef(false);
  useEffect(() => {
    if (useApi && !seededPaymentsRef.current && apiPayments.length === 0) {
      seededPaymentsRef.current = true;
      const seedData = INIT_PAYMENTS.map((p, i) => ({
        date: p.date,
        label: p.label,
        amount: p.amount,
        paid: p.paid,
        sortOrder: i,
      }));
      createPaymentMutation.mutate(seedData as unknown as object);
    }
  }, [useApi, apiPayments.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // New task form
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("General");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Task["assignee"]>("self");

  // Collapsible phases
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());

  // Auto-collapse phase when all milestones in it are done
  useEffect(() => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      TIMEFRAMES.forEach((tf) => {
        const items = milestones.filter((m) => m.timeframe === tf);
        if (items.length > 0 && items.every((m) => m.done) && !prev.has(tf)) {
          next.add(tf);
        }
      });
      if (next.size === prev.size) return prev;
      return next;
    });
  }, [milestones]);

  const togglePhaseCollapse = (tf: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(tf)) next.delete(tf);
      else next.add(tf);
      return next;
    });
  };

  // Inline milestone date editing
  const [editingMilestoneDate, setEditingMilestoneDate] = useState<string | null>(null);

  const updateMilestoneDate = async (id: string, date: string) => {
    if (useApi) {
      await updateMilestoneMutation.mutateAsync({ id, targetDate: date });
    } else {
      setLocalMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, targetDate: date } : m)));
    }
    setEditingMilestoneDate(null);
  };

  // Per-phase quick-add
  const [addingToPhase, setAddingToPhase] = useState<string | null>(null);
  const [quickAddText, setQuickAddText] = useState("");

  const addMilestoneToPhase = async (tf: string) => {
    if (!quickAddText.trim()) return;
    const newMs = { label: quickAddText.trim(), timeframe: tf, done: false, sortOrder: milestones.length };
    if (useApi) {
      await createMilestoneMutation.mutateAsync(newMs);
    } else {
      setLocalMilestones((prev) => [...prev, { ...newMs, id: Date.now().toString() }]);
    }
    setQuickAddText("");
    setAddingToPhase(null);
  };

  // New payment form
  const [newPayDate, setNewPayDate] = useState("");
  const [newPayLabel, setNewPayLabel] = useState("");
  const [newPayAmount, setNewPayAmount] = useState("");
  const [showAddPayment, setShowAddPayment] = useState(false);

  const toggleMilestone = async (id: string) => {
    const ms = milestones.find((m) => m.id === id);
    if (!ms) return;
    if (useApi) {
      await updateMilestoneMutation.mutateAsync({ id, done: !ms.done });
    } else {
      setLocalMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
    }
  };

  const deleteMilestone = async (id: string) => {
    if (useApi) {
      await deleteMilestoneMutation.mutateAsync(id);
    } else {
      setLocalMilestones((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim()) return;
    const newTask = {
      name: newTaskName.trim(),
      category: newTaskCategory,
      dueDate: newTaskDue,
      assignee: newTaskAssignee,
      status: "not_started" as Task["status"],
    };
    if (useApi) {
      await createTaskMutation.mutateAsync(newTask);
    } else {
      setLocalTasks((prev) => [...prev, { ...newTask, id: Date.now().toString() }]);
    }
    setNewTaskName("");
    setNewTaskDue("");
  };

  const deleteTask = async (id: string) => {
    if (useApi) {
      await deleteTaskMutation.mutateAsync(id);
    } else {
      setLocalTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const updateTaskStatus = async (id: string, status: Task["status"]) => {
    if (useApi) {
      await updateTaskMutation.mutateAsync({ id, status });
    } else {
      setLocalTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    }
  };

  const togglePayment = async (id: string) => {
    const p = payments.find((p) => p.id === id);
    if (!p) return;
    if (useApi) {
      await updatePaymentMutation.mutateAsync({ id, paid: !p.paid });
    } else {
      setLocalPayments((prev) => prev.map((p) => (p.id === id ? { ...p, paid: !p.paid } : p)));
    }
  };

  const addPayment = async () => {
    if (!newPayLabel.trim() || !newPayDate.trim() || !newPayAmount.trim()) return;
    const newP = {
      date: newPayDate.trim(),
      label: newPayLabel.trim(),
      amount: newPayAmount.startsWith("$") ? newPayAmount.trim() : `$${newPayAmount.trim()}`,
      paid: false,
      sortOrder: payments.length,
    };
    if (useApi) {
      await createPaymentMutation.mutateAsync(newP);
    } else {
      setLocalPayments((prev) => [...prev, { ...newP, id: Date.now().toString() }]);
    }
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
                const isCollapsed = collapsedPhases.has(tf);
                return (
                  <div key={tf} className="space-y-3">
                    {/* Phase header with collapse toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePhaseCollapse(tf)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        title={isCollapsed ? "Expand phase" : "Collapse phase"}
                      >
                        {isCollapsed
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronUp className="w-4 h-4" />
                        }
                        <h3 className="text-sm font-bold uppercase tracking-wider">
                          {TIMEFRAME_LABELS[tf]}
                        </h3>
                      </button>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">{doneCount}/{items.length}</span>
                    </div>

                    {!isCollapsed && (
                      <>
                        <div className="space-y-2">
                          {items.map((milestone) => (
                            <div
                              key={milestone.id}
                              className={cn(
                                "group flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
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
                                "text-sm font-medium flex-1",
                                milestone.done && "line-through text-muted-foreground"
                              )}>
                                {milestone.label}
                              </span>

                              {/* Inline date chip */}
                              {editingMilestoneDate === milestone.id ? (
                                <input
                                  type="date"
                                  className="text-xs border border-input rounded px-1.5 py-0.5 bg-background shrink-0"
                                  defaultValue={milestone.targetDate || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onBlur={(e) => updateMilestoneDate(milestone.id, e.target.value)}
                                  onKeyDown={(e) => {
                                    e.stopPropagation();
                                    if (e.key === "Enter") updateMilestoneDate(milestone.id, (e.target as HTMLInputElement).value);
                                    if (e.key === "Escape") setEditingMilestoneDate(null);
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingMilestoneDate(milestone.id); }}
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full border transition-colors shrink-0",
                                    milestone.targetDate
                                      ? "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10"
                                      : "border-dashed border-border text-muted-foreground/50 hover:border-primary/30 hover:text-muted-foreground"
                                  )}
                                >
                                  {milestone.targetDate
                                    ? new Date(milestone.targetDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "+ date"
                                  }
                                </button>
                              )}

                              {milestone.done && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteMilestone(milestone.id); }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded shrink-0"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Per-phase quick-add */}
                        {addingToPhase === tf ? (
                          <div className="flex items-center gap-2 pl-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              className="flex-1 h-8 text-sm border border-input rounded-md px-3 bg-background"
                              placeholder="New milestone..."
                              value={quickAddText}
                              onChange={(e) => setQuickAddText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") addMilestoneToPhase(tf);
                                if (e.key === "Escape") { setAddingToPhase(null); setQuickAddText(""); }
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => addMilestoneToPhase(tf)}
                              className="h-8 px-3 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => { setAddingToPhase(null); setQuickAddText(""); }}
                              className="h-8 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAddingToPhase(tf)}
                            className="text-xs text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 pl-1"
                          >
                            <Plus className="w-3 h-3" /> Add item
                          </button>
                        )}
                      </>
                    )}
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

            {/* ── Section 3: Vendor Management Link ── */}
            <section className="space-y-5">
              <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" /> Vendors
              </h2>
              <Link href="/vendors">
                <a className="block bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Vendor Management</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track status, contracts, payments, and get negotiation tips for every vendor.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-4" />
                  </div>
                </a>
              </Link>
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
