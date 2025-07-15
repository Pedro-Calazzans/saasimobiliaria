import { Lead } from "@/app/(main)/leads/components/edit-lead-modal";
import { Imovel } from "./imovel";

export type VisitStatus = 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada';

// Interface para a visita como vem do banco de dados
export interface Visit {
  id: string;
  user_id: string;
  lead_id: string;
  property_id: string;
  visit_datetime: string; // ISO string
  status: VisitStatus;
  feedback?: string;
  // Campos que podem vir do join
  leads?: Pick<Lead, 'full_name'>;
  properties?: Pick<Imovel, 'title'>;
}
