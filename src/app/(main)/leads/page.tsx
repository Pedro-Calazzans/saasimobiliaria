'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { AddLeadModal } from './components/add-lead-modal'
import { EditLeadModal, Lead } from './components/edit-lead-modal'
import { Trash2 } from 'lucide-react'

// A interface Lead será movida para o edit-lead-modal.tsx para ser reutilizada
// interface Lead { ... }

export const initialLeads: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    funnel_stage: 'Novo',
    origin: 'Portal Imobiliário',
    search_profile: 'Apartamento 2 quartos na Zona Sul',
    financial_profile: 'Financiamento aprovado',
    notes: 'Primeiro contato, parece promissor.',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    phone: '(21) 91234-5678',
    funnel_stage: 'Em Qualificação',
    origin: 'Indicação',
    search_profile: 'Casa com 3 quartos e quintal',
    financial_profile: 'Pagamento à vista',
    notes: 'Indicado por cliente antigo.',
  },
  {
    id: '3',
    name: 'Pedro Santos',
    email: 'pedro.santos@example.com',
    phone: '(31) 95555-8888',
    funnel_stage: 'Visita Agendada',
    origin: 'Website',
    search_profile: 'Cobertura com vista para o parque',
    financial_profile: 'Analisa permuta',
    notes: 'Agendou visita para o imóvel XYZ.',
  },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)

  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadData),
      });
      if (!response.ok) throw new Error('Falha ao criar lead');
      const result = await response.json();
      setLeads((prev) => [...prev, result.lead]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead)
    setIsEditModalOpen(true)
  }

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)),
    )
    setSelectedLead(null)
  }

  const handleDeleteConfirmation = (lead: Lead) => {
    setLeadToDelete(lead);
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      const response = await fetch(`/api/leads?id=${leadToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Falha ao excluir o lead');
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== leadToDelete.id));
      setLeadToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  const handleModalLeadDeleted = (leadId: string) => {
    // Esta função é chamada pelo EditLeadModal
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setIsEditModalOpen(false); // Fecha o modal de edição também
  };


  const filteredLeads = useMemo(() => {
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Meus Leads</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Adicionar Lead</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Filtrar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Etapa do Funil</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-gray-50">
                <TableCell
                  className="font-medium cursor-pointer hover:underline"
                  onClick={() => handleEditClick(lead)}
                >
                  {lead.name}
                </TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.funnel_stage}</TableCell>
                <TableCell>{lead.origin}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirmation(lead)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onLeadAdded={handleAddLead}
      />

      {/* O modal de edição é sempre renderizado, mas controlado por isOpen */}
      <EditLeadModal
        lead={selectedLead}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleModalLeadDeleted}
      />

      {/* O AlertDialog é controlado pelo estado leadToDelete */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        {leadToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o lead "{leadToDelete.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteLead} className="bg-red-600 hover:bg-red-700">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  )
}