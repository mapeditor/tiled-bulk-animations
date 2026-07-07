import ts from "typescript";

const process_root_directory = process.cwd();

export default async function transpile(local_path: string, destination: string): Promise<IResult> {
    const input_location = `${process_root_directory}/${local_path}`;
    const output_location = `${process_root_directory}/${destination}`;
    const file = Bun.file(input_location);

    if (!await file.exists()) {
        return {
            success: false,
            message: {
                data: `File not found: ${local_path}`
            }
        };
    }

    const file_content = await file.text();

    // Emit with the TypeScript compiler, which downlevels class fields and
    // other post-ES2021 syntax not supported by Qt's QJSEngine. Type checking
    // is done separately by `tsc --noEmit`.
    const transpiled = ts.transpileModule(file_content, {
        fileName: input_location,
        compilerOptions: {
            target: ts.ScriptTarget.ES2021,
            module: ts.ModuleKind.ESNext
        }
    }).outputText;

    try {
        await Bun.write(output_location, transpiled);
    } catch (error: any) {
        return {
            success: false,
            message: {
                data: `Failed to write transpiled file to ${output_location}: ${error.message}`,
                stack: error.stack
            }
        };
    }

    return {
        success: true,
        message: {
            data: `Successfully transpiled ${local_path} to ${output_location}`
        }
    };
}
