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
import { Imovel, PropertyStatus } from '@/types/imovel';
import { createClient } from '@/lib/supabase/client';

interface EditImovelModalProps {
  imovel: Imovel | null;
  isOpen: boolean;
  onClose: () => void;
  onImovelUpdated: (updatedImovel: Imovel) => void;
  onImovelDeleted: (imovelId: string) => void;
}

export function EditImovelModal({ imovel, isOpen, onClose, onImovelUpdated, onImovelDeleted }: EditImovelModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Imovel | null>(imovel);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormData(imovel);
      setErrors({});
      setIsFormValid(true);
    } else {
      setIsEditing(false);
    }
  }, [imovel, isOpen]);

  useEffect(() => {
    if (isEditing) {
      validateForm();
    }
  }, [formData, isEditing]);

  const validateForm = () => {
    if (!formData) return;
    const newErrors: { [key: string]: string } = {};
    if (!formData.title) newErrors.title = 'O título é obrigatório.';
    if (!formData.price || formData.price <= 0) newErrors.price = 'O preço deve ser maior que zero.';
    if (!formData.property_type) newErrors.property_type = 'O tipo de imóvel é obrigatório.';
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { id, value } = e.target;
    setFormData(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { id, value } = e.target;
    setFormData(prev => prev ? { ...prev, [id]: value === '' ? 0 : parseFloat(value) } : null);
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, category: 'address' | 'features') => {
    if (!formData) return;
    const { id, value } = e.target;
    const isNumeric = category === 'features';
    setFormData(prev => {
      if (!prev) return null;
      const parentObject = prev[category];
      return {
        ...prev,
        [category]: {
          ...parentObject,
          [id]: isNumeric ? (value === '' ? 0 : parseInt(value, 10)) : value,
        },
      };
    });
  };

  const handleSelectChange = (value: string, id: 'property_type' | 'status') => {
    setFormData(prev => prev ? { ...prev, [id]: value } : null);
  };

  const handleDifferentialsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!formData) return;
    const { value } = e.target;
    const differentialsArray = value.split(',').map(item => item.trim());
    setFormData(prev => prev ? { ...prev, differentials: differentialsArray } : null);
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast.error('CEP não encontrado.');
        return;
      }
      setFormData(prev => {
        if (!prev) return null;
        const newAddress = {
          ...prev.address,
          cep: data.cep || '',
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
        };
        return { ...prev, address: newAddress };
      });
    } catch (error) {
      toast.error('Erro ao buscar o CEP.');
    }
  };

  async function handleSave() {
    if (!isFormValid) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }
    if (!formData) return;

    const supabase = createClient();
    const { id, created_at, user_id, ...updateData } = formData;

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar o imóvel:', error);
      toast.error('Erro ao salvar as alterações.');
      return;
    }

    toast.success('Alterações salvas com sucesso!');
    onImovelUpdated(data as Imovel);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!formData) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', formData.id);

    if (error) {
      console.error('Erro ao excluir o imóvel:', error);
      toast.error('Erro ao excluir o imóvel.');
      return;
    }

    toast.success('Imóvel excluído com sucesso!');
    onImovelDeleted(formData.id);
    onClose();
  }

  if (!isOpen || !formData) return null;

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
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
                  <Label htmlFor="title">Título do Anúncio</Label>
                  <Input id="title" value={formData.title} onChange={handleChange} readOnly={!isEditing} />
                  {isEditing && errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_type">Tipo de Imóvel</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'property_type')} value={formData.property_type} disabled={!isEditing}>
                    <SelectTrigger className={isEditing && errors.property_type ? 'border-red-500' : ''}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartamento">Apartamento</SelectItem>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Terreno">Terreno</SelectItem>
                    </SelectContent>
                  </Select>
                  {isEditing && errors.property_type && <p className="text-sm text-red-500">{errors.property_type}</p>}
                </div>
              </>
            )}

            {renderSection(
              'Endereço',
              'Localização completa do imóvel.',
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" value={formData.address.cep} onChange={(e) => handleNestedChange(e, 'address')} onBlur={handleCepBlur} readOnly={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input id="rua" value={formData.address.rua} onChange={(e) => handleNestedChange(e, 'address')} readOnly={!isEditing} />
                  </div>
                </div>
              </>
            )}

            {renderSection(
              'Características',
              'Detalhes sobre a estrutura e cômodos do imóvel.',
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quartos">Quartos</Label>
                  <Input id="quartos" type="number" value={formData.features.quartos} onChange={(e) => handleNestedChange(e, 'features')} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suites">Suítes</Label>
                  <Input id="suites" type="number" value={formData.features.suites} onChange={(e) => handleNestedChange(e, 'features')} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banheiros">Banheiros</Label>
                  <Input id="banheiros" type="number" value={formData.features.banheiros} onChange={(e) => handleNestedChange(e, 'features')} readOnly={!isEditing} />
                </div>
              </div>
            )}

            {renderSection(
              'Detalhes Comerciais',
              'Informações sobre preço e status de venda.',
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input id="price" type="number" value={formData.price} onChange={handleNumericChange} readOnly={!isEditing} />
                  {isEditing && errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => handleSelectChange(value as PropertyStatus, 'status')} value={formData.status} disabled={!isEditing}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                      <SelectItem value="Vendido">Vendido</SelectItem>
                      <SelectItem value="Alugado">Alugado</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {renderSection(
              'Diferenciais e Observações',
              'Informações adicionais e destaques do imóvel.',
              <>
                <div className="space-y-2">
                  <Label htmlFor="differentials">Diferenciais (separados por vírgula)</Label>
                  <Textarea id="differentials" value={formData.differentials.join(', ')} onChange={handleDifferentialsChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea id="observations" value={formData.observations} onChange={handleChange} readOnly={!isEditing} />
                </div>
              </>
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
                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o imóvel.
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
              <Button variant="outline" onClick={() => { isEditing ? setIsEditing(false) : onClose(); }}>{isEditing ? 'Cancelar Edição' : 'Fechar'}</Button>
                    {isEditing ? (
                        <Button onClick={handleSave} disabled={!isFormValid}>Salvar Alterações</Button>
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
