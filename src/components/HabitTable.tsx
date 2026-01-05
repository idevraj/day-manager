import React, { memo, useCallback, useMemo } from 'react';
import { Habit, ViewMode } from '@/types/habit';
import { Pencil, Trash2, Check, GripVertical } from 'lucide-react';
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

interface HabitTableProps {
  habits: Habit[];
  daysInMonth: number;
  viewMode: ViewMode;
  currentDay: number;
  selectedMonth: Date;
  onToggleDay: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onReorder: (habits: Habit[]) => void;
}

interface SortableRowProps {
  habit: Habit;
  visibleDays: number[];
  selectedMonth: Date;
  currentDay: number;
  getDayOfWeek: (day: number) => number;
  onToggleDay: (habitId: string, day: number) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  index: number;
}

const SortableRow = memo(function SortableRow({
  habit,
  visibleDays,
  selectedMonth,
  currentDay,
  getDayOfWeek,
  onToggleDay,
  onEdit,
  onDelete,
  index,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }), [transform, transition, isDragging]);

  const now = new Date();
  const isCurrentMonth = 
    selectedMonth.getFullYear() === now.getFullYear() && 
    selectedMonth.getMonth() === now.getMonth();

  // Check if a day is clickable (today and past 2 days)
  const isDayClickable = useCallback((day: number): boolean => {
    if (!isCurrentMonth) return false; // Past months are not editable
    return day >= currentDay - 2 && day <= currentDay;
  }, [isCurrentMonth, currentDay]);

  const handleEdit = useCallback(() => onEdit(habit), [onEdit, habit]);
  const handleDelete = useCallback(() => onDelete(habit), [onDelete, habit]);

  const staggerClass = index < 10 ? `stagger-${index + 1}` : '';

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        animationDelay: `${index * 0.05}s`,
      }}
      className={`border-b border-border/20 group transition-all hover:bg-secondary/30 animate-fade-in animate-fill-both ${staggerClass}`}
    >
      <td
        className="p-2 sm:p-4 sticky left-0 z-10"
        style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.98), hsl(var(--card) / 0.9))' }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            className="cursor-grab active:cursor-grabbing p-0.5 sm:p-1 text-muted-foreground hover:text-primary transition-all hover:scale-110"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <div
            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 gpu-accelerated"
            style={{
              backgroundColor: `hsl(${habit.color})`,
              boxShadow: `0 0 12px hsl(${habit.color} / 0.6), 0 0 24px hsl(${habit.color} / 0.3)`,
            }}
          />
          <span className="text-foreground font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{habit.name}</span>
        </div>
      </td>
      {visibleDays.map((day) => {
        const isCompleted = habit.completedDays.includes(day);
        const clickable = isDayClickable(day);
        return (
          <td key={day} className="p-0.5 sm:p-1.5 text-center">
            <button
              onClick={() => clickable && onToggleDay(habit.id, day)}
              disabled={!clickable}
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-lg transition-all duration-300 flex items-center justify-center cursor-pointer border-2 gpu-accelerated
                ${isCompleted ? 'habit-checkbox-filled' : 'habit-checkbox-empty border-border/50'}
                ${!clickable ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:border-primary/70'}`}
              style={
                isCompleted
                  ? {
                      backgroundColor: `hsl(${habit.color})`,
                      boxShadow: `0 0 20px hsl(${habit.color} / 0.6), 0 0 40px hsl(${habit.color} / 0.3)`,
                      borderColor: `hsl(${habit.color})`,
                    }
                  : undefined
              }
              aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'} for day ${day}`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 drop-shadow-lg" />}
            </button>
          </td>
        );
      })}
      <td
        className="p-2 sm:p-4 sticky right-0 z-10"
        style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.85))' }}
      >
        <div className="flex gap-1 sm:gap-2 justify-end">
          <button
            onClick={handleEdit}
            className="p-1.5 sm:p-2.5 rounded-lg transition-all duration-300 text-muted-foreground hover:text-primary hover:bg-primary/10"
            aria-label={`Edit ${habit.name}`}
          >
            <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 sm:p-2.5 rounded-lg transition-all duration-300 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

export function HabitTable({
  habits,
  daysInMonth,
  viewMode,
  currentDay,
  selectedMonth,
  onToggleDay,
  onEdit,
  onDelete,
  onReorder,
}: HabitTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
  // Adjust to make Monday = 0 (ISO week)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getVisibleDays = () => {
    if (viewMode === 'weekly') {
      const startDay = Math.max(1, currentDay - 6);
      const endDay = Math.min(daysInMonth, currentDay);
      return Array.from({ length: endDay - startDay + 1 }, (_, i) => startDay + i);
    }
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const visibleDays = getVisibleDays();

  // Get day of week for a specific day in the month (0 = Monday, 6 = Sunday in ISO)
  const getDayOfWeek = (day: number): number => {
    return (startOffset + day - 1) % 7;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      const newHabits = arrayMove(habits, oldIndex, newIndex);
      onReorder(newHabits);
    }
  };

  return (
    <div className="card-neon overflow-hidden animate-fade-in">
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th
                  className="text-left p-2 sm:p-4 text-foreground font-semibold sticky left-0 z-10 min-w-[100px] sm:min-w-[180px] text-xs sm:text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.85))' }}
                >
                  Habit
                </th>
                {visibleDays.map((day) => (
                  <th key={day} className="p-0.5 sm:p-1.5 text-center min-w-[28px] sm:min-w-[42px]">
                    <div className="text-[8px] sm:text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                      {weekDays[getDayOfWeek(day)].slice(0, 1)}
                      <span className="hidden sm:inline">{weekDays[getDayOfWeek(day)].slice(1)}</span>
                    </div>
                    <div className="text-[10px] sm:text-sm text-muted-foreground font-medium">{day}</div>
                  </th>
                ))}
                <th
                  className="p-2 sm:p-4 text-right text-foreground font-semibold sticky right-0 z-10 min-w-[60px] sm:min-w-[100px] text-xs sm:text-sm"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--card) / 0.85))' }}
                >
                  <span className="hidden sm:inline">Actions</span>
                  <span className="sm:hidden">⋮</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={visibleDays.length + 2} className="text-center p-8 text-muted-foreground">
                    No habits yet. Click "Add Habit" to get started!
                  </td>
                </tr>
              ) : (
                <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                  {habits.map((habit, index) => (
                    <SortableRow
                      key={habit.id}
                      habit={habit}
                      visibleDays={visibleDays}
                      selectedMonth={selectedMonth}
                      currentDay={currentDay}
                      getDayOfWeek={getDayOfWeek}
                      onToggleDay={onToggleDay}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      index={index}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}