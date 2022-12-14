import { createLiveView, html } from "liveviewjs";
import { BroadcastChannelPubSub } from "../../deno/broadcastChannelPubSub.ts";

// use global broadcastchannel implementation
const pubSub = new BroadcastChannelPubSub();

type Chat = {
  author: string;
  message: string;
  timestamp: Date;
};

// in memory chat
const chatMessages: Chat[] = [
  {
    author: "Chatbot",
    message: "Welcome to the chat!",
    timestamp: new Date(),
  },
];

export const chatLiveView = createLiveView<
  { chatMessages: Chat[] },
  { type: "send"; author: string; message: string },
  { type: "updated" }
>({
  mount: (socket) => {
    if (socket.connected) {
      socket.subscribe("chatMessages");
    }
    socket.assign({ chatMessages });
  },
  handleEvent: (event) => {
    switch (event.type) {
      case "send":
        chatMessages.push({
          author: event.author,
          message: event.message,
          timestamp: new Date(),
        });
        pubSub.broadcast("chatMessages", { type: "updated" });
        break;
    }
  },
  handleInfo: (info, socket) => {
    switch (info.type) {
      case "updated":
        socket.assign({ chatMessages });
        break;
    }
  },
  render: (context, meta) => {
    const { chatMessages } = context;
    return html`
      <h1>Chat</h1>

      ${chatMessages.map(renderChatMessage)}

      <form phx-submit="send">
        <input type="hidden" name="_csrf_token" value="${meta.csrfToken}" />

        <label>
          <span>Message:</span>
          <textarea type="text" name="message" placeholder="Message"></textarea>
        </label>
        <label>
          <span>Author:</span>
          <input type="text" name="author" placeholder="Author" autocomplete="off" />
        </label>

        <button type="submit">Send</button>
      </form>
    `;
  },
});

const formatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function renderChatMessage(c: Chat) {
  return html`
    <fieldset>
      <pre>${c.message}</pre>
      <label>
        <span>Author:</span>
        <div>${c.author}</div>
      </label>
      <label>
        <span>Timestamp:</span>
        <div>${formatter.format(c.timestamp)}</div>
      </label>
    </fieldset>
  `;
}
