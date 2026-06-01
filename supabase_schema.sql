-- 1. Create Restaurants Table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    general_password TEXT NOT NULL, -- For initial access
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Profiles (Users) Table
CREATE TYPE user_role AS ENUM ('admin', 'kitchen', 'waiter');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Tables Table
CREATE TABLE restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    status TEXT DEFAULT 'available', -- available, occupied, reserved
    qr_code_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(restaurant_id, table_number)
);

-- 4. Create Products (Menu) Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    quick_delivery BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Orders Table
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled', 'paid');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    customer_name TEXT,
    status order_status DEFAULT 'pending',
    total_price DECIMAL(10, 2) DEFAULT 0,
    payment_method TEXT, -- 'Cash', 'SINPE', 'Card'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (Internal)
CREATE POLICY "Users can see their restaurant data" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- PUBLIC POLICIES for Customer Menu
-- Allow anyone to see restaurant names and settings
CREATE POLICY "Public access to restaurant info" ON restaurants
    FOR SELECT USING (true);

-- Allow anyone to see available products
CREATE POLICY "Public access to available products" ON products
    FOR SELECT USING (is_available = true);

-- Allow anyone to see restaurant tables (needed to validate the table selection)
CREATE POLICY "Public access to restaurant tables" ON restaurant_tables
    FOR SELECT USING (true);

-- Allow customers to create orders
CREATE POLICY "Public can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- Allow customers to create order items
CREATE POLICY "Public can create order items" ON order_items
    FOR INSERT WITH CHECK (true);

-- Add branding settings to restaurants
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Atomic Order Creation Function for Customers
-- Defined as SECURITY DEFINER to bypass RLS for the insert process if needed
CREATE OR REPLACE FUNCTION create_customer_order(
    p_restaurant_id UUID,
    p_table_id UUID,
    p_items JSONB, -- Array of {product_id, quantity, notes}
    p_total_price DECIMAL
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- Find active order for the table (not delivered or cancelled)
    SELECT id INTO v_order_id
    FROM orders
    WHERE table_id = p_table_id
      AND status NOT IN ('delivered', 'cancelled')
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_order_id IS NOT NULL THEN
        -- Update existing order total price
        UPDATE orders
        SET total_price = total_price + p_total_price,
            updated_at = now()
        WHERE id = v_order_id;
    ELSE
        -- Create new order
        INSERT INTO orders (restaurant_id, table_id, status, total_price)
        VALUES (p_restaurant_id, p_table_id, 'confirmed', p_total_price)
        RETURNING id INTO v_order_id;
    END IF;

    -- Insert new items
    INSERT INTO order_items (order_id, product_id, quantity, notes)
    SELECT v_order_id, (item->>'product_id')::UUID, (item->>'quantity')::INT, item->>'notes'
    FROM jsonb_array_elements(p_items) AS item;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
