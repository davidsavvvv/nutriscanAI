import { motion } from "motion/react";

interface ScanResultProps {
  score: number;
}

export default function ScanResult({ score }: ScanResultProps) {
  let imageSrc = "";
  let message = "";
  let bgColor = "";
  let animationVariant = {};

  if (score >= 80) {
    imageSrc = "/images/poulpe_excellent.png";
    message = "Incroyable ! C'est une bombe nutritionnelle 👑";
    bgColor = "from-emerald-400 to-emerald-600";
    // Animation rebond (bounce joyeuse)
    animationVariant = {
      animate: { y: [0, -15, 0] },
      transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (score >= 60) {
    imageSrc = "/images/poulpe_muscle.png";
    message = "Bon choix ! Ce produit est bon pour toi 💪";
    bgColor = "from-green-500 to-emerald-700";
    // Animation flex (monte/descend les bras - on simule avec un squish)
    animationVariant = {
      animate: { scaleX: [1, 1.05, 1], scaleY: [1, 0.95, 1] },
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (score >= 40) {
    imageSrc = "/images/poulpe_neutre.png";
    message = "Pas mal, mais à consommer avec modération 😊";
    bgColor = "from-amber-400 to-orange-500";
    // Animation flottement doux
    animationVariant = {
      animate: { y: [0, -6, 0] },
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (score >= 20) {
    imageSrc = "/images/poulpe_triste.png";
    message = "Aïe... ce produit est plutôt à éviter 😞";
    bgColor = "from-orange-500 to-red-500";
    // Animation balancement lent
    animationVariant = {
      animate: { rotate: [-3, 3, -3] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    };
  } else {
    imageSrc = "/images/poulpe_pleure.png";
    message = "Danger ! Ce produit est vraiment mauvais pour ta santé 💔";
    bgColor = "from-red-600 to-rose-700";
    // Animation tremblement
    animationVariant = {
      animate: { x: [-3, 3, -3, 3, 0] },
      transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`rounded-[32px] p-6 lg:p-8 bg-gradient-to-r ${bgColor} shadow-xl flex flex-col sm:flex-row items-center gap-6 justify-center text-center sm:text-left mb-8`}
    >
      <motion.div 
        className="shrink-0 w-32 h-32 md:w-40 md:h-40 filter drop-shadow-xl"
        {...animationVariant}
      >
        <img
          src={imageSrc}
          alt="Octopus Coach Emotion"
          className="w-full h-full object-contain"
        />
      </motion.div>
      <div className="flex-1">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white drop-shadow-md">
          {message}
        </h3>
      </div>
    </motion.div>
  );
}
