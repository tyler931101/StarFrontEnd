import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartService } from './services/chart.service';
import { Ticket, TicketStatus } from '../ticket/models/ticket.model';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  tickets: Ticket[] = [];
  activeTab: 'status' | 'filter' = 'status';
  chartUser = '';
  chartStatus: '' | TicketStatus = '';
  useMock = true;
  lineLabels: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  seriesTodo: number[] = [];
  seriesInProgress: number[] = [];
  seriesClosed: number[] = [];

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    if (this.useMock) {
      this.loadMockTickets();
      this.chartService.setMockTickets(this.tickets);
      this.buildSeries();
    } else {
      
    }
  }

  private loadMockTickets() {
    this.tickets = [
      { id: 'T-101', title: 'Set up project board', priority: 'medium', status: 'todo', assignedTo: 'Alice', dueDate: '2023-12-01' },
      { id: 'T-102', title: 'Design ticket model', priority: 'high', status: 'todo', assignedTo: 'Bob', dueDate: '2023-12-01' },
      { id: 'T-103', title: 'Create API stubs', priority: 'low', status: 'todo', assignedTo: 'Charlie', dueDate: '2023-12-01' },
      { id: 'T-201', title: 'Implement login', priority: 'high', status: 'in_progress', assignedTo: 'Dana', dueDate: '2023-12-01' },
      { id: 'T-202', title: 'User list pagination', priority: 'medium', status: 'in_progress', assignedTo: 'Alice', dueDate: '2023-12-01' },
      { id: 'T-301', title: 'Add global styles', priority: 'low', status: 'closed', assignedTo: 'Bob', dueDate: '2023-12-01' },
      { id: 'T-302', title: 'Fix modal bugs', priority: 'medium', status: 'closed', assignedTo: 'Alice', dueDate: '2023-12-01' },
      { id: 'T-303', title: 'Refactor API service', priority: 'high', status: 'closed', assignedTo: 'Charlie', dueDate: '2023-12-01' },
    ];
  }

  private buildSeries() {
    const c = this.statusCounts;
    this.seriesTodo = this.genSeries(c.todo);
    this.seriesInProgress = this.genSeries(c.in_progress);
    this.seriesClosed = this.genSeries(c.closed);
  }

  private genSeries(base: number): number[] {
    const n = this.lineLabels.length;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / n;
      const v = Math.max(0, Math.round(base * (0.35 + 0.65 * Math.sin(t * Math.PI))));
      arr.push(v);
    }
    return arr;
  }

  get seriesMax() {
    return Math.max(
      ...this.seriesTodo,
      ...this.seriesInProgress,
      ...this.seriesClosed,
      1
    );
  }

  linePath(values: number[], width: number, height: number, padX: number, padY: number) {
    const n = values.length;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const step = n > 1 ? w / (n - 1) : w;
    const max = this.seriesMax;
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = padX + i * step;
      const y = padY + (1 - values[i] / max) * h;
      d += (i === 0 ? 'M' : 'L') + x + ' ' + y + ' ';
    }
    return d.trim();
  }

  get vbGroups() {
    const n = this.lineLabels.length;
    const groups: { idx: number; todo: number; in_progress: number; closed: number }[] = [];
    for (let i = 0; i < n; i++) {
      groups.push({
        idx: this.lineLabels[i],
        todo: this.seriesTodo[i] || 0,
        in_progress: this.seriesInProgress[i] || 0,
        closed: this.seriesClosed[i] || 0,
      });
    }
    return groups;
  }

  barHeightPercent(v: number) {
    return (v / this.seriesMax) * 100;
  }

  get uniqueUsers(): string[] {
    return Array.from(new Set(this.tickets.map(t => t.assignedTo))).sort();
  }

  get statusCounts() {
    const items = this.tickets;
    return {
      todo: items.filter(t => t.status === 'todo').length,
      in_progress: items.filter(t => t.status === 'in_progress').length,
      closed: items.filter(t => t.status === 'closed').length,
    };
  }

  get maxCount() {
    const c = this.statusCounts;
    return Math.max(c.todo, c.in_progress, c.closed, 1);
  }

  get pieBackground() {
    const c = this.statusCounts;
    const total = c.todo + c.in_progress + c.closed || 1;
    const pTodo = (c.todo / total) * 100;
    const pIn = (c.in_progress / total) * 100;
    const pClosed = (c.closed / total) * 100;
    return `conic-gradient(#b91c1c ${pTodo}%, #0369a1 0 ${pTodo + pIn}%, #047857 0 ${pTodo + pIn + pClosed}%)`;
  }

  get filteredChartTickets() {
    return this.tickets.filter(t => (!this.chartUser || t.assignedTo === this.chartUser) && (!this.chartStatus || t.status === this.chartStatus));
  }

  get filteredChartCounts() {
    const items = this.filteredChartTickets;
    return {
      todo: items.filter(t => t.status === 'todo').length,
      in_progress: items.filter(t => t.status === 'in_progress').length,
      closed: items.filter(t => t.status === 'closed').length,
    };
  }

  get filteredMaxCount() {
    const c = this.filteredChartCounts;
    return Math.max(c.todo, c.in_progress, c.closed, 1);
  }

  get distPercent() {
    const c = this.statusCounts;
    const total = c.todo + c.in_progress + c.closed || 1;
    return {
      todo: (c.todo / total) * 100,
      in_progress: (c.in_progress / total) * 100,
      closed: (c.closed / total) * 100,
    };
  }

  get filteredDistPercent() {
    const c = this.filteredChartCounts;
    const total = c.todo + c.in_progress + c.closed || 1;
    return {
      todo: (c.todo / total) * 100,
      in_progress: (c.in_progress / total) * 100,
      closed: (c.closed / total) * 100,
    };
  }

  radialBg(color: string, percent: number) {
    return `conic-gradient(${color} ${percent}%, #e5e7eb 0)`;
  }

  get filteredByStatusTickets() {
    return this.tickets.filter(t => (!this.chartStatus || t.status === this.chartStatus));
  }

  get usersForGroup(): string[] {
    if (this.chartUser) return [this.chartUser];
    return Array.from(new Set(this.filteredByStatusTickets.map(t => t.assignedTo))).sort();
  }

  get groupedStatusByUser() {
    return this.usersForGroup.map(u => {
      const items = this.filteredByStatusTickets.filter(t => t.assignedTo === u);
      const todo = items.filter(t => t.status === 'todo').length;
      const in_progress = items.filter(t => t.status === 'in_progress').length;
      const closed = items.filter(t => t.status === 'closed').length;
      const total = todo + in_progress + closed || 1;
      return {
        user: u,
        counts: { todo, in_progress, closed },
        percents: {
          todo: (todo / total) * 100,
          in_progress: (in_progress / total) * 100,
          closed: (closed / total) * 100,
        },
        total
      };
    });
  }

  get groupBarMaxCount() {
    let max = 1;
    for (const g of this.groupedStatusByUser) {
      max = Math.max(max, g.counts.todo, g.counts.in_progress, g.counts.closed);
    }
    return max;
  }
}
