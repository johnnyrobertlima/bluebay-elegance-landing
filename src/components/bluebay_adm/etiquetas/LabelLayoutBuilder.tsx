import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LabelElement, LabelLayout, saveLayout, fetchLayouts, deleteLayout } from '@/service/bluebay_adm/labelLayoutService';
import { toast } from 'sonner';
import { Trash2, Save, Plus, Type, Barcode, QrCode, Square, GripVertical, Image as ImageIcon } from 'lucide-react';

interface LabelLayoutBuilderProps {
    onSave?: () => void;
}

// Default Dimensions
const DEFAULT_DPI = 203; // ZT411 default
const ITEM_FIELDS = [
    { value: 'ITEM_CODIGO', label: 'Código do Item' },
    { value: 'CODIGOAUX', label: 'Código Auxiliar' },
    { value: 'DESCRICAO', label: 'Descrição' },
    { value: 'GRU_CODIGO', label: 'Código Grupo' },
    { value: 'GRU_DESCRICAO', label: 'Descrição Grupo' },
    { value: 'ncm', label: 'NCM' },
    { value: 'genero', label: 'Gênero' },
    { value: 'faixa_etaria', label: 'Faixa Etária' },
    { value: 'estacao', label: 'Estação' },
    { value: 'id_marca', label: 'Marca' },
    { value: 'id_subcategoria', label: 'Subcategoria' },
    { value: 'FILIAL', label: 'Filial' },
    { value: 'MATRIZ', label: 'Matriz' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'DATACADASTRO', label: 'Data Cadastro' },
    { value: 'empresa', label: 'Empresa' },
    // Derived/Extra fields
    { value: 'PRECO', label: 'Preço (Se houver)' },
    { value: 'COR', label: 'Cor (Variação)' },
    { value: 'CORES', label: 'Cores (Descrição)' },
    { value: 'TAMANHO', label: 'Tamanho (Variação)' },
    { value: 'GRADE', label: 'Grade' },
    { value: 'QTD_CAIXA', label: 'Qtd. por Caixa' },
    { value: 'DUN14', label: 'DUN14' },
    { value: 'URL_CATALOGO', label: 'URL Catálogo (QR)' }
];
const DEFAULT_WIDTH = 86;
const DEFAULT_HEIGHT = 120;
const PREVIEW_SCALE = 4; // Screen pixels per mm

