import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";

interface ProductCardProps {
  name: string;
  brand: string;
  type: string;
  compatibility?: "good" | "warning" | "error";
  onRemove?: () => void;
}

const ProductCard = ({ name, brand, type, compatibility, onRemove }: ProductCardProps) => {
  const getCompatibilityColor = () => {
    switch (compatibility) {
      case "good":
        return "border-success bg-success/5";
      case "warning":
        return "border-warning bg-warning/5";
      case "error":
        return "border-destructive bg-destructive/5";
      default:
        return "";
    }
  };

  return (
    <Card className={`p-4 shadow-card transition-smooth hover:shadow-glow ${getCompatibilityColor()}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">{brand}</p>
            </div>
            {compatibility && compatibility !== "good" && (
              <AlertCircle className={`w-4 h-4 ${compatibility === "warning" ? "text-warning" : "text-destructive"}`} />
            )}
          </div>
          <span className="inline-block text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
            {type}
          </span>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
