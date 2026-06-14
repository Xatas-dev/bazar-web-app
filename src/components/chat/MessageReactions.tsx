import { cn } from "@/lib/utils";
import { MessageResponse } from "@/types/chat";
import { motion } from "framer-motion";

interface MessageReactionsProps {
  message: MessageResponse;
  reactionLabelById: Record<string, string>;
  onReact: (messageId: number, reactionId: string) => void;
}

const getReactionLabel = (reactionId: string, reactionLabelById: Record<string, string>) => {
  return reactionLabelById[reactionId] ?? reactionId;
};

export const MessageReactions = ({ message, reactionLabelById, onReact }: MessageReactionsProps) => {
  const reactions = (message.reactions ?? []).filter((reaction) => reaction.count > 0 || reaction.reactedByMe);

  if (reactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1 px-1">
      {reactions.map((reaction) => {
        const label = getReactionLabel(reaction.reactionId, reactionLabelById);

        return (
          <motion.button
            key={reaction.reactionId}
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{
              scale: reaction.reactedByMe ? 0.82 : 1.3,
              transition: { type: "spring", stiffness: 400, damping: 12 },
            }}
            onClick={() => onReact(message.id, reaction.reactionId)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors",
              reaction.reactedByMe
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-accent/60"
            )}
            title="Нажмите, чтобы поставить или убрать реакцию"
          >
            <span className="text-sm leading-none">{label}</span>
            <span className="text-[11px] font-medium">
              {reaction.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
