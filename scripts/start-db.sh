#!/bin/bash
# Script para iniciar o PostgreSQL com Docker

echo "🐘 Iniciando PostgreSQL com Docker..."

docker-compose up -d postgres

echo "⏳ Aguardando PostgreSQL ficar pronto..."
sleep 5

# Verificar se o container está rodando
if docker ps --filter "name=celesc-invoice-bot-db" --format "{{.Status}}" | grep -q "Up"; then
    echo "✅ PostgreSQL está rodando!"
    echo ""
    echo "📝 Informações de conexão:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: celesc_invoice_bot"
    echo "   User: celesc_user"
    echo "   Password: celesc_password"
    echo ""
    echo "💡 Para parar o banco: docker-compose down"
else
    echo "❌ Erro ao iniciar PostgreSQL"
    exit 1
fi

