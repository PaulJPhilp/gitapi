import { cn } from "@/components/ui/utils"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import type { EditorState, LexicalEditor as LexicalEditorType } from "lexical"
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical"

interface LexicalEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    onChange?: (editorState: EditorState, editor: LexicalEditorType) => void
    defaultValue?: string
    placeholder?: string
}

const initialConfig = {
    namespace: "lexical-editor",
    theme: {
        paragraph: "mb-1",
        text: {
            bold: "font-bold",
            italic: "italic",
            underline: "underline",
            strikethrough: "line-through",
        },
    },
    onError: (error: Error) => {
        console.error("[LexicalEditor]", error)
    },
}

export function LexicalEditor({
    className,
    onChange,
    defaultValue,
    placeholder = "Enter text...",
    ...props
}: LexicalEditorProps) {
    const config = {
        ...initialConfig,
        editorState: defaultValue ? (editor: LexicalEditorType) => {
            const root = $getRoot()
            const paragraph = $createParagraphNode()
            const text = $createTextNode(defaultValue)
            paragraph.append(text)
            root.append(paragraph)
        } : undefined,
    }

    return (
        <div
            className={cn(
                "min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <LexicalComposer initialConfig={config}>
                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="min-h-[80px] outline-none" />
                        }
                        placeholder={
                            <div className="pointer-events-none absolute top-[1.125rem] select-none text-muted-foreground">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={(editorState, editor, tags) => {
                        onChange?.(editorState, editor)
                    }} />
                    <HistoryPlugin />
                </div>
            </LexicalComposer>
        </div>
    )
} 