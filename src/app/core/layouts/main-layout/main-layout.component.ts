import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  imports: [RouterModule, CommonModule]
})
export class MainLayoutComponent {
  isDropdownvisible: boolean = false;

  toggleDropdown() {
    this.isDropdownvisible = !this.isDropdownvisible;
  }
}
