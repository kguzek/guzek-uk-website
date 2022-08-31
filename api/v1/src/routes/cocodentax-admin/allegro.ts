import express from "express";
import { fetchWithAuth } from "../../cocodentax-admin";

export const router = express.Router();

const ALLEGRO_BASE =
  "https://allegro.pl/auth/oauth/token?redirect_uri=https://www.guzek.uk/cocodentax-admin";
const TOKEN_URL = ALLEGRO_BASE + "&grant_type=authorization_code&code=";
const REFRESH_URL = ALLEGRO_BASE + "&grant_type=refresh_token&refresh_token=";

const API_BASE = "https://api.allegro.pl/";

router.get("/auth", (req, res) => {
  // Determine if this is a login request or a token refresh request,
  // depending on what query parameter is provided in the URL
  let url: string;
  if (req.query.code) url = TOKEN_URL + req.query.code;
  else if (req.query.token) url = REFRESH_URL + req.query.token;
  else {
    res
      .status(400)
      .json({ "400 Bad Request": "No JWT or authorisation code specified." });
    return;
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