export function LabelLayoutBuilder({ onSave }: LabelLayoutBuilderProps) {
    const [layouts, setLayouts] = useState<LabelLayout[]>([]);
    const [currentLayout, setCurrentLayout] = useState<Partial<LabelLayout>>({
        name: 'Novo Layout',
        layout_data: [],
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        is_active: false
    });
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadLayouts();
    }, []);

    const loadLayouts = async () => {
        try {
            const data = await fetchLayouts();
            setLayouts(data);
        } catch (error) {
            toast.error("Erro ao carregar layouts");
        }
    };

    const selectedElement = currentLayout.layout_data?.find(el => el.id === selectedElementId);

    const addElement = (type: LabelElement['type']) => {
        const newElement: LabelElement = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: 10,
            y: 10,
            width: type === 'text' ? 60 : (type === 'barcode' ? 60 : 20),
            height: type === 'text' ? 10 : (type === 'barcode' ? 20 : 20),
            properties: {
                text: type === 'text' ? 'Novo Texto' : (type === 'barcode' ? '{ITEM_CODIGO}' : '{URL}'),
                fontSize: 3,
                textAlign: 'left',
                strokeWidth: 1
            }
        };

        setCurrentLayout(prev => ({
            ...prev,
            layout_data: [...(prev.layout_data || []), newElement]
        }));
        setSelectedElementId(newElement.id);
    };

    const updateElement = (id: string, partial: Partial<LabelElement> | Partial<LabelElement['properties']>) => {
        setCurrentLayout(prev => ({
            ...prev,
            layout_data: prev.layout_data?.map(el => {
                if (el.id === id) {
                    // Check if it's property update or root update
                    const isPropUpdate = Object.keys(partial).some(k => k in (el.properties || {}));
                    if ('text' in partial || 'fontSize' in partial || 'textAlign' in partial || 'strokeWidth' in partial) {
                        return { ...el, properties: { ...el.properties, ...partial } };
                    }
                    return { ...el, ...partial };
                }
                return el;
            })
        }));
    };

    const removeElement = (id: string) => {
        setCurrentLayout(prev => ({
            ...prev,
            layout_data: prev.layout_data?.filter(el => el.id !== id)
        }));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('elementId', id);
        // Store the offset of the mouse relative to the element's top-left corner
        // e.nativeEvent.offsetX/Y gives position within the element
        e.dataTransfer.setData('offsetX', e.nativeEvent.offsetX.toString());
        e.dataTransfer.setData('offsetY', e.nativeEvent.offsetY.toString());
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('elementId');
        const offsetX = parseFloat(e.dataTransfer.getData('offsetX')) || 0;
        const offsetY = parseFloat(e.dataTransfer.getData('offsetY')) || 0;

        if (!id || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();

        // Calculate X/Y relative to canvas, subtracting the mouse offset within the element
        const x = (e.clientX - rect.left - offsetX) / PREVIEW_SCALE;
        const y = (e.clientY - rect.top - offsetY) / PREVIEW_SCALE;

        updateElement(id, { x: Math.round(x), y: Math.round(y) });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleSave = async () => {
        if (!currentLayout.name) {
            toast.error("Nome é obrigatório");
            return;
        }
        try {
            await saveLayout(currentLayout as any);
            toast.success("Layout salvo!");
            loadLayouts();
            if (onSave) onSave();
        } catch (error) {
            toast.error("Erro ao salvar");
        }
    };

    const handleLoad = (layout: LabelLayout) => {
        setCurrentLayout({
            ...layout,
            width: layout.width || DEFAULT_WIDTH,
            height: layout.height || DEFAULT_HEIGHT
        });
        setSelectedElementId(null);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Deletar Layout?")) {
            try {
                await deleteLayout(id);
                toast.success("Layout excluído");
                loadLayouts();
                if (currentLayout.id === id) {
                    setCurrentLayout({
                        name: 'Novo Layout',
                        layout_data: [],
                        width: DEFAULT_WIDTH,
                        height: DEFAULT_HEIGHT,
                        is_active: false
                    });
                }
            } catch (e) { toast.error("Erro ao excluir"); }
        }
    };

    const renderElement = (el: LabelElement) => {
        const isSelected = selectedElementId === el.id;
        const style: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x * PREVIEW_SCALE}px`,
            top: `${el.y * PREVIEW_SCALE}px`,
            width: `${el.width * PREVIEW_SCALE}px`,
            height: `${el.height * PREVIEW_SCALE}px`,
            border: isSelected ? '2px solid #3b82f6' : (el.type === 'text' || el.type === 'image' ? '1px dashed #ccc' : 'none'), // Show border for invisible containers
            cursor: 'move',
            display: 'flex',
            alignItems: 'center',
            justifyContent: el.properties.textAlign === 'center' ? 'center' : (el.properties.textAlign === 'right' ? 'flex-end' : 'flex-start'),
            fontSize: `${(el.properties.fontSize || 3) * PREVIEW_SCALE}px`,
            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            zIndex: isSelected ? 10 : 1,
            borderRadius: el.type === 'circle' ? '50%' : '0', // Visual Circle
            transform: `rotate(${el.rotation || 0}deg)` // Apply rotation
        };

        const renderContent = () => {
            switch (el.type) {
                case 'text': return <span>{el.properties.text}</span>;
                case 'barcode': return (
                    <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-[10px]">
                        ||||||||||||
                        <span style={{ fontSize: '10px' }}>{el.properties.text}</span>
                    </div>
                );
                case 'qrcode': return (
                    <div className="w-full h-full border-2 border-black flex items-center justify-center">
                        <QrCode className="w-full h-full p-1" />
                    </div>
                );
                case 'rectangle': return <div className="w-full h-full border-black" style={{ borderWidth: `${(el.properties.strokeWidth || 1) * PREVIEW_SCALE}px` }}></div>;
                case 'circle': return <div className="w-full h-full border-black rounded-full" style={{ borderWidth: `${(el.properties.strokeWidth || 1) * PREVIEW_SCALE}px` }}></div>;
                case 'line': {
                    const isHorizontal = el.width >= el.height;
                    return (
                        <div
                            className="bg-black"
                            style={{
                                width: isHorizontal ? '100%' : `${(el.properties.strokeWidth || 1) * PREVIEW_SCALE}px`,
                                height: isHorizontal ? `${(el.properties.strokeWidth || 1) * PREVIEW_SCALE}px` : '100%'
                            }}
                        />
                    );
                }
                case 'image': return el.properties.imageUrl ?
                    <div className="w-full h-full relative overflow-hidden">
                        {/* Transparency Grid Background */}
                        <div className="absolute inset-0 z-0 opacity-20"
                            style={{
                                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                                backgroundSize: '10px 10px',
                                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                            }}
                        />
                        <img
                            src={el.properties.imageUrl}
                            alt="img"
                            className="w-full h-full object-contain relative z-10 pointer-events-none"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-50');
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 hidden group-has-[img[style*='none']]:flex">
                            Erro Imagem
                        </div>
                    </div> :
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-300">Sem Imagem</div>;
                default: return null;
            }
        }

        return (
            <div
                key={el.id}
                style={style}
                draggable
                onDragStart={(e) => handleDragStart(e, el.id)}
                onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
            >
                {renderContent()}
                {/* Visual Helpers */}
                {isSelected && (
                    <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-1 rounded flex items-center">
                        <GripVertical className="h-3 w-3 mr-1" />
                        {el.x}mm, {el.y}mm
                    </div>
                )}
            </div>
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Add Image Element
            const newElement: LabelElement = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'image',
                x: 10, y: 10, width: 30, height: 30,
                properties: { imageUrl: base64 }
            };
            setCurrentLayout(prev => ({ ...prev, layout_data: [...(prev.layout_data || []), newElement] }));
            setSelectedElementId(newElement.id);
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        e.target.value = '';
    };

    return (
        <div className="grid grid-cols-12 gap-6 h-[800px]">
            {/* Sidebar - Tools & Properties */}
            <div className="col-span-3 space-y-4 flex flex-col h-full">
                <Card className="p-4">
                    <Label className="font-bold mb-4 block">Ferramentas</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => addElement('text')}><Type className="mr-2 h-4 w-4" /> Texto</Button>
                        <Button variant="outline" onClick={() => addElement('barcode')}><Barcode className="mr-2 h-4 w-4" /> Código</Button>
                        <Button variant="outline" onClick={() => addElement('qrcode')}><QrCode className="mr-2 h-4 w-4" /> QR Code</Button>
                        <Button variant="outline" onClick={() => addElement('rectangle')}><Square className="mr-2 h-4 w-4" /> Retângulo</Button>
                        <Button variant="outline" onClick={() => addElement('circle')}><div className="mr-2 h-3 w-3 border-2 border-current rounded-full"></div> Círculo</Button>
                        <Button variant="outline" onClick={() => addElement('line')}><div className="mr-2 h-[2px] w-3 bg-current"></div> Linha</Button>
                        <div className="relative">
                            <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            <Button variant="outline" className="w-full" onClick={() => document.getElementById('img-upload')?.click()}>
                                <ImageIcon className="mr-2 h-4 w-4" /> Imagem
                            </Button>
                        </div>
                    </div>
                </Card>

                {selectedElement ? (
                    <Card className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Propriedades</h3>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeElement(selectedElement.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">X (mm)</Label>
                                <Input type="number" value={selectedElement.x} onChange={e => updateElement(selectedElement.id, { x: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Y (mm)</Label>
                                <Input type="number" value={selectedElement.y} onChange={e => updateElement(selectedElement.id, { y: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Largura</Label>
                                <Input type="number" value={selectedElement.width} onChange={e => updateElement(selectedElement.id, { width: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Altura</Label>
                                <Input type="number" value={selectedElement.height} onChange={e => updateElement(selectedElement.id, { height: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Rotação (°)</Label>
                                <Input type="number" value={selectedElement.rotation || 0} onChange={e => {
                                    // Update root level rotation (since it is not in properties in interface line 10)
                                    // Actually interface shows it at root level. 
                                    // updateElement helper handles root or properties?
                                    // Let's check updateElement. 
                                    // Step 478 shows updateElement handles properties if key is known, else merges.
                                    // rotation is root.
                                    // We need to make sure updateElement handles it.
                                    // Let's just pass { rotation: ... }
                                    updateElement(selectedElement.id, { rotation: Number(e.target.value) })
                                }} />
                            </div>
                        </div>

                        {(selectedElement.type === 'text' || selectedElement.type === 'barcode' || selectedElement.type === 'qrcode') && (
                            <div className="space-y-2">
                                <Label>Conteúdo</Label>
                                <Tabs defaultValue="custom" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="custom">Texto Fixo</TabsTrigger>
                                        <TabsTrigger value="variable">Variável</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="custom">
                                        <Input
                                            value={selectedElement.properties.text || ''}
                                            onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                            placeholder="Digite o texto..."
                                        />
                                    </TabsContent>


                                    <TabsContent value="variable">
                                        <Select
                                            onValueChange={(val) => updateElement(selectedElement.id, { text: `{${val}}` })}
                                            value={selectedElement.properties.text?.startsWith('{') ? selectedElement.properties.text.replace(/[{}]/g, '') : ''}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o campo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ITEM_FIELDS.map(f => (
                                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TabsContent>
                                </Tabs>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Texto atual: {selectedElement.properties.text}
                                </p>
                            </div>
                        )}

                        {selectedElement.type === 'text' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Tam. Fonte (mm)</Label>
                                    <Input type="number" value={selectedElement.properties.fontSize} onChange={e => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alinhamento</Label>
                                    <Select
                                        value={selectedElement.properties.textAlign || 'left'}
                                        onValueChange={(val: any) => updateElement(selectedElement.id, { textAlign: val })}

                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Esquerda</SelectItem>
                                            <SelectItem value="center">Centro</SelectItem>
                                            <SelectItem value="right">Direita</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )
                        }
                        {
                            (selectedElement.type === 'barcode' || selectedElement.type === 'qrcode') && (
                                <div className="space-y-2">
                                    <Label>Valor / Conteúdo</Label>
                                    <Tabs defaultValue="variable" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="variable">Variável</TabsTrigger>
                                            <TabsTrigger value="custom">Fixo</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="custom">
                                            <Input
                                                value={selectedElement.properties.text || ''}
                                                onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                                            />
                                        </TabsContent>
                                        <TabsContent value="variable">
                                            <Select
                                                onValueChange={(val) => updateElement(selectedElement.id, { text: `{${val}}` })}
                                                value={selectedElement.properties.text?.startsWith('{') ? selectedElement.properties.text.replace(/[{}]/g, '') : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o campo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ITEM_FIELDS.map(f => (
                                                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )
                        }
                    </Card >
                ) : (
                    <Card className="p-4">
                        <p className="text-muted-foreground text-sm">Selecione um elemento para editar</p>
                    </Card>
                )}

                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Configuração da Página</h3>
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={currentLayout.name} onChange={e => setCurrentLayout({ ...currentLayout, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs">Largura (mm)</Label>
                            <Input
                                type="number"
                                value={currentLayout.width || 86}
                                onChange={e => setCurrentLayout({ ...currentLayout, width: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Altura (mm)</Label>
                            <Input
                                type="number"
                                value={currentLayout.height || 120}
                                onChange={e => setCurrentLayout({ ...currentLayout, height: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Colunas</Label>
                            <Input
                                type="number"
                                min={1}
                                max={5}
                                value={currentLayout.num_columns || 1}
                                onChange={e => setCurrentLayout({ ...currentLayout, num_columns: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={currentLayout.is_active} onChange={e => setCurrentLayout({ ...currentLayout, is_active: e.target.checked })} id="isActive" />
                        <Label htmlFor="isActive">Layout Ativo</Label>
                    </div>
                    <Button className="w-full" onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                </Card>

                <div className="space-y-2">
                    <h3 className="font-semibold">Carregar Layout</h3>
                    {layouts.map(l => (
                        <div key={l.id} className={`p-2 border rounded cursor-pointer hover:bg-accent flex justify-between items-center ${currentLayout.id === l.id ? 'bg-accent border-primary' : ''}`} onClick={() => handleLoad(l)}>
                            <span>{l.name} {l.is_active && '(Ativo)'}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => handleDelete(l.id, e)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div >

            {/* Canvas Area */}
            <div className="col-span-6 bg-slate-100 p-8 flex justify-center items-start overflow-auto rounded-lg border">
                <div
                    ref={canvasRef}
                    className="bg-white shadow-lg relative"
                    style={{
                        width: `${(currentLayout.width || DEFAULT_WIDTH) * PREVIEW_SCALE}px`,
                        height: `${(currentLayout.height || DEFAULT_HEIGHT) * PREVIEW_SCALE}px`,
                    }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {currentLayout.layout_data?.map(el => renderElement(el))}
                </div>
            </div >
        </div >
    );
}
