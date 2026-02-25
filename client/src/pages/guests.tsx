import { useState, useEffect } from "react";
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
  Plus, Search, Trash2, Users, Check, X, ChevronUp, ChevronDown,
  Utensils, UserCheck, UserX, Clock, FileDown, ClipboardList,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Guest {
  id: string;
  name: string;
  plusOne: boolean;
  rsvp: "pending" | "attending" | "declined";
  dietary: string;
  table: string;
  side: "partner1" | "partner2" | "both";
  notes: string;
}

type SortField = "name" | "rsvp" | "table" | "side";
type RsvpFilter = "all" | "attending" | "declined" | "pending";

const STORAGE_KEY = "wedagent_guests";

const RSVP_STYLES: Record<Guest["rsvp"], string> = {
  attending: "bg-green-100 text-green-800 border-green-200",
  declined:  "bg-red-100 text-red-800 border-red-200",
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const RSVP_ICONS: Record<Guest["rsvp"], React.ReactNode> = {
  attending: <UserCheck className="w-3 h-3" />,
  declined:  <UserX className="w-3 h-3" />,
  pending:   <Clock className="w-3 h-3" />,
};

const SIDE_LABELS: Record<Guest["side"], string> = {
  partner1: "Partner 1",
  partner2: "Partner 2",
  both: "Both sides",
};

function blankGuest(): Guest {
  return {
    id: crypto.randomUUID(),
    name: "",
    plusOne: false,
    rsvp: "pending",
    dietary: "",
    table: "",
    side: "both",
    notes: "",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<RsvpFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest>(blankGuest());
  const [isEditing, setIsEditing] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  }, [guests]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const totalInvited = guests.length + guests.filter((g) => g.plusOne).length;
  const attending = guests.filter((g) => g.rsvp === "attending").length;
  const declined = guests.filter((g) => g.rsvp === "declined").length;
  const pending = guests.filter((g) => g.rsvp === "pending").length;
  const dietaryCount = guests.filter((g) => g.dietary.trim()).length;

  // ── Filtering & sorting ────────────────────────────────────────────────────

  const filtered = guests
    .filter((g) => {
      const q = search.toLowerCase();
      const matchSearch = !search || g.name.toLowerCase().includes(q) || g.table.toLowerCase().includes(q);
      const matchRsvp = rsvpFilter === "all" || g.rsvp === rsvpFilter;
      return matchSearch && matchRsvp;
    })
    .sort((a, b) => {
      let va = a[sortField] as string;
      let vb = b[sortField] as string;
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditGuest(blankGuest());
    setIsEditing(false);
    setDialogOpen(true);
  };

  const openEdit = (guest: Guest) => {
    setEditGuest({ ...guest });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const saveGuest = () => {
    if (!editGuest.name.trim()) return;
    if (isEditing) {
      setGuests((prev) => prev.map((g) => (g.id === editGuest.id ? editGuest : g)));
    } else {
      setGuests((prev) => [...prev, editGuest]);
    }
    setDialogOpen(false);
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const cycleRsvp = (id: string) => {
    const order: Guest["rsvp"][] = ["pending", "attending", "declined"];
    setGuests((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, rsvp: order[(order.indexOf(g.rsvp) + 1) % order.length] }
          : g
      )
    );
  };

  const bulkAddGuests = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const added: Guest[] = [];
    for (const line of lines) {
      const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(",");
      const [rawName, rawRsvp, rawSide, rawTable, rawDietary, ...rest] = parts.map((p) => p.trim());
      if (!rawName) continue;
      const rsvpMap: Record<string, Guest["rsvp"]> = {
        attending: "attending", yes: "attending", confirmed: "attending",
        declined: "declined", no: "declined",
        pending: "pending", maybe: "pending", tbd: "pending",
      };
      const rsvp: Guest["rsvp"] = rsvpMap[rawRsvp?.toLowerCase()] ?? "pending";
      const sideMap: Record<string, Guest["side"]> = {
        partner1: "partner1", p1: "partner1",
        partner2: "partner2", p2: "partner2",
        both: "both",
      };
      const side: Guest["side"] = sideMap[rawSide?.toLowerCase()] ?? "both";
      added.push({
        id: crypto.randomUUID(),
        name: rawName,
        plusOne: false,
        rsvp,
        dietary: rawDietary ?? "",
        table: rawTable ?? "",
        side,
        notes: rest.join(", ").trim(),
      });
    }
    if (added.length === 0) return;
    setGuests((prev) => [...prev, ...added]);
    setBulkText("");
    setBulkDialogOpen(false);
    toast({ title: `Added ${added.length} guest${added.length !== 1 ? "s" : ""}` });
  };

  const exportToCSV = () => {
    const headers = ["Name", "RSVP", "Side", "Table", "Dietary", "Notes", "+1"];
    const rows = guests.map((g) => [
      g.name, g.rsvp, SIDE_LABELS[g.side], g.table, g.dietary, g.notes, g.plusOne ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "guest-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : null;

  return (
    <Shell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary font-serif">Guest List</h1>
            <p className="text-muted-foreground mt-1">Track RSVPs, dietary needs, and table assignments.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setBulkDialogOpen(true)} className="gap-2 rounded-full">
              <ClipboardList className="w-4 h-4" /> Bulk Add
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="gap-2 rounded-full" disabled={guests.length === 0}>
              <FileDown className="w-4 h-4" /> Export CSV
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full text-muted-foreground"
              onClick={() => toast({ title: "Google Drive export coming soon", description: "This feature is currently in development." })}
            >
              <FileDown className="w-4 h-4" /> Drive
            </Button>
            <Button onClick={openAdd} className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> Add Guest
            </Button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Invited", value: totalInvited, icon: <Users className="w-4 h-4" />, color: "text-primary" },
            { label: "Attending", value: attending, icon: <UserCheck className="w-4 h-4" />, color: "text-green-600" },
            { label: "Declined", value: declined, icon: <UserX className="w-4 h-4" />, color: "text-red-600" },
            { label: "Pending", value: pending, icon: <Clock className="w-4 h-4" />, color: "text-yellow-600" },
            { label: "Dietary", value: dietaryCount, icon: <Utensils className="w-4 h-4" />, color: "text-purple-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
              <div className={cn("flex items-center gap-1.5 text-xs font-medium", stat.color)}>
                {stat.icon}
                {stat.label}
              </div>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "attending", "declined", "pending"] as RsvpFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setRsvpFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize",
                  rsvpFilter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                )}
              >
                {f === "all" ? `All (${guests.length})` : f}
              </button>
            ))}
          </div>
        </div>

        {/* ── Guest Table ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-14 h-14 text-muted-foreground/20 mb-4" />
            <p className="font-medium text-muted-foreground">
              {search || rsvpFilter !== "all" ? "No guests match your filters" : "No guests yet"}
            </p>
            {!search && rsvpFilter === "all" && (
              <Button variant="ghost" onClick={openAdd} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Add your first guest
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2.5 border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
              <button className="flex items-center gap-1 hover:text-foreground text-left" onClick={() => toggleSort("name")}>
                Name <SortIcon field="name" />
              </button>
              <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("rsvp")}>
                RSVP <SortIcon field="rsvp" />
              </button>
              <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("table")}>
                Table <SortIcon field="table" />
              </button>
              <button className="flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort("side")}>
                Side <SortIcon field="side" />
              </button>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/50">
              {filtered.map((guest) => (
                <div
                  key={guest.id}
                  className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 sm:gap-4 px-4 py-3 hover:bg-muted/30 transition-colors items-center"
                >
                  {/* Name */}
                  <div>
                    <button
                      onClick={() => openEdit(guest)}
                      className="font-medium text-sm hover:text-primary transition-colors text-left"
                    >
                      {guest.name}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {guest.plusOne && (
                        <span className="text-[10px] text-muted-foreground">+1</span>
                      )}
                      {guest.dietary && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Utensils className="w-2.5 h-2.5" /> {guest.dietary}
                        </span>
                      )}
                      {guest.notes && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{guest.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* RSVP */}
                  <button onClick={() => cycleRsvp(guest.id)} title="Click to cycle RSVP status">
                    <Badge
                      variant="outline"
                      className={cn(
                        "gap-1 cursor-pointer text-xs capitalize",
                        RSVP_STYLES[guest.rsvp]
                      )}
                    >
                      {RSVP_ICONS[guest.rsvp]}
                      {guest.rsvp}
                    </Badge>
                  </button>

                  {/* Table */}
                  <p className="text-sm text-muted-foreground">
                    {guest.table || <span className="italic text-muted-foreground/50">—</span>}
                  </p>

                  {/* Side */}
                  <p className="text-sm text-muted-foreground text-xs">
                    {SIDE_LABELS[guest.side]}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(guest)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bulk Add Dialog ── */}
        <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Bulk Add Guests</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Paste one guest per line. Separate fields with a comma or tab:
              </p>
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono">
                Name, rsvp, side, table, dietary, notes
                <br />
                <span className="opacity-60">e.g. Sarah Johnson, attending, partner1, Table 4, vegan</span>
              </div>
              <p className="text-xs text-muted-foreground">
                RSVP: attending / declined / pending &nbsp;·&nbsp; Side: partner1 / partner2 / both &nbsp;·&nbsp; All fields after Name are optional
              </p>
              <Textarea
                placeholder={"Sarah Johnson, attending, partner1, Table 4, vegan\nMike Chen, pending, partner2\nEmma Davis, attending, both, Table 2, gluten-free"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="font-mono text-sm min-h-[160px]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setBulkDialogOpen(false); setBulkText(""); }}>
                Cancel
              </Button>
              <Button onClick={bulkAddGuests} disabled={!bulkText.trim()} className="rounded-full px-6">
                Add Guests
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Add / Edit Dialog ── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {isEditing ? "Edit Guest" : "Add Guest"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  placeholder="e.g. Sarah Johnson"
                  value={editGuest.name}
                  onChange={(e) => setEditGuest((g) => ({ ...g, name: e.target.value }))}
                />
              </div>

              {/* RSVP + Plus One row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>RSVP Status</Label>
                  <select
                    value={editGuest.rsvp}
                    onChange={(e) => setEditGuest((g) => ({ ...g, rsvp: e.target.value as Guest["rsvp"] }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Side</Label>
                  <select
                    value={editGuest.side}
                    onChange={(e) => setEditGuest((g) => ({ ...g, side: e.target.value as Guest["side"] }))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="both">Both sides</option>
                    <option value="partner1">Partner 1</option>
                    <option value="partner2">Partner 2</option>
                  </select>
                </div>
              </div>

              {/* Table + Dietary row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Table</Label>
                  <Input
                    placeholder="e.g. Table 4 or Magnolia"
                    value={editGuest.table}
                    onChange={(e) => setEditGuest((g) => ({ ...g, table: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Dietary Needs</Label>
                  <Input
                    placeholder="e.g. Vegan, Gluten-free"
                    value={editGuest.dietary}
                    onChange={(e) => setEditGuest((g) => ({ ...g, dietary: e.target.value }))}
                  />
                </div>
              </div>

              {/* Plus One */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setEditGuest((g) => ({ ...g, plusOne: !g.plusOne }))}
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                    editGuest.plusOne ? "bg-primary border-primary" : "border-input"
                  )}
                >
                  {editGuest.plusOne && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <span className="text-sm text-muted-foreground">Bringing a +1</span>
              </label>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="e.g. Bride's college roommate, seat near family"
                  value={editGuest.notes}
                  onChange={(e) => setEditGuest((g) => ({ ...g, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveGuest} disabled={!editGuest.name.trim()} className="rounded-full px-6">
                {isEditing ? "Save Changes" : "Add Guest"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
