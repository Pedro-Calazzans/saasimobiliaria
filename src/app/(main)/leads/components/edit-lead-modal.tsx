'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' 

export const funnelStages = [
  'Novo',
  'Em Qualificação',
  'Visita Agendada',
  'Proposta Apresentada',
  'Negociação',
  'Fechado',
] as const;

export type FunnelStage = typeof funnelStages[number];

export interface SearchProfile {
  property_type: string;
  min_price: number;
  max_price: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
}

export interface FinancialProfile {
  income: number;
  financing_approved: boolean;
  max_financing_amount: number;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  funnel_stage: FunnelStage;
  origin: string;
  search_profile: Partial<SearchProfile>;
  financial_profile: Partial<FinancialProfile>;
  notes: string;
  created_at?: string;
}

interface EditLeadModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onLeadUpdated: (updatedLead: Lead) => void
  onLeadDeleted: (leadId: string) => void
}

export function EditLeadModal({ lead, isOpen, onClose, onLeadUpdated, onLeadDeleted }: EditLeadModalProps) {
  const [formData, setFormData] = useState<Lead | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(true);

  useEffect(() => {
    setFormData(lead);
    if (lead) {
      validateForm(lead);
    }
  }, [lead]);

  useEffect(() => {
    if (formData) {
      validateForm(formData);
    }
  }, [formData]);

  const validateForm = (data: Lead | Partial<Lead>) => {
    const newErrors: { [key: string]: string } = {};
    if (!data.full_name) newErrors.full_name = 'O nome é obrigatório.';
    if (!data.email) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Formato de email inválido.';
    }
    if (!data.phone) newErrors.phone = 'O telefone é obrigatório.';
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'search_profile' | 'financial_profile'
  ) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    const isNumeric = type === 'number';
    
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [name]: isNumeric ? parseFloat(value) || 0 : value,
      },
    });
  };

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }
    if (!formData) return;

    const supabase = createClient();
    const { id, created_at, ...updateData } = formData;

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao atualizar o lead.');
      console.error(error);
      return;
    }

    toast.success('Lead atualizado com sucesso!');
    onLeadUpdated(data as Lead);
    onClose();
  };

  const handleDelete = async () => {
    if (!formData) return;

    const supabase = createClient();
    const { error } = await supabase.from('leads').delete().eq('id', formData.id);

    if (error) {
      toast.error('Erro ao excluir o lead.');
      console.error(error);
      return;
    }
    
    toast.success('Lead excluído com sucesso!');
    onLeadDeleted(formData.id);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  if (!isOpen || !formData) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize as informações do lead. Clique em salvar para aplicar as alterações.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Nome Completo
            </Label>
            <div className="col-span-3">
              <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input id="email" name="email" value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <div className="col-span-3">
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="funnel_stage" className="text-right">
              Etapa do Funil
            </Label>
            {/* Idealmente, isso seria um Select, mas para manter a simplicidade, vamos manter o Input por enquanto */}
            <Input id="funnel_stage" name="funnel_stage" value={formData.funnel_stage} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Input id="origin" name="origin" value={formData.origin} onChange={handleChange} className="col-span-3" />
          </div>
          {/* Seção Perfil de Busca */}
          <div className="col-span-4">
            <h4 className="font-semibold text-md mb-2 mt-4 border-t pt-4">Perfil de Busca</h4>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="property_type" className="text-right">Tipo de Imóvel</Label>
            <Input id="property_type" name="property_type" value={formData.search_profile?.property_type} onChange={(e) => handleNestedChange(e, 'search_profile')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">Localização</Label>
            <Input id="location" name="location" value={formData.search_profile?.location} onChange={(e) => handleNestedChange(e, 'search_profile')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bedrooms" className="text-right">Quartos</Label>
            <Input id="bedrooms" name="bedrooms" type="number" value={formData.search_profile?.bedrooms} onChange={(e) => handleNestedChange(e, 'search_profile')} className="col-span-3" />
          </div>

          {/* Seção Perfil Financeiro */}
          <div className="col-span-4">
            <h4 className="font-semibold text-md mb-2 mt-4 border-t pt-4">Perfil Financeiro</h4>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="income" className="text-right">Renda</Label>
            <Input id="income" name="income" type="number" value={formData.financial_profile?.income} onChange={(e) => handleNestedChange(e, 'financial_profile')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="financing_approved" className="text-right">Financiamento Aprovado?</Label>
            <Input id="financing_approved" name="financing_approved" checked={formData.financial_profile?.financing_approved} onChange={(e) => setFormData({...formData, financial_profile: {...formData.financial_profile, financing_approved: e.target.checked}})} type="checkbox" className="col-span-3 h-4 w-4" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Anotações
            </Label>
            <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter className="justify-between">
          <Button type="button" variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            Excluir Lead
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={handleSave} disabled={!isFormValid}>Salvar Alterações</Button>
          </div>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o lead
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
