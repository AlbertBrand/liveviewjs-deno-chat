import { BroadcastChannelPubSub } from "../deno/broadcastChannelPubSub.ts";
import { DenoOakLiveViewServer } from "../deno/server.ts";
import { Application, LiveViewRouter, Router, send } from "../deps.ts";
import { liveHtmlTemplate, wrapperTemplate } from "./liveTemplates.ts";
import { chatLiveView } from "./liveview/chat.ts";

// map request paths to LiveViews
const lvRouter: LiveViewRouter = {
  "/": chatLiveView,
};

// configure your oak app
const app = new Application();
const router = new Router();

// middleware to log requests
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url} - ${new Date().toISOString()}`);
  await next();
});

// initialize the LiveViewServer
const liveView = new DenoOakLiveViewServer(
  lvRouter,
  liveHtmlTemplate,
  { title: "Deno Demo", suffix: " · LiveViewJS" },
  {
    wrapperTemplate: wrapperTemplate,
    pubSub: new BroadcastChannelPubSub(),
  }
);

// setup the LiveViewJS HTTP middleware
app.use(liveView.httpMiddleware());

// in Deno, websocket requests come in over http and get "upgraded" to web socket requests
// so we add the wsMiddleware to this http route
router.get("/live/websocket", liveView.wsMiddleware());

// serve images or js files
router.get("/(.*).(png|jpg|jpeg|gif|js|js.map)", async (ctx) => {
  const path = ctx.request.url.pathname;
  await send(ctx, path, {
    root: "./public/",
  });
});

// add oak router to app
app.use(router.routes());
app.use(router.allowedMethods());

// listen for requests
const port = Number(Deno.env.get("PORT")) || 9001;
console.log(`LiveViewJS Express is listening on port ${port}!`);
await app.listen({ port });
