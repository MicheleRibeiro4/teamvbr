
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const VBRChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Olá! Sou o Assistente IA do Team VBR. Como posso ajudar na sua evolução hoje?' }
  ]);
  
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
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    historyRef.current.push({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = historyRef.current.find(m => m.role === 'system')?.content || '';
      
      const historyForGemini = historyRef.current
        .filter(m => m.role !== 'system' && m.content !== userMessage)
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history: historyForGemini,
        config: { systemInstruction: systemInstruction }
      });
      
      const result = await chat.sendMessage({ message: userMessage });
      const fullText = result.text;
      setMessages(prev => [...prev, { role: 'model', text: fullText }]);
      historyRef.current.push({ role: 'assistant', content: fullText });
    } catch (error: any) {
      console.error("Erro Chatbot:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um problema de conexão com a IA. Por favor, verifique se a API Key está configurada corretamente e tente novamente.' }]);
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
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-[#d4af37]/5 text-white/80 border border-[#d4af37]/10'}`}>
                    {msg.text}
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
              <button onClick={handleSendMessage} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d4af37] text-black rounded-lg flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50">
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