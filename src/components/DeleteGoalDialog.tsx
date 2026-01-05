import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteGoalDialogProps {
  open: boolean;
  goalName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteGoalDialog({ open, goalName, onConfirm, onCancel }: DeleteGoalDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="card-neon border-destructive/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground neon-text-primary">Delete Goal</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete "<span className="text-foreground font-medium">{goalName}</span>"? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className="border-border text-foreground hover:text-foreground hover:bg-secondary/50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 btn-glow"
            style={{ boxShadow: '0 0 15px hsl(0 72% 51% / 0.4)' }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
