import { createLiveView, html } from "liveviewjs";

export const counterLiveView = createLiveView<{ count: number }, { type: "increment" }>({
  mount: (socket) => {
    socket.assign({ count: 0 });
  },
  handleEvent: (event, socket) => {
    const { count } = socket.context;
    switch (event.type) {
      case "increment":
        socket.assign({ count: count + 1 });
        break;
    }
  },
  render: (context) => {
    const { count } = context;
    return html`
      <div>
        <h1>Count is: ${count}</h1>
        <button phx-click="increment">+</button>
      </div>
    `;
  },
});
