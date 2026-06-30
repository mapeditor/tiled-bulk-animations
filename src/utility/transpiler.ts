const process_root_directory = process.cwd();

const transpiler = new Bun.Transpiler({
    loader: "tsx"
});

export default async function transpile(local_path: string, destination: string): Promise<IResult> {
    const input_location = `${process_root_directory}/${local_path}`;
    const output_location = `${process_root_directory}/${destination}`;
    const file = Bun.file(input_location);

    if (!file.exists()) {
        return {
            success: false,
            message: {
                data: `File not found: ${local_path}`
            }
        };
    }

    const file_content = await file.text();
    // Pre-process: replace bare `return;` with `return (0, void 0);` so Bun won't strip it
    const preprocessed = file_content.replace(/\breturn\s*;/g, "return (0, void 0);");
    let transpiled = await transpiler.transform(preprocessed);
    // Strip class field declarations (ES2022) — not supported by Qt's QJSEngine
    transpiled = transpiled.replace(/^([ \t]+)\w+;\s*$/gm, "");
    // Rewrite bare relative imports to .mjs for Qt module resolution
    transpiled = transpiled.replace(/(from\s+["'])(\.\/\w+)(["'])/g, "$1$2.mjs$3");
    // Post-process: restore bare `return;`
    transpiled = transpiled.replace(/\breturn\s+0\s*,\s*(?:void\s+0|undefined)\s*;/g, "return;");

    await Bun.write(output_location, transpiled).catch((error) => {
        return {
            success: false,
            message: {
                data: `Failed to write transpiled file to ${output_location}: ${error.message}`,
                stack: error.stack
            }
        };
    });

    return {
        success: true,
        message: {
            data: `Successfully transpiled ${local_path} to ${output_location}`
        }
    };
}
