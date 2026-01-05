import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Calendar as CalendarIcon, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Habit } from '@/types/habit';
import { Goal } from '@/types/goal';
import { JournalEntry } from '@/types/journal';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportDataDialogProps {
  habits: Habit[];
  goals: Goal[];
  journalEntries?: JournalEntry[];
  selectedMonth: Date;
  onImportHabits?: (habits: Habit[]) => void;
  onImportGoals?: (goals: Goal[]) => void;
  onImportJournal?: (entries: JournalEntry[]) => void;
}

export function ExportDataDialog({ 
  habits, 
  goals, 
  journalEntries = [], 
  selectedMonth,
  onImportHabits,
  onImportGoals,
  onImportJournal
}: ExportDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [exportHabits, setExportHabits] = useState(true);
  const [exportGoals, setExportGoals] = useState(true);
  const [exportJournal, setExportJournal] = useState(true);
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();

    if (exportHabits && habits.length > 0) {
      const habitData = habits.map(habit => ({
        'Habit Name': habit.name,
        'Created At': format(parseISO(habit.createdAt), 'MMM d, yyyy'),
        'Total Completed Days': habit.completedDays.length,
        'Completed Days': habit.completedDays.sort((a, b) => a - b).join(', '),
      }));

      const habitsSheet = XLSX.utils.json_to_sheet(habitData);
      XLSX.utils.book_append_sheet(workbook, habitsSheet, 'Habits');
    }

    if (exportGoals && goals.length > 0) {
      const filteredGoals = goals.filter(goal => {
        const createdAt = parseISO(goal.createdAt);
        return isWithinInterval(createdAt, { start: startDate, end: endDate });
      });

      const goalData = filteredGoals.map(goal => ({
        'Goal Name': goal.name,
        'Status': goal.status.charAt(0).toUpperCase() + goal.status.slice(1).replace('-', ' '),
        'Priority': goal.value,
        'Duration (Days)': goal.days,
        'Created At': format(parseISO(goal.createdAt), 'MMM d, yyyy'),
        'Completed At': goal.completedAt ? format(parseISO(goal.completedAt), 'MMM d, yyyy') : '-',
      }));

      if (goalData.length > 0) {
        const goalsSheet = XLSX.utils.json_to_sheet(goalData);
        XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Goals');
      }
    }

    if (exportJournal && journalEntries.length > 0) {
      const filteredJournal = journalEntries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });

      const journalData = filteredJournal.map(entry => ({
        'Date': format(parseISO(entry.date), 'MMM d, yyyy'),
        'How Was Your Day': entry.howWasYourDay || '-',
        'Productive Thing': entry.productiveThing || '-',
        'Learned Today': entry.learnedToday || '-',
        'Missed Today': entry.missedToday || '-',
        'Tomorrow Plan': entry.tomorrowPlan || '-',
        'Screen Time': entry.screenTime || '-',
        'Day Rating': entry.dayRating > 0 ? `${entry.dayRating}/5` : '-',
      }));

      if (journalData.length > 0) {
        const journalSheet = XLSX.utils.json_to_sheet(journalData);
        XLSX.utils.book_append_sheet(workbook, journalSheet, 'Journal');
      }
    }

    const fileName = `habit-goals-journal-export-${format(startDate, 'MMM-d')}-to-${format(endDate, 'MMM-d-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    setOpen(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const filteredJournal = journalEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });

    // Title
    doc.setFontSize(24);
    doc.setTextColor(147, 51, 234);
    doc.text('Journal Report', 105, 20, { align: 'center' });

    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`, 105, 30, { align: 'center' });

    // Stats summary
    const totalEntries = filteredJournal.length;
    const avgRating = filteredJournal.reduce((acc, e) => acc + e.dayRating, 0) / (totalEntries || 1);
    const totalWords = filteredJournal.reduce((acc, e) => {
      const words = [e.howWasYourDay, e.productiveThing, e.learnedToday, e.missedToday, e.tomorrowPlan]
        .filter(Boolean)
        .join(' ')
        .split(/\s+/).length;
      return acc + words;
    }, 0);

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 14, 45);
    
    doc.setFontSize(11);
    doc.text(`Total Entries: ${totalEntries}`, 14, 55);
    doc.text(`Average Rating: ${avgRating.toFixed(1)}/5`, 14, 62);
    doc.text(`Total Words: ${totalWords}`, 14, 69);

    // Journal entries table
    if (filteredJournal.length > 0) {
      const tableData = filteredJournal.map(entry => [
        format(parseISO(entry.date), 'MMM d'),
        (entry.howWasYourDay || '-').substring(0, 50) + ((entry.howWasYourDay?.length || 0) > 50 ? '...' : ''),
        entry.dayRating > 0 ? `${entry.dayRating}/5` : '-',
        entry.screenTime || '-'
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Date', 'Day Summary', 'Rating', 'Screen Time']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [147, 51, 234],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        styles: { fontSize: 9, cellPadding: 3 }
      });
    }

    doc.save(`journal-report-${format(startDate, 'MMM-d')}-to-${format(endDate, 'MMM-d-yyyy')}.pdf`);
    toast({ title: 'PDF exported successfully!' });
    setOpen(false);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Import Habits
        if (workbook.SheetNames.includes('Habits') && onImportHabits) {
          const habitsSheet = workbook.Sheets['Habits'];
          const habitsData = XLSX.utils.sheet_to_json(habitsSheet) as any[];
          
          const importedHabits: Habit[] = habitsData.map((row, index) => ({
            id: `imported-${Date.now()}-${index}`,
            name: row['Habit Name'] || 'Unnamed Habit',
            color: '187 100% 42%', // Default teal color
            completedDays: row['Completed Days'] 
              ? String(row['Completed Days']).split(',').map(d => parseInt(d.trim())).filter(n => !isNaN(n))
              : [],
            createdAt: new Date().toISOString(),
          }));

          onImportHabits(importedHabits);
        }

        // Import Goals
        if (workbook.SheetNames.includes('Goals') && onImportGoals) {
          const goalsSheet = workbook.Sheets['Goals'];
          const goalsData = XLSX.utils.sheet_to_json(goalsSheet) as any[];
          
          const validDays = [1, 7, 15, 30, 45, 90, 150, 180, 270, 365] as const;
          const importedGoals: Goal[] = goalsData.map((row, index) => {
            const parsedDays = parseInt(row['Duration (Days)']) || 30;
            const closestDays = validDays.reduce((prev, curr) => 
              Math.abs(curr - parsedDays) < Math.abs(prev - parsedDays) ? curr : prev
            );
            
            return {
              id: `imported-${Date.now()}-${index}`,
              name: row['Goal Name'] || 'Unnamed Goal',
              status: (row['Status']?.toLowerCase().replace(' ', '-') as Goal['status']) || 'not-yet',
              value: (row['Priority'] as Goal['value']) || 'IMP',
              days: closestDays,
              createdAt: new Date().toISOString(),
              completedAt: undefined,
            };
          });

          onImportGoals(importedGoals);
        }

        // Import Journal
        if (workbook.SheetNames.includes('Journal') && onImportJournal) {
          const journalSheet = workbook.Sheets['Journal'];
          const journalData = XLSX.utils.sheet_to_json(journalSheet) as any[];
          
          const importedJournal: JournalEntry[] = journalData.map((row, index) => ({
            id: `imported-journal-${Date.now()}-${index}`,
            date: row['Date'] ? format(new Date(row['Date']), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            howWasYourDay: row['How Was Your Day'] !== '-' ? row['How Was Your Day'] : '',
            productiveThing: row['Productive Thing'] !== '-' ? row['Productive Thing'] : '',
            learnedToday: row['Learned Today'] !== '-' ? row['Learned Today'] : '',
            missedToday: row['Missed Today'] !== '-' ? row['Missed Today'] : '',
            tomorrowPlan: row['Tomorrow Plan'] !== '-' ? row['Tomorrow Plan'] : '',
            screenTime: row['Screen Time'] !== '-' ? row['Screen Time'] : '',
            socialMediaTime: '',
            firstPickupTime: '',
            dayRating: row['Day Rating'] ? parseInt(row['Day Rating']) : 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          onImportJournal(importedJournal);
        }

        toast({ title: 'Data imported successfully!' });
        setOpen(false);
      } catch (error) {
        toast({ title: 'Import failed', description: 'Please check the file format', variant: 'destructive' });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const workbook = XLSX.utils.book_new();

    // Habits template
    const habitsTemplate = [
      { 'Habit Name': 'Example Habit 1', 'Completed Days': '1, 5, 10, 15' },
      { 'Habit Name': 'Example Habit 2', 'Completed Days': '2, 7, 12' },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(habitsTemplate), 'Habits');

    // Goals template
    const goalsTemplate = [
      { 'Goal Name': 'Example Goal', 'Status': 'On-Going', 'Priority': 'IMP', 'Duration (Days)': 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(goalsTemplate), 'Goals');

    // Journal template
    const journalTemplate = [
      { 
        'Date': format(new Date(), 'MMM d, yyyy'),
        'How Was Your Day': 'Great day!',
        'Productive Thing': 'Completed project',
        'Learned Today': 'New concept',
        'Missed Today': 'Nothing',
        'Tomorrow Plan': 'Review work',
        'Screen Time': '2h 30m',
        'Day Rating': '4/5'
      },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(journalTemplate), 'Journal');

    XLSX.writeFile(workbook, 'import-template.xlsx');
    toast({ title: 'Template downloaded!' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="glass-button gap-1.5 sm:gap-2 text-xs sm:text-sm"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="neon-text-primary flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import / Export Data
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="export" className="data-[state=active]:bg-primary/20">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-primary/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-2">
            {/* Date Range Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Date Range</label>
              <div className="flex flex-wrap items-center gap-2">
                <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 min-w-[130px] glass-button gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{format(startDate, 'MMM d, yyyy')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => { if (date) setStartDate(date); setStartCalendarOpen(false); }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">to</span>

                <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex-1 min-w-[130px] glass-button gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm">{format(endDate, 'MMM d, yyyy')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-card" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => { if (date) setEndDate(date); setEndCalendarOpen(false); }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Include in Export</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg glass-card hover:border-primary/30 transition-colors">
                  <Checkbox 
                    id="habits" 
                    checked={exportHabits} 
                    onCheckedChange={(checked) => setExportHabits(checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="habits" className="text-sm cursor-pointer flex-1">
                    <span className="font-medium">Habits Data</span>
                    <span className="text-muted-foreground ml-2">({habits.length} habits)</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg glass-card hover:border-neon-purple/30 transition-colors">
                  <Checkbox 
                    id="goals" 
                    checked={exportGoals} 
                    onCheckedChange={(checked) => setExportGoals(checked as boolean)}
                    className="data-[state=checked]:bg-neon-purple data-[state=checked]:border-neon-purple"
                  />
                  <label htmlFor="goals" className="text-sm cursor-pointer flex-1">
                    <span className="font-medium">Goals Data</span>
                    <span className="text-muted-foreground ml-2">({goals.length} goals)</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg glass-card hover:border-neon-purple/30 transition-colors">
                  <Checkbox 
                    id="journal" 
                    checked={exportJournal} 
                    onCheckedChange={(checked) => setExportJournal(checked as boolean)}
                    className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <label htmlFor="journal" className="text-sm cursor-pointer flex-1">
                    <span className="font-medium">Journal Data</span>
                    <span className="text-muted-foreground ml-2">({journalEntries.length} entries)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={handleExport}
                disabled={!exportHabits && !exportGoals && !exportJournal}
                className="flex-1 btn-glow bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button 
                onClick={handleExportPDF}
                disabled={!exportJournal || journalEntries.length === 0}
                className="flex-1 btn-glow bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground"
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-2">
            <div className="glass-card p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500">Import Format</p>
                  <p className="text-muted-foreground mt-1">
                    Download the template below to see the required format. Your Excel file should have sheets named "Habits", "Goals", and/or "Journal".
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="w-full glass-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>

            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full btn-glow bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File to Import
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
