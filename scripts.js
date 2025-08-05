const input = document.getElementById('user-input');
    const form = document.getElementById('input-form');
    const chatArea = document.getElementById('chat-area');
    const modeNormal = document.getElementById('mode-normal');
    const modeRag = document.getElementById('mode-rag');

    const placeholders = [
      "Suggest a VM for HANA workload",
      "Which VM is best for BW/4HANA?",
      "Recommend Intel VMs with 128GB RAM",
      "VM SKU for SAP NetWeaver?",
      "What's the best VM for SAP app tier?"
    ];
    let currentIndex = 0;

    function updatePlaceholder() {
      input.placeholder = placeholders[currentIndex];
      currentIndex = (currentIndex + 1) % placeholders.length;
    }

    setInterval(updatePlaceholder, 3000);
    updatePlaceholder();

    let currentMode = 'Normal';
    modeNormal.addEventListener('change', (e) => {
      if (e.target.checked) currentMode = 'Normal';
    });
    modeRag.addEventListener('change', (e) => {
      if (e.target.checked) currentMode = 'RAG';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      document.getElementById('welcome-message')?.remove();
      appendMessage('user', message);
      input.value = '';
      simulateResponse(message);
    });

    function appendMessage(sender, text) {
      const welcome = document.getElementById('welcome-message');
      if (welcome) {
        welcome.remove();
      }

      const bubble = document.createElement('div');
      bubble.className = sender === 'user'
        ? 'bg-blue-600 text-white p-3 rounded-lg self-end max-w-md ml-auto'
        : 'bg-gray-700 text-white p-3 rounded-lg self-start max-w-md';
      bubble.innerHTML = text;
      chatArea.appendChild(bubble);
      chatArea.scrollTop = chatArea.scrollHeight;
    }

    function simulateResponse(message) {
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'bg-gray-700 text-white p-3 rounded-lg self-start max-w-md flex items-center space-x-2';
      loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Thinking...</span>';
      chatArea.appendChild(loadingMsg);
      chatArea.scrollTop = chatArea.scrollHeight;

      setTimeout(() => {
        chatArea.removeChild(loadingMsg);

        if (!message.toLowerCase().includes('vm')) {
          appendMessage('bot', "Sorry, I can only help with SAP VM recommendations.");
          return;
        }

        const mockData = [
          { sku: "D8s_v5", vcpu: 8, ram: "32 GB", storage: "128 GB SSD", network: "Up to 10 Gbps" },
          { sku: "E16ds_v5", vcpu: 16, ram: "128 GB", storage: "512 GB SSD", network: "Up to 20 Gbps" },
          { sku: "M32ts", vcpu: 32, ram: "256 GB", storage: "1 TB SSD", network: "Up to 30 Gbps" }
        ];

        let responseHtml = `<div class="font-bold mb-1">Recommended VMs (${currentMode} mode):</div><ul class="space-y-2">`;
        mockData.forEach(vm => {
          responseHtml += `
            <li class="border border-gray-600 p-2 rounded">
              <div><strong>SKU:</strong> ${vm.sku}</div>
              <div><strong>vCPU:</strong> ${vm.vcpu}</div>
              <div><strong>RAM:</strong> ${vm.ram}</div>
              <div><strong>Storage:</strong> ${vm.storage}</div>
              <div><strong>Network:</strong> ${vm.network}</div>
            </li>
          `;
        });
        responseHtml += '</ul>';
        appendMessage('bot', responseHtml);
      }, 1500);
    }

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
  
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
    });
  
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
    });
    let chatHistory = [];
let chatCount = 0;

document.getElementById('new-chat').addEventListener('click', () => {
  const chatArea = document.getElementById('chat-area');
  const currentMessages = chatArea.innerHTML.trim();

  const welcomeMessage = `
    <div id="welcome-message" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center text-gray-400 leading-relaxed px-4">
        <p class="text-center font-bold text-2xl text-white mb-1 leading-[3rem]">
          Hello! I am the SAP VM SKU Recommendation Assistant.
        </p>
        <p class="text-gray-400 text-lg max-w-2xl mx-auto">
          I can help you find the best Azure Intel VM SKU based on your SAP workload requirements.
        </p>
      </div>
    </div>
  `;

  if (currentMessages && !currentMessages.includes('SAP VM SKU Recommendation Assistant')) {
    chatCount++;
    chatHistory.push(currentMessages);

    const listItem = document.createElement('li');
    listItem.textContent = `Chat ${chatCount}`;
    listItem.className = 'cursor-pointer text-gray-300 hover:underline';
    listItem.addEventListener('click', () => {
      document.getElementById('welcome-message')?.remove();
      chatArea.innerHTML = chatHistory[chatCount - 1];
    });

    document.getElementById('chat-history').appendChild(listItem);
  }

  // Clear chat
  chatArea.innerHTML = '';
  chatArea.insertAdjacentHTML('beforeend', welcomeMessage);
});
