
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const CentroCustoLoading = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Indicadores por Centro de Custo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
        </div>
      </CardContent>
    </Card>
  );
};
