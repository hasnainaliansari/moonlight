const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Live redirect (your Vercel callback)
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "https://moonlight-blond.vercel.app/auth/google/callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n1) Open this URL and allow access:\n", authUrl);
console.log("\n2) After allow, you will be redirected to your LIVE callback URL.");
console.log("   Copy the FULL redirected URL from browser address bar and paste here.\n");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste redirected URL here: ", async (redirectedUrl) => {
  try {
    const u = new URL(redirectedUrl.trim());
    const code = u.searchParams.get("code");

    if (!code) {
      console.error("No `code` found in URL. Paste the FULL redirected URL.");
      process.exit(1);
    }

    const { tokens } = await oauth2Client.getToken(code);
    console.log("\nTOKENS:\n", tokens);

    if (!tokens.refresh_token) {
      console.log(
        "\n⚠️ refresh_token not returned.\n" +
        "Fix: Google Account → Security → Third-party access → remove this app access, then run again.\n"
      );
    } else {
      console.log("\n✅ SAVE THIS REFRESH TOKEN:\n", tokens.refresh_token);
    }
  } catch (e) {
    console.error("Token exchange failed:", e.message);
  } finally {
    rl.close();
  }
});
