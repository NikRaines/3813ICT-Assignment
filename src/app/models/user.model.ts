export interface User {
    username: string;
    email: string;
    role: string;
    groups: number[];
    appliedGroups: number[];
    valid: boolean;
}
