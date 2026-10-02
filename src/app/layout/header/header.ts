import { ActiveUser } from '../active-user/active-user';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserSelector } from '../user-selector/user-selector';

@Component({
  imports: [ActiveUser, RouterLink, UserSelector],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html'
})
export class Header {}
