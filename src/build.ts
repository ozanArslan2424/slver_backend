import fs from "fs/promises";

await Bun.build({
	entrypoints: ["src/main.ts"],
	target: "bun",
	outdir: "./dist",
});

await fs.cp("src/client/mail", "dist/src/client/mail", {
	recursive: true,
});
