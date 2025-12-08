# 🚀 Instruções de Execução - CELESC Invoice Bot

## ✅ Configuração Concluída

O projeto foi configurado e está pronto para execução. Seguem as instruções:

## 📝 Passo a Passo para Executar

### 1. Configurar Variáveis de Ambiente

Execute o script de setup:

```bash
pnpm run setup
```

Isso criará um arquivo `.env` na raiz do projeto. **EDITE O ARQUIVO `.env`** e configure:

#### ⚠️ Variáveis OBRIGATÓRIAS:

```env
# Supabase (para carregar PDFs e resumos)
SUPABASE_STORAGE_URL=https://seu-projeto.supabase.co/storage/v1
SUPABASE_API_KEY=sua_chave_anon_do_supabase

# Banco de Dados
DATABASE_URL=mysql://usuario:senha@host:porta/database

# Storage (Forge API)
BUILT_IN_FORGE_API_URL=https://sua-forge-api.com
BUILT_IN_FORGE_API_KEY=sua_chave_forge

# JWT
JWT_SECRET=sua_chave_secreta_jwt
```

### 2. Validar Conexão com Supabase

Antes de iniciar o servidor, valide a conexão:

```bash
pnpm run validate:supabase
```

Este comando irá:
- ✅ Verificar se as variáveis estão configuradas
- ✅ Testar acesso às pastas "faturas" e "resumos"
- ✅ Mostrar quantos arquivos foram encontrados
- ✅ Validar construção de URLs públicas

**Se houver erros, corrija as variáveis no `.env` antes de continuar.**

### 3. Configurar Banco de Dados

Execute as migrações:

```bash
pnpm run db:push
```

Isso criará as tabelas necessárias no MySQL.

### 4. Iniciar o Servidor

#### Modo Desenvolvimento:

```bash
pnpm run dev
```

O servidor iniciará em `http://localhost:3000` (ou outra porta disponível).

#### Modo Produção:

```bash
# 1. Fazer build
pnpm run build

# 2. Iniciar servidor
pnpm run start
```

## 🔍 Como Validar se os PDFs Estão Sendo Carregados

### 1. Verificar Logs do Servidor

Quando o servidor estiver rodando, você verá logs como:

```
[PDF Poller] Starting Supabase Storage polling service
[PDF Poller] Storage URL: https://...
[PDF Poller] Checking Supabase Storage for new PDFs...
[PDF Poller] ✓ Found and stored X new PDF(s)
```

### 2. O Sistema Funciona Automaticamente

O **PDF Poller** executa a cada 25 segundos e:
- ✅ Verifica a pasta "faturas" no Supabase
- ✅ Verifica a pasta "resumos" no Supabase
- ✅ Baixa novos PDFs encontrados
- ✅ Armazena no S3 (via Forge API)
- ✅ Salva no banco de dados MySQL

### 3. Verificar via Interface Web

Acesse a página de PDFs na interface web para ver todos os arquivos carregados.

### 4. Verificar via API

Acesse: `http://localhost:3000/api/trpc/pdf.list` para ver todos os PDFs.

## 📋 Checklist de Validação

Antes de considerar o sistema "no ar", verifique:

- [ ] Arquivo `.env` configurado com todas as variáveis
- [ ] `pnpm run validate:supabase` executado com sucesso
- [ ] `pnpm run db:push` executado com sucesso
- [ ] Servidor iniciado sem erros
- [ ] Logs mostram "[PDF Poller] Starting Supabase Storage polling service"
- [ ] Logs mostram verificação periódica de PDFs
- [ ] PDFs aparecem na interface web ou via API

## 🐛 Problemas Comuns

### Erro: "Supabase credentials not configured"

**Solução**: Configure `SUPABASE_STORAGE_URL` e `SUPABASE_API_KEY` no `.env`

### Erro: "Database not available"

**Solução**: 
1. Verifique se `DATABASE_URL` está correto
2. Certifique-se de que o MySQL está rodando
3. Execute `pnpm run db:push`

### PDFs não aparecem

**Verificações**:
1. Execute `pnpm run validate:supabase` novamente
2. Verifique se os arquivos estão nas pastas corretas no Supabase:
   - `faturas/` para faturas
   - `resumos/` para resumos
3. Verifique os logs do servidor para erros
4. Certifique-se de que os arquivos têm extensão `.pdf`

## 📚 Documentação Adicional

Consulte `README-SETUP.md` para mais detalhes sobre configuração e estrutura do projeto.

## ✨ Melhorias Implementadas

1. ✅ Scripts corrigidos para funcionar no Windows (usando `cross-env`)
2. ✅ Script de validação do Supabase criado
3. ✅ Script de setup inicial criado
4. ✅ Correção na comparação de nomes de arquivos (evita duplicatas)
5. ✅ Melhor tratamento de erros no PDF Poller
6. ✅ Validação de variáveis de ambiente no início

---

**Pronto para executar!** 🎉

