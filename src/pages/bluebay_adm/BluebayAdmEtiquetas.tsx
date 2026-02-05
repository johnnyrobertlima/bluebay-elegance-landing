import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LabelLayoutBuilder } from "@/components/bluebay_adm/etiquetas/LabelLayoutBuilder";
import { LabelPrintQueue } from "@/components/bluebay_adm/etiquetas/LabelPrintQueue";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";

export function BluebayAdmEtiquetas() {
  return (
    <main className="container-fluid p-0 max-w-full">

      <BluebayAdmMenu />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Etiquetas (ZPL)</h1>
          <p className="text-muted-foreground">
            Gerencie layouts e imprima etiquetas para impressoras Zebra (86mm x 120mm).
          </p>
        </div>

        <Tabs defaultValue="print" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="print">Imprimir</TabsTrigger>
            <TabsTrigger value="layout">Editor de Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="print" className="mt-6">
            <LabelPrintQueue />
          </TabsContent>

          <TabsContent value="layout" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Editor Visual de Etiquetas</CardTitle>
                <CardDescription>
                  Arraste elementos para compor sua etiqueta. As dimensões são fixas em 86x120mm.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LabelLayoutBuilder />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default BluebayAdmEtiquetas;