import express, { Request } from "express";
import { fetchWithAuth } from "../../cocodentax-admin";

export const router = express.Router();

const ALLEGRO_BASE = "https://allegro.pl/auth/oauth/token?redirect_uri=";

const API_BASE = "https://api.allegro.pl/";

function getURL(req: Request, forToken: boolean) {
  const redirectTo =
    req.headers.origin === "http://localhost:3001"
      ? "https://www.guzek.uk/cocodentax-admin"
      : req.headers.origin;
  return (
    ALLEGRO_BASE +
    redirectTo +
    "&grant_type=" +
    (forToken
      ? `authorization_code&code=${req.query.code}`
      : `refresh_token&refresh_token=${req.query.token}`)
  );
}

router.get("/auth", (req, res) => {
  // Determine if this is a login request or a token refresh request,
  // depending on what query parameter is provided in the URL
  let url;
  if (req.query.code) {
    url = getURL(req, true);
  } else if (req.query.token) {
    url = getURL(req, false);
  } else {
    return void res
      .status(400)
      .json({ "400 Bad Request": "No JWT or authorisation code provided." });
  }
  fetchWithAuth(
    url,
    res,
    {
      user: process.env.ALLEGRO_CLIENT_ID,
      pass: process.env.ALLEGRO_CLIENT_SECRET,
    },
    "POST"
  );
});

router.get("/api/:path", (req, res) => {
  const url = API_BASE + decodeURIComponent(req.params.path);
  fetchWithAuth(url, res, req.headers.authorization);
});
