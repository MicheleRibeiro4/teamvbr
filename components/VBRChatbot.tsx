
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import OpenAI from "openai";

// Chave fornecida explicitamente para fallback
const API_KEY = process.env.API_KEY || "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";

const VBRChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  
  // Mensagens do UI
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Olá! Sou o Assistente IA do Team VBR. Como posso ajudar na sua evolução hoje?' }
  ]);
  
  // Histórico para a API (Mantendo formato original para compatibilidade local, mas convertido no envio)
  const historyRef = useRef<{ role: "system" | "user" | "assistant"; content: string }[]>([
    { role: 'system', content: 'Você é o Assistente Virtual Oficial do Team VBR Rhino. Seu tom é profissional, motivador e técnico. Você é um expert em musculação, nutrição esportiva e fisiologia. Ajude o usuário com dúvidas sobre seus protocolos, exercícios e dieta. Sempre incentive a disciplina e a constância.' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Atualiza UI
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    // Atualiza histórico local
    historyRef.current.push({ role: 'user', content: userMessage });

    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true
      });
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: historyRef.current.map(m => ({ role: m.role as any, content: m.content })),
      });
      
      const fullText = completion.choices[0].message.content || "Não consegui processar a resposta.";
      
      setMessages(prev => [...prev, { role: 'model', text: fullText }]);
      
      // Salva a resposta completa no histórico local
      historyRef.current.push({ role: 'assistant', content: fullText });

    } catch (error: any) {
      console.error("Erro Chatbot:", error);
      const errorMessage = 'Desculpe, tive um problema de conexão. Verifique sua chave API.';
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-[100] w-16 h-16 bg-[#d4af37] text-black rounded-full shadow-[0_0_30px_rgba(212,175,55,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        <MessageSquare size={28} />
        <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black px-2 py-1 rounded-full border border-black animate-bounce">AI</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 left-8 z-[100] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${isMinimized ? 'h-16 w-64' : 'h-[600px] w-[380px]'}`}>
      <div className="p-4 bg-[#d4af37] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-[#d4af37]">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-black leading-none">Team VBR</h3>
            <p className="text-[8px] font-bold text-black/60 uppercase">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="text-black/60 hover:text-black">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-white/5 border-white/10 text-white' : 'bg-[#d4af37]/10 border-[#d4af37]/20 text-[#d4af37]'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user' ? 'bg-white/10 text-white rounded-tr-none' : 'bg-[#d4af37]/5 text-white/80 border border-[#d4af37]/10 rounded-tl-none'}`}>
                    {msg.text || (isLoading && idx === messages.length - 1 ? <Loader2 size={14} className="animate-spin text-[#d4af37]" /> : '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/40">
            <div className="relative">
              <input
                type="text"
                placeholder="Pergunte algo..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-1 focus:ring-[#d4af37] outline-none text-white font-bold"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d4af37] text-black rounded-lg flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VBRChatbot;
