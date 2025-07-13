import { NextResponse } from 'next/server'

// Dados iniciais para simular um banco de dados pré-existente
const initialLeads = [
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
  },
];

// Mock de uma lista de leads (simulando um banco de dados)
let leads: any[] = [...initialLeads];

export async function GET() {
  try {
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return NextResponse.json({ message: 'Erro ao processar a requisição' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newLead = {
      id: (initialLeads.length + leads.length - initialLeads.length + 1).toString(), // Gera um ID único
      ...body,
      created_at: new Date().toISOString(),
    }

    leads.push(newLead)

    console.log('Lead adicionado:', newLead)
    console.log('Todos os leads:', leads)

    return NextResponse.json({ message: 'Lead adicionado com sucesso!', lead: newLead }, { status: 201 })
  } catch (error) {
    console.error('Erro ao adicionar lead:', error)
    return NextResponse.json({ message: 'Erro ao processar a requisição' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updatedData } = body

    const leadIndex = leads.findIndex((lead) => lead.id === id)

    if (leadIndex === -1) {
      return NextResponse.json({ message: 'Lead não encontrado' }, { status: 404 })
    }

    const updatedLead = { ...leads[leadIndex], ...updatedData }
    leads[leadIndex] = updatedLead

    console.log('Lead atualizado:', updatedLead)

    return NextResponse.json({ message: 'Lead atualizado com sucesso!', lead: updatedLead }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ message: 'Erro ao processar a requisição' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID do lead não fornecido' }, { status: 400 });
    }

    const leadIndex = leads.findIndex((lead) => lead.id.toString() === id);

    if (leadIndex === -1) {
      return NextResponse.json({ message: 'Lead não encontrado' }, { status: 404 });
    }

    leads.splice(leadIndex, 1);

    console.log(`Lead com ID ${id} excluído.`);

    return NextResponse.json({ message: 'Lead excluído com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    return NextResponse.json({ message: 'Erro ao processar a requisição' }, { status: 500 });
  }
}