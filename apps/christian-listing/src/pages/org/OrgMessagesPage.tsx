import { useState } from 'react';

export default function OrgMessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  return (
    <div className="h-screen bg-white flex font-sans overflow-hidden">
      {/* ── Left: Thread List ─────────────────────────────────────────── */}
      <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-xl font-serif font-bold text-[#1B1B1B]">Messages</h1>
          {/* TODO: search input */}
        </div>

        {/* Thread list */}
        {/* TODO: list of message threads — avatar | sender name | preview | timestamp | unread dot */}
      </div>

      {/* ── Right: Thread View ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* TODO: thread header — sender name + listing context */}
            {/* TODO: chat bubble messages */}
            {/* TODO: reply input + send button */}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}
