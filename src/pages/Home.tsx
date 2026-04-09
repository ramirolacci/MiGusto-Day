import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function Home() {
  const [nombreApellido, setNombreApellido] = useState('');
  const [instagram, setInstagram] = useState('');
  const [celular, setCelular] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);

  const closeSuccessModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsClosingModal(false);
    }, 500);
  };

  const closeErrorModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setError(null);
      setIsClosingModal(false);
    }, 500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowValidation(true);
    
    if (!nombreApellido || !instagram || !celular) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [nameCheck, instaCheck, phoneCheck] = await Promise.all([
        supabase.from('disculpas').select('id').eq('nombre_apellido', nombreApellido).limit(1),
        supabase.from('disculpas').select('id').eq('instagram', instagram).limit(1),
        supabase.from('disculpas').select('id').eq('celular', celular).limit(1)
      ]);

      if (
        (nameCheck.data && nameCheck.data.length > 0) ||
        (instaCheck.data && instaCheck.data.length > 0) ||
        (phoneCheck.data && phoneCheck.data.length > 0)
      ) {
        setError('Los datos ingresados ya se encuentran registrados.');
        setIsLoading(false);
        return;
      }

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
      setShowValidation(false);
    } catch (err: any) {
      console.error('Error saving to Supabase:', err);
      setError('Hubo un error al enviar tus datos. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <section className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-10 shadow-premium animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-2 duration-1000 ease-out fill-mode-both">
        <h1 className="text-3xl md:text-4xl font-black text-migusto-crema mb-8 text-center tracking-tight">
          <span className="block mb-2">MI GUSTO DAY</span>
          <span className="block text-xl md:text-2xl opacity-90 font-extrabold text-migusto-dorado">Canjeá tu 15% OFF</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
              className={`w-full rounded-2xl border ${showValidation && !nombreApellido ? 'border-migusto-rojo bg-migusto-rojo/10' : 'border-white/20 bg-black/20'} px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-dorado/50 hover:border-migusto-dorado/30 transition-colors`}
              placeholder="Ingresa tu nombre y apellido"
            />
            {showValidation && !nombreApellido && (
              <p className="mt-2 text-sm text-migusto-rojo font-bold">Este campo es obligatorio.</p>
            )}
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
              className={`w-full rounded-2xl border ${showValidation && !instagram ? 'border-migusto-rojo bg-migusto-rojo/10' : 'border-white/20 bg-black/20'} px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-dorado/50 hover:border-migusto-dorado/30 transition-colors`}
              placeholder="Ingresa tu usuario"
            />
            {showValidation && !instagram && (
              <p className="mt-2 text-sm text-migusto-rojo font-bold">Este campo es obligatorio.</p>
            )}
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
              className={`w-full rounded-2xl border ${showValidation && !celular ? 'border-migusto-rojo bg-migusto-rojo/10' : 'border-white/20 bg-black/20'} px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-migusto-dorado/50 hover:border-migusto-dorado/30 transition-colors`}
              placeholder="Ingresa tu numero"
            />
            {showValidation && !celular && (
              <p className="mt-2 text-sm text-migusto-rojo font-bold">Este campo es obligatorio.</p>
            )}
          </div>





          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-xs rounded-2xl bg-migusto-dorado px-10 py-4 font-black uppercase tracking-wider text-tierra transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-migusto-dorado/20"
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
          </div>
        </form>
      </div>
    </section>

    {isSuccess && (
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosingModal ? 'animate-out fade-out duration-500 ease-in' : 'animate-in fade-in duration-500 ease-out'}`}>
        <div className={`max-w-md w-full overflow-hidden rounded-3xl border border-emerald-500/50 bg-emerald-950/90 shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)] relative ${isClosingModal ? 'animate-out zoom-out-95 slide-out-to-bottom-4 duration-500 ease-in' : 'animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="p-8 flex flex-col items-center text-center gap-5 relative z-10">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-white text-2xl tracking-wide uppercase mb-3">
                ¡Datos enviados con éxito!
              </h3>
              <p className="text-emerald-50/90 font-medium leading-relaxed text-lg">
                Tus datos fueron enviados con exito, en breve te llegara un beneficio exclusivo!
              </p>
            </div>
            <button
              onClick={closeSuccessModal}
              disabled={isClosingModal}
              className="mt-4 w-full rounded-2xl bg-emerald-600 px-6 py-4 font-black uppercase tracking-wider text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {error && (
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosingModal ? 'animate-out fade-out duration-500 ease-in' : 'animate-in fade-in duration-500 ease-out'}`}>
        <div className={`max-w-md w-full overflow-hidden rounded-3xl border border-migusto-rojo/50 bg-[#300508]/90 shadow-[0_0_40px_-10px_rgba(198,0,24,0.4)] relative ${isClosingModal ? 'animate-out zoom-out-95 slide-out-to-bottom-4 duration-500 ease-in' : 'animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-migusto-rojo/10 to-transparent pointer-events-none" />
          <div className="p-8 flex flex-col items-center text-center gap-5 relative z-10">
            <div className="p-4 bg-migusto-rojo/20 rounded-full">
              <XCircle className="h-12 w-12 text-migusto-rojo" />
            </div>
            <div>
              <h3 className="font-black text-white text-2xl tracking-wide uppercase mb-3">
                ¡Ocurrió un problema!
              </h3>
              <p className="text-red-50/90 font-medium leading-relaxed text-lg">
                {error}
              </p>
            </div>
            <button
              onClick={closeErrorModal}
              disabled={isClosingModal}
              className="mt-4 w-full rounded-2xl bg-migusto-rojo px-6 py-4 font-black uppercase tracking-wider text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-migusto-rojo/30 active:scale-[0.98] disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}