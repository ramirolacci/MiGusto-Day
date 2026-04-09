/*
  # Golden Tickets Mi Gusto Lovers - Database Schema

  1. New Tables
    - `tickets`
      - `id_ticket` (text, primary key) - Unique ticket identifier (e.g., BRONCE1-150)
      - `tipo` (text) - Ticket type: BRONCE, PLATA, or ORO
      - `meses` (integer) - Number of months for redemption (3, 6, or 12)
      - `usado` (boolean) - Whether ticket has been used/registered
      - `dni_validado` (text, nullable) - DNI of person who validated the ticket
      - `fecha_validacion` (timestamptz, nullable) - Validation timestamp
      - `created_at` (timestamptz) - Record creation timestamp

    - `registros`
      - `id` (uuid, primary key) - Unique registration ID
      - `nombre` (text) - First name
      - `apellido` (text) - Last name
      - `dni` (text) - National ID number
      - `telefono` (text) - Phone number
      - `id_ticket` (text, foreign key) - Reference to ticket
      - `fecha_registro` (timestamptz) - Registration timestamp
      - `activo` (boolean) - Whether registration is active

  2. Security
    - Enable RLS on both tables
    - Public read access for tickets (to validate)
    - Public insert/read access for registros (for registration)
    - Authenticated users can manage all records (for admin panel)

  3. Sample Data
    - Pre-populate with example tickets for testing
*/

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id_ticket text PRIMARY KEY,
  tipo text NOT NULL CHECK (tipo IN ('BRONCE', 'PLATA', 'ORO')),
  meses integer NOT NULL CHECK (meses IN (3, 6, 12)),
  usado boolean DEFAULT false NOT NULL,
  dni_validado text,
  fecha_validacion timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create registros table
CREATE TABLE IF NOT EXISTS registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  dni text NOT NULL,
  telefono text NOT NULL,
  id_ticket text NOT NULL REFERENCES tickets(id_ticket),
  fecha_registro timestamptz DEFAULT now() NOT NULL,
  activo boolean DEFAULT true NOT NULL
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets
CREATE POLICY "Anyone can view tickets"
  ON tickets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update ticket validation"
  ON tickets FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for registros
CREATE POLICY "Anyone can view registrations"
  ON registros FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create registrations"
  ON registros FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert sample tickets for testing
INSERT INTO tickets (id_ticket, tipo, meses) VALUES
  ('BRONCE1-150', 'BRONCE', 3),
  ('BRONCE2-150', 'BRONCE', 3),
  ('BRONCE3-150', 'BRONCE', 3),
  ('PLATA1-100', 'PLATA', 6),
  ('PLATA2-100', 'PLATA', 6),
  ('PLATA3-100', 'PLATA', 6),
  ('ORO1-50', 'ORO', 12),
  ('ORO2-50', 'ORO', 12),
  ('ORO3-50', 'ORO', 12)
ON CONFLICT (id_ticket) DO NOTHING;
