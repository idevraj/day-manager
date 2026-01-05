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

interface DeleteHabitDialogProps {
  open: boolean;
  habitName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteHabitDialog({ open, habitName, onConfirm, onCancel }: DeleteHabitDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent className="card-neon border-destructive/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground text-lg">Delete Habit</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-destructive">"{habitName}"</span>? 
            This action cannot be undone and all progress data will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onCancel}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            style={{ boxShadow: '0 0 20px hsl(0 72% 51% / 0.4)' }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}