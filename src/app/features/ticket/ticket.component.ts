import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../shared/components/components.module';
import { User } from '../admin/models/user.model';
import { TicketService } from './services/ticket.service';
import { Ticket, TicketStatus } from './models/ticket.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, ComponentsModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css'],
})
export class TicketComponent implements OnInit {
  users: string[] = [];
  assignees: User[] = [];

  todo: Ticket[] = [];

  inProgress: Ticket[] = [];

  resolved: Ticket[] = [];

  testing: Ticket[] = [];

  done: Ticket[] = [];

  filteredTodo = [...this.todo];
  filteredInProgress = [...this.inProgress];
  filteredResolved = [...this.resolved];
  filteredTesting = [...this.testing];
  filteredDone = [...this.done];

  searchTerm = '';
  selectedAssignee = '';
  selectedStatus: '' | 'todo' | 'in_progress' | 'resolved' | 'testing' | 'done' = '';

  isEditModalVisible = false;
  isCreateModalVisible = false;
  isDeleteModalVisible = false;
  selectedTicket: Ticket | null = null;
  editTitle = '';
  editDescription = '';
  editPriority: 'low' | 'medium' | 'high' = 'medium';
  editAssignedTo = '';
  editAssignedToId: number | null = null;
  editStatus: 'todo' | 'in_progress' | 'resolved' | 'testing' | 'done' = 'todo';

  constructor(
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.loadAssignees();
    this.loadTickets();
  }

