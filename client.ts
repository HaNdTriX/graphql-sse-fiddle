import { createClient } from "graphql-sse";

const log = document.getElementById("log") as HTMLPreElement;

let retryIntervalRef: null | ReturnType<typeof setInterval> = null;

const client = createClient({
  url: "http://localhost:4000/graphql/stream",
  // Reuses a single SSE connection for all GraphQL operations.
  singleConnection: true,
  // We don't want to retry failed operations.
  retryAttempts: 0,
  lazy: false,
  onNonLazyError(error) {
    console.log("onNonLazyError", error);

    log.innerHTML += `Error: ${error}\n`;
    writeLine(`Error: ${error}`, "red");

    // Recover from error
    retryIntervalRef = setInterval(mount, 1000);
  },
  on: {
    connected() {
      console.log("connected");
      if (retryIntervalRef) clearInterval(retryIntervalRef);
    },
    disconnected() {
      console.log("disconnected");
    },
  },
});

mount();

async function mount() {
  // Query
  const query = client.iterate({
    query: "{ count }",
  });

  const { value } = await query.next();
  writeLine(`Query: ${value.data!.count}`, "green");

  // Subscription
  const subscription = client.iterate({
    query: "subscription { count }",
  });

  for await (const event of subscription) {
    writeLine(`Subscription: ${event.data!.count}`);
  }
}

function writeLine(
  text: string,
  color: "red" | "green" | "default" = "default"
) {
  const colors = {
    red: "bg-red-200",
    green: "bg-green-200",
    default: "bg-transparent",
  } as const;

  const div = document.createElement("div");
  div.classList.add("p-0.5", "rounded", colors[color]);
  div.innerText = text;

  log.insertBefore(div, log.firstChild);
}
