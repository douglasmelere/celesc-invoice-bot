#!/usr/bin/env node
/**
 * Script de teste para verificar se o PDF Poller está funcionando
 */

import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, "..", ".env") });

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

async function testPdfPoller() {
  console.log("🧪 Testando PDF Poller...\n");

  if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
    console.error("❌ Variáveis de ambiente não configuradas!");
    process.exit(1);
  }

  try {
    // Testar listagem de faturas
    console.log("📁 Testando listagem de faturas...");
    const faturasResponse = await axios.post(
      `${SUPABASE_STORAGE_URL}/object/list/celesc-faturas`,
      {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: "faturas",
      },
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        timeout: 10000,
      }
    );

    const faturas = faturasResponse.data.filter(
      (file) => file.name && file.name !== "faturas" && file.name.endsWith(".pdf")
    );
    console.log(`✓ Encontrados ${faturas.length} arquivo(s) em faturas`);
    
    if (faturas.length > 0) {
      const file = faturas[0];
      console.log(`  Exemplo: ${file.name}`);
      console.log(`  Tamanho: ${(file.metadata?.size || 0) / 1024} KB`);
      
      // Testar construção de URL
      let filePath = file.name;
      if (!filePath.includes('/')) {
        filePath = `faturas/${filePath}`;
      }
      const pathSegments = filePath.split('/').map(segment => encodeURIComponent(segment));
      const encodedPath = pathSegments.join('/');
      const publicUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${encodedPath}`;
      console.log(`  URL pública: ${publicUrl}`);
    }

    // Testar listagem de resumos
    console.log("\n📁 Testando listagem de resumos...");
    const resumosResponse = await axios.post(
      `${SUPABASE_STORAGE_URL}/object/list/celesc-faturas`,
      {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
        prefix: "resumos",
      },
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_API_KEY,
        },
        timeout: 10000,
      }
    );

    const resumos = resumosResponse.data.filter(
      (file) => file.name && file.name !== "resumos" && file.name.endsWith(".pdf")
    );
    console.log(`✓ Encontrados ${resumos.length} arquivo(s) em resumos`);
    
    if (resumos.length > 0) {
      const file = resumos[0];
      console.log(`  Exemplo: ${file.name}`);
      console.log(`  Tamanho: ${(file.metadata?.size || 0) / 1024} KB`);
      
      // Testar construção de URL
      let filePath = file.name;
      if (!filePath.includes('/')) {
        filePath = `resumos/${filePath}`;
      }
      const pathSegments = filePath.split('/').map(segment => encodeURIComponent(segment));
      const encodedPath = pathSegments.join('/');
      const publicUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${encodedPath}`;
      console.log(`  URL pública: ${publicUrl}`);
    }

    console.log("\n✅ Teste concluído!");
    console.log("\n💡 Se os arquivos aparecem aqui mas não no banco de dados:");
    console.log("   1. Verifique os logs do servidor (pnpm run dev)");
    console.log("   2. Verifique se o PDF Poller está rodando");
    console.log("   3. Verifique se há erros no console do servidor");

  } catch (error) {
    console.error("\n❌ Erro no teste:", error.message);
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Data:`, error.response.data);
    }
    process.exit(1);
  }
}

testPdfPoller();

