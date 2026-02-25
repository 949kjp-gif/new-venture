import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
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
  const { user, isDemoMode } = useAuth();
  const useApi = !!user && !isDemoMode;
  const seededRef = useRef(false);

  // ── Budget from API ─────────────────────────────────────────────────────
  const { data: budgetData } = useQuery<{ totalBudget: number }>({
    queryKey: ["/api/budget"],
    enabled: useApi,
  });

  const updateBudgetMutation = useMutation({
    mutationFn: (totalBudget: number) =>
      apiRequest("PUT", "/api/budget", { totalBudget }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/budget"] }),
  });

  // ── Budget categories from API ──────────────────────────────────────────
  type ApiCategory = { id: string; name: string; target: number; sortOrder: number };
  const { data: apiCategories = [] } = useQuery<ApiCategory[]>({
    queryKey: ["/api/budget/categories"],
    enabled: useApi,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, target }: { id: string; target: number }) =>
      apiRequest("PUT", `/api/budget/categories/${id}`, { target }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/budget/categories"] }),
  });

  // ── Budget items from API ───────────────────────────────────────────────
  type ApiItem = { id: string; categoryId: string; name: string; cost: number; paid: boolean };
  const { data: apiItems = [] } = useQuery<ApiItem[]>({
    queryKey: ["/api/budget/items"],
    enabled: useApi,
  });

  // Seed categories + items on first load
  useEffect(() => {
    if (!useApi || seededRef.current || apiCategories.length > 0) return;
    seededRef.current = true;
    const seedCategories = async () => {
      const res = await apiRequest("POST", "/api/budget/categories",
        CATEGORIES_INIT.map((c, i) => ({ name: c.name, target: c.target, sortOrder: i }))
      ).then((r) => r.json() as Promise<ApiCategory[]>);
      for (const cat of res) {
        const src = CATEGORIES_INIT.find((c) => c.name === cat.name);
        if (!src) continue;
        for (const item of src.items) {
          await apiRequest("POST", "/api/budget/items", {
            categoryId: cat.id,
            name: item.name,
            cost: item.cost,
            paid: item.paid,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/budget/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/budget/items"] });
    };
    seedCategories();
  }, [useApi, apiCategories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge API data into the CATEGORIES_INIT shape for rendering
  const categories = CATEGORIES_INIT.map((c) => {
    if (!useApi) return c;
    const apiCat = apiCategories.find((a) => a.name === c.name);
    const items = apiCat
      ? apiItems
          .filter((i) => i.categoryId === apiCat.id)
          .map((i) => ({ name: i.name, cost: i.cost, paid: i.paid }))
      : c.items;
    const actual = items.reduce((sum, i) => sum + i.cost, 0);
    const target = apiCat?.target ?? c.target;
    const percentage = target > 0 ? Math.round((actual / target) * 100) : 0;
    const status = actual === 0 ? "pending" : actual > target ? "over" : actual === target ? "on_target" : "under";
    return { ...c, target, actual, items, percentage, status };
  });

  const totalInvested = categories.reduce((sum, c) => sum + c.actual, 0);

  // Existing state
  const [showAlert, setShowAlert] = useState(true);
  const [expandedCats, setExpandedCats] = useState<string[]>(["Venue & Catering"]);
  const [overallBudget, setOverallBudget] = useState([65000]);

  // Sync budget from API on load
  useEffect(() => {
    if (budgetData?.totalBudget) {
      setOverallBudget([budgetData.totalBudget]);
    }
  }, [budgetData?.totalBudget]);

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

  // Sync category targets from API
  useEffect(() => {
    if (apiCategories.length > 0) {
      setCatTargets(Object.fromEntries(apiCategories.map((c) => [c.name, c.target])));
      setCatEditVal(Object.fromEntries(apiCategories.map((c) => [c.name, String(c.target)])));
    }
  }, [apiCategories]);

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
      if (useApi) {
        const apiCat = apiCategories.find((c) => c.name === name);
        if (apiCat) updateCategoryMutation.mutate({ id: apiCat.id, target: parsed });
      }
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
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground border-none shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-3">Budget Dashboard</p>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight text-white">
                    You're on track,<br />Alex & Jordan.
                  </h1>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white border-none mt-1"
                    onClick={() => setCollabModalOpen(true)}
                    title="Invite Collaborators"
                  >
                    <Users className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Budget Slider Panel */}
            <div className="lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-center">
              <div className="flex justify-between items-end mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Flexible Budget</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-serif font-bold text-white">${overallBudget[0].toLocaleString()}</p>
                  <button
                    onClick={() => setBudgetLocked((v) => !v)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    title={budgetLocked ? "Click to unlock and adjust" : "Lock budget"}
                  >
                    {budgetLocked
                      ? <Lock className="w-4 h-4 text-white/50" />
                      : <Unlock className="w-4 h-4 text-accent" />
                    }
                  </button>
                </div>
              </div>
              <div className={budgetLocked ? "opacity-50 pointer-events-none" : ""}>
                <Slider
                  value={overallBudget}
                  onValueChange={(v) => {
                    setOverallBudget(v);
                    if (useApi) updateBudgetMutation.mutate(v[0]);
                  }}
                  max={150000}
                  min={30000}
                  step={1000}
                  className="mb-6"
                  disabled={budgetLocked}
                />
              </div>
              {!budgetLocked && (
                <div className="mt-2 mb-2 bg-accent/20 border border-accent/30 rounded-lg px-3 py-2 text-center">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Unlocked & Adjustable</p>
                </div>
              )}
              {budgetLocked && (
                <p className="text-[9px] text-white/40 text-center uppercase tracking-[0.1em] font-bold">LOCKED</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Smart Insight Alert ── */}
        {showAlert && (
          <div className="bg-accent px-6 py-5 rounded-2xl border border-accent flex items-center justify-between group animate-in slide-in-from-top-4 shadow-md">
            <div className="flex items-center gap-4 text-accent-foreground">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">Smart Insight</span>
                <span className="text-sm font-medium">Your catering is trending 8% over. Consider reallocating from your $5k Decor buffer.</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowAlert(false)} className="rounded-full hover:bg-black/10 w-10 h-10 text-accent-foreground">
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Budget Categories ── */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">Budget Categories</h2>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px] uppercase tracking-widest px-3 py-1 font-bold">
                  5 Categories Total
                </Badge>
              </div>

              <div className="space-y-4">
                {categories.map((cat) => {
                  const target = catTargets[cat.name] ?? cat.target;
                  const locked = catLocked[cat.name];
                  const editVal = catEditVal[cat.name];

                  return (
                    <div key={cat.name} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                      <div
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                        onClick={() => toggleCat(cat.name)}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between mb-3 items-end">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xl font-serif text-primary">{cat.name}</span>
                              {expandedCats.includes(cat.name)
                                ? <ChevronUp className="w-4 h-4 text-primary/50" />
                                : <ChevronDown className="w-4 h-4 text-primary/50" />
                              }
                            </div>
                            {/* Category target with lock */}
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <span className="text-sm text-muted-foreground font-bold">
                                ${cat.actual.toLocaleString()} <span className="text-muted-foreground/30">/</span>
                              </span>
                              {locked ? (
                                <span className="text-sm text-primary font-bold">${target.toLocaleString()}</span>
                              ) : (
                                <Input
                                  className="h-8 w-28 text-sm text-right font-bold px-3 bg-muted border-primary/20"
                                  value={editVal}
                                  onChange={(e) => setCatEditVal((prev) => ({ ...prev, [cat.name]: e.target.value }))}
                                  onBlur={() => lockCat(cat.name)}
                                  onKeyDown={(e) => { if (e.key === "Enter") lockCat(cat.name); }}
                                  autoFocus
                                />
                              )}
                              <button
                                onClick={() => locked ? unlockCat(cat.name) : lockCat(cat.name)}
                                className="p-1.5 rounded-full hover:bg-muted transition-colors text-primary/40 hover:text-primary"
                                title={locked ? "Edit target" : "Lock target"}
                              >
                                {locked
                                  ? <Lock className="w-4 h-4" />
                                  : <Unlock className="w-4 h-4 text-amber-600" />
                                }
                              </button>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(cat.percentage, 100)}
                            className={`h-2 rounded-full bg-muted ${
                              cat.status === "over" ? "[&>div]:bg-amber-600" :
                              cat.status === "on_target" ? "[&>div]:bg-green-600" :
                              "[&>div]:bg-primary"
                            }`}
                          />
                        </div>
                        <div className="sm:ml-8 sm:w-32 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          {cat.status === "over" && (
                            <div className="text-right">
                              <span className="text-sm font-bold text-amber-600">+${(cat.actual - target).toLocaleString()}</span>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter block">Over Target</span>
                            </div>
                          )}
                          {cat.status === "under" && (
                            <div className="text-right">
                              <span className="text-sm font-bold text-green-600">-${(target - cat.actual).toLocaleString()}</span>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter block">Remaining</span>
                            </div>
                          )}
                          {cat.status === "on_target" && <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">On Plan</span>}
                          {cat.status === "pending" && <span className="text-xs text-muted-foreground italic uppercase tracking-widest">Awaiting Quotes</span>}
                        </div>
                      </div>

                      {expandedCats.includes(cat.name) && (
                        <div className="bg-muted/40 border-t border-border p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          {cat.items.length > 0 ? (
                            <div className="space-y-3">
                              {cat.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-card py-4 px-5 rounded-xl border border-border text-sm shadow-sm group hover:border-primary/30 transition-colors">
                                  <div className="font-bold text-primary">{item.name}</div>
                                  <div className="flex items-center gap-6">
                                    <div className="font-extrabold text-primary">${item.cost.toLocaleString()}</div>
                                    <div className="w-20 flex justify-end">
                                      {item.paid ? (
                                        <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] font-bold py-1 px-3 shadow-none">
                                          PAID
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/40 text-[10px] font-bold py-1 px-3 shadow-none">
                                          DUE
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-10 text-muted-foreground font-medium text-sm">
                              No entries in this category yet.
                            </div>
                          )}
                          <div className="flex justify-center pt-2">
                            <Button variant="default" size="sm" className="text-[10px] font-bold rounded-full h-9 uppercase tracking-[0.15em] px-6">
                              + Add New Line Item
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget Snapshot Section - Moved down and full tone */}
            <div className="pt-10 border-t border-border">
              <h2 className="text-2xl font-serif font-bold text-primary mb-6 px-2 tracking-tight">Budget Snapshot</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-4 p-8 rounded-3xl bg-white border border-border shadow-md">
                  <p className="text-[10px] opacity-60 uppercase tracking-widest font-extrabold text-primary">Total Invested</p>
                  <p className="text-4xl font-bold font-serif text-primary">${totalInvested.toLocaleString()}</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.round((totalInvested / overallBudget[0]) * 100))}%` }} />
                  </div>
                </div>
                <div className="space-y-4 p-8 rounded-3xl bg-white border border-border shadow-md">
                  <p className="text-[10px] opacity-60 uppercase tracking-widest font-extrabold text-primary">Remaining</p>
                  <p className="text-4xl font-bold font-serif text-primary">${Math.max(0, overallBudget[0] - totalInvested).toLocaleString()}</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${Math.min(100, 100 - Math.round((totalInvested / overallBudget[0]) * 100))}%` }} />
                  </div>
                </div>
                <div className="space-y-4 p-8 rounded-3xl bg-white border border-border shadow-md">
                  <p className="text-[10px] opacity-60 uppercase tracking-widest font-extrabold text-primary">Contingency</p>
                  <p className="text-4xl font-bold font-serif text-primary">$6,500</p>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40" style={{ width: '10%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="space-y-8">
            {/* Trade-Offs Card */}
            <Card className="border-border bg-card shadow-lg rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <CardHeader className="pb-4 pt-10">
                <CardTitle className="flex items-center justify-between text-primary font-serif text-2xl">
                  <span>Trade-Offs</span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {showTradeoffs ? "On" : "Off"}
                    </span>
                    <Switch
                      checked={showTradeoffs}
                      onCheckedChange={setShowTradeoffs}
                      aria-label="Toggle suggestions"
                      className="data-[state=checked]:bg-accent"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pb-12">
                {!showTradeoffs ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-3xl mb-4">⏸</p>
                    <p className="font-bold text-lg">Suggestions Paused</p>
                    <p className="text-xs mt-2">Toggle back on to see AI trade-offs</p>
                  </div>
                ) : visibleTradeoffs.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p className="text-3xl mb-4">✅</p>
                    <p className="font-bold text-lg">All Reviewed</p>
                    <p className="text-xs mt-2">You're current on all budget tips</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">Smart ways to rebalance your budget:</p>
                    <div className="space-y-4">
                      {visibleTradeoffs.map((t) => (
                        <div key={t.id} className="p-5 bg-secondary/50 rounded-2xl border border-border space-y-3 group hover:border-accent transition-all shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="font-bold text-base text-primary">{t.title}</div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold py-1 px-3 shadow-sm">{t.saving}</Badge>
                              <button
                                onClick={() => dismissSuggestion(t.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug font-medium">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Timeline */}
            <div className="bg-secondary p-8 rounded-3xl border border-border space-y-6 shadow-md">
              <h3 className="font-serif font-bold text-2xl text-primary tracking-tight">Payment Timeline</h3>
              <div className="space-y-8 pt-4 relative">
                <div className="absolute left-1.5 top-8 bottom-8 w-[2px] bg-primary/20" />
                {[
                  { date: "Mar 15", label: "DJ Final Balance", amount: "$3,000", done: false },
                  { date: "Apr 02", label: "Catering 50% Milestone", amount: "$6,250", done: false },
                  { date: "May 20", label: "Florist Retainer", amount: "$1,500", done: false },
                ].map((p, i) => (
                  <div key={i} className="flex gap-5 relative z-10">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary mt-1.5 ring-4 ring-primary/10 shadow-sm" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-[0.2em]">{p.date}</p>
                      <p className="text-base font-bold text-primary leading-tight">{p.label}</p>
                      <p className="text-sm text-primary font-extrabold opacity-70">{p.amount}</p>
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
