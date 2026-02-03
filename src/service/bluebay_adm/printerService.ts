import { toast } from "sonner";

// Default Zebra Browser Print Service URL
const DEFAULT_HOST = "http://localhost:9100";

interface PrinterConfig {
    ip: string;
    port: string;
    useLocalService: boolean; // true = localhost:9100, false = direct IP
    dpi: number;
    offsetLeft: number; // mm
    offsetTop: number; // mm
}

const STORAGE_KEY = "bluebay_printer_config";

export const getPrinterConfig = (): PrinterConfig => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const config = JSON.parse(saved);
        if (!config.dpi) config.dpi = 203;
        if (config.offsetLeft === undefined) config.offsetLeft = 0;
        if (config.offsetTop === undefined) config.offsetTop = 0;
        return config;
    }
    return {
        ip: "localhost",
        port: "9100",
        useLocalService: true,
        dpi: 203,
        offsetLeft: 0,
        offsetTop: 0
    };
};

export const savePrinterConfig = (config: PrinterConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const sendZplToPrinter = async (zpl: string) => {
    const config = getPrinterConfig();

    if (!config.useLocalService) {
        // Direct Network IP Mode (Port 9100 usually invalid for HTTP)
        // Network printers act as raw socket listeners on 9100, NOT HTTP servers.
        // We can only use HTTP if the printer has a built-in webserver accepting POST (like /pstprnt).

        console.log(`Sending to Network Printer: http://${config.ip}/pstprnt`);
        try {
            await fetch(`http://${config.ip}/pstprnt`, {
                method: 'POST',
                body: zpl,
                mode: 'no-cors'
            });
            toast.success("Enviado para impressora (Modo Rede)");
        } catch (e) {
            console.error("Network print error", e);
            throw new Error("Falha ao enviar para IP de rede. Verifique se a impressora suporta HTTP POST.");
        }
        return;
    }

    // Local Service Mode (Zebra Browser Print)
    // 1. Get Available Devices
    // 2. Send to "write" endpoint with correct UID

    const baseUrl = `http://${config.ip}:${config.port}`;

    try {
        toast.info("Buscando dispositivos...");

        // Step 1: Discover Devices
        const availableResponse = await fetch(`${baseUrl}/available`);
        if (!availableResponse.ok) {
            throw new Error(`Erro ao buscar dispositivos: ${availableResponse.status}`);
        }

        const devices = await availableResponse.json();

        if (!devices || !devices.printer || devices.printer.length === 0) {
            throw new Error("Nenhuma impressora encontrada no serviço local.");
        }

        // Select the first available printer
        const selectedPrinter = devices.printer[0];
        console.log("Selected printer:", selectedPrinter);

        // Step 2: Send ZPL
        toast.info(`Imprimindo em ${selectedPrinter.name}...`);

        // IMPORTANT: Send the EXACT device object received from /available
        // Do not construct manually to avoid missing fields like 'deviceType'
        const printResponse = await fetch(`${baseUrl}/write`, {
            method: 'POST',
            body: JSON.stringify({
                device: selectedPrinter,
                data: zpl
            })
        });

        if (!printResponse.ok) {
            throw new Error(`Erro na impressão: ${printResponse.status}`);
        }

        toast.success("Enviado com sucesso!");

    } catch (error: any) {
        console.error("Zebra Browser Print Error:", error);

        // Fallback: Try RAW POST to localhost if user is using a simple proxy (not ZBP)
        try {
            console.log("Tentando fallback RAW...");
            await fetch(baseUrl, { method: 'POST', body: zpl, mode: 'no-cors' });
            toast.success("Enviado (Modo RAW/Fallback)");
            return;
        } catch (fallbackError) {
            console.error("Fallback failed", fallbackError);
        }

        toast.error(`Erro: ${error.message || "Falha na comunicação"}. Tente reiniciar o Zebra Browser Print.`);
        throw error;
    }
};
