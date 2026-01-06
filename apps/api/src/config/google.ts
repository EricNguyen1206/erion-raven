import dotenv from "dotenv";

dotenv.config();

export const googleConfig = {
  clientId: process.env['GOOGLE_CLIENT_ID'] || "",
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || "",
};
