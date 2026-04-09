import { motion, Variants } from 'framer-motion';

type EpicTextProps = {
  text: string;
  className?: string;
  goldWord?: string;
  delay?: number;
};

const container: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: (i - 1) * 0.05 },
  }),
};

const child: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    } as any,
  },
};

export function EpicTitle({ text, className = '', goldWord, delay = 0 }: EpicTextProps) {
  const words = text.split(' ');

  return (
    <motion.h1
      className={`overflow-hidden font-serif leading-tight tracking-tight ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block mr-[0.25em] whitespace-nowrap"
        >
          <span
            className={
              goldWord && word.toLowerCase() === goldWord.toLowerCase()
                ? 'text-gold-gradient italic font-extrabold pb-1'
                : 'text-migusto-crema'
            }
          >
            {word}
          </span>
        </motion.span>
      ))}
    </motion.h1>
  );
}

export function EpicSubtitle({ text, className = '', delay = 0, goldWord }: EpicTextProps) {
  const words = text.split(' ');

  return (
    <motion.p
      className={`overflow-hidden font-sans font-light tracking-wide ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className={`inline-block mr-[0.25em] ${goldWord && word.toLowerCase() === goldWord.toLowerCase()
              ? 'text-migusto-dorado-bright font-bold'
              : 'text-migusto-crema/60'
            }`}
        >
          {word}{index < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.p>
  );
}
