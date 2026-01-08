
import { Card, CardContent } from "@/components/ui/card";

export const VariationLoading = () => {
  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando item e carregando dados...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
