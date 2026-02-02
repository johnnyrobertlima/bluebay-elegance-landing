
import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { fetchEmpresas } from "@/services/bluebay_adm/itemGroupService";

interface CompanyFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export const CompanyFilter: React.FC<CompanyFilterProps> = ({
    value,
    onChange,
}) => {
    const [empresas, setEmpresas] = useState<string[]>([]);

    useEffect(() => {
        const loadEmpresas = async () => {
            const data = await fetchEmpresas();
            setEmpresas(data);
        };
        loadEmpresas();
    }, []);

    return (
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <Select
                value={value}
                onValueChange={onChange}
            >
                <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Empresa do Grupo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as empresas</SelectItem>
                    {empresas.map((empresa) => (
                        <SelectItem key={empresa} value={empresa}>
                            {empresa}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};
