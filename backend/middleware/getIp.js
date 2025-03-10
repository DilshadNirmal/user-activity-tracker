const getIp = (req, res, next) => {
  // Get IP from various headers that might contain the real IP
  const ip =
    // Vercel-specific header
    req.headers["x-vercel-forwarded-for"] ||
    // Standard proxy headers
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.headers["x-client-ip"] ||
    // Cloudflare
    req.headers["cf-connecting-ip"] ||
    // Fallback to remote address
    req.socket.remoteAddress;

  // Convert localhost IPv6 to IPv4
  let clientIp = ip === "::1" ? "127.0.0.1" : ip;

  // Remove IPv6 prefix if present
  clientIp = clientIp?.replace(/^::ffff:/, "");

  // For development environment, if it's a private IP, we'll keep it
  // For production, this will be the actual public IP
  req.clientIp = clientIp || "Unknown";

  next();
};

module.exports = getIp;
