import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, DollarSign, Wallet, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2 font-serif">Financial Overview</h1>
            <p className="text-muted-foreground text-lg">Your realistic budget based on 125 guests in New York, NY.</p>
          </div>
          <div className="bg-amber-50 px-4 py-2.5 rounded-lg border border-amber-200 flex items-center gap-3 text-sm font-medium shadow-sm">
             <AlertCircle className="w-5 h-5 text-amber-600" />
             <div className="text-amber-900 flex flex-col">
               <span>Risk Score: Moderate</span>
               <span className="text-xs font-normal opacity-80">Catering is trending over budget</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-primary text-primary-foreground border-transparent shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80 flex justify-between items-center">
                Target Budget
                <Wallet className="w-4 h-4 opacity-50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">$65,000</div>
              <div className="text-xs text-primary-foreground/60 mt-2">Set on Jan 14, 2026</div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Committed Spend
                <DollarSign className="w-4 h-4 text-muted-foreground/50" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">$22,400</div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                34% of total budget
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1 bg-amber-400 h-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Pending Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-amber-600">$14,200</div>
              <div className="text-xs text-muted-foreground mt-2">
                Awaiting 3 vendor contracts
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1 bg-green-500 h-full" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Remaining Buffer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-green-600">$28,400</div>
              <div className="text-xs text-muted-foreground mt-2">
                Includes $6,500 contingency
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif font-bold text-primary">Category Breakdown</h2>
               <Link href="/quote-normalizer">
                 <a className="text-sm text-accent hover:text-accent-foreground font-medium flex items-center gap-1 transition-colors">
                   Analyze New Quote <ArrowRight className="w-4 h-4" />
                 </a>
               </Link>
            </div>
            
            <div className="space-y-4">
               {[
                 { name: "Venue & Catering", target: 30000, actual: 32500, status: "over", percentage: 108 },
                 { name: "Photography & Video", target: 8000, actual: 5500, status: "under", percentage: 68 },
                 { name: "Florals & Decor", target: 5000, actual: 0, status: "pending", percentage: 0 },
                 { name: "Attire & Beauty", target: 4000, actual: 4200, status: "over", percentage: 105 },
                 { name: "Entertainment", target: 6000, actual: 6000, status: "on_target", percentage: 100 },
               ].map(cat => (
                 <div key={cat.name} className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-accent/50 transition-colors">
                   <div className="flex-1">
                     <div className="flex justify-between mb-2 items-end">
                       <span className="font-semibold text-lg">{cat.name}</span>
                       <span className="text-sm text-muted-foreground font-medium">
                         ${cat.actual.toLocaleString()} / ${cat.target.toLocaleString()}
                       </span>
                     </div>
                     <Progress 
                        value={Math.min(cat.percentage, 100)} 
                        className={`h-2.5 ${
                          cat.status === 'over' ? '[&>div]:bg-destructive' : 
                          cat.status === 'on_target' ? '[&>div]:bg-green-500' :
                          '[&>div]:bg-primary'
                        }`} 
                     />
                   </div>
                   <div className="sm:ml-6 sm:w-28 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                     {cat.status === 'over' && (
                       <div className="flex flex-col sm:items-end">
                         <span className="text-sm font-bold text-destructive flex items-center gap-1">
                           <TrendingUp className="w-4 h-4"/> +${(cat.actual - cat.target).toLocaleString()}
                         </span>
                         <span className="text-xs text-muted-foreground">over budget</span>
                       </div>
                     )}
                     {cat.status === 'under' && (
                       <div className="flex flex-col sm:items-end">
                         <span className="text-sm font-bold text-green-600">
                           -${(cat.target - cat.actual).toLocaleString()}
                         </span>
                         <span className="text-xs text-muted-foreground">remaining</span>
                       </div>
                     )}
                     {cat.status === 'on_target' && (
                       <div className="flex flex-col sm:items-end">
                         <span className="text-sm font-bold text-muted-foreground">On target</span>
                       </div>
                     )}
                     {cat.status === 'pending' && <span className="text-sm text-muted-foreground italic">No quotes</span>}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-accent/40 bg-accent/5 shadow-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-accent to-primary" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-primary font-serif text-xl">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Trade-Off Engine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-sm text-primary/80 font-medium">Your Catering quote is $2,500 over target. Here are smart ways to reallocate and stay on budget:</p>
                <div className="space-y-3">
                  <div className="p-4 bg-card rounded-lg border border-border/80 shadow-sm flex gap-3 items-start cursor-pointer hover:border-primary transition-all hover:shadow-md group">
                     <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">1</div>
                     <div>
                       <div className="font-semibold text-primary group-hover:text-accent transition-colors">Reduce Guest Count</div>
                       <div className="text-sm text-muted-foreground mt-1 leading-snug">Cut 12 guests to save ~$2,400 in F&B, rentals, and invitations.</div>
                     </div>
                  </div>
                  <div className="p-4 bg-card rounded-lg border border-border/80 shadow-sm flex gap-3 items-start cursor-pointer hover:border-primary transition-all hover:shadow-md group">
                     <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono">2</div>
                     <div>
                       <div className="font-semibold text-primary group-hover:text-accent transition-colors">Adjust Floral Scope</div>
                       <div className="text-sm text-muted-foreground mt-1 leading-snug">Move $2,500 from Florals. We suggest dropping aisle markers and repurposing bridesmaid bouquets.</div>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Shell>
  );
}
