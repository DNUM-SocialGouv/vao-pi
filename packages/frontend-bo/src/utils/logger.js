import $debug from "debug";
export default (path) => {
  const debug = $debug(`debug:vao-frontend-usagers/${path}`);
  const info = $debug(`info:vao-frontend-usagers/${path}`);
  const warn = $debug(`warn:vao-frontend-usagers/${path}`);
  return {
    d(message, ...args) {
      if (debug.enabled) {
        debug("[DEBUG]", message, ...args);
      }
    },
    i(message, ...args) {
      if (debug.enabled) {
        debug("[INFO]", message, ...args);
      } else if (info.enabled) {
        info("[INFO]", message);
      }
    },
    w(...args) {
      if (debug.enabled) {
        debug("[WARN]", ...args);
      } else if (info.enabled) {
        info("[WARN]", ...args);
      } else if (warn.enabled) {
        warn("[WARN]", ...args);
      }
    },
  };
};
