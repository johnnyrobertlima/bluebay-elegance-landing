
import React from "react";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Copy, Mail, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { toast } from "@/components/ui/use-toast";

interface CollectionMessageContentProps {
  clientName: string;
  clientTitles: FinancialTitle[];
  onCopy: () => void;
  onSendEmail: () => void;
  onSendMailto: () => void;
  isSending: boolean;
}

export const CollectionMessageContent: React.FC<CollectionMessageContentProps> = ({
  clientName,
  clientTitles,
  onCopy,
  onSendEmail,
  onSendMailto,
  isSending
}) => {
  const totalTitulos = clientTitles.length;
  const valorTotalTitulos = clientTitles.reduce((total, title) => total + title.VLRSALDO, 0);
  
  const handleOpenOutlookWeb = () => {
    try {
      onSendEmail();
      
      // Informar ao usuário que o link foi acionado
      toast({
        title: "Abrindo Outlook Web",
        description: "Estamos abrindo o Outlook Web em uma nova aba",
        duration: 5000,
      });
    } catch (error) {
      console.error("Erro ao tentar abrir o Outlook Web:", error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir o Outlook Web",
        description: "Por favor, tente copiar o texto e colar manualmente",
        duration: 5000,
      });
    }
  };
  
  return (
    <div className="bg-slate-50 p-4 rounded-md my-4 text-sm relative">
      {/* Botões de ação (Copiar e Abrir Cliente de Email) */}
      <div className="flex justify-end gap-2 mb-4">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCopy}
          className="flex items-center"
        >
          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar Texto
        </Button>
        <Button 
          size="sm"
          variant="default"
          onClick={handleOpenOutlookWeb}
          disabled={isSending}
          className="bg-blue-600 hover:bg-blue-700 flex items-center font-medium"
        >
          <Mail className="h-3.5 w-3.5 mr-1" /> Abrir no Outlook Web <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>
      
      <ScrollArea className="h-[400px] pr-4">
        <div className="whitespace-pre-line">
          <p><strong>Assunto:</strong> Títulos em atraso - Bluebay</p>
          <p>&nbsp;</p>
          <p>Olá,</p>
          <p>&nbsp;</p>
          <p>Verificamos que a empresa <strong>{clientName}</strong> possui título(s) com vencimento em aberto junto à Bluebay.</p>
          <p>&nbsp;</p>
          <p>Pedimos a gentileza de acessar nosso portal para realizar o download dos boletos e efetuar o pagamento o quanto antes, evitando assim encargos adicionais ou restrições comerciais.</p>
          <p>&nbsp;</p>
          <p>Segue abaixo o(s) título(s) vencido(s):</p>
          <p>&nbsp;</p>
          
          {clientTitles.map((title, index) => {
            const formattedDate = title.DTVENCIMENTO 
              ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) 
              : 'N/A';
            
            return (
              <div key={index} className="mb-1">
                <p>Nº do Título: <strong>{title.NUMDOCUMENTO || title.NUMNOTA}</strong></p>
                <p>Valor: <strong>{formatCurrency(title.VLRSALDO)}</strong></p>
                <p>Vencimento: <strong>{formattedDate}</strong></p>
                <p>&nbsp;</p>
              </div>
            );
          })}
          
          <div className="mt-2 mb-4 font-medium">
            <p>Total de Títulos Vencidos: <strong>{totalTitulos}</strong></p>
            <p>Valor Total dos Títulos: <strong>{formatCurrency(valorTotalTitulos)}</strong></p>
          </div>
          
          <p>Acesse seu portal através do link abaixo:</p>
          <p>🔗 Acessar Portal Bluebay</p>
          <p>&nbsp;</p>
          <p>Em caso de dúvidas, nossa equipe está à disposição para ajudá-lo.</p>
          <p>&nbsp;</p>
          <p>Atenciosamente,</p>
          <p>Equipe Financeira – Bluebay Importadora</p>
          <p>📧 financeiro@bluebay.com.br</p>
          <p>📞 (11) 1234-5678</p>
        </div>
      </ScrollArea>
    </div>
  );
};
