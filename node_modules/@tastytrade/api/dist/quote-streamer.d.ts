import { DXLinkFeed, type DXLinkFeedEventListener } from '@dxfeed/dxlink-api';
import type AccountsAndCustomersService from './services/accounts-and-customers-service.js';
import type Logger from './logger.js';
export declare enum MarketDataSubscriptionType {
    Candle = "Candle",
    Quote = "Quote",
    Trade = "Trade",
    Summary = "Summary",
    Profile = "Profile",
    Greeks = "Greeks",
    Underlying = "Underlying"
}
export declare enum CandleType {
    Tick = "t",
    Second = "s",
    Minute = "m",
    Hour = "h",
    Day = "d",
    Week = "w",
    Month = "mo",
    ThirdFriday = "o",
    Year = "y",
    Volume = "v",
    Price = "p"
}
export default class QuoteStreamer {
    private readonly accountsAndCustomersService;
    private readonly logger;
    dxLinkFeed: DXLinkFeed<any> | null;
    dxLinkUrl: string | null;
    dxLinkAuthToken: string | null;
    eventListeners: DXLinkFeedEventListener[];
    constructor(accountsAndCustomersService: AccountsAndCustomersService, logger: Logger);
    /**
     * Connects to the DxLink WebSocket and sets up the feed
     * Make sure to call disconnect() when done
     * Calls `getApiQuoteToken` to get the connection URL and auth token
     * Make sure you have a valid session or access token before calling this
     */
    connect(): Promise<void>;
    disconnect(): void;
    addEventListener(listener: DXLinkFeedEventListener): () => void;
    removeEventListener(listenerToRemove: DXLinkFeedEventListener): void;
    subscribe(streamerSymbols: string[], types?: MarketDataSubscriptionType[] | null): void;
    unsubscribe(streamerSymbols: string[]): void;
    /**
     * Adds a candle subscription
     * @param streamerSymbol Get this from an instrument's streamer-symbol json response field
     * @param fromTime Epoch timestamp from where you want to start
     * @param period The duration of each candle
     * @param type The duration type of the period
     * For example, a period/type of 5/m means you want each candle to represent 5 minutes of data
     * From there, setting fromTime to 24 hours ago would give you 24 hours of data grouped in 5 minute intervals
     * @returns
     */
    subscribeCandles(streamerSymbol: string, fromTime: number, period: number, type: CandleType): void;
}
//# sourceMappingURL=quote-streamer.d.ts.map