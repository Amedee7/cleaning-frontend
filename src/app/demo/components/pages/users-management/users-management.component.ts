import { Component, OnInit } from '@angular/core';
import {UserService} from "./user.service";
import {CommonModule, DatePipe, NgForOf, NgIf} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {InputTextModule} from "primeng/inputtext";
import {ConfirmationService, MessageService, SharedModule} from "primeng/api";
import {TableModule} from "primeng/table";
import {ToastModule} from "primeng/toast";
import {FieldsetModule} from "primeng/fieldset";
import {CheckboxModule} from "primeng/checkbox";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";

interface User {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    roles: { name: string }[];
    created_at: Date;
    updated_at: Date;

  }

  interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    updated_at: Date;
    created_at: Date;
    permissions?: Permission[];
  }

  interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    updated_at: Date;
    created_at: Date;
    checked?: boolean;
  }

@Component({
  selector: 'app-users-management',
  standalone: true,
    providers: [MessageService, ConfirmationService, DatePipe],
    imports: [
        ButtonModule,
        InputTextModule,
        TableModule,
        ToastModule,
        ConfirmDialogModule,
        DatePipe,
        NgForOf,
        NgIf,
        FieldsetModule,
        CheckboxModule,
        DialogModule,
        FormsModule,
    ],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit {
    isLoading = false;
    users: User[] = [];
    totalRecords: number = 0;
    pageSize = 10;
    activeTabIndex: number = 0;
    stepIndex = 1;

    roles: Role[] = [];
    visible = false;
    checkedPermissions: any[] = [];
    allPermissions: any[] = [];
    selectedRole: Role | null = null;
    rolesPermissions: Role[] = [];
    selectedUser: User | null = null;
    selectedUserRoles: Role[] = [];
    selectedUserPermissions: Permission[] = [];




    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
     this.loadUsers();
     this.loadRoles();
     this.getPermissions();
    }

    loadUsers() {
        this.isLoading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.users = data.map((user) => ({
                    ...user,
                    updated_at: new Date(user.updated_at),
                }));

                this.users.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.users.length;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching owners:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des propriétaires',
                });
            },
        });
    }

    loadRoles() {
        this.isLoading = true;
        this.userService.getRoles().subscribe({
            next: (data) => {
                this.roles = data;
                this.roles = data.map((role) => ({
                    ...role,
                    updated_at: new Date(role.updated_at),
                }));

                this.roles.sort(
                    (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
                );
                this.totalRecords = this.roles.length;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching owners:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des propriétaires',
                });
            },
        });
    }

    getPermissions() {
        this.userService.getPermissions().subscribe({
          next: (data) => {
            this.allPermissions = data.map(permission => ({ ...permission, checked: false })); // Initialiser 'checked' à false pour toutes les permissions
          },
          error: (error) => {
            console.error('Erreur lors de la récupération de toutes les permissions', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du chargement de toutes les permissions',
            });
          },
        });
      }

      getRolePermissions(roleId: number) {
        this.userService.getRolePermissions(roleId).subscribe({
          next: (data) => {
            this.selectedRole = data.role;
            // Marquer les permissions du rôle comme 'checked' dans la liste de toutes les permissions
            this.rolesPermissions = this.allPermissions.map(permission => ({
              ...permission,
              checked: this.selectedRole?.permissions?.some(rolePerm => rolePerm.id === permission.id) || false,
            }));
          },
          error: (error) => {
            console.error('Erreur lors de la récupération des permissions du rôle', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Erreur lors du chargement des permissions du rôle',
            });
          },
        });
      }

      viewRole(role: Role) {
        this.selectedRole = role;
        this.getPermissions(); // Charger toutes les permissions et initialiser 'checked' à false
        this.getRolePermissions(role.id); // Charger les permissions du rôle et mettre à jour l'état 'checked'
        this.visible = true;
      }

    // updateRolePermissionsForSelectedRole() {
    //     if (this.selectedRole) {
    //         const selectedPermissionIds = this.rolesPermissions
    //             .filter(permission => permission.checked)
    //             .map(permission => permission.id);
    //
    //         this.userService.updateRolePermissions(this.selectedRole.id, selectedPermissionIds).subscribe({
    //             next: () => {
    //                 this.messageService.add({
    //                     severity: 'success',
    //                     summary: 'Succès',
    //                     detail: 'Permissions du rôle mises à jour avec succès',
    //                 });
    //                 this.visible = false;
    //                 this.loadRoles(); // Rafraîchir la liste des rôles
    //             },
    //             error: (error) => {
    //                 console.error('Erreur lors de la mise à jour des permissions du rôle', error);
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Erreur',
    //                     detail: 'Erreur lors de la mise à jour des permissions du rôle',
    //                 });
    //             },
    //         });
    //     }
    // }


    deleteUser(userId: number) {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment supprimer cet utilisateur ?',
            accept: () => {
                this.userService.deleteUser(userId).subscribe({
                    next: () => {
                        this.users = this.users.filter((user) => user.id !== userId);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Utilisateur supprimé avec succès',
                        });
                    },
                    error: (error) => {
                        console.error('Erreur lors de la suppression de l\'utilisateur', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Erreur lors de la suppression de l\'utilisateur',
                        });
                    },
                });
            },
        });
    }
}

