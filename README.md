# AgroWood

Plataforma de comércio de produtos agrícolas e madeireiros, composta por uma API backend, painel de administração web e app mobile.

---

## Stack

| Componente | Tecnologia |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy |
| Base de dados | PostgreSQL (Supabase) |
| Admin | React · TypeScript · Vite |
| Mobile | React Native · Expo |

---

## Estrutura do projeto

```
agrowood/
├── backend/          # API REST (FastAPI)
├── apps/
│   ├── admin/        # Painel de administração (React)
│   └── mobile/       # App mobile (React Native)
```

---

## Iniciar o projeto

### Pré-requisitos

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Expo Go](https://expo.dev/client) no telemóvel

### Comando único

Na pasta raiz do projeto:

```bash
npm start
```

Arranca o **backend** e a **app mobile** em simultâneo.

---

## Painel de Administração

```bash
cd apps/admin
npm run dev
```

Disponível em `http://localhost:5173`

---

## Configuração

Cria um ficheiro `.env` na pasta `backend/` com base no `.env.example`:

```bash
cp .env.example backend/.env
```

Preenche os valores do Supabase e restantes variáveis.

---

## Funcionalidades

**App Mobile (clientes)**
- Catálogo de produtos com pesquisa e filtros
- Carrinho e checkout
- Histórico de encomendas
- Simulador de orçamento
- Gestão de moradas

**Painel Admin**
- Dashboard com estatísticas
- Gestão de produtos e stock
- Gestão de encomendas e estados
- Zonas de entrega
- Horários de entrega e levantamento
- Simulador de orçamento
