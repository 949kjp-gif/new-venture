import { useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, LayoutDashboard, Calculator, FileText,
  ClipboardList, Building2, NotebookPen, ArrowRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const TOUR_KEY = "wedagent_toured";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to WedAgent",
    description:
      "Your AI wedding CFO — plan smarter, stay on budget, and stress less. Let's take a quick look at what's waiting for you.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "See your full budget at a glance. Live alerts flag overspending before it snowballs, and smart trade-off suggestions keep you balanced.",
    color: "text-primary",
    bg: "bg-primary/10",
    href: "/dashboard",
  },
  {
    icon: Calculator,
    title: "Budget Builder",
    description:
      "Answer a few questions about your location, guest count, and style. We generate a realistic, market-adjusted budget instantly.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/builder",
  },
  {
    icon: FileText,
    title: "Quote Analysis",
    description:
      "Upload confusing vendor PDFs. We extract the true all-in cost, expose hidden fees, and let you compare vendors fairly.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: "/quote-normalizer",
  },
  {
    icon: ClipboardList,
    title: "Planning & Milestones",
    description:
      "Track every milestone from 12 months out to the week of. Add tasks, assign them, and never miss a deadline.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    href: "/planning",
  },
  {
    icon: Building2,
    title: "Vendor Management",
    description:
      "Manage all vendors in one place — status, contracts, deposits, final payments, and contact info. Plus tips for every negotiation.",
    color: "text-green-600",
    bg: "bg-green-50",
    href: "/vendors",
  },
  {
    icon: NotebookPen,
    title: "Notes & Guest List",
    description:
      "Capture meeting notes and organize your guest list — RSVPs, dietary needs, and table assignments — all in one spot.",
    color: "text-pink-600",
    bg: "bg-pink-50",
    href: "/notes",
  },
];

export function OnboardingTour() {
  const { user, isDemoMode } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(() => {
    // Only show for authenticated non-demo users who haven't seen it
    if (typeof window === "undefined") return false;
    return localStorage.getItem(TOUR_KEY) !== "true";
  });

  // Don't show for demo users or unauthenticated
  if (!visible || !user || isDemoMode) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  const handleNext = () => {
    if (isLast) {
      dismiss();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleGoToPage = () => {
    if (current.href) {
      setLocation(current.href);
    }
    dismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-1 bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6",
              current.bg
            )}
          >
            <Icon className={cn("w-8 h-8", current.color)} />
          </div>

          {/* Step label */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
            {step === 0 ? "Getting started" : `Feature ${step} of ${STEPS.length - 1}`}
          </p>

          {/* Title */}
          <h2 className="text-2xl font-serif font-bold text-primary mb-3">
            {current.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-sm mb-8">
            {current.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 0}
              className="text-muted-foreground"
            >
              Back
            </Button>

            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === step ? "bg-primary w-4" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            <Button size="sm" onClick={handleNext} className="gap-1.5 rounded-full px-4">
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Skip / go to page */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {current.href && !isLast && (
              <button
                onClick={handleGoToPage}
                className="text-xs text-primary hover:underline transition-colors"
              >
                Go to {current.title} →
              </button>
            )}
            <button
              onClick={dismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
