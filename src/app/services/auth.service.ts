//app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  login(email: string, password: string) {
    return Promise.resolve({ success: true, email });
  }
}
