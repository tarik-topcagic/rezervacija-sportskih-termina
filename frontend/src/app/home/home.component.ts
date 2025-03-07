import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    document.body.classList.add('home-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('home-page');
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}








