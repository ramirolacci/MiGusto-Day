import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [nombreApellido, setNombreApellido] = useState('');
  const [instagram, setInstagram] = useState('');
  const [celular, setCelular] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('disculpas')
        .insert([
          {
            nombre_apellido: nombreApellido,
            instagram: instagram,
            celular: celular,
          },
        ]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      setNombreApellido('');
      setInstagram('');
      setCelular('');
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      setError('Hubo un error al enviar tus datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-10 shadow-premium">
        <h1 className="text-2xl md:text-4xl font-black text-migusto-crema mb-8 text-center">
          Mi Gusto Day - Disculpas
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre-apellido" className="block mb-2 text-sm font-bold uppercase tracking-wider text-white/80">
              Nombre y Apellido
            </label>
            <input
              id="nombre-apellido"
              type="text"
              value={nombreApellido}
              onChange={(e) => setNombreApellido(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50"
              placeholder="Ingresa tu nombre y apellido"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block mb-2 text-sm font-bold uppercase tracking-wider text-white/80">
              Usuario de Instagram
            </label>
            <input
              id="instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div>
            <label htmlFor="celular" className="block mb-2 text-sm font-bold uppercase tracking-wider text-white/80">
              Numero de Celular
            </label>
            <input
              id="celular"
              type="tel"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50"
              placeholder="Ingresa tu numero"
            />
          </div>

          {isSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-bold uppercase tracking-wider text-sm">¡Datos enviados con éxito!</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <p className="font-bold uppercase tracking-wider text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-migusto-rojo px-6 py-4 font-black uppercase tracking-wider text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-migusto-rojo/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}