import React, { memo, useCallback } from 'react';
import { Goal, GoalStatus, GoalDays, GoalValue, GOAL_DAYS_OPTIONS, GOAL_STATUS_OPTIONS, GOAL_VALUE_OPTIONS } from '@/types/goal';
import { Pencil, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GoalsTableProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onUpdate: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  onReorder: (goals: Goal[]) => void;
}

function SortableGoalRow({ 
  goal, 
  onEdit, 
  onDelete, 
  onUpdate,
  index 
}: { 
  goal: Goal; 
  onEdit: (goal: Goal) => void; 
  onDelete: (goal: Goal) => void; 
  onUpdate: (id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    animationDelay: `${index * 0.05}s`,
  };

  const staggerClass = index < 10 ? `stagger-${index + 1}` : '';

  const getValueColor = (value: GoalValue) => {
    switch (value) {
      case 'VVIMP': return 'text-red-400';
      case 'VIMP': return 'text-orange-400';
      case 'IMP': return 'text-yellow-400';
      case 'NIMP': return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case 'done': return 'text-neon-green';
      case 'on-going': return 'text-neon-cyan';
      case 'not-yet': return 'text-muted-foreground';
    }
  };

  const isUrgent = (goal.value === 'VVIMP' || goal.value === 'VIMP') && goal.status === 'not-yet';

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`border-b border-border/30 hover:bg-secondary/30 transition-colors animate-fade-in animate-fill-both ${staggerClass} ${
        goal.status === 'done' ? 'opacity-70' : ''
      }`}
    >
      <td className="py-2 sm:py-4 px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <span className={`font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none ${goal.status === 'done' ? 'line-through text-neon-green' : 'text-foreground'}`}>
            {goal.name}
          </span>
          {isUrgent && (
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 animate-pulse flex-shrink-0" />
          )}
        </div>
      </td>
      <td className="py-2 sm:py-4 px-1 sm:px-4">
        <Select 
          value={goal.status} 
          onValueChange={(v) => onUpdate(goal.id, { status: v as GoalStatus })}
        >
          <SelectTrigger className={`w-20 sm:w-28 h-8 sm:h-10 text-[10px] sm:text-sm bg-secondary/30 border-border/50 ${getStatusColor(goal.status)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {GOAL_STATUS_OPTIONS.map(s => (
              <SelectItem 
                key={s} 
                value={s} 
                className={`capitalize hover:bg-secondary/50 text-xs sm:text-sm ${getStatusColor(s)}`}
              >
                {s.replace('-', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 sm:py-4 px-1 sm:px-4">
        <Select 
          value={goal.days.toString()} 
          onValueChange={(v) => onUpdate(goal.id, { days: Number(v) as GoalDays })}
        >
          <SelectTrigger className="w-16 sm:w-24 h-8 sm:h-10 text-[10px] sm:text-sm bg-secondary/30 border-border/50 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {GOAL_DAYS_OPTIONS.map(d => (
              <SelectItem key={d} value={d.toString()} className="text-foreground hover:bg-secondary/50 text-xs sm:text-sm">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 sm:py-4 px-1 sm:px-4">
        <Select 
          value={goal.value} 
          onValueChange={(v) => onUpdate(goal.id, { value: v as GoalValue })}
        >
          <SelectTrigger className={`w-16 sm:w-24 h-8 sm:h-10 text-[10px] sm:text-sm bg-secondary/30 border-border/50 ${getValueColor(goal.value)}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {GOAL_VALUE_OPTIONS.map(v => (
              <SelectItem 
                key={v.value} 
                value={v.value} 
                className={`hover:bg-secondary/50 text-xs sm:text-sm ${getValueColor(v.value)}`}
              >
                {v.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 sm:py-4 px-1 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 sm:p-2.5 rounded-lg transition-all duration-300 text-primary hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1.5 sm:p-2.5 rounded-lg transition-all duration-300 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function GoalsTable({ goals, onEdit, onDelete, onUpdate, onReorder }: GoalsTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex(g => g.id === active.id);
      const newIndex = goals.findIndex(g => g.id === over.id);
      onReorder(arrayMove(goals, oldIndex, newIndex));
    }
  };

  if (goals.length === 0) {
    return (
      <div className="card-neon p-8 text-center animate-fade-in">
        <div className="text-4xl mb-3">🎯</div>
        <p className="text-muted-foreground">No goals yet. Click "Add Goal" to get started!</p>
      </div>
    );
  }

  return (
    <div className="card-neon overflow-hidden animate-fade-in">
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary/30 bg-secondary/20">
              <th className="text-left py-2 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-primary">Goals</th>
              <th className="text-left py-2 sm:py-4 px-1 sm:px-4 text-xs sm:text-sm font-semibold text-primary">Status</th>
              <th className="text-left py-2 sm:py-4 px-1 sm:px-4 text-xs sm:text-sm font-semibold text-primary">Days</th>
              <th className="text-left py-2 sm:py-4 px-1 sm:px-4 text-xs sm:text-sm font-semibold text-primary">Value</th>
              <th className="text-left py-2 sm:py-4 px-1 sm:px-4 text-xs sm:text-sm font-semibold text-primary"><span className="hidden sm:inline">Actions</span><span className="sm:hidden">⋮</span></th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={goals.map(g => g.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {goals.map((goal, index) => (
                  <SortableGoalRow
                    key={goal.id}
                    goal={goal}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    index={index}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
