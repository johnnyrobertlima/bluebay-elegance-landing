
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sendOutlookEmail, sendMailtoEmail } from "../utils/outlookEmailUtils";
import { ClientDebtSummary, FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useCollectionMessage = (
  selectedClient: ClientDebtSummary | null,
  clientTitles: FinancialTitle[],
  onCollectionConfirm: () => void
) => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const createMessageContent = () => {
    if (!selectedClient) return "";
    
    // Construir o texto dos títulos com quebras de linha apropriadas
    let titlesText = "";
    clientTitles.forEach(title => {
      const formattedDate = title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A';
      
      titlesText += `\nNº do Título: ${title.NUMDOCUMENTO || title.NUMNOTA}\nValor: ${formatCurrency(title.VLRSALDO)}\nVencimento: ${formattedDate}\n`;
    });
    
    // Calcular os totais para incluir na mensagem
    const totalTitulos = clientTitles.length;
    const valorTotalTitulos = clientTitles.reduce((total, title) => total + title.VLRSALDO, 0);

    const totalInfo = `\nTotal de Títulos Vencidos: ${totalTitulos}\nValor Total dos Títulos: ${formatCurrency(valorTotalTitulos)}\n`;
    
    // Usar template string (com crase) para facilitar múltiplas linhas e manter formatação
    const messageText = `Olá,

Verificamos que a empresa ${selectedClient.CLIENTE_NOME} possui título(s) com vencimento em aberto junto à Bluebay.

Pedimos a gentileza de acessar nosso portal para realizar o download dos boletos e efetuar o pagamento o quanto antes, evitando assim encargos adicionais ou restrições comerciais.

Segue abaixo o(s) título(s) vencido(s):${titlesText}
${totalInfo}
Acesse seu portal através do link abaixo:
🔗 Acessar Portal Bluebay

Em caso de dúvidas, nossa equipe está à disposição para ajudá-lo.

Atenciosamente,
Equipe Financeira – Bluebay Importadora
📧 financeiro@bluebay.com.br
📞 (11) 1234-5678`;

    return messageText;
  };

  const handleCopyText = () => {
    const messageText = createMessageContent();
    
    navigator.clipboard.writeText(messageText).then(() => {
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível copiar o texto",
      });
    });
  };

  const handleOpenOutlookWeb = async () => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      // Criar o corpo do e-mail como texto simples sem nenhuma codificação especial
      const emailBody = createMessageContent();
      
      // Definir o assunto como uma string separada
      const emailSubject = `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`;
      
      toast({
        title: "Abrindo Outlook Web",
        description: "Estamos abrindo o Outlook Web em uma nova aba",
        duration: 5000,
      });
      
      console.log("Tentando enviar e-mail para:", selectedClient.CLIENTE_NOME);
      console.log("Email do cliente:", selectedClient.CLIENTE_EMAIL || "Não disponível");
      
      // Usar o email do cliente se estiver disponível
      const recipientEmail = selectedClient.CLIENTE_EMAIL || "";
      
      // Passar o corpo e assunto para a função de envio que fará a codificação correta
      await sendOutlookEmail({
        to: recipientEmail, // Usando o email do cliente quando disponível
        subject: emailSubject,
        body: emailBody,
        clientName: selectedClient.CLIENTE_NOME
      });
      
      // Adicionamos um delay para dar tempo de o cliente responder
      setTimeout(() => {
        // Registramos a cobrança como realizada
        onCollectionConfirm();
        
        toast({
          title: "Cobrança registrada",
          description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada.`,
        });
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao abrir Outlook Web:', error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir Outlook Web",
        description: "Por favor, use a opção 'Copiar Texto' e cole em seu cliente de e-mail manualmente.",
        duration: 7000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMailto = async () => {
    if (!selectedClient) return;
    
    setIsSending(true);
    
    try {
      const emailBody = createMessageContent();
      
      toast({
        title: "Abrindo cliente de e-mail padrão",
        description: "Se o cliente de e-mail não abrir automaticamente, use a opção 'Copiar Texto'",
        duration: 5000,
      });
      
      console.log("Tentando enviar e-mail via mailto para:", selectedClient.CLIENTE_NOME);
      
      // Usar o email do cliente se estiver disponível
      const recipientEmail = selectedClient.CLIENTE_EMAIL || "";
      
      await sendMailtoEmail({
        to: recipientEmail, // Usando o email do cliente quando disponível
        subject: `Títulos em atraso - Bluebay - ${selectedClient.CLIENTE_NOME}`,
        body: emailBody,
        clientName: selectedClient.CLIENTE_NOME
      });
      
      // Registramos a cobrança como realizada após um curto período
      setTimeout(() => {
        onCollectionConfirm();
        
        toast({
          title: "Cobrança registrada",
          description: `A cobrança para ${selectedClient.CLIENTE_NOME} foi registrada.`,
        });
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast({
        variant: "destructive",
        title: "Erro ao abrir cliente de e-mail",
        description: "Por favor, use a opção 'Copiar Texto' e cole em seu cliente de e-mail manualmente.",
        duration: 7000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return {
    isSending,
    createMessageContent,
    handleCopyText,
    handleOpenOutlookWeb,
    handleSendMailto
  };
};
