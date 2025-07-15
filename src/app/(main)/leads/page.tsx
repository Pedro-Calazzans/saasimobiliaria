'use client'

import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
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
import { Trash2, ArrowUpDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-3/4"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-full"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-full"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-full"></div></td>
    <td className="p-4"><div className="h-4 bg-gray-300 rounded w-full"></div></td>
    <td className="p-4 text-right"><div className="h-8 w-8 bg-gray-300 rounded inline-block"></div></td>
  </tr>
);

type SortKey = keyof Lead;

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('leads').select('*');
      if (error) {
        toast.error('Erro ao buscar os leads.');
        console.error(error);
      } else {
        setLeads(data as Lead[]);
      }
      setLoading(false);
    };
    fetchLeads();
  }, []);

  const sortedLeads = useMemo(() => {
    let sortableItems = [...leads];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leads, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredLeads = useMemo(() => {
    if (!sortedLeads) return [];
    return sortedLeads.filter(lead =>
      lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedLeads, searchTerm]);

  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [...prev, newLead]);
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
    
    const supabase = createClient();
    const { error } = await supabase.from('leads').delete().eq('id', leadToDelete.id);

    if (error) {
      toast.error('Falha ao excluir o lead.');
      console.error(error);
    } else {
      toast.success('Lead excluído com sucesso!');
      setLeads((prev) => prev.filter((lead) => lead.id !== leadToDelete.id));
      setLeadToDelete(null);
    }
  };

  const handleModalLeadDeleted = (leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setIsEditModalOpen(false);
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-2 opacity-20" />;
    }
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="p-6">
      <PageHeader title="Meus Leads">
        <Button onClick={() => setIsAddModalOpen(true)}>Adicionar Lead</Button>
      </PageHeader>

      <div className="mb-4">
        <Input
          placeholder="Filtrar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('full_name')}><div className="flex items-center">Nome {getSortIndicator('full_name')}</div></TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('email')}><div className="flex items-center">Email {getSortIndicator('email')}</div></TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('funnel_stage')}><div className="flex items-center">Etapa do Funil {getSortIndicator('funnel_stage')}</div></TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('origin')}><div className="flex items-center">Origem {getSortIndicator('origin')}</div></TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50">
                  <TableCell
                    className="font-medium cursor-pointer hover:underline"
                    onClick={() => handleEditClick(lead)}
                  >
                    {lead.full_name}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddLeadModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onLeadAdded={handleAddLead}
      />

      <EditLeadModal
        lead={selectedLead}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleModalLeadDeleted}
      />

      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        {leadToDelete && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso excluirá permanentemente o lead "{leadToDelete.full_name}".
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
