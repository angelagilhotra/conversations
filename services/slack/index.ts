import { WebClient } from "@slack/web-api";
import { SlackEventMessage } from "interfaces";
import * as Config from "../../config/index.json";

class SlackService {
  public slack: WebClient;
  constructor() {
    this.slack = new WebClient(Config.services.slack.kernelBot.botToken);
  }
  public sendEventMessage = async (
    message: SlackEventMessage,
    channelId: string
  ): Promise<string> => {
    const response = await this.slack.chat.postMessage({
      channel: channelId,
      blocks: message.blocks,
      text: "New Event",
      icon_emoji: message.icon,
      username: message.username,
    });
    if (!response.ok) {
      throw new Error("Error in sending message");
    }
    return response.ts!;
  };
}

export default new SlackService();
