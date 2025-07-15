# Plano de Execução Mestre: SaaS Imobiliário

**Objetivo:** Guiar o desenvolvimento iterativo do SaaS Imobiliário, desde a refatoração e integração com o backend até o polimento da interface e experiência do usuário, usando tarefas específicas e com tags para execução por uma IA de desenvolvimento.

---

### **FRENTE 1: FUNDAÇÃO - ESTRUTURA E DESIGN SYSTEM**

**Meta:** Estabelecer uma base de código e visual sólida, coesa e consistente para toda a aplicação.

#### **Fase 1: Padronização do Design System**

- [x] **[TASK-01] Revisão e Centralização do Tema:**
    - **Ação:** Analisar os arquivos `tailwind.config.ts` e `src/app/globals.css`. Garantir que as variáveis de cor, fontes, espaçamentos e `border-radius` estejam centralizadas e sendo utilizadas corretamente pelos componentes.
    - **Arquivos-Alvo:** `tailwind.config.ts`, `src/app/globals.css`.
    - **Critério de Aceite:** As cores no `globals.css` (ex: `--primary`, `--destructive`) devem ser a única fonte da verdade para o esquema de cores da aplicação.

- [x] **[TASK-02] Auditoria dos Componentes de UI:**
    - **Ação:** Revisar todos os componentes na pasta `src/components/ui`. Verificar se os estados `:hover`, `:focus`, `:disabled` e `aria-invalid` são visualmente consistentes e usam as variáveis do tema.
    - **Arquivos-Alvo:** `src/components/ui/*.tsx`.
    - **Critério de Aceite:** Um botão desabilitado deve ter a mesma aparência em toda a aplicação. Um campo de input com erro (`aria-invalid`) deve ter a mesma borda vermelha e anel de foco.

- [x] **[TASK-03] Padronização da Tipografia:**
    - **Ação:** Aplicar estilos de tipografia consistentes para títulos e parágrafos em todas as páginas, utilizando as classes do Tailwind.
    - **Arquivos-Alvo:** `src/app/(main)/**/*.tsx`.
    - **Critério de Aceite:** O título principal de cada página deve ser um `<h1>` com a classe `text-2xl font-bold`. Subtítulos devem usar classes como `text-xl font-semibold`.

#### **Fase 2: Estrutura do Layout Principal**

- [x] **[TASK-04] Evolução da Sidebar:**
    - **Ação:** Adicionar ícones da biblioteca `lucide-react` ao lado de cada link no componente `Sidebar`. Refinar o estilo do link ativo para ser mais proeminente, usando uma cor de fundo mais forte (`bg-gray-200`) e texto mais escuro.
    - **Arquivos-Alvo:** `src/components/sidebar.tsx`.
    - **Critério de Aceite:** Cada item de menu deve ter um ícone à esquerda do texto. O link ativo deve ser claramente distinguível dos demais.

- [x] **[TASK-05] Padronização dos Cabeçalhos de Página:**
    - **Ação:** Criar um componente reutilizável `PageHeader.tsx` que aceite `title` como prop e um `children` para botões de ação. Implementar este componente nas páginas de Imóveis e Leads.
    - **Arquivos-Alvo:** `src/components/page-header.tsx` (novo), `src/app/(main)/imoveis/page.tsx`, `src/app/(main)/leads/page.tsx`.
    - **Critério de Aceite:** O título e o botão "Adicionar" nas páginas de Imóveis e Leads devem vir deste novo componente, garantindo um layout idêntico.

---

### **FRENTE 2: DESENVOLVIMENTO MODULAR - REVISÃO E INTEGRAÇÃO**

**Meta:** Refatorar e conectar cada módulo principal da aplicação ao Supabase de forma isolada, garantindo que cada um funcione de ponta a ponta.

#### **Fase 3: Módulo de Autenticação**

- [x] **[TASK-06] Configuração do Cliente Supabase:**
    - **Ação:** Criar um arquivo `src/lib/supabase/client.ts` para inicializar o cliente Supabase usando as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    - **Arquivos-Alvo:** `src/lib/supabase/client.ts` (novo), `.env.local`.
    - **Critério de Aceite:** O cliente Supabase deve ser um singleton exportado que pode ser importado em qualquer lugar da aplicação.

