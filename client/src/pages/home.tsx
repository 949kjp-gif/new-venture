import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/images/hero-bg.png";
import { Sparkles, Calculator, FileSearch, TrendingDown } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="absolute inset-0 z-0">
        <img src={heroBg} className="w-full h-full object-cover opacity-20" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
      </div>
      
      <header className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
          <Sparkles className="w-6 h-6 text-accent" />
          WedAgent
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
           <a href="#features" className="hover:text-foreground">Features</a>
           <a href="#how-it-works" className="hover:text-foreground">How it Works</a>
        </nav>
        <Link href="/builder">
           <Button className="rounded-full px-6 bg-primary text-primary-foreground">Get Started</Button>
        </Link>
      </header>

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
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
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

      <section id="features" className="relative z-10 bg-card py-24 border-t border-border">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Financial Intelligence for Weddings</h2>
               <p className="text-muted-foreground max-w-2xl mx-auto">Wedding pricing is opaque and filled with hidden costs. WedAgent gives you the financial clarity you need to make confident decisions.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                     <Calculator className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Smart Budget Builder</h3>
                  <p className="text-muted-foreground">Generate realistic, location-adjusted budgets based on your guest count and style preferences, not arbitrary numbers.</p>
               </div>
               
               <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                     <FileSearch className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">True Cost Normalizer</h3>
                  <p className="text-muted-foreground">Upload confusing vendor PDFs. Our AI extracts line items, applies hidden taxes, and reveals the true all-in cost so you can compare fairly.</p>
               </div>

               <div className="bg-background p-8 rounded-2xl border border-border shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                     <TrendingDown className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Trade-Off Engine</h3>
                  <p className="text-muted-foreground">Overshooting in one category? Our engine automatically suggests smart reallocations and flags risks before they snowball.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
