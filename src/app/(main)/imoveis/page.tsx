'use client';

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { AddImovelModal } from './components/add-imovel-modal';
import { EditImovelModal } from './components/edit-imovel-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpDown } from 'lucide-react';
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
import { Imovel } from '@/types/imovel';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/4 mt-1"></div>
    </td>
    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </td>
    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </td>
    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
      <div className="h-6 bg-gray-300 rounded-full w-24"></div>
    </td>
    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
      <div className="h-8 w-8 bg-gray-300 rounded"></div>
    </td>
  </tr>
);

type SortKey = keyof Imovel;

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    const fetchImoveis = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('properties').select('*');

      if (error) {
        toast.error('Erro ao buscar imóveis.');
        console.error(error);
      } else {
        setImoveis(data as Imovel[]);
      }
      setLoading(false);
    };

    fetchImoveis();
  }, []);

  const sortedImoveis = useMemo(() => {
    let sortableItems = [...imoveis];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Tratar nulos ou indefinidos para evitar erros
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
  }, [imoveis, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredImoveis = sortedImoveis.filter(imovel =>
    imovel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImovel = (novoImovel: Imovel) => {
    setImoveis((prevImoveis) => [...prevImoveis, novoImovel]);
  };

  const handleUpdateImovel = (updatedImovel: Imovel) => {
    setImoveis(prevImoveis =>
      prevImoveis.map(imovel =>
        imovel.id === updatedImovel.id ? updatedImovel : imovel
      )
    );
    handleCloseEditModal();
  };

  const handleDeleteImovel = (imovelId: string) => {
    setImoveis(prevImoveis =>
      prevImoveis.filter(imovel => imovel.id !== imovelId)
    );
    handleCloseEditModal();
  };

  const handleOpenEditModal = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedImovel(null);
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-2 opacity-20" />;
    }
    return sortConfig.direction === 'ascending' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Gestão de Imóveis">
        <Input
          placeholder="Filtrar por título ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <AddImovelModal onImovelAdded={handleAddImovel} />
      </PageHeader>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('title')}>
                <div className="flex items-center">Título {getSortIndicator('title')}</div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('property_type')}>
                <div className="flex items-center">Tipo {getSortIndicator('property_type')}</div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('price')}>
                <div className="flex items-center">Preço {getSortIndicator('price')}</div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('status')}>
                <div className="flex items-center">Status {getSortIndicator('status')}</div>
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              filteredImoveis.map((imovel) => (
                <tr key={imovel.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                    <p className="text-gray-900 whitespace-no-wrap font-semibold">{imovel.title}</p>
                    <p className="text-gray-600 whitespace-no-wrap text-xs">Cód: {imovel.id}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                    <p className="text-gray-900 whitespace-no-wrap">{imovel.property_type}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                    <p className="text-gray-900 whitespace-no-wrap">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.price)}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                    <span
                      className={`relative inline-block px-3 py-1 font-semibold leading-tight ${imovel.status === 'Disponível' ? 'text-green-900' : imovel.status === 'Vendido' ? 'text-red-900' : 'text-yellow-900'}`}>
                      <span aria-hidden className={`absolute inset-0 ${imovel.status === 'Disponível' ? 'bg-green-200' : imovel.status === 'Vendido' ? 'bg-red-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span>
                      <span className="relative">{imovel.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
                          <AlertDialogAction onClick={() => handleDeleteImovel(imovel.id)}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedImovel && (
        <EditImovelModal
          imovel={selectedImovel}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onImovelUpdated={handleUpdateImovel}
          onImovelDeleted={handleDeleteImovel}
        />
      )}
    </div>
  );
}
