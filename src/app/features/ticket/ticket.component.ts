import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../shared/components/components.module';
import { User } from '../admin/models/user.model';
import { TicketService } from './services/ticket.service';
import { Ticket, TicketStatus } from './models/ticket.model';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, ComponentsModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css'],
})
export class TicketComponent implements OnInit {
  assignees: User[] = [];

  todo: Ticket[] = [];

  inProgress: Ticket[] = [];

  resolved: Ticket[] = [];

  testing: Ticket[] = [];

  closed: Ticket[] = [];

  filteredTodo = [...this.todo];
  filteredInProgress = [...this.inProgress];
  filteredResolved = [...this.resolved];
  filteredTesting = [...this.testing];
  filteredClosed = [...this.closed];

  searchTerm = '';
  selectedAssignee = '';
  selectedStatus: '' | 'todo' | 'in_progress' | 'resolved' | 'testing' | 'closed' = '';

  isEditModalVisible = false;
  isCreateModalVisible = false;
  isDeleteModalVisible = false;
  selectedTicket: Ticket | null = null;
  editTitle = '';
  editDescription = '';
  editPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  editAssignedTo: string | null = null;
  editStatus: 'todo' | 'in_progress' | 'resolved' | 'testing' | 'closed' = 'todo';
  editDueDate: string | null = null;
  editAttempted = false;
  editError: string | null = null;
  createAttempted = false;
  createError: string | null = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
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
        this.closed = items.filter(t => t.status === 'closed');
        this.filteredTodo = [...this.todo];
        this.filteredInProgress = [...this.inProgress];
        this.filteredResolved = [...this.resolved];
        this.filteredTesting = [...this.testing];
        this.filteredClosed = [...this.closed];
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
        // Initialize empty arrays on error to prevent display issues
        this.todo = [];
        this.inProgress = [];
        this.resolved = [];
        this.testing = [];
        this.closed = [];
        this.filteredTodo = [];
        this.filteredInProgress = [];
        this.filteredResolved = [];
        this.filteredTesting = [];
        this.filteredClosed = [];
      }
    });
  }

  openCreate() {
    this.editTitle = '';
    this.editDescription = '';
    this.editPriority = 'medium';
    this.editAssignedTo = this.assignees.length > 0 ? this.assignees[0].id : null;
    this.editStatus = 'todo';
    this.createAttempted = false;
    this.createError = null;
    this.isCreateModalVisible = true;
  }

  closeCreateModal() {
    this.isCreateModalVisible = false;
  }

  saveCreate() {
    const invalid = !this.editTitle || !this.editDescription || !this.editPriority || !this.editAssignedTo || !this.editDueDate;
    if (invalid) { this.createAttempted = true; return; }
    const dto = { 
      title: this.editTitle,
      description: this.editDescription,
      priority: this.editPriority,
      assignedTo: this.editAssignedTo ?? undefined,
      dueDate: this.editDueDate as string
    };
    this.ticketService.createTicket(dto).subscribe({
      next: (created) => {
        if (created.status === 'todo') this.todo.unshift(created);
        else if (created.status === 'in_progress') this.inProgress.unshift(created);
        else if (created.status === 'resolved') this.resolved.unshift(created);
        else if (created.status === 'testing') this.testing.unshift(created);
        else this.closed.unshift(created);
        this.applyFilter();
        this.closeCreateModal();
      },
      error: (err) => {
        const msg = (err && (err.error?.message || err.message)) || 'Failed to create ticket.';
        this.createError = msg;
        this.createAttempted = true;
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
      if (id === 'closedList') return this.closed;
      return this.todo;
    };
  
    if (prevId !== targetId) {
      const item = event.item.data as Ticket;
      const src = getArr(prevId);
      const dst = getArr(targetId);
      const idx = src.findIndex(x => x.id === item.id);
      if (idx > -1) {
        const moved = src[idx];
        
        // Check permissions: Admin can move any ticket, others can only move their assigned tickets
        const currentUserId = this.authService.currentUserId;
        const userRole = this.authService.role;
        const isAdmin = userRole === 'Admin' || userRole === 'admin';
        const isAssignedToUser = moved.assignedTo === currentUserId || 
                                 moved.assignee?.id === currentUserId;
        
        if (!isAdmin && !isAssignedToUser) {
          alert('You can only move tickets that are assigned to you.');
          return;
        }
        
        const [removed] = src.splice(idx, 1);
        const originalStatus = removed.status;
        
        let newStatus: TicketStatus = 'todo';
        if (targetId === 'todoList') newStatus = 'todo';
        else if (targetId === 'inProgressList') newStatus = 'in_progress';
        else if (targetId === 'resolvedList') newStatus = 'resolved';
        else if (targetId === 'testingList') newStatus = 'testing';
        else if (targetId === 'closedList') newStatus = 'closed';
  
        removed.status = newStatus;
        dst.splice(event.currentIndex, 0, removed);
        this.ticketService.moveTicket(removed.id, newStatus).subscribe({
          next: () => {},
          error: () => {
            const dstIdx = dst.findIndex(x => x.id === removed.id);
            if (dstIdx > -1) dst.splice(dstIdx, 1);
            removed.status = originalStatus;
            src.splice(idx, 0, removed);
            this.applyFilter();
          }
        });
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
    this.filteredClosed = this.closed.filter(match);
  }

  openEdit(ticket: Ticket) {
    this.selectedTicket = ticket;
    this.editTitle = ticket.title;
    this.editDescription = ticket.description || '';
    const validPriorities = ['low', 'medium', 'high'] as const;
    this.editPriority = (validPriorities as readonly string[]).includes(ticket.priority)
      ? ticket.priority as 'low' | 'medium' | 'high'
      : 'medium';
    const matchedById = this.assignees.find(a => a.id === ticket.assignedTo);
    const matchedByPopulateId = ticket.assignee?.id
      ? this.assignees.find(a => a.id === ticket.assignee!.id)
      : undefined;
    const matchedByPopulateUsername = ticket.assignee?.username
      ? this.assignees.find(a => a.username === ticket.assignee!.username)
      : undefined;
    const matched = matchedById || matchedByPopulateId || matchedByPopulateUsername;
    this.editAssignedTo = matched ? matched.id : ticket.assignedTo || null;
    this.editStatus = ticket.status;
    this.editDueDate = ticket.dueDate ? new Date(ticket.dueDate).toISOString().slice(0, 10) : null;
    this.editAttempted = false;
    this.editError = null;
    this.isEditModalVisible = true;
  }

  closeEditModal() {
    this.isEditModalVisible = false;
    this.selectedTicket = null;
  }

  saveEdit() {
    if (!this.selectedTicket) return;
    const invalid = !this.editTitle || !this.editDescription || !this.editPriority || !this.editAssignedTo || !this.editDueDate;
    if (invalid) { this.editAttempted = true; return; }
    const id = this.selectedTicket.id;
    const dto = {
      title: this.editTitle.trim() || undefined,
      description: this.editDescription,
      priority: this.editPriority,
      assignedTo: this.editAssignedTo ?? undefined,
      dueDate: this.editDueDate ?? this.selectedTicket?.dueDate ?? new Date().toISOString(),
      status: this.editStatus as TicketStatus,
    };
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
        removeFrom(this.closed);
        if (updated.status === 'todo') this.todo.unshift(updated);
        else if (updated.status === 'in_progress') this.inProgress.unshift(updated);
        else if (updated.status === 'resolved') this.resolved.unshift(updated);
        else if (updated.status === 'testing') this.testing.unshift(updated);
        else this.closed.unshift(updated);
        this.applyFilter();
        this.closeEditModal();
      },
      error: (err) => {
        this.editError = (err && (err.error?.message || err.message)) || 'Failed to update ticket.';
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
        remove(this.closed);
        this.applyFilter();
        this.closeDeleteModal();
      },
      error: () => {
        this.closeDeleteModal();
      }
    });
  }
}
