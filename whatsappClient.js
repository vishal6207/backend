const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal"); // ✅ Add this line

let sock;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    // ✅ We are handling QR manually below
  });

  sock.ev.on("creds.update", saveCreds);

  // ✅ Show QR in terminal
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR code in your WhatsApp:");
      qrcode.generate(qr, { small: true }); // ✅ Show proper QR in terminal
    }

    if (connection === "open") {
      console.log("✅ WhatsApp connected");
    } else if (connection === "close") {
      console.log("❌ Disconnected. Reconnecting...");
      connectToWhatsApp();
    }
  });
}

function getSocket() {
  return sock;
}

module.exports = { connectToWhatsApp, getSocket };
