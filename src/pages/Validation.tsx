import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Loader2, CheckCircle2, XCircle, Ticket, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ValidationForm = {
    dni: string;
};

type ValidationResult = {
    success: boolean;
    message: string;
    tipo?: 'BRONCE' | 'PLATA' | 'ORO';
    nombre?: string;
    apellido?: string;
    id_registro?: string;
    fecha_registro?: string;
    ya_canjeado_este_mes?: boolean;
    ultima_fecha_canje?: string;
    expirado?: boolean;
    meses_vigencia?: number;
    recien_canjeado?: boolean;
};

export default function Validation() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [dniValue, setDniValue] = useState('');
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ValidationForm>();

    const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Solo números
        let value = e.target.value.replace(/\D/g, '');

        // Limitar a 8 dígitos
        if (value.length > 8) value = value.slice(0, 8);

        // Aplicar máscara: XX-XXX-XXX o X-XXX-XXX dependiendo el largo
        let formattedValue = '';
        if (value.length > 0) {
            if (value.length <= 7) {
                // Formato para 7 dígitos: X-XXX-XXX
                if (value.length <= 1) {
                    formattedValue = value;
                } else if (value.length <= 4) {
                    formattedValue = value.slice(0, 1) + '-' + value.slice(1);
                } else {
                    formattedValue = value.slice(0, 1) + '-' + value.slice(1, 4) + '-' + value.slice(4);
                }
            } else {
                // Formato para 8 dígitos: XX-XXX-XXX
                formattedValue = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5);
            }
        }

        setDniValue(formattedValue);
        setValue('dni', formattedValue, { shouldValidate: true });
    };

    const onSubmit = async (data: ValidationForm) => {
        setIsLoading(true);
        setResult(null);

        try {
            // 1. Buscamos el registro activo por DNI
            const { data: registro, error: regError } = await supabase
                .from('registros')
                .select('id, id_ticket, activo, nombre, apellido, fecha_registro')
                .eq('dni', data.dni)
                .eq('activo', true)
                .maybeSingle();

            if (regError) throw regError;

            if (!registro) {
                setResult({
                    success: false,
                    message: 'El DNI ingresado no cuenta con un beneficio activo en el sistema.'
                });
            } else {
                // 2. Buscamos el tipo de ticket y su vigencia
                const { data: ticket, error: ticketError } = await supabase
                    .from('tickets')
                    .select('tipo, meses')
                    .eq('id_ticket', registro.id_ticket)
                    .single();

                if (ticketError) throw ticketError;

                // 3. Verificamos si el ticket ha expirado
                const fechaRegistro = new Date(registro.fecha_registro);
                const mesesVigencia = ticket.meses;
                const fechaExpiracion = new Date(fechaRegistro);
                fechaExpiracion.setMonth(fechaExpiracion.getMonth() + mesesVigencia);

                const ahora = new Date();
                const expirado = ahora > fechaExpiracion;

                // 4. Verificamos si ya canjeó este mes
                const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();

                const { data: canje, error: canjeError } = await supabase
                    .from('canjes')
                    .select('fecha_canje')
                    .eq('id_registro', registro.id)
                    .gte('fecha_canje', primerDiaMes)
                    .maybeSingle();

                if (canjeError) throw canjeError;

                setResult({
                    success: true,
                    message: expirado ? 'El ticket ha vencido.' : 'Beneficio validado con éxito.',
                    tipo: ticket.tipo as 'BRONCE' | 'PLATA' | 'ORO',
                    nombre: registro.nombre,
                    apellido: registro.apellido,
                    id_registro: registro.id,
                    fecha_registro: registro.fecha_registro,
                    ya_canjeado_este_mes: !!canje,
                    ultima_fecha_canje: canje?.fecha_canje,
                    expirado: expirado,
                    meses_vigencia: mesesVigencia
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!result?.id_registro) return;
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('canjes')
                .insert([{ id_registro: result.id_registro }]);

            if (error) throw error;

            // Actualizamos el estado local para reflejar el canje
            setResult({
                ...result,
                ya_canjeado_este_mes: true,
                ultima_fecha_canje: new Date().toISOString(),
                recien_canjeado: true
            });
        } catch (err) {
            console.error('Error recording redemption:', err);
            alert('Error al registrar el canje. Reintente.');
        } finally {
            setIsLoading(false);
        }
    };

    const tierColors = {
        ORO: 'text-migusto-oro border-migusto-oro/30 bg-migusto-oro/10',
        PLATA: 'text-migusto-plata border-migusto-plata/30 bg-migusto-plata/10',
        BRONCE: 'text-migusto-bronce border-migusto-bronce/30 bg-migusto-bronce/10'
    };

    return (
        <div className="min-h-screen py-12 px-4 relative overflow-hidden bg-migusto-tierra-oscuro">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-migusto-rojo/5 blur-[120px] rounded-full animate-pulse-soft"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-migusto-dorado/5 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="container mx-auto max-w-2xl relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-6"
                    >
                        <Shield className="h-10 w-10 text-migusto-rojo" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-migusto-crema">
                        Validador de <span className="text-migusto-rojo italic">Tickets</span>
                    </h1>
                    <p className="text-migusto-crema/40 text-lg">Consulta de beneficios activos por DNI</p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-card p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden"
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-3">
                            <label className="block text-migusto-crema/70 text-sm font-bold uppercase tracking-[0.2em] ml-1">
                                DNI del Cliente
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    {...register('dni', {
                                        required: 'El DNI es obligatorio',
                                    })}
                                    value={dniValue}
                                    onChange={handleDniChange}
                                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 focus:border-migusto-rojo transition-all text-xl font-medium placeholder:text-white/10"
                                    placeholder="00-000-000"
                                    autoComplete="off"
                                />
                                <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/20" />
                            </div>
                            {errors.dni && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium ml-1">
                                    {errors.dni.message}
                                </motion.p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-migusto-rojo text-white py-5 rounded-2xl font-black text-xl shadow-premium hover:bg-migusto-rojo-claro transition-all disabled:opacity-50 flex items-center justify-center space-x-3 group relative overflow-hidden"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Consultando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Verificar Beneficio</span>
                                    <Shield className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="overflow-hidden"
                            >
                                <div className={`p-8 rounded-3xl border ${result.success ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                    <div className="flex flex-col items-center text-center">
                                        {result.success ? (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                                </div>
                                                <h3 className="text-2xl font-serif font-bold text-white mb-1">Beneficio Activo</h3>
                                                {result.nombre && (
                                                    <p className="text-migusto-dorado-bright text-xl font-bold uppercase tracking-tight mb-4">
                                                        {result.nombre} {result.apellido !== 'REQUERIDO' && result.apellido}
                                                    </p>
                                                )}

                                                <div className={`px-6 py-3 rounded-2xl border font-black tracking-widest uppercase text-sm ${tierColors[result.tipo!]}`}>
                                                    TICKET {result.tipo}
                                                </div>

                                                <div className="mt-6 flex flex-col items-center">
                                                    <div className="flex items-center space-x-3 text-migusto-dorado-bright mb-2">
                                                        <Ticket className="h-6 w-6" />
                                                        <span className="font-bold text-lg">1 pack 12 empanadas</span>
                                                    </div>

                                                    {result.expirado ? (
                                                        <div className="bg-red-500/20 text-red-400 px-6 py-2 rounded-xl border border-red-500/30 mt-2 font-bold uppercase tracking-widest text-xs">
                                                            Ticket Vencido ({result.meses_vigencia} meses cumplidos)
                                                        </div>
                                                    ) : result.recien_canjeado ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-migusto-oro/10 text-migusto-dorado-bright px-8 py-4 rounded-2xl border-2 border-migusto-oro/50 mt-2 font-black uppercase tracking-widest text-sm flex items-center space-x-3 shadow-[0_0_20px_rgba(251,191,36,0.2)] animate-pulse">
                                                                <CheckCircle2 className="h-5 w-5" />
                                                                <span>¡Beneficio entregado con éxito!</span>
                                                            </div>
                                                            <p className="text-[10px] text-white/30 mt-4 font-medium uppercase tracking-widest">
                                                                Registrado en sistema
                                                            </p>
                                                        </div>
                                                    ) : result.ya_canjeado_este_mes ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="bg-red-500/10 text-red-500 px-8 py-4 rounded-2xl border-2 border-red-500/50 mt-2 font-black uppercase tracking-widest text-sm flex items-center space-x-3 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                                                <XCircle className="h-5 w-5" />
                                                                <span>Ya usó su beneficio este mes</span>
                                                            </div>
                                                            <div className="bg-white/5 px-6 py-4 rounded-2xl mt-4 border border-white/10 w-full">
                                                                <p className="text-xs text-white/60 font-black uppercase tracking-[0.2em] mb-2 text-center">
                                                                    FECHA DE RETIRO
                                                                </p>
                                                                <p className="text-2xl text-migusto-crema font-sans font-black tracking-tight leading-none text-center">
                                                                    {new Date(result.ultima_fecha_canje!).toLocaleString('es-AR', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-white/60 font-medium mb-6">Disponible para canje este mes</p>
                                                            <motion.button
                                                                onClick={handleRedeem}
                                                                disabled={isLoading}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center space-x-3"
                                                            >
                                                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                                                    <>
                                                                        <span>Entregar Beneficio</span>
                                                                        <CheckCircle2 className="h-5 w-5" />
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-white/5 w-full">
                                                    <div className="flex items-center justify-center space-x-2 text-xs text-white/30 uppercase tracking-widest font-bold">
                                                        <Info className="h-4 w-4" />
                                                        <span>Solicitar DNI físico para validar identidad</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                                    <XCircle className="h-10 w-10 text-red-500" />
                                                </div>
                                                <h3 className="text-2xl font-serif font-bold text-white mb-2">Sin Beneficio</h3>
                                                <p className="text-white/60 leading-relaxed italic">{result.message}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
