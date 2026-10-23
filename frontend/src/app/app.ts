import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Navbar } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
