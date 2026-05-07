# AgroWood — Iniciar a Aplicação

## 1. Base de dados (Docker)

Abrir um terminal na pasta raiz do projeto e correr:

```powershell
docker compose up -d
```

---

## 2. Backend (API)

Abrir um terminal na pasta `backend/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0
```

API disponível em `http://localhost:8000`

---

## 3. Painel Admin

Abrir um **novo** terminal na pasta `apps/admin/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\apps\admin
npm run dev
```

Painel disponível em `http://localhost:5173`
Login: `admin@agrowood.pt` / `changeme`

---

## 4. App Mobile

Abrir um **novo** terminal na pasta `apps/mobile/`:

```powershell
cd C:\Users\Tiago\Desktop\agrowood\apps\mobile
npx expo start
```

Ler o QR code com a app **Expo Go** no telemóvel.
O telemóvel e o computador têm de estar na **mesma rede Wi-Fi**.

---

## Alterar o IP local

Necessário quando mudas de rede Wi-Fi ou o IP do computador muda.

**Verificar o IP atual:**

```powershell
ipconfig | Select-String "IPv4"
```

Usar o primeiro IP da lista (ex: `192.168.1.74`).

**Alterar em dois ficheiros:**

1. `backend/.env` — linha `PUBLIC_BASE_URL`:
   ```
   PUBLIC_BASE_URL=http://192.168.1.74:8000
   ```

2. `apps/mobile/src/api/client.ts` — variável `BASE_URL`:
   ```ts
   const BASE_URL = "http://192.168.1.74:8000";
   ```

Depois de alterar, reiniciar o backend e o Expo.
