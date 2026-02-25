import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Building2, Plus, Pencil, Trash2, Check, ChevronDown, ChevronUp,
  Phone, Mail, DollarSign, AlertTriangle, Lightbulb, MessageSquare,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id: string;
  category: string;
  vendorName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "searching" | "contacted" | "quoted" | "booked";
  depositAmount: string;
  depositDue: string;
  finalAmount: string;
  finalDue: string;
  notes: string;
}

const STORAGE_KEY = "wedagent_vendors";

const DEFAULT_CATEGORIES = [
  "Venue", "Catering", "Photography", "Videography",
  "Florals & Decor", "Attire", "Hair & Makeup", "Entertainment",
];

const STATUS_STYLES: Record<Vendor["status"], string> = {
  searching: "bg-muted text-muted-foreground border-border",
  contacted: "bg-blue-100 text-blue-800 border-blue-200",
  quoted:    "bg-amber-100 text-amber-800 border-amber-200",
  booked:    "bg-green-100 text-green-800 border-green-200",
};

const STATUS_ORDER: Vendor["status"][] = ["searching", "contacted", "quoted", "booked"];

function blankVendor(category: string): Vendor {
  return {
    id: crypto.randomUUID(),
    category,
    vendorName: "",
    contactName: "",
    email: "",
    phone: "",
    status: "searching",
    depositAmount: "",
    depositDue: "",
    finalAmount: "",
    finalDue: "",
    notes: "",
  };
}

function initVendors(): Vendor[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_CATEGORIES.map(blankVendor);
}

// ─── Vendor Tips Data ─────────────────────────────────────────────────────────

interface TipCategory {
  name: string;
  questions: string[];
  redFlags: string[];
  script: string;
}

