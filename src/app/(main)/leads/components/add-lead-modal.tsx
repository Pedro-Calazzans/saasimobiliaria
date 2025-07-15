'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Lead, FunnelStage } from './edit-lead-modal'

interface AddLeadModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onLeadAdded: (lead: Lead) => void
}

const initialState: Partial<Lead> = {
  full_name: '',
  email: '',
  phone: '',
  funnel_stage: 'Novo',
  origin: '',
  search_profile: {},
  financial_profile: {},
  notes: '',
};

export function AddLeadModal({ isOpen, onOpenChange, onLeadAdded }: AddLeadModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>(initialState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name) newErrors.full_name = 'O nome é obrigatório.';
    if (!formData.email) {
      newErrors.email = 'O email é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido.';
    }
    if (!formData.phone) newErrors.phone = 'O telefone é obrigatório.';
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'search_profile' | 'financial_profile'
  ) => {
    const { name, value, type } = e.target;
    const isNumeric = type === 'number';
    
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [name]: isNumeric ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleSelectChange = (value: FunnelStage) => {
    setFormData((prev) => ({ ...prev, funnel_stage: value }));
  };

  const handleSave = async () => {
    validateForm();
    if (!isFormValid) {
      toast.error('Por favor, corrija os erros no formulário.');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para adicionar um lead.');
      return;
    }

    const { id, created_at, ...insertData } = { ...initialState, ...formData };

    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...insertData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar o lead:', error);
      toast.error('Erro ao salvar o lead.');
      return;
    }

    toast.success('Lead adicionado com sucesso!');
    onLeadAdded(data as Lead);
    setFormData(initialState);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo lead.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Nome
            </Label>
            <div className="col-span-3">
              <Input id="full_name" value={formData.full_name} onChange={handleChange} />
              {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input id="email" type="email" value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <div className="col-span-3">
              <Input id="phone" value={formData.phone} onChange={handleChange} />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="funnel_stage" className="text-right">
              Etapa
            </Label>
            <Select onValueChange={handleSelectChange} defaultValue={formData.funnel_stage}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Em Qualificação">Em Qualificação</SelectItem>
                <SelectItem value="Visita Agendada">Visita Agendada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Input id="origin" value={formData.origin} onChange={handleChange} className="col-span-3" />
          </div>
          
          {/* Perfil de Busca */}
          <div className="col-span-4">
            <h4 className="font-semibold text-md mb-2 mt-4 border-t pt-4">Perfil de Busca</h4>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="property_type" className="text-right">Tipo de Imóvel</Label>
            <Input id="property_type" name="property_type" value={formData.search_profile?.property_type} onChange={(e) => handleNestedChange(e, 'search_profile')} className="col-span-3" />
          </div>

          {/* Perfil Financeiro */}
          <div className="col-span-4">
            <h4 className="font-semibold text-md mb-2 mt-4 border-t pt-4">Perfil Financeiro</h4>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="income" className="text-right">Renda</Label>
            <Input id="income" name="income" type="number" value={formData.financial_profile?.income} onChange={(e) => handleNestedChange(e, 'financial_profile')} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Anotações
            </Label>
            <Textarea id="notes" value={formData.notes} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={!isFormValid}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
