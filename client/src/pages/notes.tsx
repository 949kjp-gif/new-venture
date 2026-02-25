import { useState, useEffect, useRef, useCallback } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGoogleDrive, type Note } from "@/hooks/use-google-drive";
import {
  Plus, Search, Trash2, HardDrive, RefreshCw, FileText,
  Tag, ChevronLeft, Check, CloudOff,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "wedagent_notes";

const NOTE_TAGS = [
  "Vendor Meeting",
  "Venue",
  "Budget",
  "Timeline",
  "Personal",
  "To-Do",
] as const;

const TAG_COLORS: Record<string, string> = {
  "Vendor Meeting": "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  "Venue":         "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  "Budget":        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
  "Timeline":      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
  "Personal":      "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700",
  "To-Do":         "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");
  const [justSaved, setJustSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const drive = useGoogleDrive();

  // Persist notes to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  const filteredNotes = notes
    .filter((n) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // Debounced auto-save to localStorage
  const autoSave = useCallback(
    (id: string, title: string, content: string, tags: string[]) => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, title, content, tags, updatedAt: new Date().toISOString() }
              : n
          )
        );
      }, 400);
    },
    []
  );

  const selectNote = (note: Note) => {
    setSelectedId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags);
    setMobileView("editor");
  };

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    selectNote(note);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setEditTitle("");
      setEditContent("");
      setEditTags([]);
      setMobileView("list");
    }
  };

  const handleTitleChange = (v: string) => {
    setEditTitle(v);
    if (selectedId) autoSave(selectedId, v, editContent, editTags);
  };

  const handleContentChange = (v: string) => {
    setEditContent(v);
    if (selectedId) autoSave(selectedId, editTitle, v, editTags);
  };

  const toggleTag = (tag: string) => {
    const newTags = editTags.includes(tag)
      ? editTags.filter((t) => t !== tag)
      : [...editTags, tag];
    setEditTags(newTags);
    if (selectedId) autoSave(selectedId, editTitle, editContent, newTags);
  };

  const handleSaveToDrive = async () => {
    const ok = await drive.saveNotes(notes);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  const handleLoadFromDrive = async () => {
    const driveNotes = await drive.loadNotes();
    if (!driveNotes) return;
    // Merge: Drive wins for overlapping IDs, keep local-only notes
    setNotes((prev) => {
      const driveIds = new Set(driveNotes.map((n: Note) => n.id));
      return [
        ...driveNotes,
        ...prev.filter((n) => !driveIds.has(n.id)),
      ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
  };

  return (
    <Shell>
      <div className="flex min-h-screen">
        {/* ── Note List Panel ────────────────────────────────────────────── */}
        <aside
          className={cn(
            "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card shrink-0",
            mobileView === "editor" ? "hidden md:flex" : "flex"
          )}
        >
          {/* Panel header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-serif font-bold text-primary">Notes</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {notes.length} {notes.length === 1 ? "note" : "notes"}
                </p>
              </div>
              <Button size="sm" onClick={createNote} className="gap-1.5 rounded-full h-8 px-3">
                <Plus className="w-3.5 h-3.5" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          {/* Note list */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                <FileText className="w-10 h-10 text-muted-foreground/25 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No notes match your search" : "No notes yet"}
                </p>
                {!search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={createNote}
                    className="mt-3 gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add your first note
                  </Button>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                    selectedId === note.id &&
                      "bg-primary/5 border-l-2 border-l-primary pl-[14px]"
                  )}
                >
                  <p
                    className={cn(
                      "font-medium text-sm truncate",
                      !note.title && "text-muted-foreground italic"
                    )}
                  >
                    {note.title || "Untitled note"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 leading-relaxed">
                    {note.content || "No content"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                          TAG_COLORS[tag] ?? "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* ── Google Drive Section ── */}
          <div className="p-4 border-t border-border bg-background/50 space-y-3">
            {!drive.isConfigured ? (
              <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <CloudOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Set{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                    VITE_GOOGLE_CLIENT_ID
                  </code>{" "}
                  to enable Google Drive sync
                </span>
              </div>
            ) : !drive.isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={drive.connect}
                disabled={!drive.isReady}
                className="w-full gap-2 text-xs"
              >
                <HardDrive className="w-3.5 h-3.5" />
                Connect Google Drive
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      Drive connected
                    </span>
                  </div>
                  <button
                    onClick={drive.disconnect}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Disconnect
                  </button>
                </div>

                {drive.lastSynced && (
                  <p className="text-[11px] text-muted-foreground">
                    Last synced {formatRelativeTime(drive.lastSynced.toISOString())}
                  </p>
                )}

                {drive.syncError && (
                  <p className="text-[11px] text-destructive">{drive.syncError}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveToDrive}
                    disabled={drive.isSyncing}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    {drive.isSyncing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : justSaved ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" /> Saved
                      </>
                    ) : (
                      <>
                        <HardDrive className="w-3 h-3" /> Save to Drive
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadFromDrive}
                    disabled={drive.isSyncing}
                    className="flex-1 gap-1.5 text-xs"
                  >
                    {drive.isSyncing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" /> Load
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </aside>

        {/* ── Editor Panel ───────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex-1 flex flex-col",
            mobileView === "list" ? "hidden md:flex" : "flex"
          )}
        >
          {selectedNote ? (
            <>
              {/* Editor top bar */}
              <div className="px-6 py-3 border-b border-border flex items-center gap-3 bg-background sticky top-0 z-10">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <p className="text-xs text-muted-foreground">
                  Edited {formatRelativeTime(selectedNote.updatedAt)}
                </p>
                <span className="text-xs text-muted-foreground ml-auto">
                  Auto-saved
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNote(selectedNote.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs h-7 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>

              {/* Editor body */}
              <div className="flex-1 p-6 md:p-10 max-w-3xl w-full mx-auto space-y-5 overflow-y-auto">
                {/* Title */}
                <input
                  type="text"
                  placeholder="Note title..."
                  value={editTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-2xl md:text-3xl font-serif font-bold text-primary bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
                />

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {NOTE_TAGS.map((tag) => {
                    const active = editTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                          active
                            ? TAG_COLORS[tag] ?? "bg-primary/10 text-primary border-primary/30"
                            : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-border" />

                {/* Content */}
                <textarea
                  placeholder="Start writing your note..."
                  value={editContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="w-full min-h-[360px] bg-transparent border-none outline-none text-sm leading-7 text-foreground placeholder:text-muted-foreground/40 resize-none"
                />

                {/* Footer meta */}
                <div className="pt-4 border-t border-border/50 flex flex-col gap-1">
                  <p className="text-[11px] text-muted-foreground">
                    Created {formatDate(selectedNote.createdAt)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Last edited {formatDate(selectedNote.updatedAt)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="font-medium text-muted-foreground">Select a note to start editing</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                or create a new one to get started
              </p>
              <Button onClick={createNote} className="mt-6 gap-2 rounded-full">
                <Plus className="w-4 h-4" /> New Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
