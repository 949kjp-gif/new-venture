import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Calculator, FileText, Sparkles,
  ClipboardList, ChevronLeft, ChevronRight, MessageSquare, Send, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

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
];

// ─── Shell Component ───────────────────────────────────────────────────────────

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your WedAgent AI assistant. Ask me anything about your wedding budget, vendor negotiations, or planning timeline. (Full AI coming soon!)",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [stubIdx, setStubIdx] = useState(0);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/builder", label: "Budget Builder", icon: Calculator },
    { href: "/quote-normalizer", label: "Quote Normalizer", icon: FileText },
    { href: "/planning", label: "Planning", icon: ClipboardList },
  ];

  const sendMessage = () => {
    const text = chatInput.trim();
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

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "border-r border-border bg-card hidden md:flex flex-col transition-all duration-200",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "px-6")}>
          <Link href="/">
            <a className="flex items-center gap-2 text-primary">
              <Sparkles className="w-6 h-6 text-accent shrink-0" />
              {!collapsed && (
                <span className="font-serif text-2xl font-bold tracking-tight">WedAgent</span>
              )}
            </a>
          </Link>
        </div>

        {/* Nav links */}
        <nav className={cn("flex-1 space-y-2", collapsed ? "px-2" : "px-4")}>
          {links.map((link) => {
            const active = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "flex items-center rounded-md transition-colors",
                    collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2",
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
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className={cn("p-4 border-t border-border", collapsed ? "flex justify-center" : "")}>
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
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile header */}
        <div className="md:hidden p-4 border-b border-border bg-card flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-primary">
              <Sparkles className="w-5 h-5 text-accent" />
              WedAgent
            </a>
          </Link>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard"><a className={location === "/dashboard" ? "text-primary" : ""}>Menu</a></Link>
          </div>
        </div>

        {children}
      </main>

      {/* ── Floating Chat Button ── */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all duration-200"
        title="Open AI assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* ── Chat Drawer ── */}
      <Drawer open={chatOpen} onOpenChange={setChatOpen} direction="bottom">
        <DrawerContent className="max-h-[80vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <DrawerTitle className="text-base font-serif">WedAgent AI</DrawerTitle>
                <p className="text-xs text-muted-foreground">Your wedding planning assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="rounded-full">
              <X className="w-4 h-4" />
            </Button>
          </DrawerHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-border"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask anything about your wedding budget..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} className="rounded-full shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2 uppercase tracking-wider">
              AI responses are stubs — full AI coming soon
            </p>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
