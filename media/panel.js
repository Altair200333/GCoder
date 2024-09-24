const tryGetVsCode = () => {
  try {
    return acquireVsCodeApi();
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

const vscode = tryGetVsCode(); // for testing outside of VS Code

// CONSTANTS ------------------------

const INFO_MESSAGE = "INFO";
const RUN_PROMPT = "RUN_PROMPT";

// -- message events
const SET_LOADING_EVENT = "SET_LOADING";
const ADD_MESSAGE_EVENT = "ADD_MESSAGE";

const SEND_BUTTON = "sendButton";
const PROMPT_INPUT = "promptInput";

// CONSTANTS END --------------------

/**
 * Global State
 */
const STATE = {
  isLoading: false,
};

const setIsLoading = (isLoading) => {
  STATE.isLoading = isLoading;
  const sendButton = document.getElementById(SEND_BUTTON);
  if (isLoading) {
    sendButton.textContent = "..."; // TODO animate
  } else {
    sendButton.textContent = "send";
  }
};

/**
 * Add chat message
 * @param {*} content
 * @param {*} sender - assistant or user
 */
function addMessage(content, sender) {
  const messageElement = document.createElement("div");
  // messageElement.setAttribute("test", "test_v");

  messageElement.classList.add("message", sender);
  messageElement.innerHTML = content;

  const messagesContainer = document.getElementById("messages");
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

const handleAddMessage = (data) => {
  const content = data.content;
  const role = data.role;
  addMessage(content, role);
};

const init = () => {
  window.addEventListener("message", (event) => {
    const payload = event.data;
    console.log("received event", event);
    const type = payload.type;
    const data = payload.message;
    console.log("AA", type, data);

    switch (type) {
      case SET_LOADING_EVENT:
        return setIsLoading(data);
      case ADD_MESSAGE_EVENT:
        return handleAddMessage(data);
    }
  });

  const promptInput = document.getElementById("promptInput");

  promptInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
};

init();

const onSendClicked = () => {
  if (STATE.isLoading) {
    return;
  }
  const input = document.getElementById(PROMPT_INPUT);
  if (!input) {
    return vscode.postMessage({
      type: INFO_MESSAGE,
      message: "Input not found",
    });
  }
  const value = input.value?.trim();
  if (!value) {
    return;
  }

  vscode.postMessage({ type: RUN_PROMPT, message: value });
};
