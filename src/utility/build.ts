import transpile from "./transpiler.ts";
import { readdir } from "node:fs/promises";

performance.mark("start-build");

// Transpile project to dist folder
const output_location = `./dist/bulk-animations/`;

const results = await Promise.all([
    transpile(`./src/index.ts`, `${output_location}index.mjs`), // Module
]);

const failed = results.find((result) => !result?.success);

if (failed) {
    throw new Error(`Failed to transpile project: ${failed.message?.data ?? "Unknown error"}`);
}

// Copy images to dist folder
const image_location = `./src/images`;

const files = await readdir(image_location);

files.forEach(async (file) => {
    const input_location = `${image_location}/${file}`;
    const file_output_location = `${output_location}/images/${file}`;

    await Bun.write(file_output_location, await Bun.file(input_location).arrayBuffer()).catch((error) => {
        console.error(`Failed to copy image ${file} to ${file_output_location}: ${error.message}`);
    });
});

performance.mark("end-build");
console.log(`Build completed in ${performance.measure("build", "start-build", "end-build").duration.toFixed(2)}ms`);
