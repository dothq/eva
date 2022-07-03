import Eva from "./eva";
import { config } from "dotenv";

config();

const eva = new Eva();

eva.login(process.env.TOKEN);
