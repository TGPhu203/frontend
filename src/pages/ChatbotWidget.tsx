// src/pages/ChatbotWidget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8888";

type ChatMessage = {
    id: string;
    from: "user" | "bot";
    text: string;
    createdAt: string;
};

type BotResponse = {
    response: string;
    suggestions?: string[];
};

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Lấy sessionId + user từ localStorage
    useEffect(() => {
        // session cho chatbot
        let sid = localStorage.getItem("chatbot_session_id");
        if (!sid) {
            sid = uuidv4();
            localStorage.setItem("chatbot_session_id", sid);
        }
        setSessionId(sid);

        // lấy user từ localStorage (Auth.tsx đã lưu key "user")
        try {
            const raw = localStorage.getItem("user");
            if (raw) {
                const u = JSON.parse(raw);
                setCurrentUser(u);
            }
        } catch {
            // ignore parse error
        }
    }, []);

    // auto scroll xuống cuối khi có message mới
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const pushMessage = (msg: ChatMessage) => {
        setMessages((prev) => [...prev, msg]);
    };

    const handleSend = async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content) return;
        if (!sessionId) return;

        // thêm tin nhắn user
        const userMsg: ChatMessage = {
            id: `${Date.now()}-user`,
            from: "user",
            text: content,
            createdAt: new Date().toISOString(),
        };
        pushMessage(userMsg);
        setInput("");
        setSuggestions([]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/chatbot/message`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: content,
                    sessionId,
                    userId: currentUser?._id || currentUser?.id, // đọc từ localStorage
                    context: {
                        source: "web_chat",
                    },
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.message || "Chatbot lỗi, vui lòng thử lại");
            }

            const data: BotResponse =
                json.data ||
                json ||
                ({
                    response: "Xin lỗi, tôi chưa xử lý được yêu cầu này.",
                } as BotResponse);

            const botMsg: ChatMessage = {
                id: `${Date.now()}-bot`,
                from: "bot",
                text: data.response,
                createdAt: new Date().toISOString(),
            };

            pushMessage(botMsg);
            setSuggestions(data.suggestions || []);
        } catch (err: any) {
            console.error("Chatbot error:", err);
            toast.error(err.message || "Không gửi được tin nhắn");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Nút bật chat ở góc phải dưới */}
            <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
                {open && (
                    <Card className="w-80 sm:w-96 h-[420px] flex flex-col shadow-xl border-primary/20">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b bg-primary text-primary-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">
                                        Trợ lý mua sắm Trường Phúc
                                    </span>
                                    <span className="text-[11px] opacity-80">
                                        Hỏi về sản phẩm, đơn hàng, khuyến mãi...
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-primary-foreground"
                                onClick={() => setOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Vùng chat */}
                        <div className="flex-1 flex flex-col">
                            <ScrollArea className="px-3 py-2 h-64">
                                <div className="space-y-3 text-sm">
                                    {messages.length === 0 && (
                                        <div className="text-xs text-muted-foreground bg-slate-50 border border-dashed border-slate-200 rounded-md p-3">
                                            <p className="font-medium mb-1">
                                                Xin chào! Tôi có thể giúp gì cho bạn?
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Tìm sản phẩm theo nhu cầu</li>
                                                <li>Hỏi về bảo hành, sửa chữa</li>
                                                <li>Kiểm tra ưu đãi, mã giảm giá</li>
                                            </ul>
                                        </div>
                                    )}

                                    {messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap ${m.from === "user"
                                                        ? "bg-primary text-primary-foreground rounded-br-sm"
                                                        : "bg-slate-100 text-slate-900 rounded-bl-sm"
                                                    }`}
                                            >
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={bottomRef} />
                                </div>
                            </ScrollArea>

                            {/* Gợi ý nhanh */}
                            {suggestions.length > 0 && (
                                <div className="px-3 pb-2 flex flex-wrap gap-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            className="text-[11px] px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                            onClick={() => handleSend(s)}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Input */}
                            <div className="px-3 py-2 border-t bg-background flex items-center gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="text-sm"
                                    disabled={loading}
                                />
                                <Button
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                >
                                    {loading ? (
                                        <span className="text-xs">...</span>
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                <Button
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg"
                    onClick={() => setOpen((v) => !v)}
                >
                    <MessageCircle className="h-5 w-5" />
                </Button>
            </div>
        </>
    );
}
