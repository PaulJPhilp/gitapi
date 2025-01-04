import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptsView } from "./components/prompts-view"
import { RunsView } from "./components/runs-view"
import { TemplatesView } from "./components/templates-view"

export default function TestPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Template Pipeline Test App</h1>

            <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="prompts">Prompts</TabsTrigger>
                    <TabsTrigger value="runs">Runs</TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                    <Card className="p-4">
                        <TemplatesView />
                    </Card>
                </TabsContent>

                <TabsContent value="prompts">
                    <Card className="p-4">
                        <PromptsView />
                    </Card>
                </TabsContent>

                <TabsContent value="runs">
                    <Card className="p-4">
                        <RunsView />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 