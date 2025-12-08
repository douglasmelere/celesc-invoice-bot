# 🚀 Início Rápido - CELESC Invoice Bot

## ⚡ Passos Rápidos para Colocar no Ar

### 1. Iniciar Docker Desktop
**IMPORTANTE:** Certifique-se de que o Docker Desktop está rodando antes de continuar!

### 2. Iniciar PostgreSQL
```bash
pnpm run db:start
```

Ou manualmente:
```bash
docker-compose up -d postgres
```

### 3. Executar Migrações
```bash
pnpm run db:push
```

### 4. Iniciar o Servidor
```bash
pnpm run dev
```

## ✅ Pronto!

O sistema estará rodando em `http://localhost:3000`

O **PDF Poller** começará automaticamente a verificar o Supabase a cada 25 segundos e carregar novos PDFs.

## 🔍 Verificar se Está Funcionando

1. **Logs do servidor** devem mostrar:
   ```
   [PDF Poller] Starting Supabase Storage polling service
   [PDF Poller] Checking Supabase Storage for new PDFs...
   ```

2. **Acesse a interface web** em `http://localhost:3000`

3. **Verifique os PDFs** na página de PDFs

## 📝 Comandos Úteis

```bash
# Ver logs do PostgreSQL
pnpm run db:logs

# Parar PostgreSQL
pnpm run db:stop

# Validar Supabase
pnpm run validate:supabase
```

## 🐛 Problemas?

### Docker não está rodando
- Inicie o Docker Desktop
- Aguarde ele ficar pronto
- Tente novamente `pnpm run db:start`

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando: `docker ps`
- Verifique a `DATABASE_URL` no `.env`

### PDFs não aparecem
- Execute `pnpm run validate:supabase` para verificar conexão
- Verifique os logs do servidor

---

**Consulte `CONFIGURACAO-COMPLETA.md` para mais detalhes!**

