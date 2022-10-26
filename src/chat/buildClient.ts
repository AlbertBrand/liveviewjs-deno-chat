import * as esbuild from "https://deno.land/x/esbuild@v0.15.9/mod.js";

// Build / watch the client code
const result = await esbuild.build({
  entryPoints: ["src/client/index.ts"],
  outdir: "public/js",
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: true,
});

if (result.errors.length > 0) {
  console.error(result.errors);
} else {
  console.log("client build succeeded");
}

esbuild.stop();
