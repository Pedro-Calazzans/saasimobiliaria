'use client';

import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, ChevronsUpDown, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Visit {
  id: number;
  date: Date;
  leadName: string;
  property: string;
}

const VisitsPage = () => {
  // Estado para a data selecionada no calendário
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Dados mocados para leads e imóveis
  const [leads, setLeads] = React.useState([
    { value: 'joao.silva', label: 'João Silva' },
    { value: 'maria.oliveira', label: 'Maria Oliveira' },
    { value: 'pedro.martins', label: 'Pedro Martins' },
  ]);

  const [properties, setProperties] = React.useState([
    { value: 'apartamento.centro', label: 'Apartamento Centro' },
    { value: 'casa.quintal', label: 'Casa com Quintal' },
    { value: 'cobertura.vista.mar', label: 'Cobertura Vista Mar' },
  ]);

  // Estado para armazenar a lista de todas as visitas
  const [visits, setVisits] = React.useState<Visit[]>([
    { id: 1, date: new Date(), leadName: 'João Silva', property: 'Apartamento Centro' },
    { id: 2, date: new Date(), leadName: 'Maria Oliveira', property: 'Casa com Quintal' },
    { id: 3, date: new Date(new Date().setDate(new Date().getDate() + 1)), leadName: 'Pedro Martins', property: 'Cobertura Vista Mar' },
  ]);

  // Modificador para os dias com visitas agendadas
  const scheduledDays = React.useMemo(() => {
    // Mapeia as visitas para retornar um array de datas no início do dia.
    // Isso é necessário para que o 'react-day-picker' possa comparar apenas a data.
    return visits.map(visit => startOfDay(visit.date));
  }, [visits]);

  // Estado para o formulário de nova visita
  const [newVisit, setNewVisit] = React.useState({ leadName: '', property: '', time: '' });

  // Estado para controlar a abertura do modal de agendamento
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  // Estado para o modal de edição
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  // Estado para o diálogo de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  // Estado para armazenar a visita que está sendo editada ou excluída
  const [selectedVisit, setSelectedVisit] = React.useState<Visit | null>(null);

  // Função para adicionar uma nova visita
  const handleAddVisit = () => {
    if (!date || !newVisit.leadName || !newVisit.property || !newVisit.time) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const newId = visits.length > 0 ? Math.max(...visits.map(v => v.id)) + 1 : 1;
    const [hours, minutes] = newVisit.time.split(':');
    const visitDate = new Date(date);
    visitDate.setHours(parseInt(hours, 10));
    visitDate.setMinutes(parseInt(minutes, 10));

    const leadLabel = leads.find(l => l.value === newVisit.leadName)?.label || newVisit.leadName;
    const propertyLabel = properties.find(p => p.value === newVisit.property)?.label || newVisit.property;

    setVisits([...visits, { id: newId, date: visitDate, leadName: leadLabel, property: propertyLabel }]);
    setNewVisit({ leadName: '', property: '', time: '' }); // Limpa o formulário
    setIsAddDialogOpen(false); // Fecha o modal
  };

  // Função para abrir o modal de edição
  const handleEditClick = (visit: Visit) => {
    setSelectedVisit(visit);
    // Pré-popula o formulário de edição com os dados da visita
    const leadValue = leads.find(l => l.label === visit.leadName)?.value || '';
    const propertyValue = properties.find(p => p.label === visit.property)?.value || '';
    setNewVisit({ leadName: leadValue, property: propertyValue, time: format(visit.date, 'HH:mm') });
    setIsEditDialogOpen(true);
  };

  // Função para atualizar uma visita
  const handleUpdateVisit = () => {
    if (!selectedVisit || !newVisit.leadName || !newVisit.property || !newVisit.time) return;

    const [hours, minutes] = newVisit.time.split(':');
    const visitDate = new Date(selectedVisit.date);
    visitDate.setHours(parseInt(hours, 10));
    visitDate.setMinutes(parseInt(minutes, 10));

    const leadLabel = leads.find(l => l.value === newVisit.leadName)?.label || newVisit.leadName;
    const propertyLabel = properties.find(p => p.value === newVisit.property)?.label || newVisit.property;

    setVisits(visits.map(v => v.id === selectedVisit.id ? { ...v, date: visitDate, leadName: leadLabel, property: propertyLabel } : v));
    setIsEditDialogOpen(false);
    setSelectedVisit(null);
    setNewVisit({ leadName: '', property: '', time: '' });
  };

  // Função para deletar uma visita
  const handleDeleteVisit = () => {
    if (!selectedVisit) return;
    setVisits(visits.filter(v => v.id !== selectedVisit.id));
    setIsDeleteDialogOpen(false);
    setSelectedVisit(null);
  };

  // Filtra as visitas para mostrar apenas as do dia selecionado
  const selectedDayVisits = date ? visits.filter(visit => isSameDay(visit.date, date)) : [];

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-md border gap-6">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">Agenda de Visitas</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Agendar Visita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nova Visita</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <p>Agendando para: <span className="font-semibold">{date ? format(date, 'PPP', { locale: ptBR }) : ''}</span></p>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leadName" className="text-right">Lead</Label>
                <Combobox
                  items={[
                    ...leads,
                    { value: 'new_lead', label: 'Adicionar novo lead' },
                  ]}
                  value={newVisit.leadName}
                  onChange={(value) => {
                    if (value === 'new_lead') {
                      alert('Funcionalidade para adicionar novo lead aqui!');
                      // Futuramente, abriria o modal de cadastro de leads
                    } else {
                      setNewVisit({ ...newVisit, leadName: value });
                    }
                  }}
                  placeholder="Selecione um lead..."
                  searchPlaceholder="Buscar lead..."
                  notFoundPlaceholder="Nenhum lead encontrado."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="property" className="text-right">Imóvel</Label>
                <Combobox
                  items={properties}
                  value={newVisit.property}
                  onChange={(value) => setNewVisit({ ...newVisit, property: value })}
                  placeholder="Selecione um imóvel..."
                  searchPlaceholder="Buscar imóvel..."
                  notFoundPlaceholder="Nenhum imóvel encontrado."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">Horário</Label>
                <Input id="time" type="time" value={newVisit.time} onChange={(e) => setNewVisit({...newVisit, time: e.target.value})} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" onClick={handleAddVisit}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex flex-1 gap-6 overflow-hidden">
        {/* Coluna da Esquerda: Calendário */}
        {/* Aumentamos a largura para w-2/5 e adicionamos padding para centralizar e dar espaço. */}
        <div className="w-2/5 border-r pr-10 flex justify-center items-start pt-10">
          {/* A classe 'transform scale-125' aumenta o tamanho do calendário em 25% */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border transform scale-125"
            locale={ptBR}
            // 'modifiers' define quais dias devem ter um estilo especial.
            modifiers={{ scheduled: scheduledDays }}
            // 'modifiersClassNames' aplica as classes do Tailwind a esses dias.
            modifiersClassNames={{
              scheduled: 'bg-green-200/50 rounded-full font-bold',
            }}
          />
        </div>

        {/* Coluna da Direita: Lista de Visitas */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">
            Visitas para {date ? format(date, 'PPP', { locale: ptBR }) : 'Nenhum dia selecionado'}
          </h2>
          <div className="flex-1 overflow-y-auto pr-2">
            {selectedDayVisits.length > 0 ? (
              <ul className="space-y-4">
                {selectedDayVisits.map(visit => (
                  <li key={visit.id} className="p-4 border rounded-md shadow-sm flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{visit.leadName}</p>
                      <p className="text-gray-600">{visit.property}</p>
                      <p className="text-sm text-gray-500 mt-2">Horário: {format(visit.date, 'HH:mm')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(visit)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedVisit(visit); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Nenhuma visita agendada para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Edição de Visita */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Visita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leadNameEdit" className="text-right">Lead</Label>
                <Combobox
                  items={leads}
                  value={newVisit.leadName}
                  onChange={(value) => setNewVisit({ ...newVisit, leadName: value })}
                  placeholder="Selecione um lead..."
                  searchPlaceholder="Buscar lead..."
                  notFoundPlaceholder="Nenhum lead encontrado."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="propertyEdit" className="text-right">Imóvel</Label>
                 <Combobox
                  items={properties}
                  value={newVisit.property}
                  onChange={(value) => setNewVisit({ ...newVisit, property: value })}
                  placeholder="Selecione um imóvel..."
                  searchPlaceholder="Buscar imóvel..."
                  notFoundPlaceholder="Nenhum imóvel encontrado."
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="timeEdit" className="text-right">Horário</Label>
                <Input id="timeEdit" type="time" value={newVisit.time} onChange={(e) => setNewVisit({...newVisit, time: e.target.value})} className="col-span-3" />
              </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleUpdateVisit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a visita agendada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedVisit(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVisit}>Sim, excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Componente Combobox adicionado no final do arquivo
interface ComboboxProps {
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  notFoundPlaceholder: string;
  className?: string;
}

const Combobox: React.FC<ComboboxProps> = ({ items, value, onChange, placeholder, searchPlaceholder, notFoundPlaceholder, className }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{notFoundPlaceholder}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.value === 'new_lead' ? (
                    <span className='flex items-center'><PlusCircle className='mr-2 h-4 w-4'/>{item.label}</span>
                  ) : (
                    item.label
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VisitsPage;