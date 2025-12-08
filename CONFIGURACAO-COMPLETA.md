# ✅ Configuração Completa - CELESC Invoice Bot

## 🎉 Mudanças Realizadas

### 1. ✅ PostgreSQL com Docker
- Criado `docker-compose.yml` com PostgreSQL 16
- Configurado banco de dados: `celesc_invoice_bot`
- Usuário: `celesc_user` / Senha: `celesc_password`
- Porta: `5432`

### 2. ✅ Removido Forge API
- Storage agora usa **Supabase Storage diretamente**
- PDFs são salvos diretamente no Supabase
- Não precisa mais de `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY`

### 3. ✅ OAuth Desabilitado
- Rotas OAuth comentadas (não são mais necessárias)
- Sistema funciona sem autenticação OAuth

### 4. ✅ Schema Convertido para PostgreSQL
- Todas as tabelas convertidas de MySQL para PostgreSQL
- Usando `serial` para IDs auto-incrementados
- Usando `pgEnum` para enums
- Sintaxe atualizada para PostgreSQL

## 🚀 Como Executar

### 1. Iniciar o PostgreSQL

**Windows (PowerShell):**
```powershell
pnpm run db:start
```

**Linux/Mac:**
```bash
pnpm run db:start
```

Ou manualmente:
```bash
docker-compose up -d postgres
```

### 2. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com:
- ✅ `SUPABASE_STORAGE_URL`: Configurado
- ✅ `SUPABASE_API_KEY`: Configurado
- ✅ `DATABASE_URL`: Configurado para PostgreSQL local

### 3. Executar Migrações do Banco

```bash
pnpm run db:push
```

Isso criará as tabelas no PostgreSQL:
- `users`
- `scheduledDispatches`
- `generatedPdfs`

### 4. Validar Supabase (Opcional)

```bash
pnpm run validate:supabase
```

### 5. Iniciar o Servidor

```bash
pnpm run dev
```

## 📋 Variáveis de Ambiente Necessárias

No arquivo `.env`:

```env
# Obrigatórias
DATABASE_URL=postgresql://celesc_user:celesc_password@localhost:5432/celesc_invoice_bot
SUPABASE_STORAGE_URL=https://n8n-supabase.ztdny5.easypanel.host/storage/v1
SUPABASE_API_KEY=sua_chave_aqui
JWT_SECRET=sua_chave_jwt_aqui

# Opcionais
NODE_ENV=development
PORT=3000
```

## 🔧 Comandos Úteis

```bash
# Iniciar PostgreSQL
pnpm run db:start

# Parar PostgreSQL
pnpm run db:stop

# Ver logs do PostgreSQL
pnpm run db:logs

# Executar migrações
pnpm run db:push

# Validar Supabase
pnpm run validate:supabase

# Iniciar servidor
pnpm run dev
```

## 📊 Estrutura do Banco de Dados

### Tabela: `users`
- Armazena informações de usuários (opcional, se usar OAuth no futuro)

### Tabela: `scheduledDispatches`
- Armazena agendamentos de solicitações de faturas

### Tabela: `generatedPdfs`
- Armazena informações dos PDFs carregados do Supabase
- Campos: `filename`, `s3Key`, `s3Url`, `fileSize`, `pdfType`, `createdAt`

## 🔍 Como Funciona o Sistema

1. **PDF Poller** verifica Supabase a cada 25 segundos
2. Busca arquivos nas pastas `faturas/` e `resumos/`
3. Baixa novos PDFs encontrados
4. Salva diretamente no Supabase Storage (não usa mais Forge API)
5. Registra informações no banco PostgreSQL

## ✅ Checklist de Validação

- [x] PostgreSQL configurado com Docker
- [x] Schema convertido para PostgreSQL
- [x] Forge API removido
- [x] OAuth desabilitado
- [x] Storage usando Supabase diretamente
- [x] Credenciais do Supabase configuradas
- [x] Scripts de gerenciamento do banco criados

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"
- Verifique se o PostgreSQL está rodando: `pnpm run db:logs`
- Verifique a `DATABASE_URL` no `.env`

### Erro: "Storage upload failed"
- Verifique `SUPABASE_STORAGE_URL` e `SUPABASE_API_KEY`
- Execute `pnpm run validate:supabase`

### Erro: "relation does not exist"
- Execute as migrações: `pnpm run db:push`

## 📝 Próximos Passos

1. Execute `pnpm run db:start` para iniciar o PostgreSQL
2. Execute `pnpm run db:push` para criar as tabelas
3. Execute `pnpm run dev` para iniciar o servidor
4. O sistema começará a carregar PDFs automaticamente!

---

**Sistema configurado e pronto para uso!** 🎉

