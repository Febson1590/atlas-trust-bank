const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

execSync("npx prisma generate", { stdio: "inherit" });

const barrelPath = path.join(__dirname, "..", "generated", "prisma", "index.ts");
fs.writeFileSync(
  barrelPath,
  'export * from "./client";\nexport * from "./enums";\n'
);
