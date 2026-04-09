import { FormEvent, useState } from 'react';

export default function Home() {
  const [nombreApellido, setNombreApellido] = useState('');
  const [instagram, setInstagram] = useState('');
  const [celular, setCelular] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Plantilla base: este submit queda listo para conectar a API cuando quieras.
    console.log({ nombreApellido, instagram, celular });
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

          <button
            type="submit"
            className="w-full rounded-2xl bg-migusto-rojo px-6 py-3 font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  );
}