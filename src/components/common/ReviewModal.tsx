import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  providerId: string;
  appointmentId: string; // ✅ novo
  userId: string;
  onSuccess: () => void;
}

export function ReviewModal({
  open,
  onClose,
  providerId,
  appointmentId,
  userId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setLoading(true);

    const { error } = await supabase
      .from("provider_reviews" as any)
      .insert({
        provider_id: providerId,
        client_id: userId,
        appointment_id: appointmentId,
        rating,
        comment: comment || null,
      } as any);

    setLoading(false);

    if (!error) {
      onSuccess();
      onClose();
      setRating(0);
      setComment("");
    } else {
      console.error("Erro ao salvar avaliação:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>Avaliar Profissional</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 justify-center my-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              onClick={() => setRating(i + 1)}
              className={`w-6 h-6 cursor-pointer ${
                i < rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <textarea
          placeholder="Comentário (opcional)"
          className="w-full border rounded-lg p-2 text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button
          onClick={handleSubmit}
          disabled={loading || rating === 0}
          className="w-full mt-4"
        >
          {loading ? "Salvando..." : "Enviar Avaliação"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
