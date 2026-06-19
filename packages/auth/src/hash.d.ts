export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
