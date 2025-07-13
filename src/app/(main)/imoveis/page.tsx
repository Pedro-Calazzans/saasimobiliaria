'use client';

import { useState } from 'react';
import { AddImovelModal } from './components/add-imovel-modal';
import { EditImovelModal } from './components/edit-imovel-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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

const initialImoveis = [
  {
    id: '1',
    titulo: 'Apartamento Moderno no Centro',
    tipo: 'Apartamento',
    preco: 'R$ 550.000',
    status: 'Disponível',
    endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01001-000' },
    features: { quartos: '2', suites: '1', banheiros: '2', salas: '1', vagas: '1' },
    diferenciais: 'Piscina, Academia',
    observacoes: 'Documentação OK.',
    fotos: [],
  },
  {
    id: '2',
    titulo: 'Casa com Piscina e Churrasqueira',
    tipo: 'Casa',
    preco: 'R$ 1.200.000',
    status: 'Vendido',
    endereco: { rua: 'Av. Brasil', numero: '456', bairro: 'Jardins', cidade: 'São Paulo', estado: 'SP', cep: '01430-000' },
    features: { quartos: '4', suites: '3', banheiros: '5', salas: '2', vagas: '4' },
    diferenciais: 'Piscina aquecida, área gourmet completa.',
    observacoes: 'Negociação direta com o proprietário.',
    fotos: [],
  },
];

interface Imovel {
    id: string;
    titulo: string;
    tipo: string;
    preco: string;
    status: string;
    endereco: { rua: string; numero: string; bairro: string; cidade: string; estado: string, cep: string; };
    features: { quartos: string; suites: string; banheiros: string; salas: string; vagas: string; };
    diferenciais: string;
    observacoes: string;
    fotos: { id: string; url: string; }[];
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>(initialImoveis);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddImovel = (novoImovel: any) => {
    const imovelComId = { ...novoImovel, id: String(imoveis.length + 1), fotos: [] };
    setImoveis((prevImoveis) => [...prevImoveis, imovelComId]);
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
    // A lógica de exclusão via API já está no EditImovelModal, 
    // aqui apenas atualizamos o estado local.
    setImoveis(prevImoveis => 
      prevImoveis.filter(imovel => imovel.id !== imovelId)
    );
    handleCloseEditModal(); // Fecha o modal de edição se estiver aberto
  };

  const handleOpenEditModal = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedImovel(null);
  };

  const filteredImoveis = imoveis.filter(imovel => 
    imovel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imovel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Imóveis</h1>
        <div className="flex gap-4 items-center">
          <Input 
            placeholder="Filtrar por título ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <AddImovelModal onImovelAdded={handleAddImovel} />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
               <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredImoveis.map((imovel) => (
              <tr key={imovel.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                  <p className="text-gray-900 whitespace-no-wrap font-semibold">{imovel.titulo}</p>
                  <p className="text-gray-600 whitespace-no-wrap text-xs">Cód: {imovel.id}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                  <p className="text-gray-900 whitespace-no-wrap">{imovel.tipo}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm cursor-pointer" onClick={() => handleOpenEditModal(imovel)}>
                  <p className="text-gray-900 whitespace-no-wrap">{imovel.preco}</p>
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
            ))}
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