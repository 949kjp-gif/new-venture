import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertCircle, ChevronDown, ChevronUp, CheckCircle2, Circle, X,
  Sparkles, Lock, Unlock, Users, HardDrive, Download, XCircle, Heart
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRADEOFFS = [
  {
    id: "guest-trim",
    title: "Guest List Trim",
    saving: "Save $2.4k",
    description: "Removing 12 guests rebalances your catering overrun instantly.",
  },
  {
    id: "floral-shift",
    title: "Floral Shift",
    saving: "Save $1.8k",
    description: "Swap imported peonies for seasonal roses to save on centerpiece costs.",
  },
];

const CATEGORIES_INIT = [
  {
    name: "Venue & Catering",
    target: 30000,
    actual: 32500,
    status: "over",
    percentage: 108,
    items: [
      { name: "Venue Rental", cost: 12000, paid: true },
      { name: "Catering Deposit", cost: 8000, paid: true },
      { name: "Estimated F&B Balance", cost: 12500, paid: false },
    ],
  },
  {
    name: "Photography & Video",
    target: 8000,
    actual: 5500,
    status: "under",
    percentage: 68,
    items: [
      { name: "Photographer Retainer", cost: 2500, paid: true },
      { name: "Videographer Deposit", cost: 3000, paid: true },
    ],
  },
  {
    name: "Florals & Decor",
    target: 5000,
    actual: 0,
    status: "pending",
    percentage: 0,
    items: [],
  },
  {
    name: "Attire & Beauty",
    target: 4000,
    actual: 4200,
    status: "over",
    percentage: 105,
    items: [
      { name: "Wedding Dress", cost: 3200, paid: true },
      { name: "Alterations", cost: 600, paid: false },
      { name: "Suit Rental", cost: 400, paid: true },
    ],
  },
  {
    name: "Entertainment",
    target: 6000,
    actual: 6000,
    status: "on_target",
    percentage: 100,
    items: [
      { name: "Band Deposit", cost: 3000, paid: true },
      { name: "DJ Balance", cost: 3000, paid: false },
    ],
  },
];

