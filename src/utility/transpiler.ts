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
    const transpiled = await transpiler.transform(file_content);

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
