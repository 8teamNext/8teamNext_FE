import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, Trash2, ChevronLeft, MessagesSquare, X } from "lucide-react";
import { api, ChatSession, ChatMessage, UserProfile } from "../utils/api";

// ── 이미지 상태 타입 ──────────────────────────────────────────────────────
type BotImageState = "basic" | "thinking" | "attention" | "complete" | "hello" | "sentiment";

const BOT_IMGS: Record<BotImageState, string> = {
  basic:     "/chatbot/basic.png",
  thinking:  "/chatbot/thinking.png",
  attention: "/chatbot/attention.png",
  complete:  "/chatbot/complete.png",
  hello:     "/chatbot/hello.png",
  sentiment: "/chatbot/sentiment.png",
};

// ── 응답 내용 기반 이미지 추론 ───────────────────────────────────────────
function inferBotImage(content: string, isFirstAssistant: boolean): BotImageState {
  if (isFirstAssistant) return "hello";
  if (
    content.includes("오류가 발생") ||
    content.includes("죄송합니다") ||
    content.includes("범위 밖") ||
    content.includes("지원하지 않습니다") ||
    content.includes("알 수 없습니다")
  )
    return "attention";
  if (
    content.includes("화이팅") ||
    content.includes("응원") ||
    content.includes("힘내") ||
    content.includes("걱정하지") ||
    content.includes("잘 하실")
  )
    return "sentiment";
  if (
    content.includes("완료") ||
    content.includes("축하") ||
    content.includes("훌륭")
  )
    return "complete";
  return "basic";
}

