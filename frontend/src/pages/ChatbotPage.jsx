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
import GridBackground from "../components/ui/GridBackground";
function useChatPageUI() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [selectedChat,  setSelectedChat]  = useState(null);
  const [adminModal,    setAdminModal]    = useState(null);

  const openAdminModal = (type) => { setSettingsOpen(false); setAdminModal(type); };

  return {
    selectedModel, setSelectedModel,
    sidebarOpen,   toggleSidebar: () => setSidebarOpen(v => !v),
    settingsOpen,  openSettings: () => setSettingsOpen(true), closeSettings: () => setSettingsOpen(false),
    selectedChat,  setSelectedChat,
    adminModal,    openAdminModal, closeAdminModal: () => setAdminModal(null),
  };
}

export default function ChatbotPage() {
  const { darkMode } = useDarkMode();
  const ui = useChatPageUI();

  const {
    messages, input, setInput,
    loading, activeIOC, bottomRef,
    handleSelectIOC, sendMessage, handleNewChat,
  } = useChat(ui.selectedModel);

  const th = t(darkMode);

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: th.bg, color: th.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "14px", overflow: "hidden",
    }}>
     <GridBackground color={darkMode ? "rgba(0,168,255,0.018)" : null} size={44} />

      {ui.settingsOpen && (
        <SettingsModal onClose={ui.closeSettings} onOpenAdminModal={ui.openAdminModal} />
      )}
      {ui.adminModal === "create" && <CreateUserModal darkMode={darkMode} onClose={ui.closeAdminModal} />}
      {ui.adminModal === "delete" && <DeleteUserModal darkMode={darkMode} onClose={ui.closeAdminModal} />}

      <ChatSidebar
        open={ui.sidebarOpen}
        darkMode={darkMode}
        selectedChat={ui.selectedChat}
        onSelectChat={ui.setSelectedChat}
        onNewChat={handleNewChat}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>
        <ChatTopBar
          darkMode={darkMode}
          sidebarOpen={ui.sidebarOpen}
          onToggleSidebar={ui.toggleSidebar}
          onOpenSettings={ui.openSettings}
          activeIOC={activeIOC}
          onSelectIOC={handleSelectIOC}
        />

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
          selectedModel={ui.selectedModel}
          onModelChange={ui.setSelectedModel}
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