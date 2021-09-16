import { google } from "googleapis";
import fs from "fs";
import readline from "readline";
import * as Config from "../../../config/index.json";

const main = async () => {
  let content: any = await fs.readFileSync(
    Config.services.google.pathToCredentials
  );
  const { client_secret, client_id, redirect_uris } = JSON.parse(content).web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: Config.services.google.scopes,
    prompt: "consent",
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token!);
      // Store the token to disk for later program executions
      fs.writeFile(
        Config.services.google.pathToToken,
        JSON.stringify(token),
        (err) => {
          if (err) return console.error(err);
          console.log("Token stored to", Config.services.google.pathToToken);
        }
      );
    });
  });
};

main();
