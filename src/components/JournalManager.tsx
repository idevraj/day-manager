import { useState, useMemo, useCallback } from 'react';
import { format, subDays, addDays, isAfter, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, Smartphone, BarChart3, Clock, FileText, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJournal } from '@/hooks/useJournal';
import { 
  JOURNAL_HEADINGS, 
  SCREEN_TIME_OPTIONS, 
  SOCIAL_MEDIA_TIME_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  JournalHeadingKey 
} from '@/types/journal';
import { JournalEntryItem } from './JournalEntry';
import { JournalAnalytics } from './JournalAnalytics';
import { QuotesDisplay } from './QuotesDisplay';
import { DetoxChallenges } from './DetoxChallenges';
import { MonthlySummary } from './MonthlySummary';
import { AchievementBadges } from './AchievementBadges';
import { cn } from '@/lib/utils';

type JournalView = 'write' | 'analytics';

// Journal section types
type JournalSection = 'quotes' | 'date' | 'entries' | 'phone' | 'detox' | 'rating' | 'achievements';

interface SortableItemProps {
  id: JournalSection;
  children: React.ReactNode;
  index: number;
}

function SortableItem({ id, children, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const staggerClass = index < 10 ? `stagger-${index + 1}` : '';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
    animationDelay: `${index * 0.1}s`,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group animate-fade-in-up animate-fill-both ${staggerClass}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
      >
        <div className="p-2 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-neon-purple/50 transition-all duration-300">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      {children}
    </div>
  );
}

// Random emoji set for ratings (changes each session)
const RATING_EMOJIS = ['⭐', '❤️', '👍'];
const getSessionEmoji = () => RATING_EMOJIS[Math.floor(Math.random() * RATING_EMOJIS.length)];

const INITIAL_SECTION_ORDER: JournalSection[] = ['quotes', 'date', 'entries', 'phone', 'detox', 'rating', 'achievements'];
const SECTION_ORDER_KEY = 'journal-section-order-v2';

