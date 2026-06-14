import TastytradeClient from '@tastytrade/api';
import { getCurrentPositions } from './positions';
async function test() {
  const client = new TastytradeClient({
    baseUrl: 'https://api.tastyworks.com',
    accountStreamerUrl: 'wss://streamer.tastyworks.com',
    clientSecret: '396b944e7e31c47f9c66feea73b3b8a6b0aea231',
    refreshToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6InJ0K2p3dCIsImtpZCI6IlRheXJrYXNQSFh4bldSM2FkLTE0RDRweThrNDNiNG9LVjE1VmdDa0VjaE0iLCJqa3UiOiJodHRwczovL2FwaS50YXN0eXRyYWRlLmNvbS9vYXV0aC9qd2tzIn0.eyJpc3MiOiJodHRwczovL2FwaS50YXN0eXRyYWRlLmNvbSIsInN1YiI6IlU3YWM2OTljMy02M2MzLTRhYzYtYmQ2YS1mMjQ1ZDJlMGMwOTUiLCJpYXQiOjE3NzcxMzgzMDksImF1ZCI6IjQwYWY1NWMwLTkxZGUtNDU4Ny1iMTRiLTYzZjAxYTAzNWQwYyIsImdyYW50X2lkIjoiRzFhN2ViYWQ5LTNlZTktNGQxNC1iNDYyLTIyODdkYThkYzgyOSIsInNjb3BlIjoicmVhZCJ9.q9UzkPfM5VkX-xpaJlrZswMpQpUHXYZCi2J2sLcV5W2OgTrnHaNdRd9S8FMXT_yWRoX8Q3BI4ZOvGz-WAdh-CQ',
    oauthScopes: ['read', 'trade']
  });

  const positions = await getCurrentPositions(client, '5WX57665');
  console.log('Positions:', positions.length);
  const stocks = positions.filter((p: any) => p['instrument-type'] === 'Equity');
  console.log('Stocks:', stocks.length);
  stocks.forEach((s: any) => console.log(s['symbol'], s['quantity'], s['close-price']));
}

test().catch(console.error);
