export interface User {
    username: string;
    roles: string[];
    groups: number[];
    valid?: boolean;
}
