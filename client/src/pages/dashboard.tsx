import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, DollarSign, Wallet, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Circle, X, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function Dashboard() {
  const [showAlert, setShowAlert] = useState(true);
  const [expandedCats, setExpandedCats] = useState<string[]>(["Venue & Catering"]);
  const [overallBudget, setOverallBudget] = useState([65000]);

  const toggleCat = (name: string) => {
    setExpandedCats(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const categories = [
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
      ]
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
      ]
    },
    { 
      name: "Florals & Decor", 
      target: 5000, 
      actual: 0, 
      status: "pending", 
      percentage: 0,
      items: []
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
      ]
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
      ]
    },
  ];

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
        {/* Visual Header Section */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-primary-foreground shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-12">
            <div className="flex-1 space-y-6">
              <div>
                <Badge variant="outline" className="text-accent-foreground border-accent/30 bg-accent/10 mb-4 px-3 py-1">
                  Wedding Confidence Score: 92%
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight">
                  You're on track,<br />Alex & Jordan.
                </h1>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-1">
                  <p className="text-sm opacity-70 uppercase tracking-wider font-semibold">Total Invested</p>
                  <p className="text-3xl font-bold font-serif">${(22400).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm opacity-70 uppercase tracking-wider font-semibold">Remaining</p>
                  <p className="text-3xl font-bold font-serif">${(overallBudget[0] - 22400).toLocaleString()}</p>
                </div>
                <div className="hidden md:block space-y-1">
                  <p className="text-sm opacity-70 uppercase tracking-wider font-semibold">Contingency</p>
                  <p className="text-3xl font-bold font-serif">$6,500</p>
                </div>
              </div>
            </div>

            <div className="lg:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg flex flex-col justify-center">
              <div className="flex justify-between items-end mb-4">
                <p className="text-sm font-semibold opacity-80">Flexible Budget</p>
                <p className="text-2xl font-serif font-bold">${overallBudget[0].toLocaleString()}</p>
              </div>
              <Slider 
                value={overallBudget} 
                onValueChange={setOverallBudget} 
                max={150000} 
                min={30000} 
                step={1000} 
                className="mb-6"
              />
              <p className="text-[10px] opacity-60 text-center uppercase tracking-tighter">Adjusting your overall budget re-allocates categories automatically</p>
            </div>
          </div>
        </section>

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
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-2xl font-serif font-bold text-primary">Budget Categories</h2>
               <Badge variant="secondary" className="bg-muted text-muted-foreground">
                 5 Categories Total
               </Badge>
            </div>
            
            <div className="space-y-4">
               {categories.map(cat => (
                 <div key={cat.name} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-all hover:shadow-md">
                   <div 
                     className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                     onClick={() => toggleCat(cat.name)}
                   >
                     <div className="flex-1">
                       <div className="flex justify-between mb-3 items-end">
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-xl font-serif">{cat.name}</span>
                            {expandedCats.includes(cat.name) ? <ChevronUp className="w-4 h-4 opacity-50"/> : <ChevronDown className="w-4 h-4 opacity-50"/>}
                         </div>
                         <span className="text-sm text-muted-foreground font-semibold">
                           ${cat.actual.toLocaleString()} <span className="opacity-40">/</span> ${cat.target.toLocaleString()}
                         </span>
                       </div>
                       <Progress 
                          value={Math.min(cat.percentage, 100)} 
                          className={`h-2 rounded-full ${
                            cat.status === 'over' ? '[&>div]:bg-amber-500' : 
                            cat.status === 'on_target' ? '[&>div]:bg-green-600/80' :
                            '[&>div]:bg-primary/80'
                          }`} 
                       />
                     </div>
                     <div className="sm:ml-8 sm:w-32 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                       {cat.status === 'over' && (
                         <div className="text-right">
                           <span className="text-sm font-bold text-amber-600 flex items-center justify-end gap-1">
                             +${(cat.actual - cat.target).toLocaleString()}
                           </span>
                           <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Adjust needed</span>
                         </div>
                       )}
                       {cat.status === 'under' && (
                         <div className="text-right">
                           <span className="text-sm font-bold text-green-600">
                             -${(cat.target - cat.actual).toLocaleString()}
                           </span>
                           <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Remaining</span>
                         </div>
                       )}
                       {cat.status === 'on_target' && <span className="text-xs font-bold text-muted-foreground uppercase">On Plan</span>}
                       {cat.status === 'pending' && <span className="text-xs text-muted-foreground italic">No Spending</span>}
                     </div>
                   </div>
                   
                   {expandedCats.includes(cat.name) && (
                     <div className="bg-muted/30 border-t border-border p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        {cat.items.length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 px-4">
                               <div className="col-span-7">Line Item</div>
                               <div className="col-span-3 text-right">Amount</div>
                               <div className="col-span-2 text-right">Status</div>
                            </div>
                            {cat.items.map((item, idx) => (
                              <div key={idx} className="grid grid-cols-12 items-center bg-card py-3 px-4 rounded-xl border border-border/50 text-sm shadow-sm group hover:border-accent/40 transition-colors">
                                <div className="col-span-7 font-medium text-primary">{item.name}</div>
                                <div className="col-span-3 text-right font-bold text-primary">${item.cost.toLocaleString()}</div>
                                <div className="col-span-2 flex justify-end">
                                   {item.paid ? (
                                     <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 shadow-none gap-1">
                                       <CheckCircle2 className="w-3 h-3" /> Paid
                                     </Badge>
                                   ) : (
                                     <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 shadow-none gap-1">
                                       <Circle className="w-3 h-3" /> Due
                                     </Badge>
                                   )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground text-sm italic">
                            No quotes or contracts uploaded yet for this category.
                          </div>
                        )}
                        <div className="flex justify-center pt-2">
                           <Button variant="ghost" size="sm" className="text-xs text-accent font-bold hover:bg-accent/10 rounded-full">
                             + Add Manual Line Item
                           </Button>
                        </div>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>

          <div className="space-y-8">
            <Card className="border-accent/30 bg-white shadow-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <Sparkles className="w-8 h-8 text-accent/20" />
              </div>
              <CardHeader className="pb-4 pt-8">
                <CardTitle className="flex items-center gap-2 text-primary font-serif text-2xl">
                  Trade-Offs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-10">
                <p className="text-sm text-muted-foreground leading-relaxed">We noticed some over-runs. Here's how to balance your budget without losing quality:</p>
                <div className="space-y-4">
                  <div className="p-5 bg-muted/40 rounded-2xl border border-border/60 space-y-3 group hover:border-primary/40 transition-all cursor-pointer">
                     <div className="flex justify-between items-start">
                        <div className="font-bold text-primary group-hover:text-accent transition-colors">Guest List Trim</div>
                        <Badge className="bg-primary text-white text-[10px]">Save $2.4k</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground leading-snug">Removing 12 guests rebalances your catering overrun instantly.</p>
                  </div>
                  <div className="p-5 bg-muted/40 rounded-2xl border border-border/60 space-y-3 group hover:border-primary/40 transition-all cursor-pointer">
                     <div className="flex justify-between items-start">
                        <div className="font-bold text-primary group-hover:text-accent transition-colors">Floral Shift</div>
                        <Badge className="bg-primary text-white text-[10px]">Save $1.8k</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground leading-snug">Swap imported peonies for seasonal roses to save on centerpiece costs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 space-y-4">
               <h3 className="font-serif font-bold text-xl">Payment Timeline</h3>
               <div className="space-y-6 pt-4 relative">
                  <div className="absolute left-1.5 top-6 bottom-6 w-0.5 bg-primary/20" />
                  {[
                    { date: "Mar 15", label: "DJ Final Balance", amount: "$3,000", done: false },
                    { date: "Apr 02", label: "Catering 50% Milestone", amount: "$6,250", done: false },
                    { date: "May 20", label: "Florist Retainer", amount: "$1,500", done: false },
                  ].map((p, i) => (
                    <div key={i} className="flex gap-4 relative z-10">
                       <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/10 mt-1.5" />
                       <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{p.date}</p>
                          <p className="text-sm font-bold">{p.label}</p>
                          <p className="text-xs text-primary font-medium">{p.amount}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
