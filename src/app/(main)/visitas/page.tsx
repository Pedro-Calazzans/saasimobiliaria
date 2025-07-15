'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isSameDay, startOfDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Visit } from '@/types/visit';
import { Lead } from '@/app/(main)/leads/components/edit-lead-modal';
import { Imovel } from '@/types/imovel';

type ComboboxItem = {
  value: string;
  label: string;
};

const VisitsPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [visits, setVisits] = useState<Visit[]>([]);
  const [leads, setLeads] = useState<ComboboxItem[]>([]);
  const [properties, setProperties] = useState<ComboboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [formState, setFormState] = useState({ lead_id: '', property_id: '', time: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      const [visitsRes, leadsRes, propertiesRes] = await Promise.all([
        supabase.from('visits').select('*, leads(full_name), properties(title)').eq('user_id', user.id),
        supabase.from('leads').select('id, full_name').eq('user_id', user.id),
        supabase.from('properties').select('id, title').eq('user_id', user.id)
      ]);

      if (visitsRes.error || leadsRes.error || propertiesRes.error) {
        toast.error('Erro ao carregar dados da agenda.');
        console.error('Visits Error:', visitsRes.error);
        console.error('Leads Error:', leadsRes.error);
        console.error('Properties Error:', propertiesRes.error);
      } else {
        setVisits(visitsRes.data as Visit[]);
        setLeads(leadsRes.data.map((l: { id: string; full_name: string }) => ({ value: l.id, label: l.full_name })));
        setProperties(propertiesRes.data.map((p: { id: string; title: string }) => ({ value: p.id, label: p.title })));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const scheduledDays = useMemo(() => visits.map(visit => startOfDay(new Date(visit.visit_datetime))), [visits]);
  const selectedDayVisits = useMemo(() => date ? visits.filter(visit => isSameDay(new Date(visit.visit_datetime), date)) : [], [visits, date]);

  const openModal = (visit: Visit | null = null) => {
    setSelectedVisit(visit);
    if (visit) {
      setFormState({
        lead_id: visit.lead_id,
        property_id: visit.property_id,
        time: format(new Date(visit.visit_datetime), 'HH:mm'),
      });
    } else {
      setFormState({ lead_id: '', property_id: '', time: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveVisit = async () => {
    if (!date || !formState.lead_id || !formState.property_id || !formState.time) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [hours, minutes] = formState.time.split(':');
    const visitDate = new Date(date);
    visitDate.setHours(parseInt(hours, 10));
    visitDate.setMinutes(parseInt(minutes, 10));

    const visitData = {
      user_id: user.id,
      lead_id: formState.lead_id,
      property_id: formState.property_id,
      visit_datetime: visitDate.toISOString(),
      status: selectedVisit?.status || 'Agendada',
    };

    if (selectedVisit) { // Update
      const { data, error } = await supabase.from('visits').update(visitData).eq('id', selectedVisit.id).select('*, leads(full_name), properties(title)').single();
      if (error) {
        toast.error('Erro ao atualizar a visita.');
      } else {
        toast.success('Visita atualizada com sucesso!');
        setVisits(visits.map(v => v.id === data.id ? data : v));
      }
    } else { // Create
      const { data, error } = await supabase.from('visits').insert(visitData).select('*, leads(full_name), properties(title)').single();
      if (error) {
        toast.error('Erro ao agendar a visita.');
      } else {
        toast.success('Visita agendada com sucesso!');
        setVisits([...visits, data]);
      }
    }
    setIsModalOpen(false);
  };

  const handleDeleteVisit = async () => {
    if (!selectedVisit) return;
    const supabase = createClient();
    const { error } = await supabase.from('visits').delete().eq('id', selectedVisit.id);
    if (error) {
      toast.error('Erro ao excluir a visita.');
    } else {
      toast.success('Visita excluída com sucesso!');
      setVisits(visits.filter(v => v.id !== selectedVisit.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedVisit(null);
  };

  return (
    <div className="flex flex-col h-full bg-white p-6 rounded-md border gap-6">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">Agenda de Visitas</h1>
        <Button onClick={() => openModal()}>Agendar Visita</Button>
      </header>

      <main className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-2/5 border-r pr-10 flex justify-center items-start pt-10">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" locale={ptBR} modifiers={{ scheduled: scheduledDays }} modifiersClassNames={{ scheduled: 'bg-green-200/50 rounded-full font-bold' }} />
        </div>
        <div className="flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Visitas para {date ? format(date, 'PPP', { locale: ptBR }) : 'Nenhum dia selecionado'}</h2>
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? <p>Carregando...</p> : selectedDayVisits.length > 0 ? (
              <ul className="space-y-4">
                {selectedDayVisits.map(visit => (
                  <li key={visit.id} className="p-4 border rounded-md shadow-sm flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">{visit.leads?.full_name || 'Lead não encontrado'}</p>
                      <p className="text-gray-600">{visit.properties?.title || 'Imóvel não encontrado'}</p>
                      <p className="text-sm text-gray-500 mt-2">Horário: {format(new Date(visit.visit_datetime), 'HH:mm')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(visit)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedVisit(visit); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500"><p>Nenhuma visita agendada para este dia.</p></div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedVisit ? 'Editar Visita' : 'Agendar Nova Visita'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Agendando para: <span className="font-semibold">{date ? format(date, 'PPP', { locale: ptBR }) : ''}</span></p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lead_id" className="text-right">Lead</Label>
              <Combobox items={leads} value={formState.lead_id} onChange={(value) => setFormState({ ...formState, lead_id: value })} placeholder="Selecione um lead..." searchPlaceholder="Buscar lead..." notFoundPlaceholder="Nenhum lead encontrado." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="property_id" className="text-right">Imóvel</Label>
              <Combobox items={properties} value={formState.property_id} onChange={(value) => setFormState({ ...formState, property_id: value })} placeholder="Selecione um imóvel..." searchPlaceholder="Buscar imóvel..." notFoundPlaceholder="Nenhum imóvel encontrado." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Horário</Label>
              <Input id="time" type="time" value={formState.time} onChange={(e) => setFormState({ ...formState, time: e.target.value })} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSaveVisit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente a visita agendada.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel onClick={() => setSelectedVisit(null)}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteVisit}>Sim, excluir</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ComboboxProps { items: ComboboxItem[]; value: string; onChange: (value: string) => void; placeholder: string; searchPlaceholder: string; notFoundPlaceholder: string; className?: string; }
const Combobox: React.FC<ComboboxProps> = ({ items, value, onChange, placeholder, searchPlaceholder, notFoundPlaceholder, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full justify-between', className)}>{value ? items.find((item) => item.value === value)?.label : placeholder}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder={searchPlaceholder} /><CommandList><CommandEmpty>{notFoundPlaceholder}</CommandEmpty><CommandGroup>{items.map((item) => (<CommandItem key={item.value} value={item.value} onSelect={(currentValue) => { onChange(currentValue === value ? '' : currentValue); setOpen(false); }}><Check className={cn('mr-2 h-4 w-4', value === item.value ? 'opacity-100' : 'opacity-0')} />{item.label}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
    </Popover>
  );
};

export default VisitsPage;
