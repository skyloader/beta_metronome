import TastytradeHttpClient from "./tastytrade-http-client.js";
export default class WatchlistsService {
    private httpClient;
    constructor(httpClient: TastytradeHttpClient);
    getPairsWatchlists(): Promise<any>;
    getPairsWatchlist(pairsWatchlistName: string): Promise<any>;
    getPublicWatchlists(countsOnly?: boolean): Promise<any>;
    getPublicWatchlist(watchlistName: string): Promise<any>;
    createAccountWatchlist(watchlist: object): Promise<any>;
    getAllWatchlists(): Promise<any>;
    replaceWatchlist(watchlistName: string, replacementWatchlist: object): Promise<any>;
    deleteWatchlist(watchlistName: string): Promise<any>;
    getSingleWatchlist(watchlistName: string): Promise<any>;
}
//# sourceMappingURL=watchlists-service.d.ts.map