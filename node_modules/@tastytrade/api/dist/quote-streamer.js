import { DXLinkWebSocketClient, DXLinkFeed, FeedContract, FeedDataFormat } from '@dxfeed/dxlink-api';
import _ from 'lodash';
// TODO: Make sure this works in node and we don't have to override the global Websocket class
export var MarketDataSubscriptionType;
(function (MarketDataSubscriptionType) {
    MarketDataSubscriptionType["Candle"] = "Candle";
    MarketDataSubscriptionType["Quote"] = "Quote";
    MarketDataSubscriptionType["Trade"] = "Trade";
    MarketDataSubscriptionType["Summary"] = "Summary";
    MarketDataSubscriptionType["Profile"] = "Profile";
    MarketDataSubscriptionType["Greeks"] = "Greeks";
    MarketDataSubscriptionType["Underlying"] = "Underlying";
})(MarketDataSubscriptionType || (MarketDataSubscriptionType = {}));
const ALL_EVENT_TYPES = [
    MarketDataSubscriptionType.Quote,
    MarketDataSubscriptionType.Trade,
    MarketDataSubscriptionType.Summary,
    MarketDataSubscriptionType.Profile,
    MarketDataSubscriptionType.Greeks,
    MarketDataSubscriptionType.Underlying
];
export var CandleType;
(function (CandleType) {
    CandleType["Tick"] = "t";
    CandleType["Second"] = "s";
    CandleType["Minute"] = "m";
    CandleType["Hour"] = "h";
    CandleType["Day"] = "d";
    CandleType["Week"] = "w";
    CandleType["Month"] = "mo";
    CandleType["ThirdFriday"] = "o";
    CandleType["Year"] = "y";
    CandleType["Volume"] = "v";
    CandleType["Price"] = "p";
})(CandleType || (CandleType = {}));
export default class QuoteStreamer {
    constructor(accountsAndCustomersService, logger) {
        this.accountsAndCustomersService = accountsAndCustomersService;
        this.logger = logger;
        this.dxLinkFeed = null;
        this.dxLinkUrl = null;
        this.dxLinkAuthToken = null;
        this.eventListeners = [];
    }
    /**
     * Connects to the DxLink WebSocket and sets up the feed
     * Make sure to call disconnect() when done
     * Calls `getApiQuoteToken` to get the connection URL and auth token
     * Make sure you have a valid session or access token before calling this
     */
    async connect() {
        const tokenResponse = await this.accountsAndCustomersService.getApiQuoteToken();
        this.dxLinkUrl = _.get(tokenResponse, 'dxlink-url');
        this.dxLinkAuthToken = _.get(tokenResponse, 'token');
        const client = new DXLinkWebSocketClient();
        client.connect(this.dxLinkUrl);
        client.setAuthToken(this.dxLinkAuthToken);
        this.dxLinkFeed = new DXLinkFeed(client, FeedContract.AUTO);
        this.dxLinkFeed.configure({
            acceptAggregationPeriod: 10,
            acceptDataFormat: FeedDataFormat.COMPACT
        });
        this.eventListeners.forEach(listener => this.dxLinkFeed.addEventListener(listener));
    }
    disconnect() {
        if (_.isNil(this.dxLinkFeed)) {
            return;
        }
        this.eventListeners.forEach(listener => this.removeEventListener(listener));
        this.dxLinkFeed = null;
    }
    // Returns a function that can be called to remove the listener
    addEventListener(listener) {
        this.eventListeners.push(listener);
        if (this.dxLinkFeed) {
            this.dxLinkFeed.addEventListener(listener);
        }
        return () => {
            this.removeEventListener(listener);
        };
    }
    removeEventListener(listenerToRemove) {
        _.remove(this.eventListeners, listener => listener === listenerToRemove);
        if (this.dxLinkFeed) {
            this.dxLinkFeed.removeEventListener(listenerToRemove);
        }
    }
    subscribe(streamerSymbols, types = null) {
        if (_.isNil(this.dxLinkFeed)) {
            throw new Error('DxLink feed is not connected');
        }
        types = types ?? ALL_EVENT_TYPES;
        streamerSymbols.forEach(symbol => {
            types.forEach(type => {
                this.dxLinkFeed.addSubscriptions({ type, symbol });
            });
        });
    }
    unsubscribe(streamerSymbols) {
        if (_.isNil(this.dxLinkFeed)) {
            throw new Error('DxLink feed is not connected');
        }
        streamerSymbols.forEach(symbol => {
            ALL_EVENT_TYPES.forEach(type => {
                this.dxLinkFeed.removeSubscriptions({ type, symbol });
            });
        });
    }
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
    subscribeCandles(streamerSymbol, fromTime, period, type) {
        // Example: AAPL{=5m} where each candle represents 5 minutes of data
        const candleSymbol = `${streamerSymbol}{=${period}${type}}`;
        if (_.isNil(this.dxLinkFeed)) {
            throw new Error('DxLink feed is not connected');
        }
        this.dxLinkFeed.addSubscriptions({
            type: MarketDataSubscriptionType.Candle,
            symbol: candleSymbol,
            fromTime
        });
    }
}
//# sourceMappingURL=quote-streamer.js.map