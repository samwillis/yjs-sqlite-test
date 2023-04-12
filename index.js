import { test } from "./test.js";

/**
   Set up our output channel differently depending
    on whether we are running in a worker thread or
    the main (UI) thread.
*/
let logHtml;
if (self.window === self /* UI thread */) {
  console.log("Running demo from main UI thread.");
  logHtml = function (cssClass, ...args) {
    const ln = document.createElement("div");
    if (cssClass) ln.classList.add(cssClass);
    ln.append(document.createTextNode(args.join(" ")));
    document.body.append(ln);
  };
} else {
  /* Worker thread */
  console.log("Running demo from Worker thread.");
  logHtml = function (cssClass, ...args) {
    postMessage({
      type: "log",
      payload: { cssClass, args },
    });
  };
}
const log = (...args) => logHtml("", ...args);
const warn = (...args) => logHtml("warning", ...args);
const error = (...args) => logHtml("error", ...args);

log.warn = warn;
log.error = error;

log("Loading and initializing sqlite3 module...");
if (self.window !== self) {
  let sqlite3Js = "sqlite3.js";
  const urlParams = new URL(self.location.href).searchParams;
  if (urlParams.has("sqlite3.dir")) {
    sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
  }
  importScripts(sqlite3Js);
}
const sqlite3 = await self.sqlite3InitModule({
  // We can redirect any stdout/stderr from the module
  // like so...
  print: log,
  printErr: error,
});

//console.log('sqlite3 =',sqlite3);
log("Done initializing. Running demo...");
try {
  test(sqlite3, log);
} catch (e) {
  error("Exception:", e.message);
}
