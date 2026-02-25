import { useState } from "react";
import { Link } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ClipboardList, Building2, Users, FileText,
  Calculator, NotebookPen, Home, Circle,
  Calendar, DollarSign, Sparkles, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Demo data ────────────────────────────────────────────────────────────────

const WEDDING_DATE = new Date("2027-06-14");
const daysUntil = Math.ceil((WEDDING_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const BUDGET_CATEGORIES = [
  { name: "Venue & Catering", spent: 32500, target: 30000, status: "over" },
  { name: "Photography & Video", spent: 5500, target: 8000, status: "under" },
  { name: "Florals & Decor", spent: 0, target: 5000, status: "pending" },
  { name: "Attire & Beauty", spent: 4200, target: 4000, status: "over" },
  { name: "Entertainment", spent: 6000, target: 6000, status: "on_target" },
];

const UPCOMING_PAYMENTS = [
  { date: "Mar 15", label: "DJ Final Balance", amount: "$3,000", urgent: true },
  { date: "Apr 02", label: "Catering 50% Milestone", amount: "$6,250", urgent: false },
  { date: "May 20", label: "Florist Retainer", amount: "$1,500", urgent: false },
];

const UPCOMING_TASKS = [
  { label: "Book florist & decor", timeframe: "3–6 months", done: false },
  { label: "Book entertainment (band or DJ)", timeframe: "3–6 months", done: false },
  { label: "Finalize guest list & send invitations", timeframe: "3–6 months", done: false },
  { label: "Schedule cake tastings", timeframe: "3–6 months", done: false },
  { label: "Final dress fitting", timeframe: "1–3 months", done: false },
];

const FOCUS_OF_WEEK = {
  title: "Lock in your florist",
  description: "You're in the 3–6 month window — this is prime time to book florals before availability fills up. Get at least 2 quotes before signing.",
  action: "View Vendor Tips",
  href: "/vendors",
};

const QUICK_ACTIONS = [
  { href: "/dashboard", label: "Budget Dashboard", icon: DollarSign },
  { href: "/planning", label: "Milestone Checklist", icon: ClipboardList },
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/quote-normalizer", label: "Quote Analysis", icon: FileText },
  { href: "/guests", label: "Guest List", icon: Users },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/builder", label: "Budget Builder", icon: Calculator },
];

const MOODS = [
  { emoji: "😊", label: "Excited" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Meh" },
  { emoji: "😰", label: "Stressed" },
];

const MOOD_RESPONSES: Record<string, string> = {
  "😊": "Love that energy! Everything is coming together beautifully. 🎉",
  "😌": "That's the spirit — steady and confident. You've got this.",
  "😐": "Totally valid. Wedding planning has its slow days. What can we tackle today?",
  "😰": "Take a breath — you're not alone. Let's break it into small steps together.",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppHome() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [feelingInput, setFeelingInput] = useState("");
  const [feelingSubmitted, setFeelingSubmitted] = useState(false);

  const handleFeelingSubmit = () => {
    if (!feelingInput.trim() && !selectedMood) return;
    setFeelingSubmitted(true);
  };

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* ── Header ── */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3 opacity-70">
                <Home className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wider font-semibold">Home</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif">Alex & Jordan</h1>
              <div className="flex items-center gap-2 mt-3 opacity-80">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="text-lg">{daysUntil} days to go · June 14, 2027</span>
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold opacity-90">You're on track!</span>
              </div>
              <p className="text-xs opacity-70 leading-relaxed max-w-[200px]">
                3 of 20 milestones done. Next up: book florist & decor.
              </p>
            </div>
          </div>
        </section>

        {/* ── Focus of the Week ── */}
        <section className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Focus of the Week</p>
              <h2 className="text-xl font-serif font-bold text-primary">{FOCUS_OF_WEEK.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                {FOCUS_OF_WEEK.description}
              </p>
            </div>
            <Link href={FOCUS_OF_WEEK.href}>
              <a>
                <Button size="sm" className="rounded-full gap-1.5 shrink-0 whitespace-nowrap">
                  {FOCUS_OF_WEEK.action} <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </Link>
          </div>
        </section>

        {/* ── Budget Bar Graph ── */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-xl text-primary">Budget Overview</h2>
            <Link href="/dashboard">
              <a className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                Full view <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
          <div className="space-y-4">
            {BUDGET_CATEGORIES.map((cat) => {
              const pct = cat.target > 0 ? Math.min((cat.spent / cat.target) * 100, 100) : 0;
              const overPct = cat.target > 0 && cat.spent > cat.target
                ? Math.min(((cat.spent - cat.target) / cat.target) * 100, 20)
                : 0;
              const barColor =
                cat.status === "over"      ? "bg-amber-400" :
                cat.status === "on_target" ? "bg-green-500" :
                cat.status === "pending"   ? "bg-muted-foreground/20" :
                                             "bg-primary/60";
              const labelColor =
                cat.status === "over"      ? "text-amber-600" :
                cat.status === "on_target" ? "text-green-600" :
                cat.status === "pending"   ? "text-muted-foreground" :
                                             "text-primary";
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name}</span>
                    <span className={cn("text-xs font-semibold", labelColor)}>
                      {cat.status === "pending" ? "No spending yet" :
                       cat.status === "over"    ? `+$${(cat.spent - cat.target).toLocaleString()} over` :
                       cat.status === "on_target" ? "On plan" :
                       `-$${(cat.target - cat.spent).toLocaleString()} remaining`}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>${cat.spent.toLocaleString()} spent</span>
                    <span>${cat.target.toLocaleString()} budget</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Two-col: Upcoming Tasks + Payments ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Upcoming Tasks */}
          <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-primary">Upcoming Tasks</h2>
              <Link href="/planning">
                <a className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="space-y-2">
              {UPCOMING_TASKS.map((task, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                  <Circle className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.label}</p>
                    <p className="text-xs text-muted-foreground">{task.timeframe}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Payments */}
          <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-xl text-primary">Upcoming Payments</h2>
              <Link href="/dashboard">
                <a className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </a>
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {UPCOMING_PAYMENTS.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{p.label}</p>
                      {p.urgent && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-1.5 py-0.5 font-medium">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.date}</p>
                  </div>
                  <span className="font-bold text-primary text-sm">{p.amount}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Quick Access ── */}
        <section className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-primary">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <a className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium leading-tight">{action.label}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── How are you feeling today? ── */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-serif font-bold text-lg text-primary">How are you feeling today?</h2>
          </div>

          {feelingSubmitted ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-2xl">{selectedMood || "💬"}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedMood
                  ? MOOD_RESPONSES[selectedMood]
                  : "Thanks for sharing — we're here whenever you need us. 💛"}
              </p>
              <button
                onClick={() => { setFeelingSubmitted(false); setSelectedMood(null); setFeelingInput(""); }}
                className="text-xs text-accent hover:text-accent/80 transition-colors mt-2"
              >
                Share again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mood emoji buttons */}
              <div className="flex gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.emoji}
                    onClick={() => setSelectedMood((prev) => prev === mood.emoji ? null : mood.emoji)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-all flex-1",
                      selectedMood === mood.emoji
                        ? "bg-primary/10 border-primary/40 scale-105"
                        : "border-border hover:bg-muted/50 hover:border-primary/20"
                    )}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Free-text input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or tell us more — anything on your mind…"
                  value={feelingInput}
                  onChange={(e) => setFeelingInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleFeelingSubmit(); }}
                  className="flex-1 text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleFeelingSubmit}
                  disabled={!feelingInput.trim() && !selectedMood}
                  className="rounded-full h-9 w-9 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">Your response stays private — this is just for you.</p>
            </div>
          )}
        </section>

      </div>
    </Shell>
  );
}
