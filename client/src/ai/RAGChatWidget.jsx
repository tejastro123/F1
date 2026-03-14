import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, SectionHeader } from '../components/ui';

export default function RAGChatWidget() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your F1 AI assistant. Ask me anything about the 2026 regulations or F1 history.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Logic would call the nlp-service/RAG API
      const response = await fetch('http://localhost:8003/commentary/stream?state=' + encodeURIComponent(input), {
          method: 'GET'
      });
      // Stream handling would go here. For now, we mock.
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: 'The 2026 regulations represent a major shift towards sustainability and increased power. [Mocked Response]' }]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      <SectionHeader title="F1 Knowledge AI" subtitle="Powered by Claude 3.5 & RAG" />
      
      <Card className="max-w-4xl mx-auto h-[600px] flex flex-col bg-slate-800 border-slate-700">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-f1-red text-white' : 'bg-slate-700 text-slate-100'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-slate-500 text-sm animate-pulse italic">Claude is thinking...</div>}
        </div>
        
        <div className="p-4 border-t border-slate-700 flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about 2026 regulations..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-f1-red transition-colors"
          />
          <Button onClick={handleSend} className="bg-f1-red hover:bg-red-700">Send</Button>
        </div>
      </Card>
    </div>
  );
}
