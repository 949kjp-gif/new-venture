import { useState, useRef, type ElementType } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";
import {
  Sparkles, MapPin, Users, Star, CheckCircle2,
  Building2, UtensilsCrossed, Camera, Film, Flower2, Shirt, Wand2,
  Music2, Car, BookOpen, Mail, Cake, CalendarDays, Lightbulb,
  ClipboardList, Plane, Gift, QrCode, Upload, X, Plus, Trash2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Flexibility = "strict" | "moderate" | "flexible";
type WeddingStyle = "intimate" | "standard" | "premium" | "luxury";

interface BudgetCategory {
  id: string;
  name: string;
  Icon: ElementType;
  enabled: boolean;
  priority: "low" | "medium" | "high";
  notes: string;
  quoteFile: File | null;
  quoteFileName: string;
}

interface EventDay {
  id: string;
  name: string;
  date: string;
  guestCount: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LIST: Pick<BudgetCategory, "id" | "name" | "Icon">[] = [
  { id: "venue", name: "Venue", Icon: Building2 },
  { id: "catering", name: "Catering", Icon: UtensilsCrossed },
  { id: "photography", name: "Photography", Icon: Camera },
  { id: "videography", name: "Videography", Icon: Film },
  { id: "florals", name: "Florals & Decor", Icon: Flower2 },
  { id: "attire", name: "Attire", Icon: Shirt },
  { id: "beauty", name: "Hair & Makeup", Icon: Wand2 },
  { id: "entertainment", name: "Entertainment", Icon: Music2 },
  { id: "transportation", name: "Transportation", Icon: Car },
  { id: "officiant", name: "Officiant", Icon: BookOpen },
  { id: "stationery", name: "Stationery", Icon: Mail },
  { id: "cake", name: "Cake & Desserts", Icon: Cake },
  { id: "rehearsal", name: "Rehearsal Dinner", Icon: CalendarDays },
  { id: "lighting", name: "Lighting & AV", Icon: Lightbulb },
  { id: "planner", name: "Wedding Planner", Icon: ClipboardList },
  { id: "honeymoon", name: "Honeymoon", Icon: Plane },
  { id: "favors", name: "Favors", Icon: Gift },
  { id: "photobooth", name: "Photo Booth", Icon: QrCode },
];

const DEFAULT_ENABLED = new Set(["venue", "catering", "photography", "florals", "attire"]);

const FLEXIBILITY_OPTIONS: { value: Flexibility; label: string; description: string }[] = [
  { value: "strict", label: "Strict", description: "Hard cap — never suggest going over" },
  { value: "moderate", label: "Moderate", description: "Can stretch 10–15% for the right vendor" },
  { value: "flexible", label: "Flexible", description: "Target only — open to adjustments" },
];

const STYLE_OPTIONS: { value: WeddingStyle; label: string; description: string }[] = [
  { value: "intimate", label: "Intimate", description: "Curated & cozy, 10–50 guests" },
  { value: "standard", label: "Standard", description: "Warm and memorable, classic execution" },
  { value: "premium", label: "Premium", description: "Elevated details, bespoke experience" },
  { value: "luxury", label: "Luxury", description: "No-compromise, world-class vendors" },
];

const EVENT_NAME_SUGGESTIONS = [
  "Mehendi", "Sangeet", "Baraat", "Reception", "Wedding Ceremony", "Welcome Dinner",
];

function initCategories(): BudgetCategory[] {
  return CATEGORY_LIST.map((c) => ({
    ...c,
    enabled: DEFAULT_ENABLED.has(c.id),
    priority: "medium" as const,
    notes: "",
    quoteFile: null,
    quoteFileName: "",
  }));
}

function newEventDay(): EventDay {
  return { id: Math.random().toString(36).slice(2), name: "", date: "", guestCount: "" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onToggle,
  onUpdate,
}: {
  category: BudgetCategory;
  onToggle: () => void;
  onUpdate: (updates: Partial<BudgetCategory>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        category.enabled ? "border-primary/40 bg-primary/[0.02]" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <category.Icon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{category.name}</span>
        </div>
        <Switch checked={category.enabled} onCheckedChange={onToggle} />
      </div>

      {category.enabled && (
        <div className="border-t border-border/50 px-3 pb-3 pt-3 space-y-3">
          {/* Priority */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <div className="flex gap-1.5">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onUpdate({ priority: p })}
                  className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
                    category.priority === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              className="text-xs min-h-[56px] resize-none"
              placeholder="Details, vendor preferences, or budget caps..."
              value={category.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
            />
          </div>

          {/* Quote Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Vendor Quote{" "}
              <span className="font-normal opacity-70">(optional)</span>
            </Label>
            {category.quoteFileName ? (
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border border-border">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span className="truncate max-w-[140px]">{category.quoteFileName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdate({ quoteFile: null, quoteFileName: "" })}
                  className="text-muted-foreground hover:text-foreground ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-2 justify-center border border-dashed border-border rounded-lg py-2 px-3 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF, JPG, or PNG
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onUpdate({ quoteFile: file, quoteFileName: file?.name ?? "" });
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0 font-medium">{label}</span>
      <div className="text-right">
        <span className="text-sm text-primary">{value}</span>
        {detail && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Builder() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1
  const [locationVal, setLocationVal] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [budget, setBudget] = useState("");
  const [flexibility, setFlexibility] = useState<Flexibility>("moderate");

  // Multi-event support
  const [isMultiEvent, setIsMultiEvent] = useState(false);
  const [eventDays, setEventDays] = useState<EventDay[]>([newEventDay()]);

  // Step 2
  const [guestCount, setGuestCount] = useState([125]);
  const [style, setStyle] = useState<WeddingStyle>("premium");
  const [vision, setVision] = useState("");
  const [pinterestUrl, setPinterestUrl] = useState("");

  // Step 3
  const [categories, setCategories] = useState<BudgetCategory[]>(initCategories);

  // Step 4
  const [topPriorities, setTopPriorities] = useState<string[]>([]);

  const enabledCategories = categories.filter((c) => c.enabled);

  const toggleCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
    setTopPriorities((prev) => prev.filter((p) => p !== id));
  };

  const updateCategory = (id: string, updates: Partial<BudgetCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const togglePriority = (id: string) => {
    setTopPriorities((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const addEventDay = () => {
    if (eventDays.length >= 6) return;
    setEventDays((prev) => [...prev, newEventDay()]);
  };

  const removeEventDay = (id: string) => {
    setEventDays((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEventDay = (id: string, updates: Partial<EventDay>) => {
    setEventDays((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto p-4 md:p-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Smart Budget Builder
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 leading-tight font-serif">
            Let's build a realistic foundation.
          </h1>
          <p className="text-lg text-muted-foreground">
            Most couples start with an arbitrary number. We start with real market data based on your vision.
          </p>
        </div>

        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="bg-muted/30 border-b border-border">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i + 1 <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                {step === 1 && (<><MapPin className="w-5 h-5 text-accent" /> The Basics</>)}
                {step === 2 && (<><Users className="w-5 h-5 text-accent" /> Scale & Vision</>)}
                {step === 3 && (<><Building2 className="w-5 h-5 text-accent" /> Your Vendors</>)}
                {step === 4 && (<><Star className="w-5 h-5 text-accent" /> Top Priorities</>)}
                {step === 5 && (<><CheckCircle2 className="w-5 h-5 text-accent" /> Review & Generate</>)}
              </CardTitle>
              <span className="text-sm text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            {/* ── Step 1: The Basics ── */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-base">Where are you getting married?</Label>
                  <p className="text-sm text-muted-foreground">Location drives cost more than anything else.</p>
                  <Input
                    className="h-12 text-base"
                    placeholder="e.g. New York, NY or Austin, TX"
                    value={locationVal}
                    onChange={(e) => setLocationVal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Approximate Wedding Date</Label>
                  <p className="text-sm text-muted-foreground">Even a rough timeframe helps us account for seasonal pricing.</p>
                  <Input
                    className="h-12 text-base"
                    placeholder="e.g. June 2027 or Fall 2026"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </div>

                {/* Multi-event toggle */}
                <div className="space-y-4 border border-border rounded-2xl p-5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Is this a multi-event celebration?</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        For cultural weddings with Mehendi, Sangeet, Baraat, and more.
                      </p>
                    </div>
                    <Switch
                      checked={isMultiEvent}
                      onCheckedChange={setIsMultiEvent}
                    />
                  </div>

                  {isMultiEvent && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Event Days</p>
                      {eventDays.map((event, idx) => (
                        <div key={event.id} className="bg-background border border-border rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary">Event {idx + 1}</span>
                            {eventDays.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEventDay(event.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Event Name</Label>
                              <div className="relative">
                                <Input
                                  className="h-9 text-sm pr-8"
                                  placeholder="e.g. Sangeet, Reception..."
                                  value={event.name}
                                  onChange={(e) => updateEventDay(event.id, { name: e.target.value })}
                                  list={`event-suggestions-${event.id}`}
                                />
                                <datalist id={`event-suggestions-${event.id}`}>
                                  {EVENT_NAME_SUGGESTIONS.map((s) => (
                                    <option key={s} value={s} />
                                  ))}
                                </datalist>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Date</Label>
                              <Input
                                className="h-9 text-sm"
                                placeholder="e.g. June 14, 2027"
                                value={event.date}
                                onChange={(e) => updateEventDay(event.id, { date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Estimated Guest Count</Label>
                            <Input
                              type="number"
                              className="h-9 text-sm"
                              placeholder="e.g. 80"
                              value={event.guestCount}
                              onChange={(e) => updateEventDay(event.id, { guestCount: e.target.value })}
                            />
                          </div>
                        </div>
                      ))}

                      {eventDays.length < 6 && (
                        <button
                          type="button"
                          onClick={addEventDay}
                          className="w-full flex items-center gap-2 justify-center border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Another Event Day
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base">
                    Target Total Budget{" "}
                    <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">If you have a number in mind. Otherwise, we'll model from scratch.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="h-12 pl-8 text-base"
                      placeholder="65,000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Budget Flexibility</Label>
                  <p className="text-sm text-muted-foreground">How firm is your number?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FLEXIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFlexibility(opt.value)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          flexibility === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="font-semibold text-sm text-primary mb-1">{opt.label}</div>
                        <div className="text-xs text-muted-foreground leading-snug">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Scale & Vision ── */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
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
                    min={10}
                    step={5}
                    value={guestCount}
                    onValueChange={setGuestCount}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10 (micro)</span>
                    <span>150 (mid-size)</span>
                    <span>300+ (grand)</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-6">
                  <Label className="text-base">Wedding Style</Label>
                  <p className="text-sm text-muted-foreground">This shapes vendor tier, aesthetic scope, and allocation strategy.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStyle(opt.value)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          style === opt.value
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div className="font-semibold text-primary mb-1">{opt.label}</div>
                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-border pt-6">
                  <Label className="text-base">Describe Your Vision</Label>
                  <p className="text-sm text-muted-foreground">In your own words — what does the day feel and look like?</p>
                  <Textarea
                    className="resize-none min-h-[100px] text-base"
                    placeholder={`"A warm garden ceremony at golden hour, followed by an intimate dinner — candles everywhere, fresh flowers, very personal."`}
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">
                    Inspiration Board{" "}
                    <span className="text-muted-foreground text-sm font-normal">(optional)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground">Link a Pinterest board, Instagram collection, or any mood board URL.</p>
                  <Input
                    className="h-12 text-base"
                    placeholder="https://pinterest.com/yourboard"
                    value={pinterestUrl}
                    onChange={(e) => setPinterestUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ── Step 3: Vendor Categories ── */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-sm text-muted-foreground">
                  Toggle on what you're planning to hire. For each, optionally set a priority, add notes, or upload a quote you've already received.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <CategoryCard
                      key={cat.id}
                      category={cat}
                      onToggle={() => toggleCategory(cat.id)}
                      onUpdate={(updates) => updateCategory(cat.id, updates)}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  {enabledCategories.length} of {categories.length} vendor categories selected
                </p>
              </div>
            )}

            {/* ── Step 4: Top Priorities ── */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <Label className="text-base">Select Your Top 3 Priorities</Label>
                  <p className="text-sm text-muted-foreground mt-1">We'll allocate more budget here and find savings in lower-priority areas.</p>
                </div>

                {enabledCategories.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm py-4 text-center">
                    No categories selected. Go back to Step 3 to choose your vendors.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {enabledCategories.map((cat) => {
                        const rank = topPriorities.indexOf(cat.id);
                        const isSelected = rank !== -1;
                        const isDisabled = !isSelected && topPriorities.length >= 3;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => togglePriority(cat.id)}
                            disabled={isDisabled}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : isDisabled
                                ? "border-border opacity-40 cursor-not-allowed"
                                : "border-border hover:border-primary/40 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <cat.Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            {isSelected ? (
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                {rank + 1}
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-border shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">{topPriorities.length}/3 selected</p>
                  </>
                )}
              </div>
            )}

            {/* ── Step 5: Review & Generate ── */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-sm text-muted-foreground">
                  Review your inputs before we generate your personalized budget model.
                </p>
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <ReviewRow label="Location" value={locationVal || "—"} />
                  <ReviewRow label="Wedding Date" value={weddingDate || "—"} />
                  {isMultiEvent && (
                    <ReviewRow
                      label="Multi-Event"
                      value={`${eventDays.length} event day(s)`}
                      detail={eventDays.filter((e) => e.name).map((e) => e.name).join(" · ") || undefined}
                    />
                  )}
                  <ReviewRow
                    label="Budget"
                    value={budget ? `$${parseInt(budget).toLocaleString()}` : "Not set — we'll model from market data"}
                  />
                  <ReviewRow
                    label="Flexibility"
                    value={FLEXIBILITY_OPTIONS.find((f) => f.value === flexibility)?.label ?? "—"}
                  />
                  <ReviewRow label="Guest Count" value={`${guestCount[0]} guests`} />
                  <ReviewRow
                    label="Style"
                    value={STYLE_OPTIONS.find((s) => s.value === style)?.label ?? "—"}
                  />
                  <ReviewRow
                    label="Vendors"
                    value={`${enabledCategories.length} categories selected`}
                    detail={enabledCategories.map((c) => c.name).join(" · ")}
                  />
                  {topPriorities.length > 0 && (
                    <ReviewRow
                      label="Top Priorities"
                      value={topPriorities
                        .map((id) => categories.find((c) => c.id === id)?.name)
                        .filter(Boolean)
                        .join(" > ")}
                    />
                  )}
                  {vision && (
                    <ReviewRow
                      label="Vision"
                      value={vision.length > 100 ? vision.slice(0, 100) + "…" : vision}
                    />
                  )}
                  {pinterestUrl && <ReviewRow label="Inspo Board" value={pinterestUrl} />}
                  {enabledCategories.some((c) => c.quoteFileName) && (
                    <ReviewRow
                      label="Quotes Uploaded"
                      value={`${enabledCategories.filter((c) => c.quoteFileName).length} file(s)`}
                      detail={enabledCategories
                        .filter((c) => c.quoteFileName)
                        .map((c) => `${c.name}: ${c.quoteFileName}`)
                        .join(" · ")}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="pt-8 border-t border-border mt-8 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="text-muted-foreground"
              >
                Back
              </Button>
              <Button
                size="lg"
                className="rounded-full px-8"
                onClick={() => {
                  if (step < TOTAL_STEPS) setStep((s) => s + 1);
                  else setLocation("/dashboard");
                }}
              >
                {step === TOTAL_STEPS ? "Generate Budget Model" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
