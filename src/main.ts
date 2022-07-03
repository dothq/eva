import Eva from "./eva";
import { config } from "dotenv";

config();

const bot = new Eva();
bot.login(process.env.TOKEN);