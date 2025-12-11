await Bun.build({
	entrypoints: ["src/main.ts"],
	target: "bun",
	// compile: true, // can't compile in docker
	outdir: "./dist",
});
