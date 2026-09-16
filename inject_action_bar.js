const fs = require("fs");
const path = require("path");

const demosDir = path.join(__dirname, "public", "demos");

const newHTML = `\n  <script src="/demos/shared-action-bar.js"></script>\n</body>`;

const replaceBadge = (dir) => {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      const indexPath = path.join(fullPath, "index.html");
      if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, "utf8");
        
        // Remove the exact old badge text if possible
        const regex = /<!-- ═══════════════════════════════════════════════════ -->[\s\S]*?<\/script>/g;
        content = content.replace(regex, "");
        
        // Remove old inject if it exists
        content = content.replace(/<script src="\/demos\/shared-action-bar\.js"><\/script>/g, "");
        
        // Inject before </body>
        if (content.includes("</body>")) {
            content = content.replace("</body>", newHTML);
            fs.writeFileSync(indexPath, content, "utf8");
            console.log("Updated", indexPath);
        } else {
            console.log("Could not find </body> in", indexPath);
        }
      }
    }
  }
};

replaceBadge(demosDir);
