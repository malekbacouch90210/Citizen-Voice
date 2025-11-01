export interface LoginResponse {
    refresh: string;
    access: string;
    email: string;
    groups: string[];
    permissions: string[];
}