import React from 'react';

interface TwitchChatPanelProps {
  channel: string;
  open: boolean;
  onClose: () => void;
}

export default function TwitchChatPanel({ channel, open, onClose }: TwitchChatPanelProps) {
  // Use window.location.hostname for the parent param if available
  const parent = typeof window !== 'undefined' ? window.location.hostname : '';
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-base-100 shadow-lg z-50 transition-all duration-300 hidden md:block ${open ? 'w-[350px]' : 'w-0'} overflow-hidden`}
      style={{ minWidth: open ? 350 : 0 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b">
          <span className="font-bold text-base">Twitch Chat</span>
          <button onClick={onClose} className="btn btn-xs btn-ghost">✕</button>
        </div>
        <iframe
          src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parent}`}
          height="100%"
          width="100%"
          frameBorder="0"
          className="flex-1"
          title={`${channel} Twitch Chat`}
        />
      </div>
    </div>
  );
} 