'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea' // Adicionado Textarea

interface AddLeadModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onLeadAdded: (lead: any) => void
}

export function AddLeadModal({ isOpen, onOpenChange, onLeadAdded }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    funnel_stage: 'Novo',
    origin: '',
    search_profile: '', // Simplificando para texto por enquanto
    financial_profile: '', // Simplificando para texto por enquanto
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, funnel_stage: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar o lead');
      }

      const newLead = await response.json();
      onLeadAdded(newLead.lead); // Adiciona o lead retornado pela API
      onOpenChange(false); // Fecha o modal
    } catch (error) {
      console.error('Erro ao salvar o lead:', error);
      // Opcional: Adicionar um estado de erro para exibir feedback ao usuário
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo lead.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input id="nome" value={formData.nome} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={formData.email} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone" className="text-right">
              Telefone
            </Label>
            <Input id="telefone" value={formData.telefone} onChange={handleChange} className="col-span-3" />
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
                <SelectItem value="Primeiro Contato">Primeiro Contato</SelectItem>
                <SelectItem value="Em Qualificação">Em Qualificação</SelectItem>
                <SelectItem value="Visita Agendada">Visita Agendada</SelectItem>
                <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                <SelectItem value="Ganho">Ganho</SelectItem>
                <SelectItem value="Perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Input id="origin" value={formData.origin} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search_profile" className="text-right">
              Perfil de Busca
            </Label>
            <Textarea id="search_profile" value={formData.search_profile} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="financial_profile" className="text-right">
              Perfil Financeiro
            </Label>
            <Textarea id="financial_profile" value={formData.financial_profile} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Anotações
            </Label>
            <Textarea id="notes" value={formData.notes} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}