const COLLABORATOR_ROLES = ["Co-Planner", "View Only", "Wedding Planner"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  // Existing state
  const [showAlert, setShowAlert] = useState(true);
  const [expandedCats, setExpandedCats] = useState<string[]>(["Venue & Catering"]);
  const [overallBudget, setOverallBudget] = useState([65000]);

  // Budget lock
  const [budgetLocked, setBudgetLocked] = useState(true);

  // Per-category lock + editable targets
  const [catTargets, setCatTargets] = useState<Record<string, number>>(
    Object.fromEntries(CATEGORIES_INIT.map((c) => [c.name, c.target]))
  );
  const [catLocked, setCatLocked] = useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES_INIT.map((c) => [c.name, true]))
  );
  const [catEditVal, setCatEditVal] = useState<Record<string, string>>(
    Object.fromEntries(CATEGORIES_INIT.map((c) => [c.name, String(c.target)]))
  );

  // Tradeoffs
  const [showTradeoffs, setShowTradeoffs] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  // Modals
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Collaborator form state
  const [collabEmail, setCollabEmail] = useState("");
  const [collabRole, setCollabRole] = useState("Co-Planner");
  const [collaborators, setCollaborators] = useState([
    { email: "partner@email.com", role: "Co-Planner" },
  ]);

  // Backup state
  const [driveConnecting, setDriveConnecting] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);

  const toggleCat = (name: string) => {
    setExpandedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const unlockCat = (name: string) => {
    setCatLocked((prev) => ({ ...prev, [name]: false }));
    setCatEditVal((prev) => ({ ...prev, [name]: String(catTargets[name]) }));
  };

  const lockCat = (name: string) => {
    const parsed = parseInt(catEditVal[name].replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCatTargets((prev) => ({ ...prev, [name]: parsed }));
    }
    setCatLocked((prev) => ({ ...prev, [name]: true }));
  };

  const dismissSuggestion = (id: string) => {
    setDismissedSuggestions((prev) => [...prev, id]);
  };

  const visibleTradeoffs = TRADEOFFS.filter((t) => !dismissedSuggestions.includes(t.id));

  const addCollaborator = () => {
    if (!collabEmail.trim()) return;
    setCollaborators((prev) => [...prev, { email: collabEmail.trim(), role: collabRole }]);
    setCollabEmail("");
    setCollabRole("Co-Planner");
  };

  const removeCollaborator = (email: string) => {
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
  };

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">

        {/* ── Hero Header ── */}
        <section className="relative overflow-hidden rounded-3xl bg-muted/30 p-8 md:p-12 text-foreground border border-border shadow-sm">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3">Budget Dashboard</p>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-primary/80">
                    You're on track,<br />Alex & Jordan.
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 rounded-full bg-primary/5 hover:bg-primary/10 text-primary mt-1"
                    onClick={() => setCollabModalOpen(true)}
                    title="Invite Collaborators"
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Budget Slider Panel */}
            <div className="lg:w-80 bg-background/50 backdrop-blur-md rounded-2xl p-6 border border-border shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-end mb-4">
                <p className="text-sm font-semibold opacity-60">Flexible Budget</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-serif font-bold text-primary/80">${overallBudget[0].toLocaleString()}</p>
                  <button
                    onClick={() => setBudgetLocked((v) => !v)}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                    title={budgetLocked ? "Click to unlock and adjust" : "Lock budget"}
                  >
                    {budgetLocked
                      ? <Lock className="w-4 h-4 opacity-40" />
                      : <Unlock className="w-4 h-4 text-amber-500/70" />
                    }
                  </button>
                </div>
              </div>
              <div className={budgetLocked ? "opacity-40 pointer-events-none" : ""}>
                <Slider
                  value={overallBudget}
                  onValueChange={(v) => { setOverallBudget(v); }}
                  max={150000}
                  min={30000}
                  step={1000}
                  className="mb-6"
                  disabled={budgetLocked}
                />
              </div>
              {!budgetLocked && (
                <div className="mt-2 mb-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                  <p className="text-[11px] text-amber-600/80 font-medium">Unlocked — changes will reallocate categories</p>
                </div>
              )}
              {budgetLocked && (
                <p className="text-[10px] opacity-40 text-center uppercase tracking-tighter">Click the lock icon to adjust your overall budget</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Smart Insight Alert ── */}
        {showAlert && (
          <div className="bg-accent/10 px-6 py-4 rounded-2xl border border-accent/30 flex items-center justify-between group animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4 text-primary">
              <AlertCircle className="w-6 h-6 text-accent shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">Smart Insight</span>
                <span className="text-sm opacity-80">Your catering is trending 8% over. Consider reallocating from your $5k Decor buffer.</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowAlert(false)} className="rounded-full hover:bg-accent/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Budget Categories ── */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-serif font-bold text-primary/60">Budget Categories</h2>
                <Badge variant="outline" className="bg-muted/30 text-muted-foreground/60 border-border/50 text-[10px] uppercase tracking-widest px-2 py-0">
                  5 Categories
                </Badge>
              </div>

              <div className="space-y-4">
                {CATEGORIES_INIT.map((cat) => {
                  const target = catTargets[cat.name];
                  const locked = catLocked[cat.name];
                  const editVal = catEditVal[cat.name];

                  return (
                    <div key={cat.name} className="bg-card/50 rounded-2xl border border-border/40 overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-border/60">
                      <div
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => toggleCat(cat.name)}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between mb-3 items-end">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg font-serif text-primary/70">{cat.name}</span>
                              {expandedCats.includes(cat.name)
                                ? <ChevronUp className="w-3.5 h-3.5 opacity-30" />
                                : <ChevronDown className="w-3.5 h-3.5 opacity-30" />
                              }
                            </div>
                            {/* Category target with lock */}
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-xs text-muted-foreground/60 font-medium">
                                ${cat.actual.toLocaleString()} <span className="opacity-30">/</span>
                              </span>
                              {locked ? (
                                <span className="text-xs text-muted-foreground/60 font-medium">${target.toLocaleString()}</span>
                              ) : (
                                <Input
                                  className="h-6 w-24 text-xs text-right font-medium px-2 bg-background/50 border-border/40"
                                  value={editVal}
                                  onChange={(e) => setCatEditVal((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                                  onBlur={() => lockCat(cat.name)}
                                  onKeyDown={(e) => { if (e.key === "Enter") lockCat(cat.name); }}
                                  autoFocus
                                />
                              )}
                              <button
                                onClick={() => locked ? unlockCat(cat.name) : lockCat(cat.name)}
                                className="p-1 rounded hover:bg-muted/50 transition-colors opacity-40 hover:opacity-100"
                                title={locked ? "Edit target" : "Lock target"}
                              >
                                {locked
                                  ? <Lock className="w-3 h-3 text-muted-foreground/60" />
                                  : <Unlock className="w-3 h-3 text-amber-500/60" />
                                }
                              </button>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(cat.percentage, 100)}
                            className={`h-1 rounded-full bg-muted/20 ${
                              cat.status === "over" ? "[&>div]:bg-amber-500/40" :
                              cat.status === "on_target" ? "[&>div]:bg-green-600/30" :
                              "[&>div]:bg-primary/30"
                            }`}
                          />
                        </div>
                        <div className="sm:ml-8 sm:w-28 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center opacity-70">
                          {cat.status === "over" && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-amber-600/70">+${(cat.actual - target).toLocaleString()}</span>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/40 tracking-tighter block">Adjust</span>
                            </div>
                          )}
                          {cat.status === "under" && (
                            <div className="text-right">
                              <span className="text-xs font-bold text-green-600/60">-${(target - cat.actual).toLocaleString()}</span>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/40 tracking-tighter block">Left</span>
                            </div>
                          )}
                          {cat.status === "on_target" && <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">On Plan</span>}
                          {cat.status === "pending" && <span className="text-[9px] text-muted-foreground/30 italic uppercase tracking-widest">Pending</span>}
                        </div>
                      </div>

                      {expandedCats.includes(cat.name) && (
                        <div className="bg-muted/10 border-t border-border/20 p-6 space-y-4 animate-in slide-in-from-top-1 duration-200">
                          {cat.items.length > 0 ? (
                            <div className="space-y-2">
                              {cat.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-background/30 py-2.5 px-4 rounded-xl border border-border/10 text-xs group hover:border-border/30 transition-colors">
                                  <div className="font-medium text-primary/60">{item.name}</div>
                                  <div className="flex items-center gap-4">
                                    <div className="font-bold text-primary/50">${item.cost.toLocaleString()}</div>
                                    <div className="w-16 flex justify-end">
                                      {item.paid ? (
                                        <Badge variant="outline" className="bg-transparent text-green-700/50 border-green-200/30 text-[9px] py-0 h-4 shadow-none">
                                          Paid
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-muted-foreground/40 border-muted-foreground/20 text-[9px] py-0 h-4 shadow-none">
                                          Due
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground/40 text-xs italic">
                              No entries yet.
                            </div>
                          )}
                          <div className="flex justify-center pt-1">
                            <Button variant="ghost" size="sm" className="text-[10px] text-primary/40 font-bold hover:bg-primary/5 rounded-full h-8 uppercase tracking-widest">
                              + Add Entry
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Snapshot Section - Moved down and muted colors */}
            <div className="pt-10 border-t border-border/50">
              <h2 className="text-2xl font-serif font-bold text-primary opacity-30 mb-6 px-2 tracking-tight">Budget Snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-3 p-8 rounded-3xl bg-muted/5 border border-border/20">
                  <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">Total Invested</p>
                  <p className="text-3xl font-bold font-serif opacity-30">${(22400).toLocaleString()}</p>
                  <div className="h-1 w-full bg-muted-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/10" style={{ width: '34%' }} />
                  </div>
                </div>
                <div className="space-y-3 p-8 rounded-3xl bg-muted/5 border border-border/20">
                  <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">Remaining</p>
                  <p className="text-3xl font-bold font-serif opacity-30">${(overallBudget[0] - 22400).toLocaleString()}</p>
                  <div className="h-1 w-full bg-muted-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/10" style={{ width: '66%' }} />
                  </div>
                </div>
                <div className="space-y-3 p-8 rounded-3xl bg-muted/5 border border-border/20">
                  <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">Contingency</p>
                  <p className="text-3xl font-bold font-serif opacity-30">$6,500</p>
                  <div className="h-1 w-full bg-muted-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/10" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-8">
            {/* Trade-Offs Card */}
            <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <Sparkles className="w-8 h-8 text-primary/5" />
              </div>
              <CardHeader className="pb-4 pt-8">
                <CardTitle className="flex items-center justify-between text-primary/80 font-serif text-2xl">
                  <span>Trade-Offs</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/50">
                      {showTradeoffs ? "On" : "Off"}
                    </span>
                    <Switch
                      checked={showTradeoffs}
                      onCheckedChange={setShowTradeoffs}
                      aria-label="Toggle suggestions"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-10">
                {!showTradeoffs ? (
                  <div className="py-8 text-center text-muted-foreground/60 text-sm">
                    <p className="text-xl mb-3 opacity-40">⏸</p>
                    <p className="font-medium">Suggestions paused</p>
                  </div>
                ) : visibleTradeoffs.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground/60 text-sm">
                    <p className="text-xl mb-3 opacity-40">✅</p>
                    <p className="font-medium">Review complete</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">Optimization ideas for your current over-runs:</p>
                    <div className="space-y-3">
                      {visibleTradeoffs.map((t) => (
                        <div key={t.id} className="p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-2 group transition-all">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-sm text-primary/70">{t.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-primary/10 text-primary/60">{t.saving}</Badge>
                              <button
                                onClick={() => dismissSuggestion(t.id)}
                                className="text-muted-foreground/40 hover:text-foreground transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground/60 leading-snug">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Timeline */}
            <div className="bg-muted/20 p-8 rounded-3xl border border-border/50 space-y-4">
              <h3 className="font-serif font-bold text-xl text-primary/60">Timeline</h3>
              <div className="space-y-6 pt-4 relative">
                <div className="absolute left-1.5 top-6 bottom-6 w-0.5 bg-border" />
                {[
                  { date: "Mar 15", label: "DJ Final Balance", amount: "$3,000", done: false },
                  { date: "Apr 02", label: "Catering 50% Milestone", amount: "$6,250", done: false },
                  { date: "May 20", label: "Florist Retainer", amount: "$1,500", done: false },
                ].map((p, i) => (
                  <div key={i} className="flex gap-4 relative z-10">
                    <div className="w-3 h-3 rounded-full bg-border mt-1.5" />
                    <div className="opacity-60">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{p.date}</p>
                      <p className="text-sm font-bold text-primary/80">{p.label}</p>
                      <p className="text-xs text-primary/60 font-medium">{p.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborator Modal */}
      <Dialog open={collabModalOpen} onOpenChange={setCollabModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Collaborators</DialogTitle>
            <DialogDescription>
              Invite your partner or wedding planner to manage the budget together.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground">Email</Label>
                <Input
                  id="email"
                  placeholder="partner@email.com"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="w-32 space-y-2">
                <Label htmlFor="role" className="text-xs uppercase font-bold text-muted-foreground">Role</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 py-2 rounded-xl border border-input bg-background text-sm"
                  value={collabRole}
                  onChange={(e) => setCollabRole(e.target.value)}
                >
                  {COLLABORATOR_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <Button onClick={addCollaborator} className="self-end h-10 rounded-xl px-4">
                Invite
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-muted-foreground">Active Members</p>
              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div key={c.email} className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div>
                      <p className="text-sm font-semibold">{c.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">{c.role}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCollaborator(c.email)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
