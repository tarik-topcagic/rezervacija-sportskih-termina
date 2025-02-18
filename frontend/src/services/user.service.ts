import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { User } from '../app/interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  private profileRefresh = new BehaviorSubject<void>(undefined);

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<User> {
    // return this.http.get<User>(`${this.apiUrl}/my-profile`);
    return this.profileRefresh.pipe(
      switchMap(() => this.http.get<User>(`${this.apiUrl}/my-profile`)),
    );
  }

  // Dodajte metodu za osvježavanje
  refreshProfile(): void {
    this.profileRefresh.next();
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-user`, data);
  }

  uploadProfilePicture(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload-profile-picture`, formData);
  }

  deleteProfilePicture(): Observable<any> {
    return this.http.delete('api/user/delete-profile-picture');
  }
}
