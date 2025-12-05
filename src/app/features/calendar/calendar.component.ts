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
  currentYear = this.today.getFullYear();
  currentMonth = this.today.getMonth();
  selectedDate: Date | null = null;

  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weeks: { date: Date; inMonth: boolean; events: CalendarEvent[] }[][] = [];

  events: CalendarEvent[] = [];
  eventColors = ['#c7d2fe','#fecaca','#fef3c7','#d1fae5','#fde68a','#fbcfe8','#cffafe','#ddd6fe','#fca5a5','#a7f3d0'];
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

  constructor() {
    this.buildCalendar();
  }

  get monthLabel() {
    return new Date(this.currentYear, this.currentMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear -= 1;
    } else {
      this.currentMonth -= 1;
    }
    this.buildCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear += 1;
    } else {
      this.currentMonth += 1;
    }
    this.buildCalendar();
  }

  goToday() {
    this.currentYear = this.today.getFullYear();
    this.currentMonth = this.today.getMonth();
    this.buildCalendar();
  }

  buildCalendar() {
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

  eventsForDate(date: Date) {
    const key = this.dateKey(date);
    return this.events.filter(e => this.isKeyInRange(key, e.date, e.endDate ?? e.date));
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
    const title = this.formTitle.trim();
    if (!title) { this.closeEventModal(); return; }
    if (this.editingEvent) {
      this.editingEvent.title = title;
      this.editingEvent.date = this.formDate;
      this.editingEvent.endDate = this.formEndDate || this.formDate;
      this.editingEvent.start = this.formStart || undefined;
      this.editingEvent.end = this.formEnd || undefined;
      this.editingEvent.description = this.formDescription || undefined;
    } else {
      const id = Math.random().toString(36).slice(2);
      const ev: CalendarEvent = { id, title, date: this.formDate, endDate: this.formEndDate || this.formDate, start: this.formStart || undefined, end: this.formEnd || undefined, description: this.formDescription || undefined, color: this.getNextColor() };
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
    const [y, m, d] = key.split('-').map(x => parseInt(x, 10));
    return new Date(y, (m - 1), d);
  }

  isToday(date: Date) {
    return this.dateKey(date) === this.dateKey(new Date());
  }

  getNextColor() {
    const color = this.eventColors[this.colorIndex % this.eventColors.length];
    this.colorIndex++;
    return color;
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
    const idx = this.events.findIndex(e => e.id === id);
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
