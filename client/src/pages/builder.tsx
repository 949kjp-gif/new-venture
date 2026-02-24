import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import { Sparkles, MapPin, Users, Palette, Heart } from "lucide-react";

export default function Builder() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [guestCount, setGuestCount] = useState([125]);
  
  return (
    <Shell>
      <div className="max-w-3xl mx-auto p-4 md:p-8 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Smart Budget Builder
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight font-serif">Let's build a realistic foundation.</h1>
          <p className="text-lg text-muted-foreground">Most couples start with an arbitrary number. We start with real market data based on your vision.</p>
        </div>
        
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="bg-muted/30 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
               <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
               <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
               <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            </div>
            <CardTitle className="text-xl flex items-center gap-2">
               {step === 1 && <><MapPin className="w-5 h-5 text-accent"/> The Basics</>}
               {step === 2 && <><Users className="w-5 h-5 text-accent"/> Guest Count & Style</>}
               {step === 3 && <><Heart className="w-5 h-5 text-accent"/> Priorities</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-3">
                  <Label className="text-base">Where are you getting married?</Label>
                  <p className="text-sm text-muted-foreground mb-2">Location drives cost more than anything else.</p>
                  <Input className="h-12 text-lg" placeholder="e.g. New York, NY or Austin, TX" />
                </div>
                <div className="space-y-3 pt-4">
                  <Label className="text-base">Target Total Budget (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">If you have a strict cap, enter it here. Otherwise, leave blank.</p>
                  <div className="relative">
                     <span className="absolute left-4 top-3.5 text-muted-foreground text-lg">$</span>
                     <Input type="number" className="h-12 pl-8 text-lg" placeholder="50,000" />
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <Label className="text-base">Expected Guest Count</Label>
                      <p className="text-sm text-muted-foreground mt-1">Every guest is a plate, a chair, and an invitation.</p>
                    </div>
                    <span className="text-3xl font-serif font-bold text-primary">{guestCount[0]}</span>
                  </div>
                  <Slider 
                    defaultValue={[125]} 
                    max={300} 
                    min={20}
                    step={5} 
                    value={guestCount}
                    onValueChange={setGuestCount}
                    className="py-4"
                  />
                </div>
                <div className="space-y-4 pt-4 border-t border-border">
                  <Label className="text-base flex items-center gap-2"><Palette className="w-4 h-4"/> Wedding Style</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-2 hover:border-accent group">
                        <span className="font-semibold text-lg">Standard</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">~$200/guest</span>
                     </Button>
                     <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-2 border-primary bg-primary/5 ring-1 ring-primary">
                        <span className="font-semibold text-lg">Premium</span>
                        <span className="text-xs text-primary font-medium">~$400/guest</span>
                     </Button>
                     <Button variant="outline" className="h-28 flex flex-col items-center justify-center gap-2 hover:border-accent group">
                        <span className="font-semibold text-lg">Luxury</span>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">~$800/guest</span>
                     </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                 <Label className="text-base">Select Your Top 3 Priorities</Label>
                 <p className="text-sm text-muted-foreground mb-4">We'll allocate more budget here and find savings elsewhere.</p>
                 <div className="grid grid-cols-2 gap-3">
                   {["Venue & Food", "Photography", "Florals & Decor", "Live Band", "Open Bar", "Videography", "Attire", "Guest Experience"].map((p, i) => (
                     <Button 
                        key={p} 
                        variant={i < 3 ? "default" : "outline"} 
                        className={`h-12 justify-start px-4 ${i < 3 ? "bg-primary text-primary-foreground border-transparent" : "hover:border-accent"}`}
                     >
                       <div className="flex justify-between w-full items-center">
                          <span>{p}</span>
                          {i < 3 && <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">{i+1}</div>}
                       </div>
                     </Button>
                   ))}
                 </div>
               </div>
            )}
            
            <div className="pt-8 border-t border-border flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="text-muted-foreground">
                Back
              </Button>
              <Button size="lg" className="rounded-full px-8" onClick={() => {
                if (step < 3) setStep(step + 1);
                else setLocation("/dashboard");
              }}>
                {step === 3 ? "Generate Budget Model" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
