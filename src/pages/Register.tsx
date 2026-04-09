import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle2, Loader2, AlertCircle, CreditCard, Ticket, Sparkles, Award } from 'lucide-react';
import { supabase, type Registro, type Ticket as TicketData } from '../lib/supabase';

type RegisterForm = {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  id_ticket: string;
};

type RegistrationResult = {
  success: boolean;
  message: string;
  registroId?: string;
};

export default function Register() {
  const [registros, setRegistros] = useState<(Registro & { tickets: TicketData })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset } = useForm<RegisterForm>();

  useEffect(() => {
    loadRegistros();
  }, []);

  const loadRegistros = async () => {
    const { data, error } = await supabase
      .from('registros')
      .select(`
        *,
        tickets (*)
      `)
      .order('fecha_registro', { ascending: false });

    if (!error && data) {
      setRegistros(data as any);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setRegistrationResult(null);

    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('id_ticket', data.id_ticket)
        .maybeSingle();

      if (ticketError || !ticket) {
        setRegistrationResult({
          success: false,
          message: 'Ticket inválido. El ID no existe en el sistema.'
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      if (!ticket.usado) {
        setRegistrationResult({
          success: false,
          message: 'Ticket no validado. Primero debe validarse en la sucursal.'
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      const { data: existingRegistro } = await supabase
        .from('registros')
        .select('*')
        .eq('id_ticket', data.id_ticket)
        .maybeSingle();

      if (existingRegistro) {
        setRegistrationResult({
          success: false,
          message: 'Este ticket ya fue registrado previamente.'
        });
        setShowModal(true);
        setIsLoading(false);
        return;
      }

      const { data: newRegistro, error: registroError } = await supabase
        .from('registros')
        .insert([{
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          telefono: data.telefono,
          id_ticket: data.id_ticket
        }])
        .select()
        .single();

      if (registroError || !newRegistro) {
        setRegistrationResult({
          success: false,
          message: 'Error al registrar. Intente nuevamente.'
        });
      } else {
        setRegistrationResult({
          success: true,
          message: `¡Registrado! Recibí tu Tarjeta Lovers virtual con ID: ${newRegistro.id}. Canjea 1 pack/mes en Vicente López.`,
          registroId: newRegistro.id
        });
        loadRegistros();
        reset();
      }

      setShowModal(true);
    } catch (err) {
      setRegistrationResult({
        success: false,
        message: 'Error inesperado. Intente nuevamente.'
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4 md:gap-6 mb-8"
          >
            {/* Bronce */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-[#4d3326] to-[#2d1e16] border border-[#CD7F32]/20 w-28 md:w-32"
            >
              <div className="p-3 rounded-full bg-[#CD7F32]/10 border border-[#CD7F32]/20 mb-3">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-[#CD7F32]" />
              </div>
              <h3 className="text-lg font-black text-[#CD7F32] uppercase tracking-tighter">Bronce</h3>
              <div className="h-[2px] w-8 bg-[#CD7F32]/40 mt-2"></div>
            </motion.div>
            {/* Plata */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-[#4a4a4a] to-[#1a1a1a] border border-white/10 w-28 md:w-32"
            >
              <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-3">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-[#C0C0C0]" />
              </div>
              <h3 className="text-lg font-black text-[#C0C0C0] uppercase tracking-tighter">Plata</h3>
              <div className="h-[2px] w-8 bg-white/30 mt-2"></div>
            </motion.div>
            {/* Oro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-[#4d3d00] to-[#1a1500] border border-migusto-dorado/30 w-28 md:w-32"
            >
              <div className="p-3 rounded-full bg-migusto-dorado/10 border border-migusto-dorado/20 mb-3">
                <Award className="h-8 w-8 md:h-10 md:w-10 text-migusto-oro" />
              </div>
              <h3 className="text-lg font-black text-migusto-oro uppercase tracking-tighter">Oro</h3>
              <div className="h-[2px] w-8 bg-migusto-oro/40 mt-2"></div>
            </motion.div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-migusto-crema tracking-tight">
            Registro y <span className="text-migusto-rojo italic">Canje</span>
          </h1>
          <p className="text-migusto-crema/40 text-xl font-light">Completa tus datos para recibir tu Tarjeta Lovers exclusiva</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] relative"
          >
            <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright mb-8">Datos del Titular</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-migusto-rojo/5 border border-migusto-rojo/20 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-migusto-rojo flex-shrink-0 mt-0.5" />
                  <div className="text-[10px] text-migusto-crema/60 uppercase tracking-widest font-black">
                    <p className="text-migusto-rojo mb-1">Privacidad:</p>
                    <p>Datos personales protegidos</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-migusto-dorado-bright flex-shrink-0 mt-0.5" />
                  <div className="text-[10px] text-migusto-crema/60 uppercase tracking-widest font-black">
                    <p className="text-migusto-dorado-bright mb-1">Requisito:</p>
                    <p>Presentarse con DNI y ticket especial</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Nombre</label>
                  <input
                    type="text"
                    {...register('nombre', { required: 'Nombre es requerido' })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 transition-all font-medium placeholder:text-white/5"
                    placeholder="Leonel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Apellido</label>
                  <input
                    type="text"
                    {...register('apellido', { required: 'Apellido es requerido' })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 transition-all font-medium placeholder:text-white/5"
                    placeholder="Messi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">DNI</label>
                <input
                  type="text"
                  {...register('dni', { required: 'DNI es requerido', pattern: /^[0-9]+$/ })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 transition-all font-medium placeholder:text-white/5"
                  placeholder="Sin puntos"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  {...register('telefono', { required: 'Teléfono es requerido' })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 transition-all font-medium placeholder:text-white/5"
                  placeholder="Ej: 11 2345 6789"
                />
              </div>

              <div className="space-y-2 pb-4">
                <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">ID del Ticket Dorado</label>
                <input
                  type="text"
                  {...register('id_ticket', { required: 'ID del ticket es requerido' })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 transition-all font-bold tracking-tighter text-xl placeholder:text-white/5 uppercase"
                  placeholder="ORO-XXX"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-migusto-rojo text-white py-5 rounded-2xl font-black text-xl shadow-premium disabled:opacity-50 flex items-center justify-center space-x-3 overflow-hidden"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <span>Activar Membresía</span>
                    <Ticket className="h-6 w-6" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] flex flex-col h-full max-h-[750px]"
          >
            <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright mb-10">Lovers Registrados</h2>

            <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar flex-grow">
              {registros.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <UserPlus className="h-16 w-16 mb-4" />
                  <p className="text-lg font-bold uppercase tracking-tighter">No hay registros aún</p>
                </div>
              ) : (
                registros.map((registro: Registro & { tickets: TicketData }) => (
                  <motion.div
                    key={registro.id}
                    className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-migusto-rojo/20 flex items-center justify-center text-migusto-rojo font-black">
                          {registro.nombre[0]}
                        </div>
                        <span className="font-bold text-migusto-crema">
                          {registro.nombre}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${registro.tickets.tipo === 'ORO' ? 'bg-migusto-oro/10 text-migusto-oro border-migusto-oro/20' :
                        registro.tickets.tipo === 'PLATA' ? 'bg-migusto-plata/10 text-migusto-plata border-migusto-plata/20' :
                          'bg-migusto-bronce/10 text-migusto-bronce border-migusto-bronce/20'
                        }`}>
                        {registro.tickets.tipo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 text-[10px] font-bold uppercase tracking-widest text-white/30 px-1 italic">
                      <div>DNI: {registro.dni.slice(0, 2)}******</div>
                      <div>Ticket: {registro.id_ticket}</div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>{new Date(registro.fecha_registro).toLocaleDateString()}</span>
                      </div>
                      <div className="text-migusto-dorado-bright">ID: {registro.id.slice(0, 6)}</div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Remastered */}
      {showModal && registrationResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`glass-card max-w-md w-full border-2 relative overflow-hidden ${registrationResult.success
              ? 'border-migusto-dorado/40 rounded-[2rem]'
              : 'border-red-500/30 rounded-[3rem] p-10'
              }`}
          >
            {registrationResult.success ? (
              <div className="relative p-10">
                {/* Decoración de éxito */}
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                  <Sparkles className="absolute top-6 left-8 h-5 w-5 text-migusto-dorado/30 animate-pulse" />
                  <Sparkles className="absolute top-10 right-12 h-4 w-4 text-migusto-dorado/20 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <Sparkles className="absolute bottom-20 left-12 h-4 w-4 text-migusto-dorado/25 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <Sparkles className="absolute bottom-16 right-10 h-5 w-5 text-migusto-dorado/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-migusto-dorado/20 border-2 border-migusto-dorado/40 flex items-center justify-center mb-6 shadow-premium-gold"
                  >
                    <CheckCircle2 className="h-14 w-14 text-emerald-400" />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs font-black text-migusto-dorado uppercase tracking-[0.4em] mb-2"
                  >
                    ¡Felicitaciones!
                  </motion.span>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-3xl font-serif font-bold text-migusto-crema mb-3 tracking-tight"
                  >
                    Registro Exitoso
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-migusto-crema/70 mb-6 leading-relaxed text-base"
                  >
                    Recibí tu Tarjeta Lovers virtual. Canjea 1 pack/mes en Vicente López.
                  </motion.p>

                  {registrationResult.registroId && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="w-full px-5 py-4 rounded-2xl bg-migusto-dorado/10 border border-migusto-dorado/30 mb-8"
                    >
                      <p className="text-[10px] font-bold text-migusto-dorado/80 uppercase tracking-widest mb-1">Tu ID de membresía</p>
                      <p className="text-xl font-black text-migusto-dorado tracking-tighter font-mono">{registrationResult.registroId.slice(0, 8)}</p>
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setShowModal(false)}
                    className="w-full bg-migusto-rojo text-white py-4 rounded-2xl font-black text-lg shadow-premium"
                  >
                    ¡Listo!
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                  <AlertCircle className="h-12 w-12 text-red-400" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-migusto-crema mb-4 tracking-tight">
                  Error de Registro
                </h3>
                <p className="text-migusto-crema/60 mb-10 leading-relaxed text-lg italic">{registrationResult.message}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-migusto-rojo text-white py-5 rounded-2xl font-black text-xl hover:bg-migusto-rojo-claro transition-all shadow-premium"
                >
                  Cerrar
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
