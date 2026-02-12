
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Check, AlertCircle } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface UserAccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName: string | null;
    onSuccess: () => void;
}

type AccessType = 'NONE' | 'CNPJ' | 'CATEGORY';

export function UserAccessDialog({ isOpen, onClose, userId, userName, onSuccess }: UserAccessDialogProps) {
    const { toast } = useToast();
    const [accessType, setAccessType] = useState<AccessType>('NONE');
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedClient, setSelectedClient] = useState<{ label: string, value: string } | null>(null);
    const [openClientCombo, setOpenClientCombo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Load current settings when dialog opens
    useEffect(() => {
        if (isOpen && userId) {
            loadUserSettings();
        } else {
            // Reset form
            setAccessType('NONE');
            setSelectedCategory("");
            setSelectedClient(null);
            setSearchQuery("");
        }
    }, [isOpen, userId]);

    const loadUserSettings = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('profiles')
                .select('linked_client_type, linked_client_value')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                setAccessType((data.linked_client_type as AccessType) || 'NONE');
                if (data.linked_client_type === 'CATEGORY') {
                    setSelectedCategory(data.linked_client_value || "");
                } else if (data.linked_client_type === 'CNPJ') {
                    // Ideally we would fetch the client name here to display nicely
                    // For now, we set the value as label if we don't have the name
                    // Optimization: Fetch client name by CNPJ/ID if time permits
                    if (data.linked_client_value) {
                        fetchClientDetails(data.linked_client_value);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading user settings:", error);
            toast({
                variant: "destructive",
                title: "Erro ao carregar configurações",
            });
        }
    };

    const fetchClientDetails = async (cnpjOrId: string) => {
        try {
            // Search by both CNPJ or ID to be safe, though usually we store CNPJ if type is CNPJ
            // Attempting to match exact
            const { data } = await (supabase as any)
                .from('BLUEBAY_PESSOA')
                .select('RAZAOSOCIAL, APELIDO, CNPJCPF')
                .or(`CNPJCPF.eq.${cnpjOrId},PES_CODIGO.eq.${cnpjOrId}`) // Try both just in case
                .limit(1)
                .maybeSingle();

            if (data) {
                setSelectedClient({
                    value: cnpjOrId, // Keep the stored value
                    label: data.APELIDO || data.RAZAOSOCIAL || cnpjOrId
                });
            } else {
                setSelectedClient({ value: cnpjOrId, label: cnpjOrId });
            }
        } catch (e) {
            console.error("Error fetching client details", e);
            setSelectedClient({ value: cnpjOrId, label: cnpjOrId });
        }
    }


    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['client-categories'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('BLUEBAY_PESSOA')
                .select('NOME_CATEGORIA')
                .not('NOME_CATEGORIA', 'is', null);

            if (error) throw error;

            // Get unique categories
            const unique = Array.from(new Set(data.map((item: any) => item.NOME_CATEGORIA))).sort() as string[];
            return unique;
        },
        enabled: isOpen && accessType === 'CATEGORY'
    });

    // Client Search
    const { data: clientSearchResults = [], isLoading: isLoadingClients } = useQuery({
        queryKey: ['client-search', searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.length < 2) return [];

            const { data, error } = await (supabase as any)
                .from('BLUEBAY_PESSOA')
                .select('PES_CODIGO, RAZAOSOCIAL, APELIDO, CNPJCPF')
                .or(`RAZAOSOCIAL.ilike.%${searchQuery}%,CNPJCPF.ilike.%${searchQuery}%,APELIDO.ilike.%${searchQuery}%`)
                .limit(20);

            if (error) throw error;
            return data;
        },
        enabled: isOpen && accessType === 'CNPJ' && searchQuery.length >= 2
    });

    const handleSave = async () => {
        if (!userId) return;

        if (accessType === 'CATEGORY' && !selectedCategory) {
            toast({ title: "Selecione uma categoria", variant: "destructive" });
            return;
        }
        if (accessType === 'CNPJ' && !selectedClient) {
            toast({ title: "Selecione um cliente", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            let value = null;
            if (accessType === 'CATEGORY') value = selectedCategory;
            if (accessType === 'CNPJ') value = selectedClient?.value;

            const { error } = await (supabase as any)
                .from('profiles')
                .update({
                    linked_client_type: accessType,
                    linked_client_value: value
                })
                .eq('id', userId);

            if (error) throw error;

            toast({ title: "Acesso atualizado com sucesso" });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving access:", error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: error.message
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Acesso do Usuário</DialogTitle>
                    <DialogDescription>
                        Defina as restrições de visualização para <strong>{userName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup value={accessType} onValueChange={(val) => setAccessType(val as AccessType)} className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <RadioGroupItem value="NONE" id="none" className="mt-1" />
                            <div className="grid gap-1.5">
                                <Label htmlFor="none" className="font-medium">Acesso Completo (Sem Restrição)</Label>
                                <p className="text-sm text-muted-foreground">O usuário pode ver todos os clientes.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <RadioGroupItem value="CNPJ" id="cnpj" className="mt-1" />
                            <div className="grid gap-1.5 w-full">
                                <Label htmlFor="cnpj" className="font-medium">Vincular a um Cliente (CNPJ)</Label>
                                <p className="text-sm text-muted-foreground">O usuário verá apenas dados deste cliente específico.</p>

                                {accessType === 'CNPJ' && (
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                        <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openClientCombo}
                                                    className="w-full justify-between"
                                                >
                                                    {selectedClient ? selectedClient.label : "Buscar cliente..."}
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0" align="start">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="Buscar por nome ou CNPJ..."
                                                        value={searchQuery}
                                                        onValueChange={setSearchQuery}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {searchQuery.length < 2 ? "Digite pelo menos 2 caracteres..." :
                                                                isLoadingClients ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> : "Nenhum cliente encontrado."}
                                                        </CommandEmpty>
                                                        <CommandGroup heading="Clientes">
                                                            {clientSearchResults.map((client: any) => (
                                                                <CommandItem
                                                                    key={client.PES_CODIGO}
                                                                    value={client.CNPJCPF || String(client.PES_CODIGO)}
                                                                    onSelect={() => {
                                                                        // Prefer CNPJ, fallback to ID if needed but user asked for CNPJ
                                                                        // CAUTION: Some clients might not have CNPJ. 
                                                                        const val = client.CNPJCPF || String(client.PES_CODIGO);
                                                                        const label = `${client.APELIDO || client.RAZAOSOCIAL} (${val})`;
                                                                        setSelectedClient({ value: val, label });
                                                                        setOpenClientCombo(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedClient?.value === (client.CNPJCPF || String(client.PES_CODIGO)) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col">
                                                                        <span>{client.APELIDO || client.RAZAOSOCIAL}</span>
                                                                        <span className="text-xs text-muted-foreground">{client.CNPJCPF || "Sem CNPJ"}</span>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <RadioGroupItem value="CATEGORY" id="category" className="mt-1" />
                            <div className="grid gap-1.5 w-full">
                                <Label htmlFor="category" className="font-medium">Vincular a uma Categoria</Label>
                                <p className="text-sm text-muted-foreground">O usuário verá todos os clientes desta categoria.</p>

                                {accessType === 'CATEGORY' && (
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </RadioGroup>

                    {selectedClient && selectedClient.value && !selectedClient.value.match(/^\d{14}$/) && accessType === 'CNPJ' && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs mt-2 bg-amber-50 p-2 rounded">
                            <AlertCircle className="h-4 w-4" />
                            <span>Atenção: O cliente selecionado não possui um CNPJ válido cadastrado. O vínculo será feito pelo ID interno ({selectedClient.value}).</span>
                        </div>
                    )}

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
