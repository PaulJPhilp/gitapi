import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactElement } from "react";
import { z } from "zod";

interface MDXPromptTemplate {
    content: ReactElement;
    frontmatter: {
        version: string;
        title: string;
        description?: string;
        tags?: string[];
    };
}

const frontmatterSchema = z.object({
    version: z.string(),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export async function loadMDXPrompt(
    templatePath: string,
): Promise<MDXPromptTemplate> {
    try {
        // Using Bun's file API
        const source = await Bun.file(templatePath).text();

        const { content, frontmatter } = await compileMDX({
            source,
            options: { parseFrontmatter: true },
        });

        const validatedFrontmatter = frontmatterSchema.parse(frontmatter);

        return {
            content,
            frontmatter: validatedFrontmatter,
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid frontmatter: ${error.message}`);
        }
        if (error instanceof Error && error.message.includes('no such file')) {
            throw new Error(`Template file not found: ${templatePath}`);
        }
        throw new Error(`Failed to load MDX prompt: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
