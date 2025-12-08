# Project TODO

## Core Features
- [x] Create database schema for scheduled dispatches
- [x] Implement webhook integration with n8n (https://n8n.pagluz.com.br/webhook/celesc-bot)
- [x] Build invoice request form with validation (UC, CPF/CNPJ, Date of Birth)
- [x] Handle webhook response (PDF download or error message)
- [x] Implement localStorage for request history
- [x] Create scheduling system for single dispatches
- [x] Create scheduling system for daily recurring dispatches
- [x] Add background execution for scheduled dispatches (works with tab closed)
- [x] Implement push notifications for dispatch results
- [x] Design futuristic UI theme
- [x] Add loading states during webhook processing (~1 minute)
- [x] Implement PDF download functionality
- [x] Add error handling and user feedback

## Bug Fixes
- [x] Fix nested anchor tag error in navigation component

## New Features - PDF Polling
- [x] Create backend endpoint to poll PDF webhook every 25 seconds
- [x] Store received PDFs with metadata (timestamp, filename)
- [x] Create "PDFs Gerados" tab in navigation
- [x] Implement auto-refresh every 25 seconds in PDFs tab
- [x] Display list of received PDFs with download buttons
- [x] Add visual indicator when new PDF is detected

## Supabase Storage Migration
- [x] Replace webhook polling with Supabase Storage API
- [x] Fetch files from /faturas and /resumos folders
- [x] Update database schema to track file type (fatura/resumo)
- [x] Modify UI to separate faturas and resumos sections
- [x] Test file listing and download from Supabase
