import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../app/interfaces/user";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = environment.apiUrl + '/users';

    constructor(private http: HttpClient){}

    getMyProfile() : Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/my-profile`);
    }
}