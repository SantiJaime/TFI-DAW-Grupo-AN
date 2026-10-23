import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
