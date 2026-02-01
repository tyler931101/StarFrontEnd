import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmComponent } from '../../shared/components/confirm/confirm.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmComponent],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent {
  today = new Date();
  currentDate = new Date();
  currentYear = this.today.getFullYear();
  currentMonth = this.today.getMonth();
  selectedDate: Date | null = null;

  viewMode: 'day' | 'week' | 'month' | 'year' = 'month';
  viewOptions = ['Day', 'Week', 'Month', 'Year'];

  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weeks: { date: Date; inMonth: boolean; events: CalendarEvent[] }[][] = [];

  // For Year View
  yearMonths: {
    name: string;
    date: Date;
    weeks: { date: Date; inMonth: boolean; events: CalendarEvent[] }[][];
  }[] = [];

  // For Day/Week View (Time Grid)
  timeSlots: string[] = [];

  events: CalendarEvent[] = [];
  eventColors = [
    '#c7d2fe',
    '#fecaca',
    '#fef3c7',
    '#d1fae5',
    '#fde68a',
    '#fbcfe8',
    '#cffafe',
    '#ddd6fe',
    '#fca5a5',
    '#a7f3d0',
  ];
  colorIndex = 0;

  isEventModalVisible = false;
  isDeleteModalVisible = false;
  editingEvent: CalendarEvent | null = null;

  formTitle = '';
  formDate = '';
  formEndDate = '';
  formStart = '';
  formEnd = '';
  formDescription = '';
  formAttempted = false;

  get formStartDateTime(): string {
    if (!this.formDate) return '';
    return `${this.formDate}T${this.formStart || '09:00'}`;
  }

  set formStartDateTime(val: string) {
    if (!val) return;
    const parts = val.split('T');
    if (parts.length >= 2) {
      this.formDate = parts[0];
      this.formStart = parts[1];
    } else {
      this.formDate = parts[0];
    }
  }

  get formEndDateTime(): string {
    if (!this.formEndDate) return '';
    return `${this.formEndDate}T${this.formEnd || '10:00'}`;
  }

  set formEndDateTime(val: string) {
    if (!val) return;
    const parts = val.split('T');
    if (parts.length >= 2) {
      this.formEndDate = parts[0];
      this.formEnd = parts[1];
    } else {
      this.formEndDate = parts[0];
    }
  }

  constructor() {
    this.generateTimeSlots();
    this.buildCalendar();
  }

  generateTimeSlots() {
    this.timeSlots = [];
    for (let i = 0; i < 24; i++) {
      const time = i.toString().padStart(2, '0') + ':00';
      this.timeSlots.push(time);
    }
  }

  get currentLabel() {
    if (this.viewMode === 'day') {
      return this.currentDate.toLocaleDateString(undefined, { dateStyle: 'full' });
    } else if (this.viewMode === 'week') {
      const start = this.getStartOfWeek(this.currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const startStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startStr} - ${endStr}`;
    } else if (this.viewMode === 'year') {
      return this.currentDate.getFullYear().toString();
    }
    // Month view
    return new Date(this.currentYear, this.currentMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }

  prev() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else if (this.viewMode === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    }
    this.syncDateProps();
    this.buildCalendar();
  }

  next() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (this.viewMode === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.viewMode === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else if (this.viewMode === 'year') {
      this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    }
    this.syncDateProps();
    this.buildCalendar();
  }

  goToday() {
    this.currentDate = new Date();
    this.syncDateProps();
    this.buildCalendar();
  }

  syncDateProps() {
    this.currentYear = this.currentDate.getFullYear();
    this.currentMonth = this.currentDate.getMonth();
  }

  onViewModeChange() {
    this.buildCalendar();
  }

  buildCalendar() {
    if (this.viewMode === 'month') {
      this.buildMonthView();
    } else if (this.viewMode === 'week') {
      this.buildWeekView();
    } else if (this.viewMode === 'day') {
      this.buildDayView();
    } else if (this.viewMode === 'year') {
      this.buildYearView();
    }
  }

  buildMonthView() {
    const first = new Date(this.currentYear, this.currentMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const grid: { date: Date; inMonth: boolean; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < startDay; i++) {
      const d = new Date(this.currentYear, this.currentMonth - 1, prevMonthDays - (startDay - 1 - i));
      grid.push({ date: d, inMonth: false, events: this.eventsForDate(d) });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(this.currentYear, this.currentMonth, day);
      grid.push({ date: d, inMonth: true, events: this.eventsForDate(d) });
    }
    while (grid.length % 7 !== 0) {
      const last = grid[grid.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      grid.push({ date: d, inMonth: false, events: this.eventsForDate(d) });
    }
    const weeks: typeof this.weeks = [];
    for (let i = 0; i < grid.length; i += 7) {
      weeks.push(grid.slice(i, i + 7));
    }
    this.weeks = weeks;
  }

  buildWeekView() {
    const start = this.getStartOfWeek(this.currentDate);
    const grid: { date: Date; inMonth: boolean; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      grid.push({ date: d, inMonth: d.getMonth() === this.currentMonth, events: this.eventsForDate(d) });
    }
    this.weeks = [grid];
  }

  buildDayView() {
    const d = new Date(this.currentDate);
    const grid: { date: Date; inMonth: boolean; events: CalendarEvent[] }[] = [];
    // We can just show one day, but to reuse the grid structure, we might put it in a single cell or a list.
    // However, the template expects 'weeks'. Let's just put one day in the grid for now, but we might want a different layout for day view.
    // For consistency with existing grid:
    grid.push({ date: d, inMonth: true, events: this.eventsForDate(d) });
    this.weeks = [grid]; 
  }

  buildYearView() {
    this.yearMonths = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(this.currentYear, m, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(this.currentYear, m + 1, 0).getDate();
      
      const grid: { date: Date; inMonth: boolean; events: CalendarEvent[] }[] = [];
      // Simple mini calendar logic
      // Fill empty slots
      for(let i=0; i<startDay; i++) {
        // We can put nulls or placeholder dates
         const d = new Date(this.currentYear, m, 1 - (startDay - i));
         grid.push({ date: d, inMonth: false, events: [] });
      }
      for(let day=1; day<=daysInMonth; day++) {
        const d = new Date(this.currentYear, m, day);
        grid.push({ date: d, inMonth: true, events: this.eventsForDate(d) });
      }
      // Fill end
       while (grid.length % 7 !== 0) {
         const last = grid[grid.length - 1].date;
         const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
         grid.push({ date: d, inMonth: false, events: [] });
       }
       
       const weeks: { date: Date; inMonth: boolean; events: CalendarEvent[] }[][] = [];
       for (let i = 0; i < grid.length; i += 7) {
         weeks.push(grid.slice(i, i + 7));
       }
       
       this.yearMonths.push({
         name: new Date(this.currentYear, m, 1).toLocaleString('default', { month: 'long' }),
         date: new Date(this.currentYear, m, 1),
         weeks: weeks
       });
    }
  }

  getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // adjust when day is sunday
    return new Date(d.setDate(diff));
  }

  eventsForDate(date: Date) {
    const key = this.dateKey(date);
    return this.events.filter((e) => this.isKeyInRange(key, e.date, e.endDate ?? e.date));
  }

  dateKey(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  openCreate(date: Date) {
    this.selectedDate = date;
    this.editingEvent = null;
    this.formAttempted = false;
    this.formTitle = '';
    this.formDate = this.dateKey(date);
    this.formEndDate = this.formDate;
    this.formStart = '';
    this.formEnd = '';
    this.formDescription = '';
    this.isEventModalVisible = true;
  }

  openEdit(event: CalendarEvent) {
    this.editingEvent = event;
    this.formAttempted = false;
    this.formTitle = event.title;
    this.formDate = event.date;
    this.formEndDate = event.endDate ?? event.date;
    this.formStart = event.start ?? '';
    this.formEnd = event.end ?? '';
    this.formDescription = event.description ?? '';
    this.isEventModalVisible = true;
  }

  closeEventModal() {
    this.isEventModalVisible = false;
    this.editingEvent = null;
  }

  openCreateFromToolbar() {
    this.selectedDate = null;
    this.editingEvent = null;
    this.formAttempted = false;
    this.formTitle = '';
    const todayKey = this.dateKey(new Date());
    this.formDate = todayKey;
    this.formEndDate = todayKey;
    this.formStart = '';
    this.formEnd = '';
    this.formDescription = '';
    this.isEventModalVisible = true;
  }

  saveEvent() {
    this.formAttempted = true;
    const title = this.formTitle.trim();

    if (!title || !this.formDate || !this.formEndDate || !this.formDescription.trim()) {
      return;
    }

    if (this.editingEvent) {
      this.editingEvent.title = title;
      this.editingEvent.date = this.formDate;
      this.editingEvent.endDate = this.formEndDate || this.formDate;
      this.editingEvent.start = this.formStart || undefined;
      this.editingEvent.end = this.formEnd || undefined;
      this.editingEvent.description = this.formDescription || undefined;
    } else {
      const id = Math.random().toString(36).slice(2);
      const ev: CalendarEvent = {
        id,
        title,
        date: this.formDate,
        endDate: this.formEndDate || this.formDate,
        start: this.formStart || undefined,
        end: this.formEnd || undefined,
        description: this.formDescription || undefined,
        color: this.getNextColor(),
      };
      this.events.push(ev);
    }
    this.buildCalendar();
    this.closeEventModal();
  }

  isKeyInRange(key: string, startKey: string, endKey: string) {
    const k = this.keyToDate(key);
    const s = this.keyToDate(startKey);
    const e = this.keyToDate(endKey);
    // Normalize end: ensure end >= start
    const end = e.getTime() < s.getTime() ? s : e;
    return k.getTime() >= s.getTime() && k.getTime() <= end.getTime();
  }

  keyToDate(key: string) {
    const [y, m, d] = key.split('-').map((x) => parseInt(x, 10));
    return new Date(y, m - 1, d);
  }

  isToday(date: Date) {
    return this.dateKey(date) === this.dateKey(new Date());
  }

  getNextColor() {
    const color = this.eventColors[this.colorIndex % this.eventColors.length];
    this.colorIndex++;
    return color;
  }

  getEventStyle(event: CalendarEvent) {
    if (!event.start) return {}; // All day event or no time
    
    const startParts = event.start.split(':').map(x => parseInt(x, 10));
    const startMin = startParts[0] * 60 + startParts[1];
    
    let endMin = startMin + 60; // Default 1 hour
    if (event.end) {
        const endParts = event.end.split(':').map(x => parseInt(x, 10));
        endMin = endParts[0] * 60 + endParts[1];
    }
    
    // If end is next day or earlier than start (crossing midnight), handle gracefully
    if (endMin <= startMin) endMin = 24 * 60; // Cap at end of day for now

    const duration = endMin - startMin;
    const heightPerMin = 50 / 60; // 50px per hour
    
    return {
      top: `${startMin * heightPerMin}px`,
      height: `${Math.max(duration * heightPerMin, 20)}px`, // Min height 20px
      position: 'absolute',
      width: '90%'
    };
  }

  openDelete(event: CalendarEvent) {
    this.editingEvent = event;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
    this.editingEvent = null;
  }

  confirmDelete() {
    if (!this.editingEvent) return;
    const id = this.editingEvent.id;
    const idx = this.events.findIndex((e) => e.id === id);
    if (idx > -1) this.events.splice(idx, 1);
    this.buildCalendar();
    this.closeDeleteModal();
  }
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  start?: string;
  end?: string;
  description?: string;
  color?: string;
}
