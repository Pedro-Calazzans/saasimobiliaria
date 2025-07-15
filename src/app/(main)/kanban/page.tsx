'use client'

import { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent, DragOverEvent, UniqueIdentifier, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Card, CardContent } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createClient } from '@/lib/supabase/client';
import type { Lead, FunnelStage } from '@/app/(main)/leads/components/edit-lead-modal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Column {
  id: string;
  title: string;
  leads: Lead[];
}

const initialColumns: Column[] = [
  { id: 'novo', title: 'Novo', leads: [] },
  { id: 'qualificacao', title: 'Em Qualificação', leads: [] },
  { id: 'visita-agendada', title: 'Visita Agendada', leads: [] },
  { id: 'proposta', title: 'Proposta Apresentada', leads: [] },
  { id: 'negociacao', title: 'Negociação', leads: [] },
  { id: 'fechado', title: 'Fechado', leads: [] },
];

const funnelStepToColumnId: Record<FunnelStage, string> = {
  'Novo': 'novo',
  'Em Qualificação': 'qualificacao',
  'Visita Agendada': 'visita-agendada',
  'Proposta Apresentada': 'proposta',
  'Negociação': 'negociacao',
  'Fechado': 'fechado',
};

const columnIdToFunnelStep: Record<string, Lead['funnel_stage']> = {
  'novo': 'Novo',
  'qualificacao': 'Em Qualificação',
  'visita-agendada': 'Visita Agendada',
  'proposta': 'Proposta Apresentada',
  'negociacao': 'Negociação',
  'fechado': 'Fechado',
};

function LeadCard({ lead, isDragging }: { lead: Lead, isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-0 py-1">
      <Card className={cn(
        "bg-white dark:bg-gray-800 shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500",
        isDragging && "shadow-2xl rotate-3"
      )}>
        <CardContent className="p-2">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">{lead.full_name.charAt(0)}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                {lead.full_name}
              </p>
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p>{lead.phone}</p>
            <p>{lead.search_profile?.property_type} em {lead.search_profile?.location}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ column }: { column: Column }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className={cn(
      "w-80 p-4 bg-gray-100 rounded-lg flex-shrink-0 border transition-colors duration-300",
      isOver && "bg-blue-100"
    )}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md font-semibold text-gray-700">{column.title}</h2>
          <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {column.leads.length}
          </span>
        </div>
        <SortableContext items={column.leads.map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[200px]">
            {column.leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </SortableContext>
      </div>
    )
  }

  export default function KanbanPage() {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchLeads = async () => {
        const supabase = createClient();
        const { data: leadsData, error } = await supabase.from('leads').select('*');

        if (error) {
          toast.error('Erro ao buscar os leads.');
          console.error(error);
          setLoading(false);
          return;
        }

        const newColumns = initialColumns.map(c => ({ ...c, leads: [] as Lead[] }));

        (leadsData as Lead[]).forEach(lead => {
          const columnId = funnelStepToColumnId[lead.funnel_stage];
          const column = newColumns.find(c => c.id === columnId);
          if (column) {
            column.leads.push(lead);
          }
        });

        setColumns(newColumns);
        setLoading(false);
      };

      fetchLeads();
    }, []);
    
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const activeLead = useMemo(() => {
      if (!activeId) return null;
      for (const column of columns) {
        const lead = column.leads.find(l => l.id === activeId);
        if (lead) return lead;
      }
      return null;
    }, [activeId, columns]);

    const findColumn = (id: UniqueIdentifier) => {
      if (columns.some(c => c.id === id)) {
        return columns.find(c => c.id === id)
      }
      return columns.find(c => c.leads.some(l => l.id === id));
    };

    function handleDragStart(event: DragStartEvent) {
      const { active } = event;
      setActiveId(active.id);
    }

    function handleDragOver(event: DragOverEvent) {
      const { active, over } = event;
      if (!over) {
        return;
      }
      const { id } = active;
      const { id: overId } = over;

      const activeContainer = findColumn(id);
      const overContainer = findColumn(overId);

      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return;
      }

      setColumns((prev) => {
        const activeItems = activeContainer.leads;
        const overItems = overContainer.leads;

        const activeIndex = activeItems.findIndex((i) => i.id === id);
        let overIndex = overItems.findIndex((i) => i.id === overId);

        if (overIndex === -1) {
           overIndex = overItems.length;
        }
        
        return prev.map((column) => {
          if (column.id === activeContainer.id) {
            return {
              ...column,
              leads: column.leads.filter((lead) => lead.id !== id),
            };
          } else if (column.id === overContainer.id) {
            return {
              ...column,
              leads: [
                ...column.leads.slice(0, overIndex),
                activeItems[activeIndex],
                ...column.leads.slice(overIndex),
              ],
            };
          } else {
            return column;
          }
        });
      });
    }

    async function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      
      setActiveId(null);

      if (!over) {
        return;
      }

      const activeContainer = findColumn(active.id);
      const overContainer = findColumn(over.id);

      if (!activeContainer || !overContainer) {
        return;
      }

      const leadId = active.id;
      const newColumnId = overContainer.id;
      const oldColumnId = activeContainer.id;

      if (oldColumnId !== newColumnId) {
        const newStatus = columnIdToFunnelStep[newColumnId];
        if (!newStatus) return;

        const supabase = createClient();
        const { error } = await supabase
          .from('leads')
          .update({ funnel_stage: newStatus })
          .eq('id', leadId);

        if (error) {
          toast.error('Falha ao atualizar o status do lead.');
          console.error(error);
        } else {
          toast.success('Status do lead atualizado!');
        }
      }
      
      if (activeContainer === overContainer) {
        const activeIndex = activeContainer.leads.findIndex((i) => i.id === active.id);
        const overIndex = overContainer.leads.findIndex((i) => i.id === over.id);

        if (activeIndex !== overIndex) {
          setColumns((prev) => {
            return prev.map((column) => {
              if (column.id === activeContainer.id) {
                return {
                  ...column,
                  leads: arrayMove(activeContainer.leads, activeIndex, overIndex),
                };
              }
              return column;
            });
          });
        }
      }
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Funil de Vendas</h1>
        <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto pb-4 space-x-4">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} />
            ))}
          </div>
          <DragOverlay>
            {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  }
