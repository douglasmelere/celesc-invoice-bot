#!/usr/bin/env node
/**
 * Script de setup inicial do projeto
 * Verifica dependências e configuração básica
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

console.log("🚀 Configurando o projeto CELESC Invoice Bot...\n");

// Verificar se o arquivo .env existe
const envPath = join(rootDir, ".env");
const envExamplePath = join(rootDir, "env.example.txt");

if (!existsSync(envPath)) {
  console.log("📝 Criando arquivo .env...");
  
  if (existsSync(envExamplePath)) {
    const exampleContent = readFileSync(envExamplePath, "utf-8");
    writeFileSync(envPath, exampleContent);
    console.log("✓ Arquivo .env criado a partir de env.example.txt");
    console.log("⚠ IMPORTANTE: Edite o arquivo .env e configure todas as variáveis necessárias!\n");
  } else {
    // Criar um .env básico
    const basicEnv = `# Application Configuration
VITE_APP_ID=
JWT_SECRET=
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=

# OAuth Configuration
OAUTH_SERVER_URL=
OWNER_OPEN_ID=

# Storage Configuration (Forge API)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Supabase Storage Configuration
SUPABASE_STORAGE_URL=
SUPABASE_API_KEY=
`;
    writeFileSync(envPath, basicEnv);
    console.log("✓ Arquivo .env criado");
    console.log("⚠ IMPORTANTE: Configure todas as variáveis no arquivo .env!\n");
  }
} else {
  console.log("✓ Arquivo .env já existe\n");
}

// Verificar dependências
console.log("📦 Verificando dependências...");
try {
  const packageJson = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8"));
  console.log("✓ package.json encontrado");
  
  if (!existsSync(join(rootDir, "node_modules"))) {
    console.log("⚠ node_modules não encontrado. Execute: pnpm install");
  } else {
    console.log("✓ node_modules encontrado");
  }
} catch (error) {
  console.error("❌ Erro ao ler package.json:", error.message);
}

console.log("\n✅ Setup inicial concluído!");
console.log("\n📋 Próximos passos:");
console.log("  1. Edite o arquivo .env e configure todas as variáveis");
console.log("  2. Execute: pnpm install (se ainda não executou)");
console.log("  3. Execute: pnpm run validate:supabase (para validar conexão com Supabase)");
console.log("  4. Execute: pnpm run db:push (para configurar o banco de dados)");
console.log("  5. Execute: pnpm run dev (para iniciar o servidor de desenvolvimento)");
console.log("\n");