- [x] **[TASK-07] Implementação do Login com Supabase:**
    - **Ação:** Modificar a função `handleSignIn` na página de login para usar `supabase.auth.signInWithPassword()`. Implementar o tratamento de erros e sucesso com `react-hot-toast`.
    - **Arquivos-Alvo:** `src/app/(auth)/login/page.tsx`.
    - **Critério de Aceite:** Um login bem-sucedido redireciona para `/dashboard`. Uma falha exibe um toast de erro.

#### **Fase 4: Módulo de Imóveis (CRUD Completo)**

- [x] **[TASK-08] Refatoração do Estado dos Imóveis:**
    - **Ação:** Analisar `imoveis/page.tsx` e os modais `add-imovel-modal.tsx` e `edit-imovel-modal.tsx`. Ajustar os estados (`useState`) e tipos (`interface Imovel`) para corresponder exatamente à estrutura da tabela `properties` no `BD.txt`, especialmente os campos `jsonb` (`endereco`, `features`).
    - **Arquivos-Alvo:** `src/app/(main)/imoveis/**/*.tsx`.
    - **Critério de Aceite:** A interface `Imovel` em TypeScript deve ser idêntica à estrutura da tabela do banco de dados.

- [x] **[TASK-09] Conexão de Leitura (GET) dos Imóveis:**
    - **Ação:** Na página `imoveis/page.tsx`, remover o `initialImoveis` e, dentro de um `useEffect`, buscar os dados reais da tabela `properties` usando a chamada `supabase.from('properties').select('*')`. Implementar um estado de carregamento (skeleton loader) enquanto os dados são buscados.
    - **Arquivos-Alvo:** `src/app/(main)/imoveis/page.tsx`.
    - **Critério de Aceite:** A tabela de imóveis deve exibir dados vindos diretamente do Supabase.

- [x] **[TASK-10] Conexão de Escrita (POST/PUT/DELETE) dos Imóveis:**
    - **Ação:** Refatorar as funções de salvar e excluir nos modais para usar `supabase.from('properties').insert()`, `update()` e `delete()`. Substituir as chamadas `fetch` para a API interna.
    - **Arquivos-Alvo:** `src/app/(main)/imoveis/components/add-imovel-modal.tsx`, `src/app/(main)/imoveis/components/edit-imovel-modal.tsx`.
    - **Critério de Aceite:** Adicionar, editar ou excluir um imóvel no UI deve persistir a alteração no banco de dados do Supabase e refletir na tabela principal.

#### **Fase 5: Módulo de Leads (CRUD Completo)**

- [x] **[TASK-11] Refatoração do Estado dos Leads:**
    - **Ação:** Similar à tarefa [TASK-08], alinhar a interface `Lead` e os estados dos componentes com a estrutura da tabela `leads` do `BD.txt`, tratando `search_profile` e `financial_profile` como objetos.
    - **Arquivos-Alvo:** `src/app/(main)/leads/**/*.tsx`.
    - **Critério de Aceite:** O formulário de edição de lead deve conseguir manipular e salvar dados nos campos `jsonb`.

- [x] **[TASK-12] Conexão do CRUD de Leads com Supabase:**
    - **Ação:** Substituir os dados mocados e as chamadas `fetch` para a API interna (`/api/leads`) por chamadas diretas ao Supabase (`select`, `insert`, `update`, `delete`) na página e nos modais de Leads.
    - **Arquivos-Alvo:** `src/app/(main)/leads/**/*.tsx`.
    - **Critério de Aceite:** O CRUD de Leads deve estar totalmente funcional e persistido no Supabase.

#### **Fase 6: Módulo Kanban e Visitas**

- [x] **[TASK-13] Conexão do Kanban com Supabase:**
    - **Ação:** Em `kanban/page.tsx`, buscar os leads do Supabase e distribuí-los nas colunas corretas. Na função `handleDragEnd`, implementar a chamada `supabase.from('leads').update({ funnel_stage: new_status }).eq('id', lead_id)`.
    - **Arquivos-Alvo:** `src/app/(main)/kanban/page.tsx`.
    - **Critério de Aceite:** Arrastar um card de lead entre colunas deve atualizar seu status no banco de dados.

