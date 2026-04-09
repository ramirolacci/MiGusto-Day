import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Ticket = {
  id_ticket: string;
  tipo: 'BRONCE' | 'PLATA' | 'ORO';
  meses: number;
  usado: boolean;
  dni_validado: string | null;
  fecha_validacion: string | null;
  created_at: string;
};

export type Registro = {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  id_ticket: string;
  fecha_registro: string;
  activo: boolean;
};
