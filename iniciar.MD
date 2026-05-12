# AgroWood — Iniciar a Aplicação

## Pré-requisitos (instalar uma vez)

- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Expo Go](https://expo.dev/client) no telemóvel

---

## 1. Backend (API)

Abrir um terminal na pasta `backend/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0
```

API disponível em `http://localhost:8000`

---

## 2. Painel Admin

Abrir um **novo** terminal na pasta `apps/admin/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\apps\admin
npm run dev
```

Painel disponível em `http://localhost:5173`
Login: `admin@agrowood.pt` / `changeme`

---

## 3. App Mobile

Abrir um **novo** terminal na pasta `apps/mobile/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\apps\mobile
npx expo start
```

Ler o QR code com a app **Expo Go** no telemóvel.
O telemóvel e o computador têm de estar na **mesma rede Wi-Fi**.

---

## Notas

- A base de dados está no **Supabase** (online) — não precisas de Docker.
- O IP é detetado automaticamente pelo Expo — não precisas de o alterar manualmente.
- Se mudares de rede Wi-Fi, corre `npm start` novamente.
