import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/images/hero-bg.png";
import { Sparkles, Calculator, FileSearch, TrendingDown, Check } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

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
              <div className="text-4xl font-bold mb-2">$XX<span className="text-lg opacity-60">/mo</span></div>
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
