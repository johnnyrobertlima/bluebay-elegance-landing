
import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
    value: string
    label: string
}

interface MultiSelectAsyncFilterProps {
    label: string
    value: string[]; // Array of selected values
    onChange: (value: string[]) => void;
    fetchOptions: (query: string) => Promise<Option[]>;
    initialOptions?: Option[];
    placeholder?: string;
    width?: string;
}

export function MultiSelectAsyncFilter({
    label,
    value = [], // Default to empty array
    onChange,
    fetchOptions,
    initialOptions = [],
    placeholder = "Selecionar...",
    width = "w-[300px]"
}: MultiSelectAsyncFilterProps) {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<Option[]>(initialOptions)
    const [loading, setLoading] = React.useState(false)
    const [selectedLabels, setSelectedLabels] = React.useState<Map<string, string>>(new Map());

    // Populate initial map if options are provided or we might need a way to fetch labels for pre-selected IDs
    // For simplicity, we assume options found during search populate the label cache.
    // If we only have IDs initially, we display IDs until a search finds the name, or we need a prop to pre-fill labels.

    const handleSearch = React.useCallback(async (search: string) => {
        setLoading(true)
        try {
            const results = await fetchOptions(search)
            setOptions(results)
            // Update known labels map
            setSelectedLabels(prev => {
                const next = new Map(prev);
                results.forEach(r => next.set(r.value, r.label));
                return next;
            });
        } catch (error) {
            console.error("Failed to fetch options", error)
        } finally {
            setLoading(false)
        }
    }, [fetchOptions])

    // Debounce search
    const [query, setQuery] = React.useState("")
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (open) {
                if (query.length >= 2 || (query.length === 0 && initialOptions.length === 0)) {
                    handleSearch(query)
                }
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query, open, handleSearch, initialOptions.length])

    // Initialize labels for initial options
    React.useEffect(() => {
        if (initialOptions.length > 0) {
            setSelectedLabels(prev => {
                const next = new Map(prev);
                initialOptions.forEach(r => next.set(r.value, r.label));
                return next;
            });
        }
    }, [initialOptions]);


    const handleSelect = (optionValue: string, optionLabel: string) => {
        const isSelected = value.includes(optionValue);
        let newValue: string[];

        if (isSelected) {
            newValue = value.filter(v => v !== optionValue);
        } else {
            newValue = [...value, optionValue];
        }

        // Ensure label is saved
        setSelectedLabels(prev => {
            const next = new Map(prev);
            next.set(optionValue, optionLabel);
            return next;
        });

        onChange(newValue);
        // Don't close on select for multi-select convenience
        // setOpen(false); 
    };

    const handleRemove = (valToRemove: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== valToRemove));
    };

    return (
        <div className="flex flex-col gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(width, "justify-between", "h-auto min-h-[40px] px-3 py-2")}
                    >
                        <div className="flex flex-wrap gap-1 items-center">
                            {value.length === 0 && <span className="text-muted-foreground font-normal">{label}</span>}
                            {value.length > 0 && (
                                <span className="mr-2 font-medium">{label}:</span>
                            )}
                            {value.length > 0 && value.length <= 2 && value.map(val => (
                                <Badge key={val} variant="secondary" className="mr-1">
                                    {selectedLabels.get(val) || val}
                                    <X
                                        className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                                        onClick={(e) => handleRemove(val, e)}
                                    />
                                </Badge>
                            ))}
                            {value.length > 2 && (
                                <Badge variant="secondary">
                                    {value.length} selecionados
                                </Badge>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn(width, "p-0")}>
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={placeholder}
                            value={query}
                            onValueChange={setQuery}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (options.length > 0) {
                                        const newValues = [...value];
                                        const newLabels = new Map(selectedLabels);
                                        let changeCount = 0;

                                        options.forEach(opt => {
                                            if (!newValues.includes(opt.value)) {
                                                newValues.push(opt.value);
                                                changeCount++;
                                            }
                                            newLabels.set(opt.value, opt.label);
                                        });

                                        if (changeCount > 0) {
                                            setSelectedLabels(newLabels);
                                            onChange(newValues);
                                        }
                                    }
                                }
                            }}
                        />
                        <CommandList>
                            {loading && <div className="py-6 text-center text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Carregando...</div>}
                            {!loading && options.length === 0 && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}
                            <CommandGroup>
                                {!loading && options.map((option) => {
                                    const isSelected = value.includes(option.value);
                                    return (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => handleSelect(option.value, option.label)}
                                        >
                                            <div className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                            )}>
                                                <Check className={cn("h-4 w-4")} />
                                            </div>
                                            {option.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Display active tags detail if more than 2, or just always show details below? 
                User said "aparecer como um filtro ativo... e ir removendo".
                If we use badges inside the button (Combobox), it's compact.
                If we have many selected, we might want a list below.
                For now, the combobox display logic handles usage.
            */}
            {value.length > 2 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {value.map(val => (
                        <Badge key={val} variant="outline" className="text-xs">
                            {selectedLabels.get(val) || val}
                            <X
                                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                                onClick={(e) => handleRemove(val, e)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
