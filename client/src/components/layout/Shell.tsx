import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Calculator, FileText, Sparkles,
  ClipboardList, ChevronLeft, ChevronRight, MessageSquare, Send, X,
  LogOut, ArrowRight, NotebookPen, Users, Building2, Home, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { OnboardingTour } from "@/components/OnboardingTour";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const STUB_RESPONSES = [
  "AI assistant coming soon — ask anything about your wedding budget and I'll help you plan smarter.",
  "Great question! Our AI is being trained on thousands of real wedding budgets. Stay tuned for personalized advice.",
  "I'm a preview of your AI wedding CFO. Full answers coming soon — I'll help you negotiate vendor quotes and spot hidden fees.",
  "Vendor negotiations can be tricky — soon I'll walk you through how to read contracts and spot hidden fees.",
  "Budget overruns happen — once fully trained, I'll suggest smart trade-offs based on your priorities.",
];

// ─── Shell Component ───────────────────────────────────────────────────────────

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hiddenLinks, setHiddenLinks] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("wedagent_hidden_nav") || "[]"); }
    catch { return []; }
  });
  const [showHidden, setShowHidden] = useState(false);
  const { user, logoutMutation, isDemoMode, exitDemoMode } = useAuth();

  useEffect(() => {
    localStorage.setItem("wedagent_hidden_nav", JSON.stringify(hiddenLinks));
  }, [hiddenLinks]);

  // Desktop right-side chat panel
  const [chatPanelOpen, setChatPanelOpen] = useState(true);

  // Mobile bottom drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your WedAgent AI assistant. Ask me anything about your wedding budget, vendor negotiations, or planning timeline. (Full AI coming soon!)",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [stubIdx, setStubIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const links = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Budget Dashboard", icon: LayoutDashboard },
    { href: "/builder", label: "Budget Builder", icon: Calculator },
    { href: "/quote-normalizer", label: "Quote Analysis", icon: FileText },
    { href: "/planning", label: "Milestone Checklist", icon: ClipboardList },
    { href: "/vendors", label: "Vendors", icon: Building2 },
    { href: "/guests", label: "Guest List", icon: Users },
    { href: "/notes", label: "Notes", icon: NotebookPen },
  ];

  const sendMessage = (targetInput?: string) => {
    const text = (targetInput ?? chatInput).trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text };
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      text: STUB_RESPONSES[stubIdx % STUB_RESPONSES.length],
    };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setStubIdx((i) => i + 1);
    setChatInput("");
  };

  // ── Chat UI (reused in panel & drawer) ──────────────────────────────────────
  const ChatMessages = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {chatMessages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm border border-border"
            )}
          >
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );

  const ChatInput = ({ onSend }: { onSend: () => void }) => (
    <div className="p-3 border-t border-border">
      <div className="flex gap-2">
        <Input
          placeholder="Ask about your wedding..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSend(); }}
          className="flex-1 text-sm h-9"
        />
        <Button size="icon" onClick={onSend} className="rounded-full shrink-0 h-9 w-9">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase tracking-wider">
        AI responses are stubs — full AI coming soon
      </p>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-background flex text-foreground">
      {/* ── Onboarding Tour ── */}
      <OnboardingTour />

      {/* ── Left Sidebar ── */}
      <aside
        className={cn(
          "border-r border-border bg-card hidden md:flex flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        {/* Logo */}
        <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "px-5")}>
          <Link href="/">
            <a className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5 text-accent shrink-0" />
              {!collapsed && (
                <span className="font-serif text-xl font-bold tracking-tight">WedAgent</span>
              )}
            </a>
          </Link>
        </div>

        {/* Nav links */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>
          {links
            .filter((link) => !hiddenLinks.includes(link.href))
            .map((link) => {
              const active = location === link.href;
              const Icon = link.icon;
              return (
                <div key={link.href} className="relative group/nav">
                  <Link href={link.href}>
                    <a
                      className={cn(
                        "flex items-center rounded-md transition-colors",
                        collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2 pr-7",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={collapsed ? link.label : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="font-medium text-sm">{link.label}</span>}
                    </a>
                  </Link>
                  {!collapsed && (
                    <button
                      onClick={() => setHiddenLinks((prev) => [...prev, link.href])}
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/nav:opacity-100 p-1 rounded text-muted-foreground/50 hover:text-muted-foreground transition-all"
                      title={`Hide ${link.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Show hidden pages */}
        {!collapsed && hiddenLinks.length > 0 && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setShowHidden((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-left px-3 py-1.5"
            >
              {showHidden ? "▴" : "▾"} Hidden pages ({hiddenLinks.length})
            </button>
            {showHidden && (
              <div className="mt-1 space-y-0.5">
                {hiddenLinks.map((href) => {
                  const link = links.find((l) => l.href === href);
                  if (!link) return null;
                  return (
                    <div key={href} className="flex items-center justify-between px-3 py-1 rounded hover:bg-muted/50">
                      <span className="text-xs text-muted-foreground">{link.label}</span>
                      <button
                        onClick={() => setHiddenLinks((prev) => prev.filter((h) => h !== href))}
                        className="text-xs text-primary hover:text-primary/80 transition-colors p-0.5"
                        title={`Restore ${link.label}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom: user + collapse */}
        <div className={cn("p-4 border-t border-border space-y-2", collapsed ? "flex flex-col items-center" : "")}>
          {isDemoMode ? (
            <>
              {!collapsed && (
                <p className="text-xs text-muted-foreground px-1">Viewing demo</p>
              )}
              <Link href="/auth">
                <a
                  onClick={exitDemoMode}
                  className={cn(
                    "flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors w-full",
                    collapsed ? "justify-center" : ""
                  )}
                  title="Get Started"
                >
                  <ArrowRight className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>Get Started</span>}
                </a>
              </Link>
            </>
          ) : (
            <>
              {!collapsed && user && (
                <p className="text-xs text-muted-foreground truncate px-1">
                  Signed in as <span className="font-medium text-foreground">{user.username}</span>
                </p>
              )}
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full"
                title="Log out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!collapsed && <span>Log out</span>}
              </button>
            </>
          )}

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight className="w-4 h-4" />
              : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              )
            }
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto relative min-w-0">
        {/* Demo mode top bar (desktop) */}
        {isDemoMode && (
          <div className="hidden md:flex sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border items-center justify-between px-6 py-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Demo mode</span> — explore the app freely
            </p>
            <Link href="/auth">
              <a onClick={exitDemoMode}>
                <Button size="sm" className="rounded-full px-5 gap-1.5">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </Link>
          </div>
        )}

        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-border bg-card flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-primary">
              <Sparkles className="w-5 h-5 text-accent" />
              WedAgent
            </a>
          </Link>
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            {isDemoMode ? (
              <Link href="/auth">
                <a onClick={exitDemoMode} className="flex items-center gap-1 font-medium text-primary">
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  title="Open AI chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-1 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Log out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {children}
      </main>

      {/* ── Right Chat Panel (desktop) ── */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-l border-border bg-card transition-all duration-200 shrink-0",
          chatPanelOpen ? "w-72" : "w-10"
        )}
      >
        {chatPanelOpen ? (
          <>
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-serif font-semibold text-primary leading-tight">WedAgent AI</p>
                  <p className="text-[10px] text-muted-foreground">Your planning assistant</p>
                </div>
              </div>
              <button
                onClick={() => setChatPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Collapse chat"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <ChatMessages />

            {/* Input */}
            <ChatInput onSend={() => sendMessage()} />
          </>
        ) : (
          /* Collapsed tab */
          <button
            onClick={() => setChatPanelOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            title="Open AI chat"
          >
            <MessageSquare className="w-4 h-4" />
            <ChevronLeft className="w-3 h-3" />
          </button>
        )}
      </aside>

      {/* ── Mobile Chat Drawer ── */}
      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen} direction="bottom">
        <DrawerContent className="max-h-[80vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-base font-serif">WedAgent AI</DrawerTitle>
                <p className="text-xs text-muted-foreground">Your wedding planning assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileDrawerOpen(false)} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </DrawerHeader>
          <ChatMessages />
          <ChatInput onSend={() => { sendMessage(); }} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
