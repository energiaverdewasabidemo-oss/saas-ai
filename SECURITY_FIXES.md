# Security Fixes Documentation

## Overview

This document explains the security issues that were identified and how they were resolved.

## Issues Fixed

### 1. Unused Database Indexes (Performance)

**Problem:** Three indexes were created but never used by queries, consuming unnecessary storage and potentially slowing down write operations.

**Solution:** Removed the following unused indexes:
- `idx_calls_classification` - Not used by queries
- `idx_calls_call_id` - Redundant with the UNIQUE constraint
- `idx_calls_lead_name` - Not used by queries

The `idx_calls_created_at` index was kept as it's used for ordering results.

### 2. Row Level Security Policies (Critical Security Issue)

**Problem:** The RLS policies were using `USING (true)` and `WITH CHECK (true)`, which completely bypasses row-level security. This allowed anyone to insert, update, or delete data without any restrictions.

**Solution:** Implemented secure policies:

#### For `calls` table:
- **SELECT:** Public access maintained (dashboard viewing)
- **INSERT:** Restricted to authenticated users only
- **UPDATE:** Restricted to authenticated users only
- **DELETE:** Restricted to authenticated users only

#### For `dashboard_metrics` table:
- **SELECT:** Public access maintained (dashboard viewing)
- **INSERT:** Restricted to authenticated users only
- **UPDATE:** Restricted to authenticated users only
- **DELETE:** Restricted to authenticated users only

### 3. Function Security (search_path vulnerability)

**Problem:** The `reset_daily_data()` function had a mutable search_path, which could be exploited for privilege escalation attacks.

**Solution:** Added `SET search_path = public, pg_temp` to the function definition, making it immutable and secure against search_path manipulation attacks.

## New API Endpoint

Since write operations now require authentication, a secure Edge Function has been created to handle data writes from external services.

### Endpoint: `manage-calls`

Base URL: `https://your-project.supabase.co/functions/v1/manage-calls`

#### 1. Create a Call

**Endpoint:** `POST /manage-calls/calls`

**Request Body:**
```json
{
  "call_id": "unique-call-id",
  "lead_name": "John Doe",
  "phone": "+1234567890",
  "classification": "Positivo",
  "duration_seconds": 120,
  "answered": true,
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "call_id": "unique-call-id",
    "lead_name": "John Doe",
    "phone": "+1234567890",
    "classification": "Positivo",
    "duration_seconds": 120,
    "answered": true,
    "created_at": "2026-02-20T10:00:00Z",
    "metadata": {}
  }
}
```

#### 2. Update Metrics

**Endpoint:** `POST /manage-calls/metrics`

**Request Body:**
```json
{
  "total_calls": 2232,
  "answered_calls": 812,
  "total_duration_seconds": 16331,
  "total_filtered": 4,
  "agents_count": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "total_calls": 2232,
    "answered_calls": 812,
    "total_duration_seconds": 16331,
    "total_filtered": 4,
    "agents_count": 1,
    "updated_at": "2026-02-20T10:00:00Z"
  }
}
```

## Usage Examples

### Using cURL

```bash
# Add a new call
curl -X POST https://your-project.supabase.co/functions/v1/manage-calls/calls \
  -H "Content-Type: application/json" \
  -d '{
    "call_id": "call-123",
    "lead_name": "Jane Smith",
    "phone": "+1234567890",
    "classification": "Positivo",
    "duration_seconds": 180,
    "answered": true
  }'

# Update metrics
curl -X POST https://your-project.supabase.co/functions/v1/manage-calls/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "total_calls": 2233,
    "answered_calls": 813,
    "total_duration_seconds": 16511
  }'
```

### Using JavaScript/TypeScript

```typescript
const supabaseUrl = 'https://your-project.supabase.co';

// Add a new call
const response = await fetch(`${supabaseUrl}/functions/v1/manage-calls/calls`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    call_id: 'call-123',
    lead_name: 'Jane Smith',
    phone: '+1234567890',
    classification: 'Positivo',
    duration_seconds: 180,
    answered: true
  })
});

const result = await response.json();
console.log(result);
```

## Important Notes

1. The dashboard (frontend) continues to work without authentication since it only performs READ operations.

2. The `reset_daily_data()` function continues to work as it uses `SECURITY DEFINER`, which executes with elevated privileges.

3. External services that need to INSERT or UPDATE data must now use the Edge Function endpoint instead of direct database access.

4. All write operations are now securely processed through the Edge Function, which uses the service role key internally.

5. The Edge Function is publicly accessible (no JWT verification) but uses the secure service role key to authenticate with the database.

## Migration Applied

The security fixes were applied in the migration: `fix_security_issues.sql`

This migration is safe to run multiple times (idempotent) and can be rolled back if needed.
