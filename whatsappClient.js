const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

let sock;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    // ✅ Remove deprecated printQRInTerminal
    // printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  // ✅ Listen for QR and print manually
  sock.ev.on("connection.update", (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR code in your WhatsApp:");
      console.log(qr);
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
