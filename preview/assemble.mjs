import { readFileSync, writeFileSync } from "node:fs";

const S = "/tmp/claude-0/-home-user-Hawann-end-lily/0d67ba3d-0ae9-5fd9-ac31-12e20ba86b50/scratchpad";

const fonts = readFileSync(`${S}/fonts-inline.css`, "utf8");
const css = readFileSync("preview/dist/app.css", "utf8");
const js = readFileSync("preview/dist/app.js", "utf8");

// The published page supplies its own <head>/<body>, so bind the font variables
// and the .dark scope to a wrapper element instead of <html>.
const html = `<title>Coach Lily — Private Jiu-Jitsu Lessons</title>
<style>
${fonts}
:root { --font-inter: 'Inter', system-ui, sans-serif; --font-oswald: 'Oswald', system-ui, sans-serif; }
${css}
#root { display: flex; min-height: 100vh; flex-direction: column; }
body { margin: 0; }
</style>
<div id="root" class="dark"></div>
<script>${js}</script>
`;

writeFileSync(`${S}/coach-lily-preview.html`, html);
console.log("wrote preview:", (html.length / 1024 / 1024).toFixed(2) + " MB");
