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
const APPLY_CODE = "APPLY_CODE";

// -- message events
const SET_LOADING_EVENT = "SET_LOADING";
const ADD_MESSAGE_EVENT = "ADD_MESSAGE";

const SEND_BUTTON = "sendButton";
const PROMPT_INPUT = "promptInput";

// CONSTANTS END --------------------

// UTILS -----------------------------

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}

// UTILS END -------------------------
/**
 * Global State
 */
const STATE = {
  isLoading: false,
  codeFragments: {},
};

console.log(uuidv4());

const setIsLoading = (isLoading) => {
  STATE.isLoading = isLoading;
  const sendButton = document.getElementById(SEND_BUTTON);
  if (isLoading) {
    sendButton.textContent = "..."; // TODO animate
  } else {
    sendButton.textContent = "send";
  }
};

// messageElement.setAttribute("test", "test_v");
/**
 * Add chat message
 * @param {*} content
 * @param {*} sender - assistant or user
 */
function addMessage(content, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  const renderer = new marked.Renderer();

  renderer.code = function (args) {
    const rawText = args.raw;
    const codeBlock = marked.parse(rawText);
    const sign = `&nbsp&lt/&gt`;

    const codeUUID = uuidv4();
    STATE.codeFragments[codeUUID] = rawText;

    return `<div><button class="applyBtn" data-code="${codeUUID}">apply${sign}</button>${codeBlock}</div>`;
  };

  const htmlContent = marked.parse(content, { renderer });
  messageElement.innerHTML = htmlContent;

  const messagesContainer = document.getElementById("messages");
  messagesContainer.appendChild(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  addMessageButtonsListerners(messageElement);
}

const addMessageButtonsListerners = (container) => {
  const applyButtons = container.querySelectorAll(".applyBtn");

  applyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const codeFramentId = button.getAttribute("data-code");
      const rawText = STATE.codeFragments[codeFramentId];
      if (!rawText) {
        console.warn(`Code fragment ${codeFramentId} not found`);
        return;
      }

      console.log("Button clicked, rawText:", rawText);
      vscode.postMessage({ type: APPLY_CODE, message: rawText });
    });
  });
};

const handleAddMessage = (data) => {
  const content = data.content;
  const role = data.role;
  addMessage(content, role);
};

const init = () => {
  window.addEventListener("message", (event) => {
    const payload = event.data;
    const type = payload.type;
    const data = payload.message;

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

init();
