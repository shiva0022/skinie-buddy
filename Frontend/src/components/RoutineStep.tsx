import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface RoutineStepProps {
  stepNumber: number;
  product: string;
  brand: string;
  instruction?: string;
  completed?: boolean;
  onToggle?: () => void;
}

const RoutineStep = ({ stepNumber, product, brand, instruction, completed, onToggle }: RoutineStepProps) => {
  return (
    <Card 
      className={`p-4 shadow-soft transition-smooth cursor-pointer hover:shadow-card ${
        completed ? "bg-success/5 border-success" : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex gap-4 items-start">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-smooth ${
          completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
        }`}>
          {completed ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{product}</h4>
          <p className="text-sm text-muted-foreground mb-2">{brand}</p>
          {instruction && <p className="text-sm text-foreground">{instruction}</p>}
        </div>
      </div>
    </Card>
  );
};

export default RoutineStep;
