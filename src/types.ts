export type ProtocolType = 'whatsapp_web' | 'scp_protocol';

export type PersonaType = 'alexandru_assistant' | 'scp_secure_agent' | 'business_consultant';

export interface ProtocolConfig {
  phoneNumber: string;
  ownerName: string;
  triggerTag: string;
  requireTagStrict: boolean;
  activeProtocol: ProtocolType;
  accountType: 'personal' | 'business';
  autoSwitchOnFailure: boolean;
  activePersona: PersonaType;
  activeEngine: string;
}

export interface SessionState {
  status: 'connected' | 'qr_ready' | 'pairing' | 'fallback_active' | 'error';
  pairingCode: string;
  qrCodeUrl?: string;
  expiresInSeconds: number;
  lastPing: string;
  consecutiveFailures: number;
  switchCount: number;
  contactLink: string;
  isLinking: boolean;
  deviceInfo?: {
    name: string;
    platform: string;
    lastSeen: string;
  };
}

export interface SwitchLog {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  reason: string;
  type: 'auto' | 'manual' | 'failover_sim';
}

export interface MessageLog {
  id: string;
  timestamp: string;
  sender: string;
  text: string;
  hasTag: boolean;
  status: 'responded' | 'ignored_no_tag' | 'failed';
  replyText?: string;
  protocolUsed: string;
  engineUsed: string;
  latencyMs: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  senderName: string;
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
  isIgnored?: boolean;
  protocol?: string;
}
