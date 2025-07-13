'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  funnel_stage: string
  origin: string
  search_profile: string
  financial_profile: string
  notes: string
  created_at?: string
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

  useEffect(() => {
    setFormData(lead)
  }, [lead])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (formData) {
      const { name, value } = e.target
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSave = async () => {
    if (formData) {
      try {
        const response = await fetch('/api/leads', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Falha ao atualizar o lead');
        }

        const result = await response.json();
        onLeadUpdated(result.lead); // Atualiza o estado com os dados retornados pela API
        onClose();
      } catch (error) {
        console.error('Erro ao salvar o lead:', error);
        // Opcional: Adicionar um estado de erro para notificar o usuário
      }
    }
  };

  const handleDelete = async () => {
    if (formData?.id) {
      onLeadDeleted(formData.id)
      setIsDeleteDialogOpen(false)
      onClose()
    }
  }

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
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" name="email" value={formData.email} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telefone
            </Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="funnel_stage" className="text-right">
              Etapa do Funil
            </Label>
            <Input id="funnel_stage" name="funnel_stage" value={formData.funnel_stage} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Input id="origin" name="origin" value={formData.origin} onChange={handleChange} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search_profile" className="text-right">
              Perfil de Busca
            </Label>
            <Textarea id="search_profile" name="search_profile" value={formData.search_profile} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="financial_profile" className="text-right">
              Perfil Financeiro
            </Label>
            <Textarea id="financial_profile" name="financial_profile" value={formData.financial_profile} onChange={handleChange} className="col-span-3" />
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
            <Button type="button" onClick={handleSave}>Salvar Alterações</Button>
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