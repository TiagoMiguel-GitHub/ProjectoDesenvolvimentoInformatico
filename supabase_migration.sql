-- =====================================================
-- CORRER ESTE SCRIPT NO SUPABASE SQL EDITOR
-- supabase.com → projeto → SQL Editor → New query
-- =====================================================

-- 1. Remover tabelas antigas ligadas a utilizadores
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS schedule_slots CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- 2. Tabela de perfis (ligada ao Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  expo_push_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Moradas
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Horários de entrega
CREATE TABLE schedule_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 5,
  booked_count INTEGER DEFAULT 0,
  slot_type TEXT DEFAULT 'delivery' CHECK (slot_type IN ('delivery', 'pickup')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Encomendas
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  address_id UUID REFERENCES addresses(id),
  time_slot_id UUID REFERENCES schedule_slots(id),
  status TEXT DEFAULT 'pending',
  fulfillment_type TEXT DEFAULT 'delivery',
  payment_method TEXT DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_cost NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Itens de encomenda
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- 7. Histórico de estado de encomendas
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Criar perfil automaticamente quando um utilizador se regista
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Ativar segurança por linhas (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulator_configs ENABLE ROW LEVEL SECURITY;

-- 10. Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 11. Políticas de acesso
CREATE POLICY "perfil_proprio" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "atualizar_perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "ler_produtos" ON products FOR SELECT USING (true);
CREATE POLICY "admin_produtos_insert" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_produtos_update" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "admin_produtos_delete" ON products FOR DELETE USING (is_admin());

CREATE POLICY "ler_categorias" ON categories FOR SELECT USING (true);
CREATE POLICY "admin_categorias" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_categorias_update" ON categories FOR UPDATE USING (is_admin());

CREATE POLICY "ler_zonas" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "admin_zonas" ON delivery_zones FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "ler_simulador" ON simulator_configs FOR SELECT USING (true);
CREATE POLICY "admin_simulador" ON simulator_configs FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "ler_horarios" ON schedule_slots FOR SELECT USING (true);
CREATE POLICY "admin_horarios_insert" ON schedule_slots FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_horarios_update" ON schedule_slots FOR UPDATE USING (is_admin());
CREATE POLICY "admin_horarios_delete" ON schedule_slots FOR DELETE USING (is_admin());

CREATE POLICY "moradas_proprias" ON addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "encomendas_select" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "encomendas_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_encomendas_update" ON orders FOR UPDATE USING (is_admin());

CREATE POLICY "itens_select" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "itens_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
);

CREATE POLICY "historico_select" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "admin_historico_insert" ON order_status_history FOR INSERT WITH CHECK (is_admin());

-- =====================================================
-- DEPOIS DE CORRER O SCRIPT:
-- 1. Vai a Authentication → Users → Add user
-- 2. Cria: admin@agrowood.pt / changeme
-- 3. Corre este comando para torná-lo admin:
--    UPDATE profiles SET role = 'admin'
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@agrowood.pt');
-- =====================================================
