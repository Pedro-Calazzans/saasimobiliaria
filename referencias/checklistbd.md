# Plano de Execução: Correção da Integração com Supabase

**Meta:** Diagnosticar e resolver o erro de inicialização do cliente Supabase para habilitar a persistência de dados e a comunicação com o backend.

---

#### **Fase 1: Verificação e Validação do Ambiente**

- [ ] **[FIX-01] Validação das Variáveis de Ambiente:**
    - **Ação:** Verificar a existência e o conteúdo do arquivo `.env.local` na raiz do projeto.
    - **Arquivos-Alvo:** `.env.local`.
    - **Critério de Aceite:** O arquivo deve conter as seguintes linhas, com os valores corretos do seu projeto Supabase, e o prefixo `NEXT_PUBLIC_` é essencial para que as variáveis fiquem disponíveis no navegador.
      ```
      NEXT_PUBLIC_SUPABASE_URL=SUA_URL_AQUI
      NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
      ```
    - **Observação:** Após verificar, reinicie completamente o servidor de desenvolvimento (`next dev`) para garantir que o arquivo `.env.local` seja carregado.

- [ ] **[FIX-02] Depuração da Inicialização do Cliente:**
    - **Ação:** Modificar temporariamente o criador do cliente Supabase para registrar no console os valores das variáveis de ambiente no momento da sua execução. Isso nos dará certeza se as variáveis estão chegando corretamente ao cliente.
    - **Arquivos-Alvo:** `src/lib/supabase/client.ts`.
    - **Critério de Aceite:** O `console.log` deve exibir a URL e a chave do Supabase no console do navegador ao carregar uma página que utiliza o cliente.
      ```typescript
      import { createBrowserClient } from '@supabase/ssr'

      export function createClient() {
        // Log para depuração
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); // Log se a chave existe

        return createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      }
      ```

---

#### **Fase 2: Refatoração Arquitetural da Conexão**

**Meta:** Centralizar a criação do cliente Supabase usando um Padrão de Provedor (Context Provider) para garantir que uma única instância do cliente seja criada e compartilhada, evitando problemas de inicialização repetida e inconsistente.

- [ ] **[FIX-03] Criação do Provedor Supabase:**
    - **Ação:** Criar um novo componente Provedor que inicializa o cliente Supabase e o disponibiliza para toda a árvore de componentes filhos através de um Contexto React.
    - **Arquivos-Alvo:** `src/components/providers/supabase-provider.tsx` (novo).
    - **Critério de Aceite:** O arquivo deve conter um Provedor de Contexto que armazena a instância do cliente Supabase.

- [ ] **[FIX-04] Criação do Hook `useSupabase`:**
    - **Ação:** Criar um hook customizado `useSupabase` que permite aos componentes acessar facilmente a instância do cliente Supabase a partir do contexto.
    - **Arquivos-Alvo:** `src/components/providers/supabase-provider.tsx` (adicionar o hook no mesmo arquivo).
    - **Critério de Aceite:** O hook deve fornecer acesso à instância do cliente e lançar um erro se for usado fora do Provedor.

- [ ] **[FIX-05] Integração do Provedor no Layout Raiz:**
    - **Ação:** Envolver o layout principal da aplicação com o `SupabaseProvider` recém-criado, garantindo que o cliente esteja disponível para todas as páginas.
    - **Arquivos-Alvo:** `src/app/(main)/layout.tsx`.
    - **Critério de Aceite:** O `SupabaseProvider` deve ser um dos componentes de mais alto nível na árvore de componentes do layout principal.

---

#### **Fase 3: Refatoração e Teste das Páginas**

**Meta:** Substituir a criação manual do cliente em cada página pelo novo hook `useSupabase`, testar uma página para validar a correção e, em seguida, aplicar a correção a todas as outras.

- [ ] **[FIX-06] Refatoração da Página de Imóveis:**
    - **Ação:** Modificar a página `imoveis/page.tsx` para obter o cliente Supabase através do hook `useSupabase()` em vez de chamar `createClient()` diretamente.
    - **Arquivos-Alvo:** `src/app/(main)/imoveis/page.tsx`.
    - **Critério de Aceite:** A página deve buscar e exibir os imóveis do banco de dados sem o erro de inicialização. As operações de CRUD (através dos modais) devem funcionar corretamente.

- [ ] **[FIX-07] Validação e Rollout da Correção:**
    - **Ação:** Após confirmar que a página de Imóveis funciona, aplicar a mesma refatoração (usar o hook `useSupabase`) a todas as outras páginas que apresentaram o erro.
    - **Arquivos-Alvo:**
        - `src/app/(main)/leads/page.tsx`
        - `src/app/(main)/kanban/page.tsx`
        - `src/app/(main)/visitas/page.tsx`
        - `src/app/(main)/dashboard/page.tsx`
        - Todos os modais que fazem chamadas diretas ao Supabase.
    - **Critério de Aceite:** Todas as páginas da aplicação devem carregar e manipular dados do Supabase sem erros. A aplicação deve estar totalmente funcional e conectada ao backend.