- [x] **[TASK-14] Conexão da Agenda de Visitas com Supabase:**
    - **Ação:** Em `visitas/page.tsx`, substituir todos os dados mocados (visitas, leads, imóveis) por chamadas ao Supabase. Implementar a lógica de salvar, editar e excluir visitas na tabela `visits`.
    - **Arquivos-Alvo:** `src/app/(main)/visitas/page.tsx`.
    - **Critério de Aceite:** A agenda deve refletir e persistir os dados reais do banco de dados.

---

### **FRENTE 3: REFINAMENTO E FUNCIONALIDADES AVANÇADAS**

**Meta:** Elevar a qualidade do MVP com funcionalidades de valor agregado e polimento de UX/UI.

#### **Fase 7: Validação e Otimização de Formulários**

- [x] **[TASK-15] Validação Client-Side:**
    - **Ação:** Implementar validação de formulário em todos os modais. Campos obrigatórios não podem ser vazios. E-mail e Telefone devem ter formatos válidos. Desabilitar o botão "Salvar" se o formulário for inválido.
    - **Arquivos-Alvo:** Todos os componentes de modal (`add-*.tsx`, `edit-*.tsx`).
    - **Critério de Aceite:** O usuário não consegue submeter um formulário com dados inválidos. Mensagens de erro claras são exibidas abaixo dos campos problemáticos.

- [x] **[TASK-16] Otimização do Cadastro de Endereço via CEP:**
    - **Ação:** Integrar a API ViaCEP. No formulário de Imóveis, ao preencher o campo CEP e sair do foco (onBlur), fazer uma chamada à API e preencher automaticamente os campos de Rua, Bairro, Cidade e Estado.
    - **Arquivos-Alvo:** `src/app/(main)/imoveis/components/add-imovel-modal.tsx`, `edit-imovel-modal.tsx`.
    - **Critério de Aceite:** Digitar um CEP válido e clicar fora do campo preenche os campos de endereço correspondentes.

#### **Fase 8: Polimento de UI e Microinterações**

- [x] **[TASK-17] Responsividade e Otimização Mobile:**
    - **Ação:** Revisar todas as páginas em uma janela de navegador estreita. Garantir que as tabelas tenham scroll horizontal e que o Kanban seja navegável.
    - **Arquivos-Alvo:** `imoveis/page.tsx`, `leads/page.tsx`, `kanban/page.tsx`.
    - **Critério de Aceite:** A aplicação é utilizável e não apresenta quebras de layout em telas de celular.

- [x] **[TASK-18] Melhorias na Tabela de Dados:**
    - **Ação:** Adicionar funcionalidade de ordenação por clique nos cabeçalhos das colunas das tabelas de Imóveis e Leads.
    - **Arquivos-Alvo:** `imoveis/page.tsx`, `leads/page.tsx`.
    - **Critério de Aceite:** Clicar no cabeçalho "Título" ordena a tabela alfabeticamente. Clicar novamente inverte a ordem.

- [x] **[TASK-19] Aprimoramento do Quadro Kanban:**
    - **Ação:** Melhorar o feedback visual ao arrastar um card (sombra, rotação leve). Destacar a coluna de destino com uma cor de fundo diferente (`bg-blue-100`).
    - **Arquivos-Alvo:** `kanban/page.tsx`.
    - **Critério de Aceite:** A interação de arrastar e soltar no Kanban deve ser mais fluida e comunicativa.

#### **Fase 9: Funcionalidades de Análise**

- [x] **[TASK-20] Dashboard Dinâmico:**
    - **Ação:** Conectar os cards da página de Dashboard para exibir dados reais calculados a partir do banco de dados (Total de Imóveis, Novos Leads no mês, etc.).
    - **Arquivos-Alvo:** `src/app/(main)/dashboard/page.tsx`.
    - **Critério de Aceite:** Os números no dashboard devem refletir o estado atual dos dados no Supabase.
