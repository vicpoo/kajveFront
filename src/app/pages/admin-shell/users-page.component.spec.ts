//users-page.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UsersPageComponent } from './users-page.component';
import { UserService } from '../../services/user.service';

describe('UsersPageComponent', () => {
  let fixture: ComponentFixture<UsersPageComponent>;
  let component: UsersPageComponent;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj(
      'UserService',
      ['loadAdminUsers', 'createUser', 'updateUser', 'deleteUser', 'updateUserState'],
      {
        users: signal([]),
        isLoading: signal(false)
      }
    );

    userServiceSpy.loadAdminUsers.and.resolveTo();
    userServiceSpy.createUser.and.resolveTo({
      id_usuario: 99,
      email: 'admin@example.com',
      nombre: 'Admin Demo',
      rol: 'administrador',
      estado: 'activo',
      telefono: '5550000',
      fecha_registro: '2024-01-01'
    });

    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create a user and refresh the list after saving', async () => {
    component.userForm = {
      nombre: 'Admin Demo',
      email: 'admin@example.com',
      rol: 'administrador',
      password: 'secret123',
      telefono: '5550000'
    };

    await component.guardarUsuario();

    expect(userService.createUser).toHaveBeenCalled();
    expect(component.editingUserId).toBeNull();
  });
});
