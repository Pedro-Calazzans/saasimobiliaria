# Checklist de Desenvolvimento - MVP SaaS Imobiliário

Este documento rastreia o progresso do desenvolvimento das funcionalidades definidas no PRD e no fluxograma do projeto.

## [PA-01] Gestão de Imóveis (CRUD)

- [x] **Criar Imóvel:** Implementar modal para adicionar um novo imóvel.
- [x] **Ler Imóveis:** Exibir a lista de imóveis cadastrados em uma tabela.
- [x] **Atualizar Imóvel:** Implementar modal para visualizar e editar os detalhes de um imóvel existente.
- [x] **Excluir Imóvel:** Adicionar a funcionalidade de exclusão de um imóvel, com diálogo de confirmação.
- [x] **Melhorias de UI:**
    - [x] Adicionar campo de filtro na tabela de imóveis.
    - [x] Adicionar efeito de `hover` nas linhas da tabela.
    - [x] Adicionar botão de exclusão direto na linha da tabela.

## [PA-02] Gestão de Leads (CRUD)

- [ ] **Criar Lead:** Implementar interface para adicionar um novo lead.
- [ ] **Ler Leads:** Exibir a lista de leads cadastrados.
- [ ] **Atualizar Lead:** Implementar interface para editar um lead existente.
- [ ] **Excluir Lead:** Adicionar a funcionalidade de exclusão de um lead.

## [PA-03] Funil de Vendas Visual (Kanban)

- [ ] **Estrutura do Kanban:** Criar o layout visual do quadro Kanban com as colunas representando os estágios do funil.
- [ ] **Renderizar Cards:** Popular o Kanban com os leads existentes, exibidos como cards.
- [ ] **Funcionalidade Drag-and-Drop:** Implementar a capacidade de arrastar e soltar os cards de leads entre as colunas.
- [ ] **Atualização de Status:** Garantir que ao mover um card, o status do lead seja atualizado no banco de dados.

## [PA-04] Gestão de Visitas

- [ ] **Agendar Visita:** Criar formulário para agendar uma nova visita, associando um lead a um imóvel.
- [ ] **Listar Visitas:** Exibir uma lista ou calendário com as visitas agendadas.

---
*Legenda: `[x]` - Concluído, `[ ]` - Pendente*