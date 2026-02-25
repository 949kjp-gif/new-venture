import { useState, useRef, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  UploadCloud, CheckCircle2, AlertTriangle, Info, X,
  ChevronDown, ChevronUp, Copy, Star, FileText, Mail, Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HiddenFee {
  name: string;
  amount: number;
  severity: "warning" | "info";
}

interface NormalizedQuote {
  id: string;
  vendorName: string;
  fileName: string;
  originalTotal: number;
  adjustedTotal: number;
  hiddenFees: HiddenFee[];
}

interface CompareSlot {
  vendorName: string;
  file: File | null;
  fileName: string;
  status: "empty" | "ready" | "analyzing" | "done";
  result: NormalizedQuote | null;
}

type EmailTemplateType =
  | "initial-inquiry"
  | "follow-up-no-response"
  | "follow-up-after-quote"
  | "booking-confirmation"
  | "clarification"
  | "negotiation";

const TEMPLATE_LABELS: Record<EmailTemplateType, string> = {
  "initial-inquiry": "Initial Inquiry",
  "follow-up-no-response": "Follow-Up (No Response)",
  "follow-up-after-quote": "Follow-Up After Quote",
  "booking-confirmation": "Booking Confirmation",
  clarification: "Request Clarification",
  negotiation: "Negotiate Price",
};

const VENDOR_CATEGORIES = [
  "Venue", "Catering", "Photography", "Videography",
  "Florals & Decor", "Attire", "Hair & Makeup", "Entertainment",
  "Transportation", "Officiant", "Cake & Desserts", "Other",
];

// ─── Mock helpers ─────────────────────────────────────────────────────────────

function mockAnalyze(vendorName: string, fileName: string): NormalizedQuote {
  const base = 24000 + Math.floor(Math.random() * 12000);
  const adminFee = Math.round(base * 0.22);
  const tax = Math.round(base * 0.08875);
  const rental = 1000 + Math.floor(Math.random() * 1000);
  return {
    id: Math.random().toString(36).slice(2),
    vendorName: vendorName || "Unknown Vendor",
    fileName,
    originalTotal: base,
    adjustedTotal: base + adminFee + tax + rental,
    hiddenFees: [
      { name: "22% Administrative Fee", amount: adminFee, severity: "warning" },
      { name: "Local Sales Tax (8.875%)", amount: tax, severity: "warning" },
      { name: "Required Equipment Rental", amount: rental, severity: "info" },
    ],
  };
}

const SINGLE_MOCK: NormalizedQuote = {
  id: "single-demo",
  vendorName: "Grand Ballroom Events",
  fileName: "Caterer_Proposal_V2.pdf",
  originalTotal: 28000,
  adjustedTotal: 37300,
  hiddenFees: [
    { name: "22% Administrative Fee", amount: 6160, severity: "warning" },
    { name: "Local Sales Tax (8.875%)", amount: 3031, severity: "warning" },
    { name: "Required Kitchen Tent Rental", amount: 1500, severity: "info" },
  ],
};

// ─── Email template generators ────────────────────────────────────────────────

function generateInitialInquiryEmail(
  vendorName: string,
  category: string,
  date: string,
  guestCount: string
): string {
  return `Subject: Wedding ${category} Inquiry – [Your Names], ${date || "[Wedding Date]"}

Dear ${vendorName || "[Vendor Name]"} Team,

My partner and I are planning our wedding${date ? ` on ${date}` : ""} and are looking for an exceptional ${category.toLowerCase()} vendor. We came across your work and were genuinely impressed.

Here are a few details about our celebration:
  - Date: ${date || "[Wedding Date]"}
  - Guest Count: ${guestCount || "[Estimated Guests]"}
  - Location: [Wedding Venue / City]
  - Style: [Your Wedding Style]
  - Budget Range: [$X,XXX – $X,XXX] for this category

We'd love to learn more about your packages, availability for our date, and what makes your approach unique.

Could you share your pricing guide or set up a brief call this week?

We appreciate your time and look forward to hearing from you.

Warm regards,
[Your Names]
[Phone / Email]`;
}

function generateFollowUpNoResponseEmail(vendorName: string, category: string): string {
  return `Subject: Following Up – Wedding ${category} Inquiry

Dear ${vendorName || "[Vendor Name]"} Team,

I hope this message finds you well! I reached out about a week ago regarding our upcoming wedding and wanted to follow up in case my previous message got lost.

We're still very interested in working with you for our ${category.toLowerCase()} needs and would love to hear back at your earliest convenience.

Could you let us know if our date is available and whether you'd like to connect for a quick call?

Thank you so much — we really admire your work!

Warm regards,
[Your Names]`;
}

function generateFollowUpAfterQuoteEmail(vendorName: string, category: string): string {
  return `Subject: Questions About Your Proposal – [Your Names]

Dear ${vendorName || "[Vendor Name]"} Team,

Thank you so much for sending over your proposal — we've reviewed it carefully and have a few questions before we're ready to move forward.

1. Package Inclusions: Could you clarify exactly what's included in the quoted price? We want to make sure we're not missing any add-ons or required extras.
2. Payment Schedule: What does your typical payment timeline look like?
3. Overtime / Additional Hours: Is there an option to extend coverage, and what is the hourly rate?
4. Cancellation Policy: What happens if we need to adjust our plans?
5. Substitutions: Will you personally be our ${category.toLowerCase()} vendor on the day, or might a colleague step in?

We're genuinely excited about the possibility of working with you and hope to finalize things soon.

Warm regards,
[Your Names]`;
}

function generateBookingConfirmationEmail(vendorName: string, category: string): string {
  return `Subject: Booking Confirmation – [Your Names] Wedding

Dear ${vendorName || "[Vendor Name]"} Team,

We're thrilled to officially confirm our booking with you for our wedding ${category.toLowerCase()}!

Here are the agreed details:
  - Event Date: [Wedding Date]
  - Package: [Package Name]
  - Agreed Total: $[Amount]
  - Deposit Paid: $[Deposit Amount] on [Date]
  - Remaining Balance Due: $[Balance] by [Due Date]

Please let us know the next steps — we'd love to schedule a planning call and begin sharing our vision with you.

We're so excited to work together and can't wait to create something truly special.

Warm regards,
[Your Names]`;
}

function generateClarificationEmail(q: NormalizedQuote): string {
  const feeLines = q.hiddenFees
    .map((f) => `  - ${f.name}: +$${f.amount.toLocaleString()}`)
    .join("\n");
  return `Subject: Clarification Request – Proposal for [Our Wedding Date]

Dear ${q.vendorName} Team,

Thank you for sending over your proposal. We've reviewed it carefully and have a few questions before moving forward.

Our analysis shows the quoted total of $${q.originalTotal.toLocaleString()} does not appear to include the following fees, bringing the estimated all-in cost to $${q.adjustedTotal.toLocaleString()}:

${feeLines}

Could you confirm or clarify each of these items? We want to make sure we're comparing vendors on an apples-to-apples basis.

We're genuinely excited about the possibility of working together and appreciate your transparency.

Warm regards,
[Your Names]`;
}

function generateNegotiationEmail(q: NormalizedQuote): string {
  const gap = q.adjustedTotal - q.originalTotal;
  return `Subject: Follow-Up on Proposal – [Our Wedding Date]

Dear ${q.vendorName} Team,

Thank you for your detailed proposal — we love what you do and are very interested in working with you.

After a careful review, we noticed that the all-in cost comes to approximately $${q.adjustedTotal.toLocaleString()} once fees and taxes are applied, which is $${gap.toLocaleString()} above the quoted figure of $${q.originalTotal.toLocaleString()}. This puts us slightly over our budget for this category.

We'd love to explore whether there's any flexibility — whether through a package adjustment, a reduced administrative fee, or another creative approach that works for both sides.

We're prepared to move forward quickly if we can find common ground. Would you be open to a brief call this week?

Warm regards,
[Your Names]`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SingleQuoteResult({
  quote,
  onReset,
  onSave,
  onDraftEmail,
  isSaved,
}: {
  quote: NormalizedQuote;
  onReset: () => void;
  onSave: () => void;
  onDraftEmail: () => void;
  isSaved: boolean;
}) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-start md:items-center gap-4 bg-green-50 text-green-900 p-5 rounded-xl border border-green-200 shadow-sm">
        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 md:mt-0" />
        <div className="text-sm md:text-base">
          <span className="font-semibold">Extraction complete!</span> We found{" "}
          <strong>{quote.hiddenFees.length} hidden costs</strong> the vendor excluded from their
          "grand total."
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Original */}
        <Card className="bg-card border-border shadow-sm opacity-80">
          <CardHeader className="bg-muted/40 border-b border-border pb-4">
            <CardTitle className="text-base flex flex-col gap-2">
              <span className="text-muted-foreground font-normal uppercase tracking-wider text-xs">
                What you saw
              </span>
              <div className="flex justify-between items-center">
                <span className="font-serif text-xl text-primary">Vendor's "Grand Total"</span>
                <span className="font-serif text-3xl font-bold">
                  ${quote.originalTotal.toLocaleString()}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded border border-border/50">
              <Info className="w-4 h-4 shrink-0" />
              <p className="italic leading-relaxed">
                "Note: Tax, administrative fees, and required rentals are not included in this
                estimate and will be applied to the final invoice."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Adjusted */}
        <Card className="border-accent/50 shadow-xl relative overflow-hidden transform lg:scale-105 z-10 bg-card">
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg shadow-sm">
            TRUE ALL-IN COST
          </div>
          <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
          <CardHeader className="bg-accent/5 border-b border-border pt-8 pb-4">
            <CardTitle className="text-base flex flex-col gap-2">
              <span className="text-primary font-normal uppercase tracking-wider text-xs">
                What you'll actually pay
              </span>
              <div className="flex justify-between items-center">
                <span className="font-serif text-xl text-primary font-bold">
                  WedAgent Adjusted Total
                </span>
                <span className="font-serif text-4xl font-bold text-primary">
                  ${quote.adjustedTotal.toLocaleString()}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground font-medium">Base Quote</span>
              <span className="font-semibold">${quote.originalTotal.toLocaleString()}</span>
            </div>
            {quote.hiddenFees.map((fee, i) => (
              <div
                key={i}
                className={`flex justify-between text-sm p-3 rounded-lg border items-center ${
                  fee.severity === "warning"
                    ? "text-amber-900 bg-amber-50 border-amber-100"
                    : "text-blue-900 bg-blue-50 border-blue-100"
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      fee.severity === "warning" ? "text-amber-600" : "text-blue-500"
                    }`}
                  />
                  {fee.name}
                </span>
                <span className="font-bold">+${fee.amount.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" size="lg" className="rounded-full" onClick={onReset}>
          Upload Another Quote
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full gap-2"
          onClick={onSave}
          disabled={isSaved}
        >
          {isSaved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved</>
          ) : (
            <><Plus className="w-4 h-4" /> Save to Library</>
          )}
        </Button>
        <Button size="lg" className="rounded-full px-8 gap-2" onClick={onDraftEmail}>
          <Mail className="w-4 h-4" />
          Draft Email
        </Button>
      </div>
    </div>
  );
}

function CompareUploadSlot({
  slot,
  label,
  optional,
  onChange,
  onFileUpload,
}: {
  slot: CompareSlot;
  label: string;
  optional?: boolean;
  onChange: (updates: Partial<CompareSlot>) => void;
  onFileUpload: (file: File | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const borderClass: Record<CompareSlot["status"], string> = {
    empty: "border-border",
    ready: "border-primary/40 bg-primary/[0.02]",
    analyzing: "border-accent/60 bg-accent/5",
    done: "border-green-400/50 bg-green-50/30",
  };

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 transition-all ${borderClass[slot.status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">{label}</span>
        <div className="flex items-center gap-2">
          {optional && (
            <Badge variant="outline" className="text-xs">Optional</Badge>
          )}
          {slot.status === "analyzing" && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          {slot.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
        </div>
      </div>

      <Input
        className="h-9 text-sm"
        placeholder="Vendor name"
        value={slot.vendorName}
        onChange={(e) => onChange({ vendorName: e.target.value })}
        disabled={slot.status === "analyzing" || slot.status === "done"}
      />

      {slot.fileName ? (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border border-border">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="truncate max-w-[120px]">{slot.fileName}</span>
          </div>
          {slot.status !== "analyzing" && slot.status !== "done" && (
            <button
              type="button"
              onClick={() => onFileUpload(null)}
              className="text-muted-foreground hover:text-foreground ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={slot.status === "analyzing" || slot.status === "done"}
          className="w-full flex flex-col items-center gap-2 justify-center border border-dashed border-border rounded-lg py-6 px-3 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-6 h-6" />
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
          onFileUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function CompareResults({
  slots,
  bestSlot,
  selectedQuoteId,
  onSelect,
  onSave,
  onDraftEmail,
  savedQuoteIds,
}: {
  slots: CompareSlot[];
  bestSlot: CompareSlot | null;
  selectedQuoteId: string | null;
  onSelect: (id: string) => void;
  onSave: (quote: NormalizedQuote) => void;
  onDraftEmail: (quote: NormalizedQuote) => void;
  savedQuoteIds: string[];
}) {
  const cheapestTotal = bestSlot?.result?.adjustedTotal ?? 0;

  const nextBest = slots
    .filter((s) => s !== bestSlot && s.result)
    .reduce<CompareSlot | null>((acc, s) => {
      if (!acc?.result) return s;
      return (s.result?.adjustedTotal ?? Infinity) < (acc.result?.adjustedTotal ?? Infinity) ? s : acc;
    }, null);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {bestSlot?.result && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4 items-start">
          <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-primary mb-1">
              WedAgent Recommends: {bestSlot.result.vendorName}
            </div>
            <p className="text-sm text-muted-foreground">
              {bestSlot.result.vendorName} has the lowest true all-in cost at $
              {bestSlot.result.adjustedTotal.toLocaleString()} after accounting for all hidden fees.
              {nextBest?.result &&
                ` That's $${(nextBest.result.adjustedTotal - bestSlot.result.adjustedTotal).toLocaleString()} less than ${nextBest.result.vendorName}.`}
            </p>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-4 ${
          slots.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {slots.map((slot, i) => {
          if (!slot.result) return null;
          const q = slot.result;
          const isBest = slot === bestSlot;
          const isSelected = selectedQuoteId === q.id;
          const isSaved = savedQuoteIds.includes(q.id);
          const delta = q.adjustedTotal - cheapestTotal;

          return (
            <Card
              key={q.id}
              className={`transition-all relative ${
                isBest
                  ? "border-primary shadow-lg"
                  : isSelected
                  ? "border-accent shadow-md"
                  : "border-border"
              }`}
            >
              {isBest && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Best Value
                </div>
              )}
              <CardHeader className="pb-3 border-b border-border">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  Quote {String.fromCharCode(65 + i)}
                </div>
                <div className="font-bold text-primary text-lg font-serif">{q.vendorName}</div>
                <div className="text-xs text-muted-foreground truncate">{q.fileName}</div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quoted total</span>
                  <span className="line-through text-muted-foreground">
                    ${q.originalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-sm">True all-in cost</span>
                  <span className="text-xl font-serif text-primary">
                    ${q.adjustedTotal.toLocaleString()}
                  </span>
                </div>
                {delta > 0 && (
                  <div className="text-xs text-amber-600 font-medium">
                    +${delta.toLocaleString()} vs. cheapest
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Hidden Fees
                  </div>
                  {q.hiddenFees.map((fee, j) => (
                    <div key={j} className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertTriangle
                          className={`w-3 h-3 ${
                            fee.severity === "warning" ? "text-amber-500" : "text-blue-400"
                          }`}
                        />
                        {fee.name}
                      </span>
                      <span className="font-medium">+${fee.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="space-y-2 pt-1">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="w-full rounded-full"
                    onClick={() => onSelect(q.id)}
                  >
                    {isSelected ? "Selected" : "Select This Quote"}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full text-xs"
                      onClick={() => onSave(q)}
                      disabled={isSaved}
                    >
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-full gap-1 text-xs"
                      onClick={() => onDraftEmail(q)}
                    >
                      <Mail className="w-3 h-3" />
                      Draft Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Expanded Email Dialog ─────────────────────────────────────────────────────

function DraftEmailDialog({
  open,
  onClose,
  quote,
}: {
  open: boolean;
  onClose: () => void;
  quote: NormalizedQuote | null;
}) {
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplateType>("clarification");
  const [emailTexts, setEmailTexts] = useState<Record<EmailTemplateType, string>>({
    "initial-inquiry": "",
    "follow-up-no-response": "",
    "follow-up-after-quote": "",
    "booking-confirmation": "",
    clarification: "",
    negotiation: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (quote) {
      const vendorName = quote.vendorName;
      setEmailTexts({
        "initial-inquiry": generateInitialInquiryEmail(vendorName, "Venue", "", ""),
        "follow-up-no-response": generateFollowUpNoResponseEmail(vendorName, "Venue"),
        "follow-up-after-quote": generateFollowUpAfterQuoteEmail(vendorName, "Venue"),
        "booking-confirmation": generateBookingConfirmationEmail(vendorName, "Venue"),
        clarification: generateClarificationEmail(quote),
        negotiation: generateNegotiationEmail(quote),
      });
    }
  }, [quote]);

  const currentText = emailTexts[activeTemplate];
  const setCurrentText = (val: string) => {
    setEmailTexts((prev) => ({ ...prev, [activeTemplate]: val }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-primary">Draft Vendor Email</DialogTitle>
          <DialogDescription>
            {quote?.vendorName} — select a template, review, and edit before sending
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          {/* Template selector */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Email Template</Label>
            <select
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value as EmailTemplateType)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(Object.keys(TEMPLATE_LABELS) as EmailTemplateType[]).map((key) => (
                <option key={key} value={key}>{TEMPLATE_LABELS[key]}</option>
              ))}
            </select>
          </div>

          {/* Template description */}
          <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border">
            {activeTemplate === "initial-inquiry" && "First contact with a new vendor — introduces your event and asks for availability and pricing."}
            {activeTemplate === "follow-up-no-response" && "Polite follow-up to send 7-10 days after your initial inquiry with no reply."}
            {activeTemplate === "follow-up-after-quote" && "Sent after receiving a quote — asks clarifying questions before making a decision."}
            {activeTemplate === "booking-confirmation" && "Confirms your booking and outlines the agreed terms and next steps."}
            {activeTemplate === "clarification" && "Asks the vendor to explain fees and charges not included in their quoted total."}
            {activeTemplate === "negotiation" && "Friendly negotiation email when the all-in cost exceeds your budget."}
          </div>

          {/* Editable text */}
          <Textarea
            className="flex-1 min-h-[260px] text-sm resize-none font-mono"
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-2">
          <Button onClick={handleCopy} className="gap-2 rounded-full">
            {copied ? (
              <><CheckCircle2 className="w-4 h-4" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy to Clipboard</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Outreach Templates Panel ──────────────────────────────────────────────────

function OutreachTemplatesPanel() {
  const [vendorName, setVendorName] = useState("");
  const [category, setCategory] = useState("Venue");
  const [weddingDate, setWeddingDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [templateType, setTemplateType] = useState<EmailTemplateType>("initial-inquiry");
  const [emailText, setEmailText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let text = "";
    switch (templateType) {
      case "initial-inquiry":
        text = generateInitialInquiryEmail(vendorName, category, weddingDate, guestCount);
        break;
      case "follow-up-no-response":
        text = generateFollowUpNoResponseEmail(vendorName, category);
        break;
      case "follow-up-after-quote":
        text = generateFollowUpAfterQuoteEmail(vendorName, category);
        break;
      case "booking-confirmation":
        text = generateBookingConfirmationEmail(vendorName, category);
        break;
      case "clarification":
        text = generateClarificationEmail({
          id: "stub",
          vendorName: vendorName || "[Vendor Name]",
          fileName: "",
          originalTotal: 25000,
          adjustedTotal: 32000,
          hiddenFees: [
            { name: "22% Administrative Fee", amount: 5500, severity: "warning" },
            { name: "Local Tax (8.875%)", amount: 2219, severity: "warning" },
          ],
        });
        break;
      case "negotiation":
        text = generateNegotiationEmail({
          id: "stub",
          vendorName: vendorName || "[Vendor Name]",
          fileName: "",
          originalTotal: 25000,
          adjustedTotal: 32000,
          hiddenFees: [],
        });
        break;
    }
    setEmailText(text);
  }, [templateType, vendorName, category, weddingDate, guestCount]);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Select a template type and fill in your details. The email auto-populates based on your inputs — edit freely before sending.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Template Type</Label>
          <select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value as EmailTemplateType)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {(Object.keys(TEMPLATE_LABELS) as EmailTemplateType[]).map((key) => (
              <option key={key} value={key}>{TEMPLATE_LABELS[key]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Vendor Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Vendor / Business Name</Label>
          <Input
            placeholder="e.g. The Grand Ballroom"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Wedding Date</Label>
          <Input
            placeholder="e.g. June 14, 2027"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="h-10"
          />
        </div>

        {templateType === "initial-inquiry" && (
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm">Estimated Guest Count</Label>
            <Input
              placeholder="e.g. 120"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Generated Email</Label>
          <Button size="sm" variant="outline" className="gap-2 rounded-full text-xs" onClick={handleCopy}>
            {copied ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy</>
            )}
          </Button>
        </div>
        <Textarea
          className="min-h-[320px] text-sm font-mono resize-none"
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Edit the template above before copying. Fields in [brackets] need to be personalized.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuoteNormalizer() {
  // Single mode
  const [analyzing, setAnalyzing] = useState(false);
  const [singleResult, setSingleResult] = useState<NormalizedQuote | null>(null);

  // Compare mode
  const [compareSlots, setCompareSlots] = useState<CompareSlot[]>([
    { vendorName: "", file: null, fileName: "", status: "empty", result: null },
    { vendorName: "", file: null, fileName: "", status: "empty", result: null },
    { vendorName: "", file: null, fileName: "", status: "empty", result: null },
  ]);
  const [compareAnalyzing, setCompareAnalyzing] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  // Quote library
  const [savedQuotes, setSavedQuotes] = useState<NormalizedQuote[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Email dialog
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailQuote, setEmailQuote] = useState<NormalizedQuote | null>(null);

  const saveToLibrary = (quote: NormalizedQuote) => {
    setSavedQuotes((prev) => (prev.find((q) => q.id === quote.id) ? prev : [...prev, quote]));
  };

  const openDraftEmail = (quote: NormalizedQuote) => {
    setEmailQuote(quote);
    setEmailDialogOpen(true);
  };

  const updateCompareSlot = (idx: number, updates: Partial<CompareSlot>) => {
    setCompareSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const handleCompareFileUpload = (idx: number, file: File | null) => {
    updateCompareSlot(idx, {
      file,
      fileName: file?.name ?? "",
      status: file ? "ready" : "empty",
      result: null,
    });
  };

  const handleAnalyzeAll = () => {
    const snapshot = compareSlots.map((s) => ({
      vendorName: s.vendorName,
      fileName: s.fileName,
      shouldAnalyze: s.status === "ready" && !!s.fileName,
    }));
    const readyCount = snapshot.filter((s) => s.shouldAnalyze).length;
    if (readyCount < 2) return;

    setCompareAnalyzing(true);
    setCompareSlots((prev) =>
      prev.map((s) => (s.status === "ready" && s.fileName ? { ...s, status: "analyzing" as const } : s))
    );

    setTimeout(() => {
      let idx = 0;
      setCompareSlots((prev) =>
        prev.map((s) => {
          if (s.status !== "analyzing") return s;
          const snap = snapshot[idx++];
          const result = mockAnalyze(snap.vendorName, snap.fileName);
          return { ...s, status: "done" as const, result };
        })
      );
      setCompareAnalyzing(false);
    }, 3000);
  };

  const doneSlots = compareSlots.filter((s) => s.status === "done" && s.result !== null);
  const bestSlot =
    doneSlots.length > 0
      ? doneSlots.reduce((a, b) =>
          (a.result?.adjustedTotal ?? Infinity) <= (b.result?.adjustedTotal ?? Infinity) ? a : b
        )
      : null;

  const readyCount = compareSlots.filter((s) => s.status === "ready" && s.fileName).length;

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-3 font-serif">
              Quote Analysis
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Upload confusing vendor PDFs. We extract the true all-in cost, expose hidden fees, and
              help you compare apples to apples.
            </p>
          </div>

          {savedQuotes.length > 0 && (
            <Collapsible open={libraryOpen} onOpenChange={setLibraryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="shrink-0 gap-2">
                  <FileText className="w-4 h-4" />
                  Quote Library ({savedQuotes.length})
                  {libraryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 w-full md:w-72">
                <div className="bg-card border border-border rounded-xl p-4 space-y-1">
                  {savedQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium">{q.vendorName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[140px]">{q.fileName}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-primary">${q.adjustedTotal.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground line-through">${q.originalTotal.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="single">
          <TabsList className="mb-6">
            <TabsTrigger value="single">Single Quote</TabsTrigger>
            <TabsTrigger value="compare">Compare Quotes</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
          </TabsList>

          {/* ── Single Quote Tab ── */}
          <TabsContent value="single" className="space-y-8">
            {!singleResult ? (
              <Card className="border-dashed border-2 border-border bg-card/50 overflow-hidden relative">
                {analyzing && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10" />
                )}
                <CardContent className="flex flex-col items-center justify-center py-32 text-center relative z-20">
                  {analyzing ? (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-300 bg-card p-8 rounded-2xl shadow-xl border border-border">
                      <div className="w-16 h-16 border-4 border-accent border-t-primary rounded-full animate-spin mx-auto" />
                      <div>
                        <div className="text-2xl font-bold font-serif text-primary">
                          Analyzing proposal...
                        </div>
                        <p className="text-muted-foreground mt-2">
                          Extracting line items, calculating hidden taxes, checking overtime clauses...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
                        <UploadCloud className="w-10 h-10 text-accent" />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-primary">Drop Proposal Here</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Drag and drop a PDF, screenshot, or paste a link. Our AI normalizes the pricing structure instantly.
                      </p>
                      <Button
                        size="lg"
                        className="w-full h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                        onClick={() => {
                          setAnalyzing(true);
                          setTimeout(() => {
                            setAnalyzing(false);
                            setSingleResult(SINGLE_MOCK);
                          }, 2500);
                        }}
                      >
                        Select File
                      </Button>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        Supports PDF, JPG, PNG
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <SingleQuoteResult
                quote={singleResult}
                onReset={() => setSingleResult(null)}
                onSave={() => saveToLibrary(singleResult)}
                onDraftEmail={() => openDraftEmail(singleResult)}
                isSaved={!!savedQuotes.find((q) => q.id === singleResult.id)}
              />
            )}
          </TabsContent>

          {/* ── Compare Quotes Tab ── */}
          <TabsContent value="compare" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareSlots.map((slot, idx) => (
                <CompareUploadSlot
                  key={idx}
                  slot={slot}
                  label={`Quote ${String.fromCharCode(65 + idx)}`}
                  optional={idx === 2}
                  onChange={(updates) => updateCompareSlot(idx, updates)}
                  onFileUpload={(file) => handleCompareFileUpload(idx, file)}
                />
              ))}
            </div>

            {readyCount >= 2 && doneSlots.length === 0 && (
              <div className="flex justify-center">
                <Button
                  size="lg"
                  className="rounded-full px-10 shadow-lg gap-2"
                  onClick={handleAnalyzeAll}
                  disabled={compareAnalyzing}
                >
                  {compareAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Analyzing all quotes...
                    </>
                  ) : (
                    "Analyze All Quotes"
                  )}
                </Button>
              </div>
            )}

            {doneSlots.length >= 2 && (
              <CompareResults
                slots={doneSlots}
                bestSlot={bestSlot}
                selectedQuoteId={selectedQuoteId}
                onSelect={setSelectedQuoteId}
                onSave={saveToLibrary}
                onDraftEmail={openDraftEmail}
                savedQuoteIds={savedQuotes.map((q) => q.id)}
              />
            )}
          </TabsContent>

          {/* ── Email Templates Tab ── */}
          <TabsContent value="templates" className="space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-xl font-serif font-bold text-primary">Vendor Outreach Templates</h2>
              <p className="text-sm text-muted-foreground mt-1">
                6 professionally written email templates for every stage of vendor communication.
              </p>
            </div>
            <OutreachTemplatesPanel />
          </TabsContent>
        </Tabs>
      </div>

      {/* Draft Email Dialog */}
      <DraftEmailDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        quote={emailQuote}
      />
    </Shell>
  );
}
