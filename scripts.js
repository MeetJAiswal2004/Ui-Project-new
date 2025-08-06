const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const mainContent = document.getElementById("main-content");
const chatArea = document.getElementById("chat-area");

function openSidebar() {
  sidebar.classList.remove("-translate-x-full");
  sidebarOverlay.classList.remove("hidden");
  mainContent.classList.add("shifted"); // On sidebar open
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  sidebarOverlay.classList.add("hidden");
  mainContent.classList.remove("shifted");
}

sidebarToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = !sidebar.classList.contains("-translate-x-full");
  if (isOpen) closeSidebar();
  else openSidebar();
});

document.addEventListener("click", (e) => {
  const isOpen = !sidebar.classList.contains("-translate-x-full");
  if (
    isOpen &&
    !sidebar.contains(e.target) &&
    !sidebarToggle.contains(e.target)
  ) {
    closeSidebar();
  }
});

sidebarOverlay.addEventListener("click", closeSidebar);

const input = document.getElementById("user-input");
const form = document.getElementById("input-form");
const modeNormal = document.getElementById("mode-normal");
const modeRag = document.getElementById("mode-rag");

let currentMode = "Normal";
modeNormal.addEventListener("change", (e) => {
  if (e.target.checked) currentMode = "Normal";
});
modeRag.addEventListener("change", (e) => {
  if (e.target.checked) currentMode = "RAG";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event("submit"));
  }
});

const chatHistory = [];
let currentChatIndex = null;

function appendMessage(sender, text) {
  const bubble = document.createElement("div");
  bubble.className =
    sender === "user"
      ? "bg-blue-600 text-white p-3 rounded-lg self-end max-w-md ml-auto"
      : "bg-gray-700 text-white p-3 rounded-lg self-start max-w-md";
  bubble.innerHTML = text;
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;

  updateChatMemory();
}

function simulateResponse(message) {
  const loadingMsg = document.createElement("div");
  loadingMsg.className =
    "bg-gray-700 text-white p-3 rounded-lg self-start max-w-md flex items-center space-x-2";
  loadingMsg.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i><span>Thinking...</span>';
  chatArea.appendChild(loadingMsg);
  chatArea.scrollTop = chatArea.scrollHeight;

  setTimeout(() => {
    chatArea.removeChild(loadingMsg);

    if (!message.toLowerCase().includes("vm")) {
      appendMessage(
        "bot",
        "Sorry, I can only help with SAP VM recommendations."
      );
      return;
    }

    const mockData = [
      {
        sku: "D8s_v5",
        vcpu: 8,
        ram: "32 GB",
        storage: "128 GB SSD",
        network: "Up to 10 Gbps",
      },
      {
        sku: "E16ds_v5",
        vcpu: 16,
        ram: "128 GB",
        storage: "512 GB SSD",
        network: "Up to 20 Gbps",
      },
      {
        sku: "M32ts",
        vcpu: 32,
        ram: "256 GB",
        storage: "1 TB SSD",
        network: "Up to 30 Gbps",
      },
    ];

    let responseHtml = `<div class="font-bold mb-1">Recommended VMs (${currentMode} mode):</div><ul class="space-y-2">`;
    mockData.forEach((vm) => {
      responseHtml += `
             <li class="border border-gray-600 p-2 rounded">
               <div><strong>SKU:</strong> ${vm.sku}</div>
               <div><strong>vCPU:</strong> ${vm.vcpu}</div>
               <div><strong>RAM:</strong> ${vm.ram}</div>
               <div><strong>Storage:</strong> ${vm.storage}</div>
               <div><strong>Network:</strong> ${vm.network}</div>
             </li>`;
    });
    responseHtml += "</ul>";

    appendMessage("bot", responseHtml);
  }, 1500);
}

