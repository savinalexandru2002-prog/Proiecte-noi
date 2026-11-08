import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Sparkles, 
  Tag, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  Bot, 
  User, 
  RefreshCw, 
  Filter, 
  MessageSquare,
  AlertCircle,
  Plus,
  Trash2,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface Contact {
  id: number;
  jid: string;
  name: string;
  phone?: string;
  isGroup: boolean;
  labels: string[];
  unreadCount: number;
  lastMessageText?: string;
  lastMessageTimestamp?: string;
}

interface Message {
  id: number;
  messageId: string;
  jid: string;
  fromMe: boolean;
  senderName: string;
  text?: string;
  mediaUrl?: string;
  hasTag: boolean;
  isGroup: boolean;
  isAiAutoReply: boolean;
  status: string;
  timestamp: string;
}

export function WhatsAppWebManager({ ownerName = 'Alexandru' }: { ownerName?: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedJid, setSelectedJid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'tagged' | 'direct'>('all');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);
  const [labelModalJid, setLabelModalJid] = useState<string | null>(null);
  const [newLabelInput, setNewLabelInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch all chats/contacts
  const fetchChats = async () => {
    try {
      const res = await fetch('/api/whatsapp/chats');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.chats || []);
        if (!selectedJid && data.chats && data.chats.length > 0 && window.innerWidth >= 768) {
          setSelectedJid(data.chats[0].jid);
        }
      }
    } catch (e) {}
  };

  // Fetch messages for active conversation
  const fetchMessages = async (jid: string) => {
    try {
      const res = await fetch(`/api/whatsapp/chats/${encodeURIComponent(jid)}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJid) {
      fetchMessages(selectedJid);
      // Mark read
      fetch(`/api/whatsapp/chats/${encodeURIComponent(selectedJid)}/read`, { method: 'POST' }).catch(() => {});
    }
  }, [selectedJid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeContact = contacts.find(c => c.jid === selectedJid);

  // Send message manually
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedJid || sending) return;
    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch(`/api/whatsapp/chats/${encodeURIComponent(selectedJid)}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });
      if (res.ok) {
        await fetchMessages(selectedJid);
        await fetchChats();
      }
    } catch (e) {
      alert('Eroare la trimiterea mesajului.');
    } finally {
      setSending(false);
    }
  };

  // AI draft assistant
  const handleGenerateAiDraft = async () => {
    if (!selectedJid || draftingAi) return;
    setDraftingAi(true);
    try {
      const res = await fetch('/api/whatsapp/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jid: selectedJid,
          contactName: activeContact?.name || selectedJid,
          recentMessages: messages.slice(-6).map(m => ({ fromMe: m.fromMe, text: m.text })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.draft) {
          setInputText(data.draft);
        }
      }
    } catch (e) {
      alert('Eroare la generarea propunerii AI.');
    } finally {
      setDraftingAi(false);
    }
  };

  // Add label to contact
  const handleAddLabel = async (jid: string, label: string) => {
    if (!label.trim()) return;
    const contact = contacts.find(c => c.jid === jid);
    if (!contact) return;
    const current = contact.labels || [];
    if (current.includes(label.trim())) return;
    const updated = [...current, label.trim()];

    try {
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(jid)}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: updated }),
      });
      await fetchChats();
      setNewLabelInput('');
    } catch (e) {}
  };

  const handleRemoveLabel = async (jid: string, labelToRemove: string) => {
    const contact = contacts.find(c => c.jid === jid);
    if (!contact) return;
    const updated = (contact.labels || []).filter(l => l !== labelToRemove);
    try {
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(jid)}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: updated }),
      });
      await fetchChats();
    } catch (e) {}
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const q = searchQuery.toLowerCase();
    const matchName = contact.name.toLowerCase().includes(q) || (contact.phone && contact.phone.includes(q));
    if (!matchName) return false;

    if (activeFilter === 'unread') return (contact.unreadCount || 0) > 0;
    if (activeFilter === 'tagged') return contact.labels && contact.labels.length > 0;
    if (activeFilter === 'direct') return !contact.isGroup;
    return true;
  });

  return (
    <div className="w-full bg-[#111b21] border border-[#222e35] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[82vh] min-h-[580px] lg:h-[780px] animate-in fade-in duration-500">
      {/* Left Sidebar: Contacts & Search (Hidden on mobile when chat is selected) */}
      <div className={`w-full md:w-[340px] lg:w-[380px] bg-[#111b21] border-r border-[#222e35] flex flex-col h-full shrink-0 ${
        selectedJid ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-4 bg-[#202c33] border-b border-[#222e35] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs shadow-md">
                WA
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#e9edef] leading-tight">Conversații WhatsApp</h3>
                <p className="text-[10px] text-[#8696a0] font-mono">Modul Web • O5 Direct Protocol</p>
              </div>
            </div>
            <button
              onClick={() => fetchChats()}
              title="Reîmprospătează lista de contacte"
              className="p-1.5 hover:bg-[#111b21] rounded-lg text-[#8696a0] hover:text-[#00a884] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Caută contact sau număr..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b141a] border border-[#222e35] rounded-xl pl-9 pr-4 py-2 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium custom-scrollbar">
            {[
              { id: 'all', label: 'Toate' },
              { id: 'unread', label: 'Necitite' },
              { id: 'direct', label: 'Directe' },
              { id: 'tagged', label: 'Etichetate' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#00a884] text-black font-bold shadow'
                    : 'bg-[#0b141a] text-[#8696a0] hover:text-[#e9edef] border border-[#222e35]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/50 custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-[#8696a0] text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Niciun contact găsit.</p>
              <p className="text-[10px] mt-1 text-[#8696a0]/70">Contactele sincronizate din WhatsApp vor apărea aici automat.</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const isSelected = selectedJid === contact.jid;
              return (
                <div
                  key={contact.jid}
                  onClick={() => setSelectedJid(contact.jid)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-[#202c33]/40 ${
                    isSelected ? 'bg-[#202c33] border-l-4 border-[#00a884]' : ''
                  }`}
                >
                  {/* Contact Avatar */}
                  <div className="w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                    {contact.name ? contact.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5 text-cyan-400" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-xs text-[#e9edef] truncate">{contact.name}</p>
                      {contact.lastMessageTimestamp && (
                        <span className="text-[10px] font-mono text-[#8696a0] shrink-0">
                          {new Date(contact.lastMessageTimestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#8696a0] truncate line-clamp-1">
                      {contact.lastMessageText || 'Fără mesaje recente'}
                    </p>

                    {/* Labels & Unread Badge */}
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {(contact.labels || []).slice(0, 2).map(l => (
                          <span key={l} className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded text-[9px] font-mono">
                            {l}
                          </span>
                        ))}
                      </div>

                      {contact.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#00a884] text-black font-extrabold text-[10px] rounded-full shrink-0 animate-pulse">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Conversation (Hidden on mobile when no chat is selected) */}
      <div className={`flex-1 flex flex-col h-full bg-[#0b141a] ${
        !selectedJid ? 'hidden md:flex' : 'flex'
      }`}>
        {activeContact ? (
          <>
            {/* Chat Top Header */}
            <div className="p-3 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedJid(null)}
                  className="md:hidden p-1.5 -ml-1 text-[#8696a0] hover:text-white rounded-lg cursor-pointer"
                  title="Înapoi la lista de contacte"
                >
                  <ArrowLeft className="w-5 h-5 text-cyan-400" />
                </button>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold shrink-0 text-xs sm:text-sm">
                  {activeContact.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-[#e9edef] truncate">{activeContact.name}</h4>
                    {activeContact.isGroup ? (
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[9px] font-bold">
                        Grup
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold">
                        Direct 1-la-1
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-[#8696a0] truncate">{activeContact.phone || activeContact.jid}</p>
                </div>
              </div>

              {/* Action Buttons & Rule Indicator */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLabelModalJid(activeContact.jid)}
                  className="px-2.5 py-1 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white rounded-lg border border-[#222e35] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Gestionează etichetele contactului"
                >
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Etichete</span>
                </button>
              </div>
            </div>

            {/* Protocol Notice Banner */}
            <div className="px-3 py-1.5 bg-cyan-500/5 border-b border-cyan-500/20 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#8696a0]">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">Sistem Dual AI Activ: @Alexandru (Tactical) | @Alexia (Arhivă)</span>
              </span>
            </div>

            {/* Messages Stream Viewport */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#8696a0] p-6">
                  <Bot className="w-12 h-12 text-[#00a884]/40 mb-3" />
                  <p className="font-bold text-sm text-[#e9edef]">Începe o conversație cu {activeContact.name}</p>
                  <p className="text-xs max-w-sm mt-1">
                    Scrie direct în câmpul de mai jos sau folosește butonul „Sugestie AI O5”.
                  </p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.fromMe;
                  const isAutoAi = m.isAiAutoReply;

                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[75%] ${isMe ? 'ml-auto' : 'mr-auto'}`}
                    >
                      <div
                        className={`rounded-2xl p-3 shadow-md relative text-xs leading-relaxed ${
                          isMe
                            ? isAutoAi
                              ? 'bg-[#1a2730] text-[#e9edef] border border-cyan-500/40'
                              : 'bg-[#005c4b] text-white'
                            : 'bg-[#202c33] text-[#e9edef] border border-[#222e35]'
                        }`}
                      >
                        {/* Auto AI Badge */}
                        {isAutoAi && (
                          <div className="flex items-center gap-1 mb-1 text-[10px] font-mono text-cyan-300 font-bold border-b border-cyan-500/30 pb-1">
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{m.senderName || 'Terminal AI'}</span>
                          </div>
                        )}

                        {/* Message Sender on direct/group */}
                        {!isMe && (
                          <p className="text-[10px] font-bold text-emerald-400 mb-1">{m.senderName}</p>
                        )}

                        <p className="whitespace-pre-wrap select-text">{m.text}</p>

                        {/* Metadata Footer */}
                        <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-mono text-white/60">
                          <span>{new Date(m.timestamp).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && (
                            <span>
                              {m.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-cyan-400" />
                              ) : (
                                <Check className="w-3 h-3 text-white/70" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer & AI Suggestion Bar */}
            <div className="p-3 bg-[#202c33] border-t border-[#222e35] space-y-2 shrink-0">
              {/* Quick AI Drafting Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={draftingAi}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Generează o propunere inteligentă de răspuns pe baza conversației"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${draftingAi ? 'animate-spin' : ''}`} />
                  <span>{draftingAi ? 'Se formulează...' : '🪄 Sugestie AI O5'}</span>
                </button>

                <span className="text-[10px] font-mono text-[#8696a0] hidden sm:inline">
                  Apasă <kbd className="px-1 py-0.5 bg-[#0b141a] rounded text-white border border-[#222e35]">Enter</kbd> pentru trimitere
                </span>
              </div>

              {/* Text Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Scrie un mesaj către ${activeContact.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-[#0b141a] border border-[#222e35] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="p-2.5 sm:p-3 bg-[#00a884] hover:bg-[#06cf9c] text-black font-extrabold rounded-xl transition-all disabled:opacity-40 cursor-pointer shadow-lg active:scale-95 shrink-0"
                  title="Trimite mesajul direct pe WhatsApp"
                >
                  <Send className="w-4 h-4 fill-current" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8696a0]">
            <MessageSquare className="w-12 h-12 text-[#8696a0]/30 mb-3" />
            <p className="font-bold text-sm text-[#e9edef]">Selectează o conversație</p>
            <p className="text-xs mt-1">Alege un contact din lista laterală pentru a vizualiza mesajele și a interacționa.</p>
          </div>
        )}
      </div>

      {/* Label Edit Modal */}
      {labelModalJid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#111b21] w-full max-w-sm rounded-2xl border border-[#222e35] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#222e35]">
              <h4 className="font-bold text-sm text-[#e9edef] flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                Etichete Contact
              </h4>
              <button onClick={() => setLabelModalJid(null)} className="text-[#8696a0] hover:text-white font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">Etichete Active</label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                {contacts.find(c => c.jid === labelModalJid)?.labels?.map(l => (
                  <span key={l} className="px-2 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-mono flex items-center gap-1.5">
                    {l}
                    <button onClick={() => handleRemoveLabel(labelModalJid, l)} className="text-red-400 hover:text-red-300 font-bold ml-1 cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8696a0] uppercase tracking-wider">Adaugă Etichetă Nouă</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: Prioritar, MTF, Urgent..."
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel(labelModalJid, newLabelInput);
                    }
                  }}
                  className="flex-1 bg-[#0b141a] border border-[#222e35] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => handleAddLabel(labelModalJid, newLabelInput)}
                  className="px-3 py-2 bg-cyan-500 text-black font-bold rounded-xl text-xs hover:bg-cyan-400 transition-colors cursor-pointer"
                >
                  Adaugă
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
