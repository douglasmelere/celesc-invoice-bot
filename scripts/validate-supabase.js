#!/usr/bin/env node
/**
 * Script de validação para testar a conexão com Supabase Storage
 * e verificar se os PDFs e resumos estão sendo carregados corretamente
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

async function validateSupabaseConnection() {
  console.log("🔍 Validando conexão com Supabase Storage...\n");

  // Verificar se as variáveis estão configuradas
  if (!SUPABASE_STORAGE_URL || !SUPABASE_API_KEY) {
    console.error("❌ Erro: Variáveis de ambiente não configuradas!");
    console.error("   Certifique-se de que SUPABASE_STORAGE_URL e SUPABASE_API_KEY estão definidas no arquivo .env");
    process.exit(1);
  }

  console.log("✓ Variáveis de ambiente configuradas");
  console.log(`  SUPABASE_STORAGE_URL: ${SUPABASE_STORAGE_URL}`);
  console.log(`  SUPABASE_API_KEY: ${SUPABASE_API_KEY.substring(0, 20)}...\n`);

  try {
    // Testar conexão listando arquivos na pasta "faturas"
    console.log("📁 Testando acesso à pasta 'faturas'...");
    const faturasResponse = await axios.post(
      `${SUPABASE_STORAGE_URL}/object/list/celesc-faturas`,
      {
        limit: 100,
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

    if (Array.isArray(faturasResponse.data)) {
      const faturas = faturasResponse.data.filter(
        (file) => file.name && file.name.endsWith(".pdf")
      );
      console.log(`✓ Pasta 'faturas' acessível`);
      console.log(`  Total de arquivos encontrados: ${faturas.length}`);
      
      if (faturas.length > 0) {
        console.log(`  Exemplo de arquivo: ${faturas[0].name}`);
        console.log(`  Tamanho: ${(faturas[0].metadata?.size || 0) / 1024} KB`);
      }
    } else {
      console.log("⚠ Resposta inesperada da API (não é um array)");
    }

    // Testar conexão listando arquivos na pasta "resumos"
    console.log("\n📁 Testando acesso à pasta 'resumos'...");
    const resumosResponse = await axios.post(
      `${SUPABASE_STORAGE_URL}/object/list/celesc-faturas`,
      {
        limit: 100,
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

    if (Array.isArray(resumosResponse.data)) {
      const resumos = resumosResponse.data.filter(
        (file) => file.name && file.name.endsWith(".pdf")
      );
      console.log(`✓ Pasta 'resumos' acessível`);
      console.log(`  Total de arquivos encontrados: ${resumos.length}`);
      
      if (resumos.length > 0) {
        console.log(`  Exemplo de arquivo: ${resumos[0].name}`);
        console.log(`  Tamanho: ${(resumos[0].metadata?.size || 0) / 1024} KB`);
      }
    } else {
      console.log("⚠ Resposta inesperada da API (não é um array)");
    }

    // Testar construção de URL pública
    console.log("\n🔗 Testando construção de URLs públicas...");
    if (faturasResponse.data.length > 0) {
      const testFile = faturasResponse.data[0];
      const encodedFilename = encodeURIComponent(testFile.name);
      const publicUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${encodedFilename}`;
      
      console.log(`  URL de exemplo: ${publicUrl}`);
      
      try {
        const headResponse = await axios.head(publicUrl, {
          timeout: 10000,
          validateStatus: (status) => status === 200 || status === 404,
        });
        
        if (headResponse.status === 200) {
          console.log("  ✓ Arquivo acessível via URL pública");
        } else {
          console.log("  ⚠ Arquivo não encontrado (pode ser privado)");
        }
      } catch (error) {
        console.log("  ⚠ Não foi possível verificar acesso ao arquivo");
      }
    }

    console.log("\n✅ Validação concluída com sucesso!");
    console.log("\n📝 Resumo:");
    console.log("  - Conexão com Supabase Storage: ✓");
    console.log("  - Acesso à pasta 'faturas': ✓");
    console.log("  - Acesso à pasta 'resumos': ✓");
    console.log("\n💡 O sistema está pronto para carregar PDFs e resumos!");

  } catch (error) {
    console.error("\n❌ Erro ao validar conexão com Supabase:");
    
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Mensagem: ${error.response.data?.message || error.response.statusText}`);
      console.error(`  Detalhes:`, error.response.data);
    } else if (error.request) {
      console.error("  Erro: Não foi possível conectar ao servidor Supabase");
      console.error("  Verifique se a URL está correta e se há conexão com a internet");
    } else {
      console.error(`  Erro: ${error.message}`);
    }
    
    process.exit(1);
  }
}

validateSupabaseConnection();

