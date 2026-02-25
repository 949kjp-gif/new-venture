import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/images/hero-bg.png";
import { Sparkles, Calculator, FileSearch, TrendingDown, ArrowRight, Check, CheckCircle2, Heart, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [, setLocation] = useLocation();
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finalize guest list", completed: false },
    { id: 2, text: "Book catering tasting", completed: true },
    { id: 3, text: "Review floral proposal", completed: false },
    { id: 4, text: "Send save-the-dates", completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-background">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} className="w-full h-full object-cover opacity-20" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
          <Sparkles className="w-6 h-6 text-accent" />
          WedAgent
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <Link href="/builder">
          <Button className="rounded-full px-6 bg-primary text-primary-foreground">Get Started</Button>
        </Link>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-8 border border-accent/30">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Now available for DIY Couples
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-primary mb-6 leading-tight">
          Your AI Wedding CFO.
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Confidently plan your DIY wedding. Build realistic budgets, uncover hidden vendor fees, and stay on track without paying $10K for a planner.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto mb-12">
          <Link href="/builder">
            <Button size="lg" className="rounded-full px-8 h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg w-full sm:w-auto">
              Start Free Budget
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-border hover:bg-muted w-full sm:w-auto">
              View Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* ── User Interaction Section (Friendlier Features) ── */}
        <div className="w-full max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 text-left">
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-primary">
                <Target className="w-5 h-5 text-accent" />
                <span className="font-bold uppercase tracking-wider text-xs">Focus of the week</span>
              </div>
              <p className="text-xl font-medium text-primary/80 leading-relaxed">Secure your floral designer and finalize the reception layout.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">How are you feeling today?</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {["😌 Calm", "🤩 Excited", "🤯 Overwhelmed", "🧐 Focused"].map((mood) => (
                  <button key={mood} className="px-5 py-2.5 rounded-full bg-card border border-border hover:border-accent transition-all text-sm font-medium shadow-sm hover:shadow-md active:scale-95">
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Card className="rounded-3xl border-border shadow-xl overflow-hidden bg-card transition-all hover:shadow-2xl h-full">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="flex items-center gap-2 text-lg font-serif">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-background border border-border/50 group hover:border-accent/30 transition-all cursor-pointer" 
                  onClick={() => toggleTask(task.id)}
                >
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="rounded-full w-5 h-5 border-muted-foreground/30" />
                  <span className={`text-sm font-medium transition-all ${task.completed ? "line-through text-muted-foreground/60" : "text-primary"}`}>
                    {task.text}
                  </span>
                </div>
              ))}
              <Button variant="ghost" className="w-full rounded-2xl border-dashed border-2 border-border h-11 text-muted-foreground hover:text-primary hover:border-primary/30 mt-1">
                + Add a task
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative z-10 bg-background py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Three steps to complete wedding budget clarity — no spreadsheets, no guesswork.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold font-serif shadow-xl ring-8 ring-primary/10">1</div>
              <h3 className="text-xl font-bold text-primary">Build Your Budget</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Answer a few questions about your location, guest count, and vision. We generate a realistic budget instantly.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold font-serif shadow-xl ring-8 ring-primary/10">2</div>
              <h3 className="text-xl font-bold text-primary">Quote Analysis</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Upload confusing vendor proposals. We expose hidden fees and mandatory gratuities so you compare fairly.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold font-serif shadow-xl ring-8 ring-primary/10">3</div>
              <h3 className="text-xl font-bold text-primary">Track & Adjust</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Your live dashboard flags overruns. Smart trade-off suggestions keep your budget balanced.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 bg-card py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Financial Intelligence</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Wedding pricing is opaque and filled with hidden costs. WedAgent gives you the financial clarity you need.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <Calculator className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-3 text-primary">Smart Budget Builder</h3>
              <p className="text-muted-foreground">Generate realistic, location-adjusted budgets based on market data, not arbitrary numbers.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <FileSearch className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-3 text-primary">Quote Analysis</h3>
              <p className="text-muted-foreground">Our AI extracts line items and reveals the true all-in cost so you can compare vendors fairly.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
              <TrendingDown className="w-10 h-10 text-accent mb-6" />
              <h3 className="text-xl font-bold mb-3 text-primary">Trade-Off Engine</h3>
              <p className="text-muted-foreground">Suggests smart reallocations and flags risks before they snowball into five-figure surprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Budget Overview Section (Muted/Simplified) ── */}
      <section className="relative z-10 bg-background py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold text-primary opacity-30">Budget Snapshot</h2>
              <p className="text-sm text-muted-foreground opacity-60">High-level overview of your wedding investments.</p>
            </div>
            <Link href="/dashboard">
              <Button variant="link" className="text-accent/50 font-bold hover:text-accent">View Full Analytics →</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Invested", amount: "$22,400", progress: 34 },
              { label: "Pending", amount: "$14,200", progress: 22 },
              { label: "Remaining", amount: "$28,400", progress: 44 },
            ].map((stat) => (
              <div key={stat.label} className="p-8 rounded-3xl bg-muted/5 border border-border/20 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">{stat.label}</span>
                  <span className="text-2xl font-bold text-primary/30 font-serif">{stat.amount}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted-foreground/5 overflow-hidden">
                  <div className="h-full bg-muted-foreground/10" style={{ width: `${stat.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 bg-card py-24 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free for 30 days — no credit card required.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-background border border-border rounded-2xl p-8 flex flex-col">
              <div className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Free Trial</div>
              <div className="text-4xl font-bold text-primary mb-2">30 days</div>
              <p className="text-sm text-muted-foreground mb-8 italic">No credit card required</p>
              <ul className="space-y-3 mb-8 text-sm text-muted-foreground flex-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Budget Builder</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Live Dashboard</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Quote Analysis</li>
              </ul>
              <Button variant="outline" className="w-full rounded-full">Try Demo</Button>
            </div>
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl border border-primary">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Pro</div>
              <div className="mb-4 text-sm font-bold opacity-60 uppercase tracking-widest">Subscription</div>
              <div className="text-4xl font-bold mb-2">$29<span className="text-lg opacity-60">/mo</span></div>
              <p className="text-sm opacity-60 mb-8 italic">After your free trial</p>
              <ul className="space-y-3 mb-8 text-sm flex-1">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Unlimited analysis</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Trade-off engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent" /> Priority support</li>
              </ul>
              <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90">Get Started</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}