export function JournalManager() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<JournalView>('write');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [ratingEmoji] = useState(() => getSessionEmoji());
  const [sectionOrder, setSectionOrder] = useState<JournalSection[]>(() => {
    const stored = localStorage.getItem(SECTION_ORDER_KEY);
    return stored ? JSON.parse(stored) : INITIAL_SECTION_ORDER;
  });
  
  const { entries, getEntryByDate, updateField, getWordCount } = useJournal();
  
  const today = startOfDay(new Date());
  const canGoNext = !isAfter(startOfDay(addDays(selectedDate, 1)), today);

  const currentEntry = useMemo(() => getEntryByDate(selectedDate), [getEntryByDate, selectedDate]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as JournalSection);
        const newIndex = items.indexOf(over.id as JournalSection);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  }, []);

  const handlePrevDay = useCallback(() => {
    setSelectedDate(prev => subDays(prev, 1));
  }, []);

  const handleNextDay = useCallback(() => {
    if (canGoNext) {
      setSelectedDate(prev => addDays(prev, 1));
    }
  }, [canGoNext]);

  const handleFieldChange = useCallback((field: JournalHeadingKey) => (value: string) => {
    updateField(selectedDate, field, value);
  }, [selectedDate, updateField]);

  const handleScreenTimeChange = useCallback((value: string) => {
    updateField(selectedDate, 'screenTime', value);
  }, [selectedDate, updateField]);

  const handleSocialMediaTimeChange = useCallback((value: string) => {
    updateField(selectedDate, 'socialMediaTime', value);
  }, [selectedDate, updateField]);

  const handleFirstPickupChange = useCallback((value: string) => {
    updateField(selectedDate, 'firstPickupTime', value);
  }, [selectedDate, updateField]);

  const handleRatingChange = useCallback((rating: number) => {
    updateField(selectedDate, 'dayRating', rating);
  }, [selectedDate, updateField]);

  const renderSection = useCallback((sectionId: JournalSection) => {
    switch (sectionId) {
      case 'quotes':
        return <QuotesDisplay />;
      case 'date':
        return (
          <div className="card-neon p-3 sm:p-4 flex items-center justify-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevDay}
              className="hover:bg-secondary"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[180px] sm:min-w-[220px] bg-secondary/50 border-border hover:bg-secondary gap-2"
                >
                  <CalendarIcon className="w-4 h-4 text-neon-purple" />
                  <span className="text-sm sm:text-base font-medium">
                    {format(selectedDate, 'EEEE, MMM d, yyyy')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 card-neon z-50" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date && !isAfter(startOfDay(date), today)) {
                      setSelectedDate(date);
                    }
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => isAfter(startOfDay(date), today)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDay}
              disabled={!canGoNext}
              className="hover:bg-secondary disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        );
      case 'entries':
        return (
          <div className="card-neon p-3 sm:p-5 space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
              📝 Today's Reflections
            </h2>
            {JOURNAL_HEADINGS.map((heading) => (
              <JournalEntryItem
                key={heading.key}
                heading={heading.label}
                icon={heading.icon}
                value={currentEntry?.[heading.key as JournalHeadingKey] || ''}
                wordCount={getWordCount(currentEntry?.[heading.key as JournalHeadingKey] || '')}
                onChange={handleFieldChange(heading.key as JournalHeadingKey)}
              />
            ))}
          </div>
        );
      case 'phone':
        return (
          <div className="card-neon p-4 sm:p-5 space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-neon-purple" />
              Phone Usage Tracking
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-neon-purple" />
                  Total Screen Time
                </label>
                <Select 
                  value={currentEntry?.screenTime || ''} 
                  onValueChange={handleScreenTimeChange}
                >
                  <SelectTrigger className="w-full bg-secondary/50 border-border">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {SCREEN_TIME_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  📱 Social Media Time
                </label>
                <Select 
                  value={currentEntry?.socialMediaTime || ''} 
                  onValueChange={handleSocialMediaTimeChange}
                >
                  <SelectTrigger className="w-full bg-secondary/50 border-border">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    {SOCIAL_MEDIA_TIME_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  🌅 First Pickup Time
                </label>
                <Select 
                  value={currentEntry?.firstPickupTime || ''} 
                  onValueChange={handleFirstPickupChange}
                >
                  <SelectTrigger className="w-full bg-secondary/50 border-border">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-[200px]">
                    {TIME_OF_DAY_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 'detox':
        return <DetoxChallenges journalEntries={entries} />;
      case 'rating':
        return (
          <div className="card-neon p-4 sm:p-5 space-y-4">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              ⭐ Rate Your Day
            </h2>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg text-xl sm:text-2xl transition-all duration-300",
                    "border-2 flex items-center justify-center",
                    (currentEntry?.dayRating || 0) >= rating
                      ? "bg-neon-purple/20 border-neon-purple scale-110 shadow-[0_0_15px_hsl(var(--neon-purple)/0.4)]"
                      : "bg-secondary/30 border-border/50 opacity-50 hover:opacity-80 hover:scale-105"
                  )}
                  aria-label={`Rate ${rating} out of 5`}
                >
                  {ratingEmoji}
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {currentEntry?.dayRating || 0}/5
              </span>
            </div>
          </div>
        );
      case 'achievements':
        return <AchievementBadges journalEntries={entries} />;
      default:
        return null;
    }
  }, [calendarOpen, canGoNext, currentEntry, entries, getWordCount, handleFieldChange, handleFirstPickupChange, handleNextDay, handlePrevDay, handleRatingChange, handleScreenTimeChange, handleSocialMediaTimeChange, ratingEmoji, selectedDate, today]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-neon p-3 sm:p-5 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-neon-purple" />
          <span className="neon-text-purple">Daily Journal</span>
        </h1>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('write')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-500 flex items-center gap-1.5",
              viewMode === 'write' 
                ? "bg-neon-purple text-white shadow-[0_0_15px_hsl(var(--neon-purple)/0.4)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Write</span>
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-500 flex items-center gap-1.5",
              viewMode === 'analytics' 
                ? "bg-neon-purple text-white shadow-[0_0_15px_hsl(var(--neon-purple)/0.4)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
          <button
            onClick={() => setShowMonthlySummary(true)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-500 flex items-center gap-1.5",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Summary</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary Modal */}
      <MonthlySummary 
        entries={entries} 
        isOpen={showMonthlySummary} 
        onClose={() => setShowMonthlySummary(false)} 
      />

      {viewMode === 'analytics' ? (
        <JournalAnalytics entries={entries} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-8">
              {sectionOrder.map((sectionId, index) => (
                <SortableItem key={sectionId} id={sectionId} index={index}>
                  {renderSection(sectionId)}
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
