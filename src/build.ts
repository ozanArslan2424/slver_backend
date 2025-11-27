await Bun.build({
	entrypoints: ["src/main.ts"],
	target: "bun",
	external: ["@prisma/adapter-libsql"],
	// compile: true, // can't compile libsql
	outdir: "./dist",
});
