#!/usr/bin/env node
/**
 * Script para testar acesso direto aos PDFs do Supabase
 */

import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", ".env") });

const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL;

async function testPdfUrl() {
  console.log("🧪 Testando acesso direto aos PDFs...\n");

  if (!SUPABASE_STORAGE_URL) {
    console.error("❌ SUPABASE_STORAGE_URL não configurado!");
    process.exit(1);
  }

  // Testar URL de fatura
  const faturaPath = "faturas/TAISA FERNANDA HASSEMER.pdf";
  const pathSegments = faturaPath.split('/');
  const encodedSegments = pathSegments.map(segment => encodeURIComponent(segment));
  const encodedPath = encodedSegments.join('/');
  const faturaUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${encodedPath}`;

  console.log(`📄 Testando fatura:`);
  console.log(`   Path: ${faturaPath}`);
  console.log(`   URL: ${faturaUrl}\n`);

  try {
    const response = await axios.get(faturaUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
      responseType: 'arraybuffer',
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']} bytes`);
    console.log(`   Data size: ${response.data.byteLength} bytes`);
    
    if (response.status === 200) {
      console.log(`   ✅ URL acessível e PDF carregado!\n`);
    } else {
      console.log(`   ⚠ Status não é 200\n`);
    }
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      try {
        const errorData = JSON.parse(Buffer.from(error.response.data).toString());
        console.error(`   Error data:`, errorData);
      } catch {
        console.error(`   Error data (raw):`, error.response.data.toString().substring(0, 200));
      }
    }
  }

  // Testar URL de resumo
  const resumoPath = "resumos/TAISA FERNANDA HASSEMER.pdf";
  const resumoPathSegments = resumoPath.split('/');
  const resumoEncodedSegments = resumoPathSegments.map(segment => encodeURIComponent(segment));
  const resumoEncodedPath = resumoEncodedSegments.join('/');
  const resumoUrl = `${SUPABASE_STORAGE_URL}/object/public/celesc-faturas/${resumoEncodedPath}`;

  console.log(`📄 Testando resumo:`);
  console.log(`   Path: ${resumoPath}`);
  console.log(`   URL: ${resumoUrl}\n`);

  try {
    const response = await axios.head(resumoUrl, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length']} bytes`);
    
    if (response.status === 200) {
      console.log(`   ✅ URL acessível!\n`);
    } else {
      console.log(`   ⚠ Status não é 200, mas não é erro de servidor\n`);
    }
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, error.response.data);
    }
  }
}

testPdfUrl();

