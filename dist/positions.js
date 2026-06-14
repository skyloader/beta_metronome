"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountPositions = getAccountPositions;
exports.getCurrentPositions = getCurrentPositions;
// Get account positions
async function getAccountPositions(client, accountNumber) {
    try {
        // Use getCustomerAccounts to get accounts then extract positions
        const accounts = await client.accountsAndCustomersService.getCustomerAccounts();
        // Find the account with matching number
        const account = accounts.find((acc) => acc.account['account-number'] === accountNumber);
        if (!account) {
            throw new Error(`Account ${accountNumber} not found`);
        }
        // Get positions using the balances and positions service
        const positionsResponse = await client.balancesAndPositionsService.getDailyPositionHistory(accountNumber, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        new Date());
        console.log('Positions response type:', typeof positionsResponse);
        console.log('Positions response keys:', Object.keys(positionsResponse));
        return positionsResponse;
    }
    catch (error) {
        console.error('Error getting positions:', error);
        throw error;
    }
}
// Get current positions (simplified)
async function getCurrentPositions(client, accountNumber) {
    try {
        // Get positions using the balances and positions service
        // The API method is getPositionsList
        const positionsResponse = await client.balancesAndPositionsService.getPositionsList(accountNumber);
        console.log('Current positions response:', JSON.stringify(positionsResponse, null, 2));
        return positionsResponse;
    }
    catch (error) {
        console.error('Error getting current positions:', error);
        throw error;
    }
}
exports.default = {
    getAccountPositions,
    getCurrentPositions
};
//# sourceMappingURL=positions.js.map