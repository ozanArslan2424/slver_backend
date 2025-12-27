import fs from "fs/promises";

await Bun.build({
	entrypoints: ["src/main.ts"],
	target: "bun",
	outdir: "./dist",
});

await fs.cp("src/mail/templates", "dist/src/mail/templates", {
	recursive: true,
});
