export const resetPassword = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Password Reset</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background-color:#f4f4f4}.container{max-width:600px;margin:20px auto;padding:20px;background-color:#fff;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,.1)}h1{color:#2596be;text-align:center;font-size:40px}.content{text-align:start;font-size:20px}.button-container{text-align:center}.button{display:inline-block;padding:10px 20px;margin:20px 0;background-color:#2596be;text-decoration:none;border-radius:5px;font-weight:700}.footer{margin-top:20px;text-align:center;font-size:12px;color:#666}.footer hr{border:none;border-top:1px solid #ddd;margin:20px 0}</style></head><body><div class="container"><h1>Password Reset</h1><div class="content"><p>Hello{USERNAME},</p><p>You are receiving this email because we have received a password reset request for your Guzek UK account.</p><p>If this was not you, you can safely ignore this email. If this was you, click the button below to choose a new password.</p><div class="button-container"><a style="color:#fff!important" href="{RESET_PASSWORD_URL}" class="button">Reset Password</a></div></div><div class="footer"><hr><p>2025 &copy;&nbsp;<a href="{WEBSITE_URL}">Konrad Guzek</a></p></div></div></body></html>`;
