import extractResponseData from "../utils/response-util.js";
export default class WatchlistsService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    //Pairs Watchlists: Allows an API client to fetch pairs watchlists.
    async getPairsWatchlists() {
        //Returns a list of all tastyworks pairs watchlists
        const pairsWatchlists = await this.httpClient.getData(`/pairs-watchlists`, {}, {});
        return extractResponseData(pairsWatchlists);
    }
    async getPairsWatchlist(pairsWatchlistName) {
        //Returns a requested tastyworks pairs watchlist
        const pairsWatchlist = await this.httpClient.getData(`/pairs-watchlists/${pairsWatchlistName}`, {}, {});
        return extractResponseData(pairsWatchlist);
    }
    //Public Watchlists: Allows an API client to fetch tastyworks watchlists.
    async getPublicWatchlists(countsOnly = false) {
        //Returns a list of all tastyworks watchlists
        const publicWatchlists = await this.httpClient.getData(`/public-watchlists`, {}, { 'counts-only': countsOnly });
        return extractResponseData(publicWatchlists);
    }
    async getPublicWatchlist(watchlistName) {
        //Returns a requested tastyworks watchlist
        const publicWatchlist = await this.httpClient.getData(`/public-watchlists/${watchlistName}`, {}, {});
        return extractResponseData(publicWatchlist);
    }
    //User Watchlists: Allows an API client to fetch a user's watchlists.
    async createAccountWatchlist(watchlist) {
        //Create an account watchlist
        const accountWatchlist = await this.httpClient.postData(`/watchlists`, watchlist, {});
        return extractResponseData(accountWatchlist);
    }
    async getAllWatchlists() {
        //Returns a list of all watchlists for the given account
        const allWatchlists = await this.httpClient.getData(`/watchlists`, {}, {});
        return extractResponseData(allWatchlists);
    }
    async replaceWatchlist(watchlistName, replacementWatchlist) {
        //Replace all properties of an account watchlist
        const watchlist = await this.httpClient.putData(`/watchlists/${watchlistName}`, replacementWatchlist, {});
        return extractResponseData(watchlist);
    }
    async deleteWatchlist(watchlistName) {
        //Delete a watchlist for the given account
        const watchlist = await this.httpClient.deleteData(`/watchlists/${watchlistName}`, {});
        return extractResponseData(watchlist);
    }
    async getSingleWatchlist(watchlistName) {
        //Returns a requested account watchlist
        const singleWatchlist = await this.httpClient.getData(`/watchlists/${watchlistName}`, {}, {});
        return extractResponseData(singleWatchlist);
    }
}
//# sourceMappingURL=watchlists-service.js.map