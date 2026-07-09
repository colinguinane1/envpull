import fs from "fs";
import path from "path";
import os from "os";
const envpullDir = path.join(os.homedir(), ".envpull");
const configPath = path.join(envpullDir, "config.json");
export function saveToken(token) {
    if (!fs.existsSync(envpullDir)) {
        fs.mkdirSync(envpullDir);
    }
    fs.writeFileSync(configPath, JSON.stringify({
        token,
    }));
}
export function getToken() {
    if (!fs.existsSync(configPath)) {
        return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return config.token;
}
//# sourceMappingURL=config.js.map