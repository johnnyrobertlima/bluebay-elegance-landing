
import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface AsyncFilterProps {
    label: string
    value: string | null
    onChange: (value: string | null) => void
    fetchOptions: (query: string) => Promise<Option[]>
    initialOptions?: Option[]
    placeholder?: string
    width?: string
}

export function AsyncFilter({
    label,
    value,
    onChange,
    fetchOptions,
    initialOptions = [],
    placeholder = "Selecionar...",
    width = "w-[250px]"
}: AsyncFilterProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedLabel, setSelectedLabel] = React.useState<string | null>(null)
    const [options, setOptions] = React.useState<Option[]>(initialOptions)
    const [loading, setLoading] = React.useState(false)

    // Initial fetch or label lookup could be improved if we have only ID
    // For now, if value is set but no label, we might show ID or need a lookup prop.
    // Assuming value comes with knowledge or we fetch on mount if value exists?
    // Let's stick to simple: user searches, selects.

    const handleSearch = React.useCallback(async (search: string) => {
        setLoading(true)
        try {
            const results = await fetchOptions(search)
            setOptions(results)
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
            if (open) { // Only fetch if open
                if (query.length >= 2 || (query.length === 0 && initialOptions.length === 0)) {
                    handleSearch(query)
                }
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query, open, handleSearch, initialOptions.length])

    // Update local label when value or options change
    React.useEffect(() => {
        if (value) {
            const opt = options.find(o => o.value === value)
            if (opt) setSelectedLabel(opt.label)
            // If not found in current options, we might want to keep previous label if known?
            // For now, let's allow it to fallback to ID if we don't have label
        } else {
            setSelectedLabel(null)
        }
    }, [value, options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(width, "justify-between")}
                >
                    {selectedLabel || value || label}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn(width, "p-0")}>
                <Command shouldFilter={false}> {/* We filter async */}
                    <CommandInput
                        placeholder={placeholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        {loading && <div className="py-6 text-center text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Carregando...</div>}
                        {!loading && options.length === 0 && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}
                        <CommandGroup>
                            {!loading && options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        // Command might lowercase value, so use option.value
                                        const newValue = option.value === value ? null : option.value
                                        onChange(newValue)
                                        setOpen(false)
                                        setSelectedLabel(option.label)
                                        setQuery("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
