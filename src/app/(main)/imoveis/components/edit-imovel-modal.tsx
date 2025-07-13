'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';

interface Imovel {
  id: string;
  titulo: string;
  tipo: string;
  preco: string;
  status: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  features: {
    quartos: string;
    suites: string;
    banheiros: string;
    salas: string;
    vagas: string;
  };
  diferenciais: string;
  observacoes: string;
  fotos: { id: string; url: string; }[];
}

interface EditImovelModalProps {
  imovel: Imovel | null;
  isOpen: boolean;
  onClose: () => void;
  onImovelUpdated: (updatedImovel: any) => void;
  onImovelDeleted: (imovelId: string) => void;
}

export function EditImovelModal({ imovel, isOpen, onClose, onImovelUpdated, onImovelDeleted }: EditImovelModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Imovel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // O estado 'photos' não é mais necessário, pois 'formData.fotos' é a fonte da verdade.

  useEffect(() => {
    if (imovel) {
      setFormData(imovel);
    } else {
      setIsEditing(false);
    }
  }, [imovel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const keys = id.split('.');
    
    setFormData(prev => {
        if (!prev) return null;
        if (keys.length > 1) {
            const [parentKey, childKey] = keys as [keyof Imovel, string];
            const parentObject = prev[parentKey] as object;
            return {
                ...prev,
                [parentKey]: {
                    ...parentObject,
                    [childKey]: value
                }
            }
        } else {
            return { ...prev, [id]: value };
        }
    });
  };

  const handleSelectChange = (id: string, value: string) => {
     setFormData(prev => prev ? { ...prev, [id]: value } : null);
  }

  async function handleSave() {
    if (!formData) return;

    try {
      const response = await fetch(`/api/imoveis`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // O ID do imóvel já está em formData
      });

      if (!response.ok) throw new Error('Falha ao salvar as alterações.');

      const updatedImovel = await response.json();
      toast.success('Alterações salvas com sucesso!');
      onImovelUpdated(updatedImovel.data);
      setIsEditing(false);
      // onClose(); // Opcional: pode-se manter o modal aberto para ver as alterações
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar as alterações.');
    }
  }

  async function handleDelete() {
    if (!formData) return;

    try {
      const response = await fetch(`/api/imoveis`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: formData.id }),
      });

      if (!response.ok) throw new Error('Falha ao excluir o imóvel.');

      toast.success('Imóvel excluído com sucesso!');
      onImovelDeleted(formData.id);
      onClose(); 
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir o imóvel.');
    }
  }

  if (!imovel || !formData) return null;

  const renderSection = (title: string, description: string, children: React.ReactNode) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b pb-8 mb-8">
      <div className="md:col-span-1">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setIsEditing(false); } }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Imóvel' : 'Detalhes do Imóvel'}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-1 pr-6">
        <div className="space-y-8 py-6">
          {renderSection(
            'Informações Básicas',
            'Detalhes principais para identificação do imóvel.',
            <>
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Anúncio</Label>
                <Input id="titulo" value={formData.titulo} onChange={handleChange} readOnly={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Imóvel</Label>
                <Select onValueChange={(value) => handleSelectChange('tipo', value)} value={formData.tipo} disabled={!isEditing}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Apartamento">Apartamento</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Terreno">Terreno</SelectItem>
                        <SelectItem value="Comercial">Comercial</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </>
          )}

          {renderSection(
            'Endereço',
            'Localização completa do imóvel.',
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="endereco.cep">CEP</Label>
                    <Input id="endereco.cep" value={formData.endereco.cep} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endereco.rua">Rua</Label>
                    <Input id="endereco.rua" value={formData.endereco.rua} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="endereco.numero">Número</Label>
                    <Input id="endereco.numero" value={formData.endereco.numero} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="endereco.bairro">Bairro</Label>
                    <Input id="endereco.bairro" value={formData.endereco.bairro} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="endereco.cidade">Cidade</Label>
                    <Input id="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endereco.estado">Estado</Label>
                    <Input id="endereco.estado" value={formData.endereco.estado} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
            </>
          )}

          {renderSection(
            'Características',
            'Detalhes sobre a estrutura e cômodos do imóvel.',
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="features.quartos">Quartos</Label>
                  <Input id="features.quartos" type="number" value={formData.features.quartos} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features.suites">Suítes</Label>
                  <Input id="features.suites" type="number" value={formData.features.suites} onChange={handleChange} readOnly={!isEditing} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="features.banheiros">Banheiros</Label>
                  <Input id="features.banheiros" type="number" value={formData.features.banheiros} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="features.salas">Salas</Label>
                  <Input id="features.salas" type="number" value={formData.features.salas} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features.vagas">Vagas de Garagem</Label>
                  <Input id="features.vagas" type="number" value={formData.features.vagas} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </div>
            </>
          )}

          {renderSection(
            'Detalhes Comerciais',
            'Informações sobre preço e status de venda.',
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input id="preco" value={formData.preco} onChange={handleChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => handleSelectChange('status', value)} value={formData.status} disabled={!isEditing}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Disponível">Disponível</SelectItem>
                        <SelectItem value="Vendido">Vendido</SelectItem>
                        <SelectItem value="Alugado">Alugado</SelectItem>
                        <SelectItem value="Reservado">Reservado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {renderSection(
            'Diferenciais e Observações',
            'Informações adicionais e destaques do imóvel.',
            <>
              <div className="space-y-2">
                <Label htmlFor="diferenciais">Diferenciais</Label>
                <Textarea id="diferenciais" placeholder="Ex: Piscina, churrasqueira, academia..." value={formData.diferenciais} onChange={handleChange} readOnly={!isEditing}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Ex: Documentação OK, aceita financiamento..." value={formData.observacoes} onChange={handleChange} readOnly={!isEditing}/>
              </div>
            </>
          )}
        
          {renderSection(
            'Fotos do Imóvel',
            'Galeria de imagens do imóvel.',
             <div className="relative w-full">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {formData.fotos && formData.fotos.length > 0 ? (
                        formData.fotos.map((foto) => (
                          <CarouselItem key={foto.id}>
                            <Card className="overflow-hidden">
                              <CardContent className="p-0 flex items-center justify-center">
                                <img src={foto.url} alt={`Foto do imóvel`} className="h-48 w-full object-cover" />
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))
                      ) : (
                        <div className="text-center p-10 text-muted-foreground">
                            Nenhuma foto disponível.
                        </div>
                      )}
                    </CarouselContent>
                    {formData.fotos && formData.fotos.length > 1 && <CarouselPrevious />} 
                    {formData.fotos && formData.fotos.length > 1 && <CarouselNext />}
                  </Carousel>
              </div>
          )}
        </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t">
            <div className="w-full flex justify-between">
                <div>
                    {isEditing && (
                         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Excluir Imóvel</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o 
                                    imóvel e removerá seus dados de nossos servidores.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { onClose(); setIsEditing(false); }}>{isEditing ? 'Cancelar' : 'Fechar'}</Button>
                    {isEditing ? (
                        <Button onClick={handleSave}>Salvar Alterações</Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>Editar Imóvel</Button>
                    )}
                </div>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}