# Mi Gusto Day - Canjeá tu 15% OFF

Este es un sistema premium de registro diseñado para la campaña **Mi Gusto Day**, donde los usuarios pueden registrarse para obtener un beneficio exclusivo del 15% OFF. La aplicación ofrece una interfaz elegante, rápida y con validaciones en tiempo real para asegurar una experiencia de usuario de primer nivel.

## 🚀 Características Premium

- **Interfaz Moderna**: Diseño sofisticado con estética oscura, efectos de desenfoque (glassmorphism) y acentos dorados que refuerzan la identidad de marca.
- **Animaciones Fluidas**: Integración de **Framer Motion** para transiciones suaves, efectos de entrada cinematográficos y modales interactivos.
- **Validación Inteligente**: Sistema que evita registros duplicados verificando Nombre, Instagram y Celular en la base de datos antes de procesar el envío.
- **Mobile First**: Optimización total para dispositivos móviles, garantizando una carga rápida y facilidad de uso en pantallas pequeñas.
- **Feedback Inmediato**: Modales de éxito y error con iconografía de alta calidad y efectos visuales dinámicos.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconografía**: Lucide React
- **Formularios**: React Hook Form
- **Build Tool**: Vite

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone [URL-DEL-REPO]
   cd MiGusto-Day
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
   ```

4. **Configuración de Base de Datos:**
   Ejecuta el siguiente SQL en el editor de Supabase para crear la tabla necesaria:
   ```sql
   CREATE TABLE disculpas (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     nombre_apellido text NOT NULL,
     instagram text NOT NULL,
     celular text NOT NULL,
     created_at timestamptz DEFAULT now()
   );

   -- Habilitar RLS
   ALTER TABLE disculpas ENABLE ROW LEVEL SECURITY;

   -- Política para inserciones públicas
   CREATE POLICY "Allow public inserts" ON disculpas FOR INSERT TO anon WITH CHECK (true);
   
   -- Política para lectura pública (validación de duplicados)
   CREATE POLICY "Allow public read" ON disculpas FOR SELECT TO anon USING (true);
   ```

## 👥 Desarrolladores

- **Facundo Carrizo** — GitHub: [@facu14carrizo](https://github.com/facu14carrizo) · LinkedIn: [facu14carrizo](https://www.linkedin.com/in/facu14carrizo)
- **Ramiro Lacci** — GitHub: [@ramirolacci19](https://github.com/ramirolacci19) · LinkedIn: [ramiro-lacci](https://www.linkedin.com/in/ramiro-lacci)

---
Desarrollado con ❤️ para Mi Gusto.
