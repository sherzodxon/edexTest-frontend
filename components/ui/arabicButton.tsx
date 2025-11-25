import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { motion } from "framer-motion";

interface ArabicToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export const ArabicToggleButton = ({ isActive, onClick }: ArabicToggleButtonProps) => {
  return (
    <motion.div whileTap={{ scale: 0.9 }}>
      <Button
        type="button"
        onClick={onClick}
        variant={isActive ? "default" : "outline"}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-200 ${
          isActive
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border-gray-300 hover:bg-gray-100"
        }`}
      >
        <Languages
          size={18}
          className={isActive ? "text-white" : "text-blue-600"}
        />
      </Button>
    </motion.div>
  );
};
