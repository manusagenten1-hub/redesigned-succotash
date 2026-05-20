-- Habilita o uso de UUIDs se puder, mas como o CRM usa IDs em formato de string, podemos manter TEXT para facilitar a migração
-- 1. Members
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    roles TEXT[] NOT NULL,
    photo_url TEXT,
    is_pinned BOOLEAN DEFAULT false,
    token TEXT
);

-- 2. Leads
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company_name TEXT,
    whatsapp TEXT NOT NULL,
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by TEXT REFERENCES members(id) ON DELETE SET NULL
);

-- 3. Sales
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    business_type TEXT NOT NULL,
    company_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    site_url TEXT NOT NULL,
    price NUMERIC NOT NULL,
    mrr NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    responsible_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    indicator_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    created_by TEXT REFERENCES members(id) ON DELETE SET NULL
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    site_url TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    mrr NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    created_by TEXT REFERENCES members(id) ON DELETE SET NULL
);

-- 5. Commissions
CREATE TABLE IF NOT EXISTS commissions (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    sale_value NUMERIC NOT NULL,
    commission_value NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    is_recurring BOOLEAN DEFAULT false
);

-- 6. Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    description TEXT,
    priority TEXT,
    status TEXT NOT NULL,
    created_by TEXT REFERENCES members(id) ON DELETE SET NULL
);

-- 7. Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT REFERENCES members(id) ON DELETE SET NULL
);

-- 8. Goals
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    period TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 9. Achieved Goals
CREATE TABLE IF NOT EXISTS achieved_goals (
    id TEXT PRIMARY KEY,
    goal_id TEXT REFERENCES goals(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    goal_period TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    reward_text TEXT,
    period_key TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 10. Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    value NUMERIC
);

-- ==========================================
-- RLS (Row Level Security) - PERMISSÕES
-- ==========================================
-- Desativando RLS temporariamente para todas as tabelas para permitir
-- que o frontend faça todas as operações sem precisar de Autenticação Supabase
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE achieved_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
