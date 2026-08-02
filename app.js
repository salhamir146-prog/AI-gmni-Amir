// ChatGPT Classic - Logic & API Handling
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('promptInput');
    const sendBtn = document.getElementById('sendBtn');
    const welcomeContainer = document.getElementById('welcomeContainer');
    const messagesList = document.getElementById('messagesList');
    const modelSelect = document.getElementById('modelSelect');
    const currentModelName = document.getElementById('currentModelName');
    const modelDropdownBadge = document.getElementById('modelDropdownBadge');
    
    // Modals & Sidebars
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsLink = document.getElementById('openSettingsLink');
    const settingsGearBtn = document.getElementById('settingsGearBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const systemInstructionInput = document.getElementById('systemInstruction');

    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const newChatBtn = document.getElementById('newChatBtn');

    let currentModel = localStorage.getItem('selectedModel') || 'gemini-3.6-flash';
    let systemPrompt = localStorage.getItem('systemPrompt') || '';
    let conversationHistory = [];

    // Initialize selected model
    modelSelect.value = currentModel;
    updateModelLabel();

    // Auto resize input textarea
    promptInput.addEventListener('input', () => {
        promptInput.style.height = 'auto';
        promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
        sendBtn.disabled = promptInput.value.trim() === '';
    });

    // Sidebar toggles
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.add('closed'));
    openSidebarBtn.addEventListener('click', () => sidebar.classList.remove('closed'));

    // Modal controls
    const openModal = () => settingsModal.classList.add('active');
    const closeModal = () => settingsModal.classList.remove('active');

    openSettingsLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    settingsGearBtn.addEventListener('click', openModal);
    modelDropdownBadge.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    saveSettingsBtn.addEventListener('click', () => {
        currentModel = modelSelect.value;
        systemPrompt = systemInstructionInput.value;
        localStorage.setItem('selectedModel', currentModel);
        localStorage.setItem('systemPrompt', systemPrompt);
        updateModelLabel();
        closeModal();
    });

    newChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        messagesList.innerHTML = '';
        messagesList.style.display = 'none';
        welcomeContainer.style.display = 'block';
    });

    function updateModelLabel() {
        currentModelName.textContent = `ChatGPT (${currentModel})`;
    }

    // Enter to Send
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (promptInput.value.trim() !== '') handleSend();
        }
    });

    sendBtn.addEventListener('click', handleSend);

    async function handleSend() {
        const text = promptInput.value.trim();
        if (!text) return;

        // Hide welcome screen
        welcomeContainer.style.display = 'none';
        messagesList.style.display = 'flex';

        // Add User Message
        appendMessage('user', text);
        conversationHistory.push({ role: 'user', parts: [{ text }] });

        promptInput.value = '';
        promptInput.style.height = 'auto';
        sendBtn.disabled = true;

        // Add Bot Loader Message
        const botBubble = appendMessage('assistant', 'در حال پردازش...');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: currentModel,
                    contents: conversationHistory,
                    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
                })
            });

            const data = await response.json();

            if (data.error) {
                botBubble.innerHTML = `<span style="color:red;">خطا: ${data.error}</span>`;
            } else {
                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'پاسخی دریافت نشد.';
                botBubble.innerHTML = marked.parse(reply);
                conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
            }
        } catch (err) {
            botBubble.innerHTML = '<span style="color:red;">خطا در ارتباط با Cloudflare Pages Function. لطفاً تنظیمات کلید API را بررسی کنید.</span>';
        }

        const chatContent = document.getElementById('chatContent');
        chatContent.scrollTop = chatContent.scrollHeight;
    }

    function appendMessage(role, content) {
        const row = document.createElement('div');
        row.className = `message-row ${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = role === 'user' ? content : marked.parse(content);

        row.appendChild(bubble);
        messagesList.appendChild(row);

        const chatContent = document.getElementById('chatContent');
        chatContent.scrollTop = chatContent.scrollHeight;
        return bubble;
    }
});
