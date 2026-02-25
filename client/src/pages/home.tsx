import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/images/hero-bg.png";
import { Sparkles, Calculator, FileSearch, TrendingDown, CheckCircle2, Circle, Heart, Target } from "lucide-react";
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
      <div className="absolute inset-0 z-0 h-[600px]">
        <img src={heroBg} className="w-full h-full object-cover opacity-10" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
      </div>
      
      <header className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
          <Sparkles className="w-6 h-6 text-accent" />
          WedAgent
        </div>
        <Link href="/dashboard">
           <Button variant="ghost" className="rounded-full px-6">Dashboard</Button>
        </Link>
      </header>

      <main className="relative z-10 flex-1 p-6 max-w-7xl mx-auto w-full pb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Welcome & Mood */}
          <div className="lg:col-span-7 space-y-8 py-8">
            <div className="space-y-4">
              <Badge variant="outline" className="bg-accent/5 text-accent-foreground border-accent/20 px-3 py-1 text-sm">
                Good morning, Alex & Jordan
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-primary leading-tight font-serif">
                Your wedding planning,<br />simplified.
              </h1>
            </div>

            <div className="space-y-6 pt-4">
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5 text-accent" />
                  <span className="font-bold uppercase tracking-wider text-xs">Focus of the week</span>
                </div>
                <p className="text-xl font-medium text-primary/80">Secure your floral designer and finalize the reception layout.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">How are you feeling today?</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {["😌 Calm", "🤩 Excited", "🤯 Overwhelmed", "🧐 Focused"].map((mood) => (
                    <button key={mood} className="px-6 py-2.5 rounded-full bg-card border border-border hover:border-accent transition-all text-sm font-medium shadow-sm hover:shadow-md active:scale-95">
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tasks */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-border shadow-xl overflow-hidden bg-card transition-all hover:shadow-2xl">
              <CardHeader className="bg-muted/30 border-b border-border py-6">
                <CardTitle className="flex items-center gap-2 text-xl font-serif">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 group hover:border-accent/30 transition-all cursor-pointer" 
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="rounded-full w-5 h-5" />
                    <span className={`text-sm font-medium transition-all ${task.completed ? "line-through text-muted-foreground" : "text-primary"}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
                <Button variant="ghost" className="w-full rounded-2xl border-dashed border-2 border-border h-12 text-muted-foreground hover:text-primary hover:border-primary/30 mt-2">
                  + Add a task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Tools */}
        <section className="mt-20 grid md:grid-cols-3 gap-8">
            <Link href="/builder">
               <div className="group p-8 rounded-3xl bg-card border border-border hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md">
                  <Calculator className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Budget Builder</h3>
                  <p className="text-sm text-muted-foreground">Adjust your allocations and model new scenarios.</p>
               </div>
            </Link>
            <Link href="/quote-normalizer">
               <div className="group p-8 rounded-3xl bg-card border border-border hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md">
                  <FileSearch className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-bold mb-2">Quote Analyzer</h3>
                  <p className="text-sm text-muted-foreground">Uncover hidden fees in your vendor proposals.</p>
               </div>
            </Link>
            <div className="group p-8 rounded-3xl bg-card border border-border hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md">
               <TrendingDown className="w-8 h-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-lg font-bold mb-2">Trade-Off Engine</h3>
               <p className="text-sm text-muted-foreground">See how small changes impact your bottom line.</p>
            </div>
        </section>

        {/* Budget Overview Section - Moved down and muted */}
        <section className="mt-24 pt-24 border-t border-border/50">
          <div className="flex justify-between items-end mb-10 px-2">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary/40 tracking-tight">Budget Snapshot</h2>
              <p className="text-sm text-muted-foreground/60 mt-1">A high-level view of your current wedding investments.</p>
            </div>
            <Link href="/dashboard">
              <Button variant="link" className="text-accent/60 font-bold hover:text-accent">View Full Analytics →</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Invested", amount: "$22,400", progress: 34, color: "bg-muted-foreground/10" },
              { label: "Pending", amount: "$14,200", progress: 22, color: "bg-muted-foreground/10" },
              { label: "Remaining", amount: "$28,400", progress: 44, color: "bg-muted-foreground/10" },
            ].map((stat) => (
              <div key={stat.label} className="p-8 rounded-3xl bg-muted/5 border border-border/30 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{stat.label}</span>
                  <span className="text-2xl font-bold text-primary/40 font-serif">{stat.amount}</span>
                </div>
                <div className={`h-1.5 w-full rounded-full ${stat.color} overflow-hidden`}>
                  <div className="h-full bg-muted-foreground/20" style={{ width: `${stat.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}