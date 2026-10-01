import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html'
})
export class Header {
  protected readonly name = 'Current user';
  protected readonly initial = this.name.charAt(0).toUpperCase();
}
