import { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ItemGroup {
  id?: string;
  gru_codigo: string;
  gru_descricao: string;
  ativo: boolean;
  empresa_nome?: string;
  empresa_id?: string;
}

interface ItemGroupDialogProps {
  selectedGroup: ItemGroup | null;
  onSave: (groupData: any) => Promise<void>;
  empresas: string[];
  isOpen: boolean;
}

export const ItemGroupDialog = ({
  selectedGroup,
  onSave,
  empresas,
  isOpen
}: ItemGroupDialogProps) => {
  const [formData, setFormData] = useState<any>({
    id: "",
    GRU_CODIGO: "",
    GRU_DESCRICAO: "",
    empresa: "nao_definida",
    ativo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!selectedGroup?.id;

  useEffect(() => {
    if (selectedGroup) {
      setFormData({
        id: selectedGroup.id || "",
        GRU_CODIGO: selectedGroup.gru_codigo || "",
        GRU_DESCRICAO: selectedGroup.gru_descricao || "",
        empresa: selectedGroup.empresa_nome || "nao_definida",
        ativo: selectedGroup.ativo !== undefined ? selectedGroup.ativo : true
      });
    } else {
      setFormData({
        id: "",
        GRU_CODIGO: "",
        GRU_DESCRICAO: "",
        empresa: "nao_definida",
        ativo: true
      });
    }
  }, [selectedGroup, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Grupo" : "Novo Grupo"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="GRU_CODIGO">Código</Label>
            <Input
              id="GRU_CODIGO"
              value={formData.GRU_CODIGO}
              onChange={(e) => handleChange("GRU_CODIGO", e.target.value)}
              disabled={isEditing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Select
              value={formData.empresa}
              onValueChange={(value) => handleChange("empresa", value)}
            >
              <SelectTrigger id="empresa">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa} value={empresa}>{empresa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="GRU_DESCRICAO">Descrição</Label>
          <Input
            id="GRU_DESCRICAO"
            value={formData.GRU_DESCRICAO}
            onChange={(e) => handleChange("GRU_DESCRICAO", e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => handleChange("ativo", checked)}
          />
          <Label htmlFor="ativo">Ativo</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};