// ── 봇 아바타 컴포넌트 ────────────────────────────────────────────────────
function BotAvatar({ state, size = 28 }: { state: BotImageState; size?: number }) {
  return (
    <img
      src={BOT_IMGS[state]}
      alt={state}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

// ── 타입 ─────────────────────────────────────────────────────────────────
interface ChatWidgetProps {
  user: UserProfile | null;
}

interface LocalMessage {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  botImage?: BotImageState;
}

const ownerKey = (user: UserProfile | null) => user?.github_username?.trim() ?? "";

// ── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function ChatWidget({ user }: ChatWidgetProps) {
  const [isOpen, setIsOpen]               = useState(false);
  const [showSessions, setShowSessions]   = useState(false);
  const [sessions, setSessions]           = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages]           = useState<LocalMessage[]>([]);
  const [input, setInput]                 = useState("");
  const [sending, setSending]             = useState(false);
  const [fabImage, setFabImage]           = useState<BotImageState>("basic");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fabTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const owner     = ownerKey(user);
  const isLoggedIn = !!owner;

  // FAB 이미지: 일정 시간 후 basic으로 복귀
  const setFabTimed = useCallback((img: BotImageState, revertMs?: number) => {
    if (fabTimerRef.current) clearTimeout(fabTimerRef.current);
    setFabImage(img);
    if (revertMs) {
      fabTimerRef.current = setTimeout(() => setFabImage("basic"), revertMs);
    }
  }, []);

  useEffect(() => () => { if (fabTimerRef.current) clearTimeout(fabTimerRef.current); }, []);

  // ── 패널 토글 ──────────────────────────────────────────────────────────
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        setFabTimed("hello", 1500);
        setShowSessions(false);
      } else {
        setFabTimed("basic");
      }
      return !prev;
    });
  }, [setFabTimed]);

  // ── 세션 목록 로드 ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    if (!owner) return;
    try { setSessions(await api.chatListSessions(owner)); }
    catch { setSessions([]); }
  }, [owner]);

  useEffect(() => {
    if (isOpen && isLoggedIn) loadSessions();
  }, [isOpen, isLoggedIn, loadSessions]);

  // ── 세션 선택 → 메시지 로드 ─────────────────────────────────────────────
  const selectSession = useCallback(async (session: ChatSession) => {
    setCurrentSession(session);
    setShowSessions(false);
    setMessages([]);
    try {
      const msgs = await api.chatGetMessages(session.session_id);
      let assistantIdx = 0;
      setMessages(
        msgs.map((m: ChatMessage) => {
          if (m.role === "assistant") {
            const isFirst = assistantIdx === 0;
            assistantIdx++;
            return { role: m.role, content: m.content, botImage: inferBotImage(m.content, isFirst) };
          }
          return { role: m.role as "user", content: m.content };
        }),
      );
    } catch { setMessages([]); }
  }, []);

  // ── 새 세션 생성 ─────────────────────────────────────────────────────────
  const createSession = useCallback(async () => {
    if (!owner) return;
    try {
      const session = await api.chatCreateSession(owner);
      setSessions((prev) => [session, ...prev]);
      setCurrentSession(session);
      setMessages([]);
      setShowSessions(false);
    } catch { /* ignore */ }
  }, [owner]);

  // ── 세션 삭제 ────────────────────────────────────────────────────────────
  const deleteSession = useCallback(
    async (e: React.MouseEvent, sessionId: number) => {
      e.stopPropagation();
      try {
        await api.chatDeleteSession(sessionId);
        setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
        if (currentSession?.session_id === sessionId) { setCurrentSession(null); setMessages([]); }
      } catch { /* ignore */ }
    },
    [currentSession],
  );

  // ── 메시지 전송 ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    let session = currentSession;
    if (!session) {
      try {
        session = await api.chatCreateSession(owner);
        setSessions((prev) => [session!, ...prev]);
        setCurrentSession(session);
      } catch { return; }
    }

    const isFirstAssistant = messages.filter((m) => m.role === "assistant").length === 0;

    setInput("");
    setSending(true);
    setFabTimed("thinking");

    // 낙관적 UI: thinking 상태 말풍선 즉시 표시
    setMessages((prev) => [
      ...prev,
      { role: "user",      content: text },
      { role: "assistant", content: "", pending: true, botImage: "thinking" },
    ]);

    try {
      const resp = await api.chatSendMessage(session.session_id, text);
      const img  = inferBotImage(resp.content, isFirstAssistant);
      setMessages((prev) => {
        const next = [...prev];
        const idx  = next.findLastIndex((m) => m.pending);
        if (idx !== -1) next[idx] = { role: "assistant", content: resp.content, botImage: img };
        return next;
      });
      setFabTimed("complete", 2000);
      await loadSessions();
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const idx  = next.findLastIndex((m) => m.pending);
        if (idx !== -1)
          next[idx] = { role: "assistant", content: "죄송합니다, 오류가 발생했습니다.", botImage: "attention" };
        return next;
      });
      setFabTimed("attention", 2500);
    } finally {
      setSending(false);
    }
  }, [input, sending, currentSession, owner, messages, loadSessions, setFabTimed]);

  // ── 스크롤 자동 이동 ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── 헤더 아바타: 전송 중이면 thinking, 아니면 현재 fabImage ──────────────
  const headerAvatar: BotImageState = sending ? "thinking" : fabImage === "thinking" ? "basic" : fabImage;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* ── 채팅 패널 ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: 380, height: 560, background: "#ffffff", border: "1px solid #e4e4e7" }}
        >
          {/* 헤더 */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)" }}
          >
            <div className="flex items-center gap-2">
              {showSessions ? (
                <button
                  onClick={() => setShowSessions(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <ChevronLeft size={18} />
                </button>
              ) : (
                <BotAvatar state={headerAvatar} size={26} />
              )}
              <span className="text-white font-semibold text-sm">
                {showSessions ? "대화 목록" : "AI 도우미"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!showSessions && isLoggedIn && (
                <button
                  onClick={() => setShowSessions(true)}
                  className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
                  title="대화 목록"
                >
                  <MessagesSquare size={16} />
                </button>
              )}
              <button
                onClick={toggleOpen}
                className="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {!isLoggedIn ? (
              /* 로그인 안내 */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                <BotAvatar state="attention" size={72} />
                <p className="text-sm text-zinc-500 leading-relaxed">
                  AI 도우미를 사용하려면
                  <br />
                  마이페이지에서 GitHub 사용자명을
                  <br />
                  등록해 주세요.
                </p>
              </div>
            ) : showSessions ? (
              /* 세션 목록 */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 shrink-0">
                  <button
                    onClick={createSession}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-white transition"
                    style={{ background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)" }}
                  >
                    <Plus size={15} />
                    새 대화 시작
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1.5">
                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 mt-8">
                      <BotAvatar state="basic" size={56} />
                      <p className="text-xs text-zinc-400">대화 내역이 없습니다.</p>
                    </div>
                  ) : (
                    sessions.map((s) => (
                      <button
                        key={s.session_id}
                        onClick={() => selectSession(s)}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition ${
                          currentSession?.session_id === s.session_id
                            ? "bg-green-50 text-green-800 font-medium"
                            : "hover:bg-zinc-50 text-zinc-700"
                        }`}
                      >
                        <span className="truncate flex-1">{s.title}</span>
                        <button
                          onClick={(e) => deleteSession(e, s.session_id)}
                          className="shrink-0 p-1 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-300 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* 메시지 영역 */
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                    <BotAvatar state="hello" size={80} />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      AI Career Copilot 사용법이나
                      <br />
                      기능에 대해 물어보세요!
                    </p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="shrink-0 mt-0.5">
                        <BotAvatar state={msg.botImage ?? "basic"} size={30} />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-zinc-50 text-zinc-800 rounded-tl-sm border border-zinc-100"
                      }`}
                      style={
                        msg.role === "user"
                          ? { background: "linear-gradient(135deg, #16A34A, #22C55E)" }
                          : undefined
                      }
                    >
                      {msg.pending ? (
                        <span className="flex gap-1 items-center py-0.5">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 입력 영역 */}
          {isLoggedIn && !showSessions && (
            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-zinc-100">
              <div className="flex items-end gap-2 bg-zinc-50 rounded-xl px-3 py-2 border border-zinc-200 focus-within:border-green-400 transition">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="질문을 입력하세요... (Enter 전송)"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none bg-transparent text-xs text-zinc-800 placeholder-zinc-400 outline-none leading-relaxed max-h-24 overflow-y-auto"
                  style={{ minHeight: 20 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #16A34A, #22C55E)" }}
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FAB: 캐릭터 이미지 ──────────────────────────────────────────── */}
      <button
        onClick={toggleOpen}
        className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{
          background: "#f0fdf4",
          boxShadow: "0 4px 20px rgba(22, 163, 74, 0.30)",
        }}
        aria-label="AI 도우미"
      >
        <img
          src={BOT_IMGS[fabImage]}
          alt="AI 도우미"
          className="w-12 h-12 object-contain"
          style={{ transition: "opacity 0.2s" }}
        />
      </button>
    </div>
  );
}
