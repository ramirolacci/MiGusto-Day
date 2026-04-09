import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Shield, AlertTriangle, Ticket } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ValidatorResult = {
  success: boolean;
  message: string;
  nombre?: string;
  apellido?: string;
  tipo?: 'BRONCE' | 'PLATA' | 'ORO';
  meses?: number;
  fecha_registro?: string;
  ya_canjeado_este_mes?: boolean;
  ultima_fecha_canje?: string;
  id_registro?: string;
  expirado?: boolean;
};

type RecentCanje = {
  id: string;
  fecha_canje: string;
  registros: {
    nombre: string;
    apellido: string;
    dni: string;
    tickets: {
      tipo: string;
    };
  };
};

export default function Validator() {
  const [recentCanjes, setRecentCanjes] = useState<RecentCanje[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidatorResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ dni: string }>();

  useEffect(() => {
    document.title = "Mi Gusto | Validador de Sucursal";
    loadRecentCanjes();
  }, []);

  const loadRecentCanjes = async () => {
    const { data, error } = await supabase
      .from('canjes')
      .select(`
        id,
        fecha_canje,
        registros (
          nombre,
          apellido,
          dni,
          tickets (
            tipo
          )
        )
      `)
      .order('fecha_canje', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRecentCanjes(data as any);
    }
  };

  const onSubmit = async (data: { dni: string }) => {
    setIsLoading(true);
    setValidationResult(null);

    try {
      // 1. Buscamos el registro activo por DNI
      const { data: registro, error: regError } = await supabase
        .from('registros')
        .select('id, id_ticket, nombre, apellido, fecha_registro, activo')
        .eq('dni', data.dni)
        .eq('activo', true)
        .maybeSingle();

      if (regError) throw regError;

      if (!registro) {
        setValidationResult({
          success: false,
          message: 'DNI no encontrado o beneficio inactivo.'
        });
        setShowModal(true);
        return;
      }

      // 2. Buscamos el tipo de ticket y su vigencia
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('tipo, meses')
        .eq('id_ticket', registro.id_ticket)
        .single();

      if (ticketError) throw ticketError;

      // 3. Verificamos expiración
      const fechaRegistro = new Date(registro.fecha_registro);
      const fechaExpiracion = new Date(fechaRegistro);
      fechaExpiracion.setMonth(fechaExpiracion.getMonth() + (ticket.meses || 0));
      const expirado = new Date() > fechaExpiracion;

      // 4. Verificamos canje de este mes
      const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: canje, error: canjeError } = await supabase
        .from('canjes')
        .select('fecha_canje')
        .eq('id_registro', registro.id)
        .gte('fecha_canje', primerDiaMes)
        .maybeSingle();

      if (canjeError) throw canjeError;

      setValidationResult({
        success: true,
        message: expirado ? 'Beneficio expirado.' : 'Beneficio localizado.',
        nombre: registro.nombre,
        apellido: registro.apellido,
        tipo: ticket.tipo,
        meses: ticket.meses,
        fecha_registro: registro.fecha_registro,
        ya_canjeado_este_mes: !!canje,
        ultima_fecha_canje: canje?.fecha_canje,
        id_registro: registro.id,
        expirado
      });
      setShowModal(true);
      reset();
    } catch (err) {
      setValidationResult({
        success: false,
        message: 'Error inesperado al consultar. Intente nuevamente.'
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterCanje = async () => {
    if (!validationResult?.id_registro) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('canjes')
        .insert([{ id_registro: validationResult.id_registro }]);

      if (error) throw error;

      setValidationResult({
        ...validationResult,
        ya_canjeado_este_mes: true,
        ultima_fecha_canje: new Date().toISOString()
      });
      loadRecentCanjes();
    } catch (err) {
      alert('Error registrando canje. Reintente.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen pt-4 pb-12 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-migusto-crema tracking-tight">
            Validador de <span className="text-gold-gradient italic">Sucursal</span>
          </h1>
          <p className="text-migusto-crema/40 text-xl font-light">Sistema de validación exclusivo para empleados Mi Gusto</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] relative group"
          >

            <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright mb-8">Validar Ticket</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-migusto-dorado-bright flex-shrink-0 mt-1" />
                <div className="text-sm text-migusto-crema/60 leading-relaxed">
                  <p className="font-bold mb-2 text-migusto-crema uppercase tracking-widest text-xs">Protocolo de Seguridad:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                      <span>Verificar DNI físico original del cliente</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                      <span>Validar autenticidad del Ticket Dorado</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500"></div>
                      <span>Carga obligatoria de datos en sistema</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-migusto-crema/70 text-sm font-bold uppercase tracking-widest ml-1">
                  DNI del Cliente
                </label>
                <input
                  type="text"
                  {...register('dni', {
                    required: 'DNI es requerido',
                    minLength: { value: 7, message: 'Mínimo 7 dígitos' }
                  })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-dorado-bright/30 focus:border-migusto-dorado-bright hover:border-white/20 transition-all text-lg font-medium placeholder:text-white/10"
                  placeholder="Ingrese DNI del titular"
                />
                {errors.dni && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium ml-1">{errors.dni.message}</motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-xl shadow-premium hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center justify-center space-x-3 group relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <span>Consultar Beneficio</span>
                    <Shield className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] flex flex-col h-full max-h-[750px]"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright">Actividad Reciente</h2>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sistema Activo</span>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-grow">
              {recentCanjes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <Ticket className="h-16 w-16 mb-4" />
                  <p className="text-lg font-bold uppercase tracking-tighter">No hay canjes registrados hoy</p>
                </div>
              ) : (
                recentCanjes.map((canje) => (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={canje.id}
                    className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-black text-xl tracking-tighter text-migusto-crema">
                        {canje.registros?.nombre} {canje.registros?.apellido}
                      </span>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${canje.registros?.tickets?.tipo === 'ORO' ? 'bg-migusto-oro/20 text-migusto-oro border-migusto-oro/30' :
                        canje.registros?.tickets?.tipo === 'PLATA' ? 'bg-migusto-plata/20 text-migusto-plata border-migusto-plata/30' :
                          'bg-migusto-bronce/20 text-migusto-bronce border-migusto-bronce/30'
                        }`}>
                        {canje.registros?.tickets?.tipo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
                      <div className="space-y-1">
                        <p className="text-white/30 uppercase tracking-widest font-bold">DNI</p>
                        <p className="text-migusto-crema font-bold">{canje.registros?.dni}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/30 uppercase tracking-widest font-bold">Hora</p>
                        <p className="text-migusto-crema font-bold">
                          {new Date(canje.fecha_canje).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {showModal && validationResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`glass-card p-10 rounded-[3rem] max-w-md w-full border-2 relative overflow-hidden ${validationResult.success ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}
          >
            <div className="flex flex-col items-center text-center relative z-10">
              {validationResult.success ? (
                <>
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${validationResult.expirado ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    {validationResult.expirado ? <XCircle className="h-10 w-10 text-red-500" /> : <CheckCircle2 className="h-10 w-10 text-emerald-500" />}
                  </div>
                  <h3 className="text-4xl font-serif font-bold text-migusto-crema mb-2">{validationResult.expirado ? 'Beneficio Expirado' : 'Beneficio Activo'}</h3>
                  <p className="text-migusto-dorado-bright text-2xl font-black uppercase tracking-widest mb-6">
                    {validationResult.nombre} {validationResult.apellido}
                  </p>

                  <div className="grid grid-cols-2 gap-6 w-full mb-8">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-xs text-white/30 uppercase font-black mb-1 tracking-widest">Fecha Registro</p>
                      <p className="text-lg font-bold">{new Date(validationResult.fecha_registro!).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                      <p className="text-xs text-white/30 uppercase font-black mb-1 tracking-widest">Categoría</p>
                      <p className="text-lg font-bold text-migusto-dorado-bright">{validationResult.tipo}</p>
                    </div>
                  </div>

                  {!validationResult.expirado && (
                    <div className="w-full mb-8">
                      {validationResult.ya_canjeado_este_mes ? (
                        <div className="bg-red-500/10 border-2 border-red-500/30 p-6 rounded-2xl">
                          <p className="text-red-500 font-black uppercase text-lg mb-2">Ya retiró este mes</p>
                          <p className="text-sm text-white/60">
                            Último canje: <span className="text-white font-bold">{new Date(validationResult.ultima_fecha_canje!).toLocaleString('es-AR', { hour12: false })}</span>
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handleRegisterCanje}
                          disabled={isLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center space-x-3"
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                              <span>Entregar Pack 12u</span>
                              <CheckCircle2 className="h-5 w-5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white/60 hover:text-white text-base font-bold uppercase tracking-widest transition-colors py-4 px-8"
                  >
                    CERRAR CONSULTA
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-migusto-crema mb-4">{validationResult.message}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-all shadow-premium"
                  >
                    Entendido
                  </button>
                </>
              )}
            </div>
            {/* Background dynamic light */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] opacity-20 rounded-full ${validationResult.success ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
