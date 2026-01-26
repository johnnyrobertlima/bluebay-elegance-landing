
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { WalletOrder } from "@/services/bluebay/walletManagementService";
import { formatCurrency } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface WalletManagementGridProps {
    data: WalletOrder[];
    isLoading: boolean;
}

const ProgressBar = ({ delivered, total, pending, onHoverDetails }: { delivered: number, total: number, pending: number, onHoverDetails: any }) => {
    const progress = total > 0 ? (delivered / total) * 100 : 0;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-full h-4 bg-secondary rounded-full overflow-hidden cursor-help relative">
                        <div
                            className="h-full bg-green-500 transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                        {/* pending part implied as remainder */}
                    </div>
                </TooltipTrigger>
                <TooltipContent className="p-4 bg-popover border text-popover-foreground shadow-md rounded-md">
                    <div className="space-y-1 text-xs">
                        <div className="font-bold border-b pb-1 mb-1">Detalhes Financeiros</div>
                        <div className="flex justify-between gap-4">
                            <span>Total ({total}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.total)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-green-600">
                            <span>Entregue ({delivered}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.delivered)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-orange-600">
                            <span>Saldo ({pending}):</span>
                            <span className="font-mono">{formatCurrency(onHoverDetails.pending)}</span>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const WalletManagementGrid = ({ data, isLoading }: WalletManagementGridProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (data.length === 0) {
        return <div className="text-center p-8 text-muted-foreground">Nenhum pedido encontrado para o período.</div>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="w-[100px] text-right">Qtd. Pedida</TableHead>
                        <TableHead className="w-[100px] text-right">Qtd. Entregue</TableHead>
                        <TableHead className="w-[100px] text-right">Saldo</TableHead>
                        <TableHead className="w-[200px]">Status Entrega</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((order) => (
                        <TableRow key={order.pesCodigo}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{order.clienteNome}</span>
                                    <span className="text-xs text-muted-foreground">Cód: {order.pesCodigo}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">{order.qtdePedida}</TableCell>
                            <TableCell className="text-right text-green-600">{order.qtdeEntregue}</TableCell>
                            <TableCell className="text-right text-orange-600">{order.qtdeSaldo}</TableCell>
                            <TableCell>
                                <ProgressBar
                                    delivered={order.qtdeEntregue}
                                    total={order.qtdePedida}
                                    pending={order.qtdeSaldo}
                                    onHoverDetails={{
                                        total: order.valorTotalPedido,
                                        delivered: order.valorTotalEntregue,
                                        pending: order.valorTotalSaldo
                                    }}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
