export default class AccessToken {
    token: string;
    expiresIn: number;
    createdAt: Date | null;
    get isExpired(): boolean;
    get isValid(): boolean;
    get isEmpty(): boolean;
    get expiration(): Date;
    updateFromTokenResponse(tokenResponse: any): void;
    get authorizationHeader(): string | null;
    clear(): void;
}
//# sourceMappingURL=access-token.d.ts.map