const VENDOR_TIPS: TipCategory[] = [
  {
    name: "Venue",
    questions: [
      "What is the all-in cost including setup, breakdown, and overtime fees?",
      "Are there mandatory preferred vendor lists, or can we bring our own caterer/DJ?",
      "What is the weather contingency plan for outdoor ceremonies?",
      "Is the venue exclusively ours for the day, or are other events happening?",
      "What is included — tables, chairs, linens, AV — versus what's rented separately?",
    ],
    redFlags: [
      "Vague 'estimated' pricing without a detailed line-item breakdown.",
      "Mandatory in-house catering with no per-head price disclosed upfront.",
      "No written policy on overtime — verbal assurances don't protect you.",
    ],
    script:
      "Hi [Name], we're considering [Venue Name] for our wedding on [Date] with approximately [X] guests. Could you send a fully itemized pricing sheet including all fees — setup, breakdown, overtime, and any mandatory add-ons? We'd also love to know your policy on outside vendors. Thank you!",
  },
  {
    name: "Catering",
    questions: [
      "What is the per-head cost broken down by food, staffing, and rentals?",
      "Are there cake-cutting fees, corkage fees, or service charge add-ons?",
      "What is the staff-to-guest ratio, and what does that include?",
      "Is a tasting included in the contract, or is there an additional charge?",
      "What happens if a menu item becomes unavailable — what is the substitution process?",
    ],
    redFlags: [
      "Refusing to provide itemized per-head pricing — total-only quotes hide markups.",
      "No tasting offered before the contract is signed.",
      "Gratuity listed as optional in the quote but required on final invoice.",
    ],
    script:
      "Hi [Name], we're planning a [X]-guest wedding on [Date] and are evaluating caterers. Could you provide a fully itemized per-head quote including all service charges, gratuity, cake cutting, and corkage fees? We'd also like to understand your tasting policy. Looking forward to hearing from you!",
  },
  {
    name: "Photography",
    questions: [
      "Who specifically will be our lead photographer — not just the studio name?",
      "What is the turnaround time for the full gallery and highlight images?",
      "Does the contract grant us full personal usage rights and printing rights?",
      "What backup equipment do you carry, and what happens if you're ill on the day?",
      "Is a second shooter included, and what is their experience level?",
    ],
    redFlags: [
      "No written contract specifying the lead photographer by name — studios sometimes swap.",
      "Turnaround time listed as 'within a few months' — get an exact date in writing.",
      "Usage rights limited to personal use only — you may not be able to share on social media.",
    ],
    script:
      "Hi [Name], we love your work and are interested in booking you for our [Date] wedding. Could you share your package details including who will be our lead photographer, turnaround times, licensing terms, and backup policies? We'd love to schedule a call to learn more.",
  },
  {
    name: "Videography",
    questions: [
      "Is drone footage available, and are there permit requirements at our venue?",
      "What is the length of the highlight reel, and is a full ceremony edit included?",
      "Will we receive the raw footage, and how long do you store it?",
      "What music licensing do you handle — or will we need to source licensed tracks?",
      "What is your editing style — cinematic, documentary, or both?",
    ],
    redFlags: [
      "Music in demos is copyrighted — ask what licensed music options you'll actually get.",
      "No mention of audio equipment — ceremony audio from the venue mic is often poor quality.",
      "Delivery timeline not specified — video editing often takes 3–6 months.",
    ],
    script:
      "Hi [Name], we're interested in your videography services for our [Date] wedding. Could you share your packages, including highlight reel length, raw footage policy, drone availability, music licensing, and expected delivery timeline? Thank you!",
  },
  {
    name: "Florals & Decor",
    questions: [
      "Can we see a mock-up or inspiration board before finalizing the contract?",
      "What is your substitution policy if specific flowers are unavailable seasonally?",
      "Does the quote include setup, breakdown, and any rental fees for vessels or stands?",
      "What happens to the arrangements after the event — can we keep or donate them?",
      "How far in advance do you lock in the final flower order?",
    ],
    redFlags: [
      "Quote by 'feel' rather than itemized stems and labor — you lose price predictability.",
      "No substitution clause — seasonal availability can drastically change your look.",
      "Setup and breakdown not included — these can add hundreds to the final bill.",
    ],
    script:
      "Hi [Name], we're planning our wedding for [Date] with a [style] aesthetic and approximately [X] tables. Could you share a sample itemized quote and let us know your process for mock-ups, substitutions, and setup/breakdown? We'd love to connect!",
  },
  {
    name: "Attire",
    questions: [
      "What is the full timeline from order to final fitting — especially for custom or alterations?",
      "Are alterations included, or are they quoted separately by a different vendor?",
      "What is the rush fee if we're ordering within 6 months of the wedding?",
      "What is the return or cancellation policy if something changes?",
      "Do you offer preservation and cleaning services post-wedding?",
    ],
    redFlags: [
      "Sample size only available — make sure they can order or adjust to your actual measurements.",
      "Alteration costs excluded from the quote — these often add $300–$800 unexpectedly.",
      "No written production timeline — verbal promises about delivery dates aren't enforceable.",
    ],
    script:
      "Hi [Name], I'm looking for [attire type] for my [Date] wedding. Could you walk me through your ordering and alteration timeline, what's included in your pricing, and your policy on rush orders and cancellations?",
  },
  {
    name: "Entertainment",
    questions: [
      "Will you personally perform, or could a substitute DJ/band be assigned to our date?",
      "What equipment do you bring — and is there a backup plan if something fails?",
      "Will you act as MC for announcements, or is that a separate role/fee?",
      "What is the overtime rate if we want to extend the reception?",
      "Can we provide a 'do not play' list, and how much input do we have on the set list?",
    ],
    redFlags: [
      "No performance clause naming the specific performer — agencies can swap DJs last minute.",
      "Equipment list vague — ask exactly what speakers, lights, and backup gear is included.",
      "Overtime rate not specified upfront — this is often $150–$300/hour added at the end.",
    ],
    script:
      "Hi [Name], we're interested in booking you for our [Date] wedding reception for approximately [X] guests at [Venue]. Could you share your package details including equipment, MC services, overtime rates, and how you handle music requests and 'do not play' lists?",
  },
  {
    name: "Hair & Makeup",
    questions: [
      "Do you offer a trial session, and what does it cost?",
      "Can you accommodate our full bridal party — what is your maximum capacity?",
      "What time would you need to start to ensure everyone is ready before the ceremony?",
      "Do you travel to the venue, or is there a travel/parking fee?",
      "What products do you use — are they long-wear and photo-friendly?",
    ],
    redFlags: [
      "No trial offered — seeing your look in person before the day is essential.",
      "Team members not disclosed — ask who specifically will be doing each person's look.",
      "Touch-up kit not included — confirm what happens if you need adjustments after getting ready.",
    ],
    script:
      "Hi [Name], I'm getting married on [Date] and looking for hair and makeup for myself and [X] bridesmaids. Could you share your availability, pricing, timeline for a full party, travel fee, and whether a trial is included or available separately?",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Vendors() {
  const { user, isDemoMode } = useAuth();
  const useApi = !!user && !isDemoMode;

  // ── Demo mode: localStorage ──────────────────────────────────────────────
  const [localVendors, setLocalVendors] = useState<Vendor[]>(() => {
    if (useApi) return [];
    return initVendors();
  });

  const persistLocal = (updated: Vendor[]) => {
    setLocalVendors(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ── API mode: React Query ────────────────────────────────────────────────
  const { data: apiVendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
    enabled: useApi,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Vendor, "id">) =>
      apiRequest("POST", "/api/vendors", data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vendors"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Vendor) =>
      apiRequest("PUT", `/api/vendors/${id}`, data).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vendors"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/vendors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vendors"] }),
  });

  const vendors = useApi ? apiVendors : localVendors;

  const [activeTab, setActiveTab] = useState<"vendors" | "tips">("vendors");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor>(blankVendor("Venue"));
  const [isEditing, setIsEditing] = useState(false);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const booked = vendors.filter((v) => v.status === "booked").length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditVendor(blankVendor(DEFAULT_CATEGORIES[0]));
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditVendor({ ...vendor });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const saveVendor = async () => {
    if (useApi) {
      if (isEditing) {
        const { id, ...data } = editVendor;
        await updateMutation.mutateAsync({ id, ...data });
      } else {
        const { id: _id, ...data } = editVendor;
        await createMutation.mutateAsync(data);
      }
    } else {
      if (isEditing) {
        persistLocal(localVendors.map((v) => (v.id === editVendor.id ? editVendor : v)));
      } else {
        persistLocal([...localVendors, editVendor]);
      }
    }
    setDialogOpen(false);
  };

  const deleteVendor = async (id: string) => {
    if (useApi) {
      await deleteMutation.mutateAsync(id);
    } else {
      persistLocal(localVendors.filter((v) => v.id !== id));
    }
  };

  const updateStatus = async (id: string, status: Vendor["status"]) => {
    const vendor = vendors.find((v) => v.id === id);
    if (!vendor) return;
    if (useApi) {
      await updateMutation.mutateAsync({ ...vendor, status });
    } else {
      persistLocal(localVendors.map((v) => (v.id === id ? { ...v, status } : v)));
    }
  };

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary font-serif">Vendors</h1>
            <p className="text-muted-foreground mt-1">Track vendor status, payments, and get negotiation tips.</p>
          </div>
          {activeTab === "vendors" && (
            <Button onClick={openAdd} className="gap-2 rounded-full self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Add Vendor
            </Button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {(["vendors", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-1.5 rounded-md text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "vendors" ? "My Vendors" : "Vendor Tips"}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            MY VENDORS TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === "vendors" && (
          <>
            {/* Stats */}
            <div className="flex gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">
                  {booked}<span className="text-base text-muted-foreground font-normal">/{vendors.length}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Booked</p>
              </div>
            </div>

            {/* Vendor cards */}
            <div className="space-y-3">
              {vendors.map((vendor) => {
                const expanded = expandedVendor === vendor.id;
                return (
                  <div
                    key={vendor.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Card header row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => setExpandedVendor(expanded ? null : vendor.id)}
                        className="flex-1 flex items-center gap-3 text-left min-w-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{vendor.category}</span>
                            {vendor.vendorName && (
                              <span className="text-muted-foreground text-sm">— {vendor.vendorName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={vendor.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateStatus(vendor.id, e.target.value as Vendor["status"])}
                            className={cn(
                              "text-xs px-2 py-1 rounded-full border font-medium capitalize cursor-pointer",
                              STATUS_STYLES[vendor.status]
                            )}
                          >
                            {STATUS_ORDER.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          {expanded
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(vendor)}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteVendor(vendor.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Contact */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
                            <div className="space-y-1.5">
                              {vendor.contactName && (
                                <p className="text-sm">{vendor.contactName}</p>
                              )}
                              {vendor.email && (
                                <a href={`mailto:${vendor.email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                  <Mail className="w-3.5 h-3.5" /> {vendor.email}
                                </a>
                              )}
                              {vendor.phone && (
                                <a href={`tel:${vendor.phone}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                  <Phone className="w-3.5 h-3.5" /> {vendor.phone}
                                </a>
                              )}
                              {!vendor.contactName && !vendor.email && !vendor.phone && (
                                <p className="text-xs text-muted-foreground italic">No contact info added</p>
                              )}
                            </div>
                          </div>

                          {/* Payments */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payments</p>
                            <div className="space-y-1.5">
                              {(vendor.depositAmount || vendor.depositDue) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Deposit: {vendor.depositAmount && `$${vendor.depositAmount}`} {vendor.depositDue && `due ${vendor.depositDue}`}</span>
                                </div>
                              )}
                              {(vendor.finalAmount || vendor.finalDue) && (
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  <span>Final: {vendor.finalAmount && `$${vendor.finalAmount}`} {vendor.finalDue && `due ${vendor.finalDue}`}</span>
                                </div>
                              )}
                              {!vendor.depositAmount && !vendor.depositDue && !vendor.finalAmount && !vendor.finalDue && (
                                <p className="text-xs text-muted-foreground italic">No payment info added</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {vendor.notes && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{vendor.notes}</p>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(vendor)}
                          className="gap-1.5 text-xs"
                        >
                          <Pencil className="w-3 h-3" /> Edit Details
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════
            VENDOR TIPS TAB
        ════════════════════════════════════════════════════════ */}
        {activeTab === "tips" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Use these scripts and questions to walk into every vendor conversation confident and informed.
            </p>

            {VENDOR_TIPS.map((tip) => {
              const open = expandedTip === tip.name;
              return (
                <div
                  key={tip.name}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedTip(open ? null : tip.name)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="font-semibold text-foreground">{tip.name}</span>
                    {open
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                  </button>

                  {open && (
                    <div className="border-t border-border px-5 py-5 space-y-6">
                      {/* Questions */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          <p className="text-sm font-semibold">Questions to ask</p>
                        </div>
                        <ul className="space-y-2">
                          {tip.questions.map((q, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Red flags */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          <p className="text-sm font-semibold">Red flags to watch for</p>
                        </div>
                        <ul className="space-y-2">
                          {tip.redFlags.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sample script */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                          <p className="text-sm font-semibold">Sample first-contact message</p>
                        </div>
                        <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground leading-relaxed italic">
                          "{tip.script}"
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add / Edit Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {isEditing ? `Edit ${editVendor.category}` : "Add Vendor"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Category + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g. Photography"
                    value={editVendor.category}
                    onChange={(e) => setEditVendor((v) => ({ ...v, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select
                    value={editVendor.status}
                    onChange={(e) => setEditVendor((v) => ({ ...v, status: e.target.value as Vendor["status"] }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {STATUS_ORDER.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Vendor + Contact names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Vendor / Business Name</Label>
                  <Input
                    placeholder="e.g. Jane Smith Photography"
                    value={editVendor.vendorName}
                    onChange={(e) => setEditVendor((v) => ({ ...v, vendorName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Name</Label>
                  <Input
                    placeholder="e.g. Jane Smith"
                    value={editVendor.contactName}
                    onChange={(e) => setEditVendor((v) => ({ ...v, contactName: e.target.value }))}
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="hello@vendor.com"
                    value={editVendor.email}
                    onChange={(e) => setEditVendor((v) => ({ ...v, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={editVendor.phone}
                    onChange={(e) => setEditVendor((v) => ({ ...v, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Deposit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Deposit Amount ($)</Label>
                  <Input
                    placeholder="e.g. 1500"
                    value={editVendor.depositAmount}
                    onChange={(e) => setEditVendor((v) => ({ ...v, depositAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Deposit Due Date</Label>
                  <Input
                    type="date"
                    value={editVendor.depositDue}
                    onChange={(e) => setEditVendor((v) => ({ ...v, depositDue: e.target.value }))}
                  />
                </div>
              </div>

              {/* Final payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Final Amount ($)</Label>
                  <Input
                    placeholder="e.g. 4500"
                    value={editVendor.finalAmount}
                    onChange={(e) => setEditVendor((v) => ({ ...v, finalAmount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Final Payment Due</Label>
                  <Input
                    type="date"
                    value={editVendor.finalDue}
                    onChange={(e) => setEditVendor((v) => ({ ...v, finalDue: e.target.value }))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="e.g. Follow up by April 15, prefer silver linens"
                  value={editVendor.notes}
                  onChange={(e) => setEditVendor((v) => ({ ...v, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveVendor} className="rounded-full px-6">
                {isEditing ? "Save Changes" : "Add Vendor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