function updateChatMemory() {
  const content = chatArea.innerHTML.trim();

  if (!content || content.includes("SAP VM SKU Recommendation Assistant"))
    return;

  const firstUserMessage =
    chatArea.querySelector(".self-end")?.textContent || "";

  if (currentChatIndex === null) {
    chatHistory.push({
      content,
      summary: firstUserMessage.slice(0, 30) + "...",
    });
    currentChatIndex = chatHistory.length - 1;
  } else {
    chatHistory[currentChatIndex].content = content;
    chatHistory[currentChatIndex].summary =
      firstUserMessage.slice(0, 30) + "...";
  }

  renderChatList();
}
function renderChatList() {
  const list = document.getElementById("chat-history");
  list.innerHTML = "";

  chatHistory.forEach((chat, index) => {
    const li = document.createElement("li");
    li.className =
      "relative group flex justify-between items-center bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 cursor-pointer";

    const chatName = document.createElement("span");
    chatName.textContent = chat.summary;
    chatName.className = "text-gray-300 truncate";

    // More Options (⋮)
    const menuWrapper = document.createElement("div");
    menuWrapper.className = "relative";

    const menuButton = document.createElement("button");
    menuButton.innerHTML = "⋮";
    menuButton.className =
      "text-gray-400 hover:text-white px-2 focus:outline-none";
    menuButton.title = "More options";

    const dropdown = document.createElement("div");
    dropdown.className =
      "hidden absolute right-0 mt-1 w-28 bg-gray-800 border border-gray-600 rounded shadow-md z-50";
    dropdown.innerHTML = `
            <div class="px-3 py-2 hover:bg-gray-700 text-sm cursor-pointer" data-action="share">Share</div>
            <div class="px-3 py-2 hover:bg-gray-700 text-sm cursor-pointer" data-action="archive">Archive</div>
            <div class="px-3 py-2 hover:bg-gray-700 text-sm cursor-pointer" data-action="rename">Rename</div>
            <div class="px-3 py-2 hover:bg-gray-700 text-sm cursor-pointer text-red-400 hover:text-red-600" data-action="delete">Delete</div>
          `;

    menuWrapper.appendChild(menuButton);
    menuWrapper.appendChild(dropdown);

    // Toggle dropdown visibility
    menuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = !dropdown.classList.contains("hidden");
      document
        .querySelectorAll("#chat-history .dropdown-visible")
        .forEach((el) => {
          el.classList.add("hidden");
          el.classList.remove("dropdown-visible");
        });
      if (!isVisible) {
        dropdown.classList.remove("hidden");
        dropdown.classList.add("dropdown-visible");
      }
    });

    // Handle dropdown actions
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = e.target.getAttribute("data-action");
      if (!action) return;

      if (action === "share") {
        alert("Share clicked");
      } else if (action === "archive") {
        alert("Archived");
      } else if (action === "rename") {
        const newName = prompt("Enter new name:", chat.summary);
        if (newName && newName.trim() !== "") {
          chat.summary = newName.trim();
          renderChatList();
        }
      } else if (action === "delete") {
        chatHistory.splice(index, 1);
        if (currentChatIndex === index) currentChatIndex = null;
        renderChatList();
        chatArea.innerHTML = welcomeTemplate;
      }
    });

    // Clicking on the whole chat block opens it
    li.addEventListener("click", () => {
      chatArea.innerHTML = chat.content;
      currentChatIndex = index;
      closeSidebar();
    });

    li.appendChild(chatName);
    li.appendChild(menuWrapper);
    list.appendChild(li);
  });

  // Close dropdown if clicked outside
  document.addEventListener("click", (e) => {
    document
      .querySelectorAll("#chat-history .dropdown-visible")
      .forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("dropdown-visible");
      });
  });
}

const welcomeTemplate = `
       <div id="welcome-message" class="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div class="text-center text-gray-400 leading-relaxed px-4">
           <p class="text-center font-bold text-2xl text-white mb-1 leading-[3rem]">
             Hello! I am the SAP VM SKU Recommendation Assistant.
           </p>
           <p class="text-gray-400 text-lg max-w-2xl mx-auto">
             I can help you find the best Azure Intel VM SKU based on your SAP workload requirements.
           </p>
         </div>
       </div>`;

document.getElementById("new-chat").addEventListener("click", () => {
  if (chatArea.innerHTML.trim() && currentChatIndex === null) {
    updateChatMemory();
  }
  chatArea.innerHTML = welcomeTemplate;
  currentChatIndex = null;
  closeSidebar();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  document.getElementById("welcome-message")?.remove();
  appendMessage("user", message);
  input.value = "";
  simulateResponse(message);
});

// Placeholder rotation
const placeholders = [
  "Suggest a VM for HANA workload",
  "Which VM is best for BW/4HANA?",
  "Recommend Intel VMs with 128GB RAM",
  "VM SKU for SAP NetWeaver?",
  "What's the best VM for SAP app tier?",
];
let currentIndex = 0;
function updatePlaceholder() {
  input.placeholder = placeholders[currentIndex];
  currentIndex = (currentIndex + 1) % placeholders.length;
}
setInterval(updatePlaceholder, 3000);
updatePlaceholder();
