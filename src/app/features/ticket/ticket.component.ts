import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../shared/components/components.module';
import { TicketService } from './services/ticket.service';
import { TicketStatus } from './models/ticket.model';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule, ComponentsModule],
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css'],
})
export class TicketComponent implements OnInit {
  users = ['Alice', 'Bob', 'Charlie', 'Dana'];

  todo: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string }[] = [
    { id: 'T-101', title: 'Set up project board', priority: 'medium', status: 'todo', assignedTo: 'Alice' },
    { id: 'T-102', title: 'Design ticket model', priority: 'high', status: 'todo', assignedTo: 'Bob' },
    { id: 'T-103', title: 'Create API stubs', priority: 'low', status: 'todo', assignedTo: 'Charlie' },
  ];

  inProgress: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string }[] = [
    { id: 'T-201', title: 'Implement login', priority: 'high', status: 'in_progress', assignedTo: 'Dana' },
    { id: 'T-202', title: 'User list pagination', priority: 'medium', status: 'in_progress', assignedTo: 'Alice' },
  ];

  done: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string }[] = [
    { id: 'T-301', title: 'Add global styles', priority: 'low', status: 'done', assignedTo: 'Bob' },
  ];

  filteredTodo = [...this.todo];
  filteredInProgress = [...this.inProgress];
  filteredDone = [...this.done];

  searchTerm = '';
  selectedAssignee = '';
  selectedStatus: '' | 'todo' | 'in_progress' | 'done' = '';

  isEditModalVisible = false;
  isCreateModalVisible = false;
  isDeleteModalVisible = false;
  selectedTicket: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string } | null = null;
  editTitle = '';
  editPriority: 'low' | 'medium' | 'high' = 'medium';
  editAssignedTo = '';
  editStatus: 'todo' | 'in_progress' | 'done' = 'todo';

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets() {
    this.ticketService.getTickets({ page: 1, pageSize: 1000 }).subscribe({
      next: (res) => {
        const items = res.tickets || [];
        this.todo = items.filter(t => t.status === 'todo');
        this.inProgress = items.filter(t => t.status === 'in_progress');
        this.done = items.filter(t => t.status === 'done');
        this.filteredTodo = [...this.todo];
        this.filteredInProgress = [...this.inProgress];
        this.filteredDone = [...this.done];
        this.applyFilter();
      }
    });
  }

  openCreate() {
    this.editTitle = '';
    this.editPriority = 'medium';
    this.editAssignedTo = this.users[0];
    this.editStatus = 'todo';
    this.isCreateModalVisible = true;
  }

  closeCreateModal() {
    this.isCreateModalVisible = false;
  }

  saveCreate() {
    const title = this.editTitle.trim();
    if (!title) { this.closeCreateModal(); return; }
    const dto = { title, priority: this.editPriority, status: this.editStatus as TicketStatus, assignedTo: this.editAssignedTo };
    this.ticketService.createTicket(dto).subscribe({
      next: (created) => {
        if (created.status === 'todo') this.todo.unshift(created);
        else if (created.status === 'in_progress') this.inProgress.unshift(created);
        else this.done.unshift(created);
        this.applyFilter();
        this.closeCreateModal();
      },
      error: () => {
        this.closeCreateModal();
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const moved = event.container.data[event.currentIndex];
      const target = event.container.id;
      let newStatus: TicketStatus = 'todo';
      if (target === 'todoList') newStatus = 'todo';
      else if (target === 'inProgressList') newStatus = 'in_progress';
      else if (target === 'doneList') newStatus = 'done';
      moved.status = newStatus;
      this.ticketService.moveTicket(moved.id, newStatus).subscribe({
        next: () => {},
        error: () => {}
      });
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
    this.filteredDone = this.done.filter(match);
  }

  openEdit(ticket: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string }) {
    this.selectedTicket = ticket;
    this.editTitle = ticket.title;
    this.editPriority = ticket.priority;
    this.editAssignedTo = ticket.assignedTo;
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
      priority: this.editPriority,
      assignedTo: this.editAssignedTo,
      status: this.editStatus as TicketStatus,
    };
    const prevStatus = this.selectedTicket.status;
    this.ticketService.updateTicket(id, dto).subscribe({
      next: (updated) => {
        const removeFrom = (arr: any[]) => {
          const idx = arr.findIndex(x => x.id === id);
          if (idx > -1) arr.splice(idx, 1);
        };
        removeFrom(this.todo);
        removeFrom(this.inProgress);
        removeFrom(this.done);
        if (updated.status === 'todo') this.todo.unshift(updated);
        else if (updated.status === 'in_progress') this.inProgress.unshift(updated);
        else this.done.unshift(updated);
        this.applyFilter();
        this.closeEditModal();
      },
      error: () => {
        this.closeEditModal();
      }
    });
  }

  openDelete(ticket: { id: string; title: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in_progress' | 'done'; assignedTo: string }) {
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
