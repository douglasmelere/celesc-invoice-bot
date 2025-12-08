# Script para iniciar o PostgreSQL com Docker
Write-Host "🐘 Iniciando PostgreSQL com Docker..." -ForegroundColor Cyan

docker-compose up -d postgres

Write-Host "⏳ Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar se o container está rodando
$containerStatus = docker ps --filter "name=celesc-invoice-bot-db" --format "{{.Status}}"

if ($containerStatus) {
    Write-Host "✅ PostgreSQL está rodando!" -ForegroundColor Green
    Write-Host "   Container: $containerStatus" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📝 Informações de conexão:" -ForegroundColor Cyan
    Write-Host "   Host: localhost" -ForegroundColor Gray
    Write-Host "   Port: 5432" -ForegroundColor Gray
    Write-Host "   Database: celesc_invoice_bot" -ForegroundColor Gray
    Write-Host "   User: celesc_user" -ForegroundColor Gray
    Write-Host "   Password: celesc_password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Para parar o banco: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Erro ao iniciar PostgreSQL" -ForegroundColor Red
    exit 1
}

