import { useState }       from "react";
import { useChat }        from "../hooks/useChat";
import { useDarkMode }    from "../context/DarkModeContext";
import ChatSidebar        from "../components/chat/ChatSidebar";
import ChatTopBar         from "../components/chat/ChatTopBar";
import ChatInput          from "../components/chat/ChatInput";
import MessageBubble      from "../components/chat/MessageBubble";
import TypingIndicator    from "../components/chat/TypingIndicator";
import SettingsModal      from "../components/chat/SettingsModal";
import CreateUserModal    from "../components/chat/settings/CreateUserModal";
import DeleteUserModal    from "../components/chat/settings/DeleteUserModal";
import { t }             from "../components/chat/chatTheme";
import { MODELS }        from "../components/chat/ModelSelector";

export default function ChatbotPage() {
  const { darkMode, toggle: toggleDark } = useDarkMode();
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [selectedChat,  setSelectedChat]  = useState(null);
  const [adminModal,    setAdminModal]    = useState(null);

  const {
    messages, input, setInput,
    loading, activeIOC, bottomRef,
    handleSelectIOC, sendMessage, handleNewChat,
  } = useChat(selectedModel);

  const th = t(darkMode);

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: th.bg, color: th.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "14px", overflow: "hidden",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: darkMode
          ? `linear-gradient(rgba(0,168,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,168,255,0.018) 1px,transparent 1px)`
          : "none",
        backgroundSize: "44px 44px",
      }} />

      {/* Modals */}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          darkMode={darkMode}
          setDarkMode={toggleDark}
          onOpenAdminModal={(type) => { setSettingsOpen(false); setAdminModal(type); }}
        />
      )}
      {adminModal === "create" && <CreateUserModal darkMode={darkMode} onClose={() => setAdminModal(null)} />}
      {adminModal === "delete" && <DeleteUserModal darkMode={darkMode} onClose={() => setAdminModal(null)} />}

      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        darkMode={darkMode}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={handleNewChat}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <ChatTopBar
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
          onOpenSettings={() => setSettingsOpen(true)}
          activeIOC={activeIOC}
          onSelectIOC={handleSelectIOC}
        />

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "24px 32px",
          scrollbarWidth: "thin",
          scrollbarColor: `${th.scrollThumb} transparent`,
        }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} darkMode={darkMode} />
          ))}
          {loading && <TypingIndicator darkMode={darkMode} />}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          darkMode={darkMode}
          input={input}
          loading={loading}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onInputChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          onSend={sendMessage}
        />
      </div>

      <style>{`
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes typingDot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        ::-webkit-scrollbar       { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${th.scrollThumb}; border-radius: 2px; }
      `}</style>
    </div>
  );
}