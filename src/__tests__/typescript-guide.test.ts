import path from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { loadMDXPrompt } from "../utils/mdxPromptLoader"

describe("TypeScript Guide Template", () => {
    const templatePath = path.join(process.cwd(), "src/prompts/typescript-guide.mdx")

    it("should load and validate the template", async () => {
        const template = await loadMDXPrompt(templatePath)

        // Verify frontmatter
        expect(template.frontmatter).toEqual({
            version: "1",
            title: "TypeScript Coding Guide",
            description: "TypeScript conventions and best practices",
            tags: ["typescript", "best-practices", "coding-standards"]
        })

        // Verify content exists and is a React element
        expect(template.content).toBeDefined()
        expect(template.content.type).toBeDefined()
    })

    it("should contain required sections", async () => {
        const template = await loadMDXPrompt(templatePath)
        const renderedContent = renderToString(template.content)

        // Check for main sections using case-insensitive regex
        const sections = [
            /type\s+definitions/i,
            /interfaces\s+and\s+types/i,
            /null\s+handling/i,
            /async\/await/i,
            /type\s+assertions/i,
            /enums/i,
            /imports\/exports/i
        ]

        for (const section of sections) {
            expect(renderedContent).toMatch(section)
        }
    })

    it("should include code examples", async () => {
        const template = await loadMDXPrompt(templatePath)
        const renderedContent = renderToString(template.content)

        // Check for code examples using more flexible matching that handles HTML entities
        const codeExamples = [
            /interface\s+Prompt\s*{/i,
            /user\?\.profile\?\.name/i,
            /async\s+function\s+processUser/i,
            /type\s+Status\s*=\s*(?:&#x27;|')?active(?:&#x27;|')?\s*\|\s*(?:&#x27;|')?inactive(?:&#x27;|')?\s*\|\s*(?:&#x27;|')?pending(?:&#x27;|')?/i
        ]

        for (const example of codeExamples) {
            expect(renderedContent).toMatch(example)
        }
    })
}) 