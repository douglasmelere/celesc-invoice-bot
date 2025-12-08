# Guia de Configuração - CELESC Invoice Bot

Este guia irá ajudá-lo a configurar e executar o projeto, incluindo a validação do carregamento de PDFs e resumos do Supabase.

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- MySQL (banco de dados)
- Conta no Supabase com Storage configurado

## 🚀 Configuração Inicial

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Execute o script de setup:

```bash
pnpm run setup
```

Isso criará um arquivo `.env` na raiz do projeto. **Edite o arquivo `.env`** e configure todas as variáveis:

#### Variáveis obrigatórias:

- `DATABASE_URL`: URL de conexão MySQL (ex: `mysql://user:password@localhost:3306/database`)
- `SUPABASE_STORAGE_URL`: URL do Storage do Supabase (ex: `https://your-project.supabase.co/storage/v1`)
- `SUPABASE_API_KEY`: Chave API do Supabase (anon key)
- `JWT_SECRET`: Chave secreta para JWT
- `BUILT_IN_FORGE_API_URL`: URL da API Forge para armazenamento
- `BUILT_IN_FORGE_API_KEY`: Chave da API Forge

#### Variáveis opcionais:

- `VITE_APP_ID`: ID da aplicação
- `OAUTH_SERVER_URL`: URL do servidor OAuth
- `OWNER_OPEN_ID`: OpenID do proprietário
- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente (development/production)

### 3. Configurar o banco de dados

Execute as migrações do banco de dados:

```bash
pnpm run db:push
```

Isso criará as tabelas necessárias no banco de dados MySQL.

### 4. Validar conexão com Supabase

Antes de iniciar o servidor, valide a conexão com o Supabase Storage:

```bash
pnpm run validate:supabase
```

Este script irá:
- ✅ Verificar se as variáveis de ambiente estão configuradas
- ✅ Testar conexão com a pasta "faturas" no Supabase
- ✅ Testar conexão com a pasta "resumos" no Supabase
- ✅ Verificar construção de URLs públicas
- ✅ Mostrar quantos arquivos foram encontrados em cada pasta

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
pnpm run dev
```

O servidor será iniciado em `http://localhost:3000` (ou outra porta disponível).

### Modo Produção

1. Primeiro, faça o build:

```bash
pnpm run build
```

2. Depois, inicie o servidor:

```bash
pnpm run start
```

## 🔍 Validação do Sistema

### Como o sistema carrega PDFs e Resumos

O sistema possui um **PDF Poller** que:

1. **Executa automaticamente** a cada 25 segundos
2. **Verifica** as pastas "faturas" e "resumos" no Supabase Storage
3. **Baixa** novos PDFs encontrados
4. **Armazena** no S3 (via Forge API)
5. **Salva** informações no banco de dados MySQL

### Verificar se está funcionando

1. **Logs do servidor**: Quando o servidor estiver rodando, você verá logs como:
   ```
   [PDF Poller] Checking Supabase Storage for new PDFs...
   [PDF Poller] ✓ Found and stored X new PDF(s)
   ```

2. **Via API**: Acesse a rota `/api/trpc/pdf.list` para ver todos os PDFs carregados

3. **Interface Web**: Acesse a página de PDFs na interface web

### Testes

Execute os testes para validar o funcionamento:

```bash
pnpm run test
```

Isso executará:
- Testes de conexão com Supabase
- Testes de endpoints de PDF
- Testes de rotas de invoice

## 🐛 Solução de Problemas

### Erro: "Storage proxy credentials missing"

**Solução**: Configure `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` no arquivo `.env`

### Erro: "Database not available"

**Solução**: 
1. Verifique se `DATABASE_URL` está correto no `.env`
2. Certifique-se de que o MySQL está rodando
3. Execute `pnpm run db:push` para criar as tabelas

### Erro: "SUPABASE_STORAGE_URL is not defined"

**Solução**: Configure `SUPABASE_STORAGE_URL` e `SUPABASE_API_KEY` no arquivo `.env`

### PDFs não estão sendo carregados

**Verificações**:
1. Execute `pnpm run validate:supabase` para verificar a conexão
2. Verifique os logs do servidor para erros do PDF Poller
3. Certifique-se de que os arquivos estão nas pastas corretas no Supabase:
   - `faturas/` para faturas
   - `resumos/` para resumos
4. Verifique se os arquivos têm extensão `.pdf`

## 📁 Estrutura do Projeto

```
celesc-invoice-bot/
├── client/          # Frontend React
├── server/          # Backend Express + tRPC
│   ├── pdfPoller.ts # Serviço de polling do Supabase
│   ├── routers.ts   # Rotas da API
│   └── db.ts        # Funções do banco de dados
├── drizzle/         # Migrações do banco de dados
├── scripts/         # Scripts auxiliares
│   ├── setup.js              # Script de setup inicial
│   └── validate-supabase.js  # Validação do Supabase
└── .env            # Variáveis de ambiente (criar)
```

## 🔐 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` no repositório. Ele contém informações sensíveis.

## 📞 Suporte

Se encontrar problemas, verifique:
1. Os logs do servidor
2. A saída do `pnpm run validate:supabase`
3. Os testes com `pnpm run test`

