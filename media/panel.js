// Try to get VS Code API. For testing outside of VS Code, vscode will be undefined.
const tryGetVsCode = () => {
  try {
    return acquireVsCodeApi();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const vscode = tryGetVsCode();

// Constants
const SEND_BUTTON = "sendButton";
const PROMPT_INPUT = "promptInput";
const MESSAGES_CONTAINER = "messages";

const INFO_MESSAGE = "INFO";
const RUN_PROMPT = "RUN_PROMPT";
const APPLY_CODE = "APPLY_CODE";

const SIGN = "&nbsp;&lt/&gt";
const APPLY_BUTTON_TEXT = `apply${SIGN}`;

// Message events
const SET_LOADING_EVENT = "SET_LOADING";
const SET_APPLY_LOADING_EVENT = "SET_APPLY_LOADING";
const ADD_MESSAGE_EVENT = "ADD_MESSAGE";

// Utilities
/**
 * Generate a UUID v4
 * @returns {string} UUID v4 string
 */
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

// Global State
const STATE = {
  isLoading: false,
  isApplyingCode: false,
  codeFragments: {},
};

/**
 * Update the loading state and adjust the send button text accordingly
 * @param {boolean} isLoading - Whether the application is in a loading state
 */
function setIsLoading(isLoading) {
  STATE.isLoading = isLoading;
  const sendButton = document.getElementById(SEND_BUTTON);
  if (sendButton) {
    sendButton.textContent = isLoading ? "...." : "send"; // TODO: add animation
  }
}

/**
 * Update the loading state and adjust the send button text accordingly
 * @param {boolean} isLoading - Whether the application is in a loading state
 */
function setIsLoadingApplyCode(data) {
  const { isLoading, codeBlockId } = data;
  STATE.isApplyingCode = isLoading;

  const applyButton = document.querySelector(`[data-code="${codeBlockId}"]`);

  if (applyButton) {
    applyButton.innerHTML = isLoading ? "Applying.." : APPLY_BUTTON_TEXT; // TODO: add animation
  }
}

/**
 * Add a chat message to the messages container
 * @param {string} content - The message content
 * @param {string} sender - "assistant" or "user"
 */
function addMessage(content, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  const renderer = new marked.Renderer();

  // Customize code rendering to include an 'apply' button
  renderer.code = function (args) {
    const rawText = args.raw;
    const codeBlock = marked.parse(rawText);

    const codeUUID = uuidv4();
    STATE.codeFragments[codeUUID] = rawText;

    return `<div><button class="applyBtn" data-code="${codeUUID}">${APPLY_BUTTON_TEXT}</button><div data-type="code-segment">${codeBlock}</div></div>`;
  };

  const htmlContent = marked.parse(content, { renderer });
  messageElement.innerHTML = htmlContent;

  const messagesContainer = document.getElementById(MESSAGES_CONTAINER);
  if (messagesContainer) {
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addMessageButtonListeners(messageElement);

  document.querySelectorAll(`[data-type="code-segment"]`).forEach((block) => {
    hljs.highlightElement(block);
  });
}

const onApplyCodeClicked = (button) => {
  if (STATE.isApplyingCode) {
    console.warn("Already applying code");
    return;
  }

  const codeFragmentId = button.getAttribute("data-code");
  const rawText = STATE.codeFragments[codeFragmentId];
  if (!rawText) {
    console.warn(`Code fragment ${codeFragmentId} not found`);
    return;
  }

  const data = { codeBlockId: codeFragmentId, code: rawText };

  vscode.postMessage({ type: APPLY_CODE, data });
};

/**
 * Attach event listeners to 'apply' buttons within the given container
 * @param {HTMLElement} container - The element containing the message
 */
function addMessageButtonListeners(container) {
  const applyButtons = container.querySelectorAll(".applyBtn");

  applyButtons.forEach((button) => {
    button.addEventListener("click", () => onApplyCodeClicked(button));
  });
}

/**
 * Handle the 'ADD_MESSAGE' event from the VS Code extension
 * @param {Object} data - The message data containing 'content' and 'role'
 */
function handleAddMessage(data) {
  const { content, role } = data;
  addMessage(content, role);
}

/**
 * Handler for when the send button is clicked
 */
function onSendClicked() {
  if (STATE.isLoading) {
    return;
  }
  const input = document.getElementById(PROMPT_INPUT);
  if (!input) {
    vscode.postMessage({
      type: INFO_MESSAGE,
      message: "Input not found",
    });
    return;
  }
  const value = input.value.trim();
  if (!value) {
    return;
  }

  vscode.postMessage({ type: RUN_PROMPT, message: value });
}

const MESSAGE_HANDLERS = {
  [SET_LOADING_EVENT]: setIsLoading,
  [ADD_MESSAGE_EVENT]: handleAddMessage,
  [SET_APPLY_LOADING_EVENT]: setIsLoadingApplyCode,
};

/**
 * Initialize the event listeners and input handlers
 */
function init() {
  // Listen for messages from the VS Code extension
  window.addEventListener("message", (event) => {
    const { type, message: data } = event.data;

    const handler = MESSAGE_HANDLERS[type];
    if (!handler) {
      console.warn(`Unknown event type: ${type}`);
      return;
    }
    handler(data);
  });

  // Adjust the height of the prompt input textarea based on its content
  const promptInput = document.getElementById(PROMPT_INPUT);
  if (promptInput) {
    promptInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = `${this.scrollHeight}px`;
    });
  }

  // Add click handler to the send button
  const sendButton = document.getElementById(SEND_BUTTON);
  if (sendButton) {
    sendButton.addEventListener("click", onSendClicked);
  }
}

init();
