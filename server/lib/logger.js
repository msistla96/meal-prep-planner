function log(level, message, meta) {
  const line = { time: new Date().toISOString(), level, message, ...meta };
  const out = level === "error" ? console.error : console.log;
  out(JSON.stringify(line));
}

export const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta)
};

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger.info("request", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      userId: req.userId ?? null
    });
  });
  next();
}
