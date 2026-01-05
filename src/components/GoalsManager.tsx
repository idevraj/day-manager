import { useState, useCallback, useMemo } from 'react';
import { Goal, GoalAnalyticsPeriod } from '@/types/goal';
import { useGoals } from '@/hooks/useGoals';
import { useHabits } from '@/hooks/useHabits';
import { GoalsTable } from './GoalsTable';
import { AddGoalDialog } from './AddGoalDialog';
import { EditGoalDialog } from './EditGoalDialog';
import { DeleteGoalDialog } from './DeleteGoalDialog';
import { GoalsAnalytics } from './GoalsAnalytics';
import { ExportDataDialog } from './ExportDataDialog';
import { Target, BarChart3 } from 'lucide-react';

type GoalsViewMode = 'table' | 'analytics';

export function GoalsManager() {
  const [viewMode, setViewMode] = useState<GoalsViewMode>('table');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  
  const selectedMonth = new Date();

  const {
    goals,
    addGoal,
    deleteGoal,
    updateGoal,
    reorderGoals,
    getSuggestions,
  } = useGoals();

  const { habits } = useHabits(selectedMonth);

  const suggestions = useMemo(() => getSuggestions(), [getSuggestions]);

  const handleDeleteConfirm = useCallback(() => {
    if (deletingGoal) {
      deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  }, [deletingGoal, deleteGoal]);

  const handleEditGoal = useCallback((goal: Goal) => setEditingGoal(goal), []);
  const handleDeleteGoal = useCallback((goal: Goal) => setDeletingGoal(goal), []);
  const handleSetTableView = useCallback(() => setViewMode('table'), []);
  const handleSetAnalyticsView = useCallback(() => setViewMode('analytics'), []);

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="card-neon p-3 sm:p-5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 animate-fade-in">
        <h1 className="text-lg sm:text-2xl font-bold neon-text-primary">Goals Manager</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="card-neon p-0.5 sm:p-1 flex rounded-lg sm:rounded-xl overflow-hidden">
            <button
              onClick={handleSetTableView}
              className={`py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-md sm:rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                viewMode === 'table' ? 'toggle-active' : 'toggle-inactive'
              }`}
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Goals</span>
            </button>
            <button
              onClick={handleSetAnalyticsView}
              className={`py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-md sm:rounded-lg transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                viewMode === 'analytics' ? 'toggle-active' : 'toggle-inactive'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
            </button>
          </div>
          {viewMode === 'table' && (
            <>
              <AddGoalDialog onAdd={addGoal} />
              <ExportDataDialog habits={habits} goals={goals} selectedMonth={selectedMonth} />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'analytics' ? (
        <GoalsAnalytics goals={goals} suggestions={suggestions} />
      ) : (
        <>
          {/* Personal Goals Table */}
          <div className="card-neon p-3 sm:p-5 animate-fade-in">
            <h2 className="text-base sm:text-lg font-semibold neon-text-primary mb-3 sm:mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Personal Goals
            </h2>
            <GoalsTable
              goals={goals}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onUpdate={updateGoal}
              onReorder={reorderGoals}
            />
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <EditGoalDialog
        goal={editingGoal}
        open={!!editingGoal}
        onOpenChange={(open) => !open && setEditingGoal(null)}
        onSave={updateGoal}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteGoalDialog
        open={!!deletingGoal}
        goalName={deletingGoal?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingGoal(null)}
      />
    </div>
  );
}