  private loadAssignees() {
    this.ticketService.getAssignes().subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.assignees = users;
        }
      },
      error: () => {}
    });
  }

  private loadTickets() {
    this.ticketService.getTickets({}).subscribe({
      next: (res) => {
        const items = res.tickets || [];
        this.todo = items.filter(t => t.status === 'todo');
        this.inProgress = items.filter(t => t.status === 'in_progress');
        this.resolved = items.filter(t => t.status === 'resolved');
        this.testing = items.filter(t => t.status === 'testing');
        this.done = items.filter(t => t.status === 'done');
        this.filteredTodo = [...this.todo];
        this.filteredInProgress = [...this.inProgress];
        this.filteredResolved = [...this.resolved];
        this.filteredTesting = [...this.testing];
        this.filteredDone = [...this.done];
        this.applyFilter();
      }
    });
  }

  openCreate() {
    this.editTitle = '';
    this.editDescription = '';
    this.editPriority = 'medium';
    this.editAssignedTo = this.users.length > 0 ? this.users[0] : '';
    this.editStatus = 'todo';
    this.isCreateModalVisible = true;
  }

  closeCreateModal() {
    this.isCreateModalVisible = false;
  }

  saveCreate() {
    const title = this.editTitle.trim();
    if (!title) { this.closeCreateModal(); return; }
    const dto = { 
      title, 
      description: this.editDescription,
      priority: this.editPriority, 
      status: this.editStatus as TicketStatus, 
      assignedToId: this.editAssignedToId ?? undefined
    };
    this.ticketService.createTicket(dto).subscribe({
      next: (created) => {
        if (created.status === 'todo') this.todo.unshift(created);
        else if (created.status === 'in_progress') this.inProgress.unshift(created);
        else if (created.status === 'resolved') this.resolved.unshift(created);
        else if (created.status === 'testing') this.testing.unshift(created);
        else this.done.unshift(created);
        this.applyFilter();
        this.closeCreateModal();
      },
      error: () => {
        this.closeCreateModal();
      }
    });

  }

  drop(event: CdkDragDrop<Ticket[]>) {
    const prevId = event.previousContainer.id;
    const targetId = event.container.id;

    const getArr = (id: string) => {
      if (id === 'todoList') return this.todo;
      if (id === 'inProgressList') return this.inProgress;
      if (id === 'resolvedList') return this.resolved;
      if (id === 'testingList') return this.testing;
      if (id === 'doneList') return this.done;
      return this.todo;
    };

    if (prevId !== targetId) {
      const item = event.item.data as { id: string };
      const src = getArr(prevId);
      const dst = getArr(targetId);
      const idx = src.findIndex(x => x.id === item.id);
      if (idx > -1) {
        const [moved] = src.splice(idx, 1);
        let newStatus: TicketStatus = 'todo';
        if (targetId === 'todoList') newStatus = 'todo';
        else if (targetId === 'inProgressList') newStatus = 'in_progress';
        else if (targetId === 'resolvedList') newStatus = 'resolved';
        else if (targetId === 'testingList') newStatus = 'testing';
        else if (targetId === 'doneList') newStatus = 'done';
        moved.status = newStatus;
        dst.splice(event.currentIndex, 0, moved);
        this.ticketService.moveTicket(moved.id, newStatus).subscribe({ next: () => {}, error: () => {} });
      }
    }
    this.applyFilter();
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.applyFilter();
  }

  applyFilter() {
    const q = this.searchTerm.toLowerCase();
    const assignee = this.selectedAssignee;
    const status = this.selectedStatus;
    const match = (t: { title: string; id: string; assignedTo: string; status: string }) =>
      (!q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) &&
      (!assignee || t.assignedTo === assignee) &&
      (!status || t.status === status);
    this.filteredTodo = this.todo.filter(match);
    this.filteredInProgress = this.inProgress.filter(match);
    this.filteredResolved = this.resolved.filter(match);
    this.filteredTesting = this.testing.filter(match);
    this.filteredDone = this.done.filter(match);
  }

  openEdit(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.editTitle = ticket.title;
    this.editDescription = ticket.description || '';
    this.editPriority = ticket.priority;
    this.editAssignedTo = ticket.assignedTo;
    const matched = this.assignees.find(a => a.username === ticket.assignedTo);
    this.editAssignedToId = matched ? matched.id : null;
    this.editStatus = ticket.status;
    this.isEditModalVisible = true;
  }

  closeEditModal() {
    this.isEditModalVisible = false;
    this.selectedTicket = null;
  }

  saveEdit() {
    if (!this.selectedTicket) return;
    const id = this.selectedTicket.id;
    const dto = {
      title: this.editTitle.trim() || undefined,
      description: this.editDescription,
      priority: this.editPriority,
      assignedToId: this.editAssignedToId ?? undefined,
      status: this.editStatus as TicketStatus,
    };
    const prevStatus = this.selectedTicket.status;
    this.ticketService.updateTicket(id, dto).subscribe({
      next: (updated: Ticket) => {
        const removeFrom = (arr: any[]) => {
          const idx = arr.findIndex(x => x.id === id);
          if (idx > -1) arr.splice(idx, 1);
        };
        removeFrom(this.todo);
        removeFrom(this.inProgress);
        removeFrom(this.resolved);
        removeFrom(this.testing);
        removeFrom(this.done);
        if (updated.status === 'todo') this.todo.unshift(updated);
        else if (updated.status === 'in_progress') this.inProgress.unshift(updated);
        else if (updated.status === 'resolved') this.resolved.unshift(updated);
        else if (updated.status === 'testing') this.testing.unshift(updated);
        else this.done.unshift(updated);
        this.applyFilter();
        this.closeEditModal();
      },
      error: () => {
        this.closeEditModal();
      }
    });
  }

  openDelete(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.isDeleteModalVisible = true;
  }

  closeDeleteModal() {
    this.isDeleteModalVisible = false;
    this.selectedTicket = null;
  }

  confirmDelete() {
    if (!this.selectedTicket) return;
    const id = this.selectedTicket.id;
    this.ticketService.deleteTicket(id).subscribe({
      next: () => {
        const remove = (arr: any[]) => {
          const idx = arr.findIndex(x => x.id === id);
          if (idx > -1) arr.splice(idx, 1);
        };
        remove(this.todo);
        remove(this.inProgress);
        remove(this.resolved);
        remove(this.testing);
        remove(this.done);
        this.applyFilter();
        this.closeDeleteModal();
      },
      error: () => {
        this.closeDeleteModal();
      }
    });
  }
}
