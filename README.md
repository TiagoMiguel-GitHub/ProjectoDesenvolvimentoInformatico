# AgroWood

Plataforma de comércio de produtos agrícolas e madeireiros, composta por um painel de administração web e uma app mobile para clientes.

---

## Stack

| Componente | Tecnologia |
|---|---|
| Base de dados + Auth | Supabase (PostgreSQL + RLS) |
| Admin | React 19 · TypeScript · Vite |
| Mobile | React Native · Expo SDK 54 |

Sem backend próprio — toda a comunicação é feita diretamente com o Supabase.

---

## Estrutura do projeto

```
agrowood/
├── apps/
│   ├── admin/        # Painel de administração (React + Vite)
│   └── mobile/       # App mobile (React Native + Expo)
├── supabase_migration.sql   # Script de configuração da base de dados
└── package.json      # Inicia os dois projetos em simultâneo
```

---

## Configuração inicial

### 1. Supabase

1. Cria um projeto em [supabase.com](https://supabase.com)
2. Vai a **SQL Editor** e corre o ficheiro `supabase_migration.sql`
3. Vai a **Authentication → Users** e cria o utilizador admin (ex: `admin@agrowood.pt`)
4. Corre no SQL Editor para torná-lo admin:
   ```sql
   UPDATE profiles SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@agrowood.pt');
   ```

### 2. Chaves de acesso

Vai a **Settings → API** e copia a **Project URL** e a **Anon/Publishable key**.

Coloca os valores em dois ficheiros:

**`apps/admin/src/lib/supabase.ts`**
```ts
const SUPABASE_URL = "https://o-teu-projeto.supabase.co";
const SUPABASE_ANON_KEY = "a-tua-chave";
```

**`apps/mobile/src/lib/supabase.ts`**
```ts
const SUPABASE_URL = "https://o-teu-projeto.supabase.co";
const SUPABASE_ANON_KEY = "a-tua-chave";
```

---

## Iniciar o projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [Expo Go](https://expo.dev/client) no telemóvel

### Comando único

Na pasta raiz do projeto:

```bash
npm start
```

Abre o **admin** em `http://localhost:5173` e inicia a **app mobile** com Expo.

---

## Funcionalidades

**App Mobile (clientes)**
- Loja com pesquisa e filtros por categoria
- Carrinho persistente (mantém-se ao fechar a app)
- Checkout com entrega ou levantamento, seleção de horário e morada
- Gestão de moradas com definição de predefinida
- Histórico de encomendas com pull-to-refresh
- Simulador de orçamento (acessível sem conta)
- Editar perfil (nome e telemóvel)
- Recuperar password por email
- Notificações push após login (token guardado na BD)

**Painel Admin**
- Dashboard com estatísticas de encomendas e receita
- Gestão de produtos, categorias e stock
- Gestão de encomendas com atualização de estado e histórico
- Zonas de entrega com custo e limite para entrega gratuita
- Horários de entrega e levantamento
- Simulador de orçamento
- Gestão de utilizadores (funções e estado da conta)

---

## Notificações push (configuração adicional)

O token de cada utilizador é guardado automaticamente na base de dados após login. Para enviar notificações quando o estado de uma encomenda muda, é necessária uma **Supabase Edge Function**. Ver instruções detalhadas na documentação do Supabase sobre Edge Functions.
