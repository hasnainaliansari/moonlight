const { google } = require("googleapis");

const CODE = process.env.GOOGLE_CODE; // yahan aap code env se doge

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://moonlight-blond.vercel.app/auth/google/callback" // live redirect
);

(async () => {
  try {
    const { tokens } = await oauth2Client.getToken(CODE);
    console.log("TOKENS:", tokens);
    console.log("\n✅ REFRESH TOKEN (Railway env me save karo):\n", tokens.refresh_token);
  } catch (e) {
    console.error("ERROR:", e.message);
  }
})();
