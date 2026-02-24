import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, AlertTriangle, ArrowRight, Info } from "lucide-react";

export default function QuoteNormalizer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(false);

  const handleUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResult(true);
    }, 2500);
  };

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-border pb-6">
          <h1 className="text-4xl font-bold text-primary mb-3 font-serif">True Cost Quote Normalizer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">Upload a confusing vendor PDF. We'll extract the true all-in cost, expose hidden fees, and let you compare apples to apples.</p>
        </div>

        {!result ? (
          <Card className="border-dashed border-2 border-border bg-card/50 overflow-hidden relative">
            {analyzing && <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" />}
            <CardContent className="flex flex-col items-center justify-center py-32 text-center relative z-20">
              {analyzing ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300 bg-card p-8 rounded-2xl shadow-xl border border-border">
                  <div className="w-16 h-16 border-4 border-accent border-t-primary rounded-full animate-spin mx-auto" />
                  <div>
                     <div className="text-2xl font-bold font-serif text-primary">Analyzing Caterer_Proposal_V2.pdf...</div>
                     <p className="text-muted-foreground mt-2">Extracting line items, calculating hidden taxes, checking overtime clauses...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-md mx-auto">
                  <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
                    <UploadCloud className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-primary">Drop Proposal Here</h3>
                  <p className="text-muted-foreground leading-relaxed">Drag and drop a PDF, screenshot, or paste a link. Our AI will normalize the pricing structure instantly.</p>
                  <Button size="lg" className="w-full h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90" onClick={handleUpload}>
                    Select File
                  </Button>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Supports PDF, JPG, PNG</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-start md:items-center gap-4 bg-green-50 text-green-900 p-5 rounded-xl border border-green-200 shadow-sm">
               <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 md:mt-0" />
               <div className="text-sm md:text-base">
                 <span className="font-semibold">Extraction complete!</span> We found <strong>3 hidden costs</strong> the vendor excluded from their "grand total" on page 4.
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
               {/* Original Quote */}
               <Card className="bg-card border-border shadow-sm opacity-80 h-full">
                 <CardHeader className="bg-muted/40 border-b border-border pb-4">
                   <CardTitle className="text-base flex flex-col gap-2">
                     <span className="text-muted-foreground font-normal uppercase tracking-wider text-xs">What you saw</span>
                     <div className="flex justify-between items-center">
                        <span className="font-serif text-xl text-primary">Vendor's "Grand Total"</span>
                        <span className="font-serif text-3xl font-bold">$28,000</span>
                     </div>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-5">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Food & Beverage Minimum</span>
                     <span className="font-semibold">$25,000</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Standard Staffing (6 hours)</span>
                     <span className="font-semibold">$3,000</span>
                   </div>
                   <div className="pt-6 border-t border-border mt-6">
                      <div className="flex gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border/50">
                        <Info className="w-4 h-4 shrink-0" />
                        <p className="italic leading-relaxed">"Note: Tax, 22% admin fee, and mandatory rentals are not included in this estimate and will be applied to the final invoice."</p>
                      </div>
                   </div>
                 </CardContent>
               </Card>

               {/* True Cost */}
               <Card className="border-accent/50 shadow-xl relative overflow-hidden h-full transform lg:scale-105 z-10 bg-card">
                 <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg shadow-sm">
                   TRUE ALL-IN COST
                 </div>
                 <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
                 
                 <CardHeader className="bg-accent/5 border-b border-border pt-8 pb-4">
                   <CardTitle className="text-base flex flex-col gap-2">
                     <span className="text-primary font-normal uppercase tracking-wider text-xs">What you'll actually pay</span>
                     <div className="flex justify-between items-center">
                        <span className="font-serif text-xl text-primary font-bold">WedAgent Adjusted Total</span>
                        <span className="font-serif text-4xl font-bold text-primary">$37,300</span>
                     </div>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="pt-6 space-y-5">
                   <div className="flex justify-between text-sm items-center">
                     <span className="text-muted-foreground font-medium">Base Quote</span>
                     <span className="font-semibold">$28,000</span>
                   </div>
                   <div className="flex justify-between text-sm text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-100 items-center">
                     <span className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600"/> 
                        Hidden 22% Admin Fee
                     </span>
                     <span className="font-bold">+$6,160</span>
                   </div>
                   <div className="flex justify-between text-sm text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-100 items-center">
                     <span className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600"/> 
                        Local Sales Tax (8.875%)
                     </span>
                     <span className="font-bold">+$3,031</span>
                   </div>
                   <div className="flex justify-between text-sm text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-100 items-center">
                     <span className="flex items-center gap-2 font-medium">
                        <AlertTriangle className="w-4 h-4 text-amber-600"/> 
                        Required Kitchen Tent Rental
                        <span className="text-xs bg-amber-200 px-1.5 py-0.5 rounded ml-1 text-amber-800">Estimated</span>
                     </span>
                     <span className="font-bold">+$~1,500</span>
                   </div>
                 </CardContent>
               </Card>
             </div>

             <div className="flex justify-end gap-4 pt-4 border-t border-border mt-8">
               <Button variant="outline" size="lg" className="rounded-full" onClick={() => setResult(false)}>Upload Another Quote</Button>
               <Button size="lg" className="rounded-full px-8 shadow-md">Add to Dashboard</Button>
             </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
