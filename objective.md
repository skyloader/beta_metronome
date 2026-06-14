# Objective
Tastytrade 계정에서 현재 Stock, Option이 control하는 자금의 규모를 계산하고, 이를 바탕으로 QQQ Put option을 몇개를 사야 hedge가 되는지 실시간으로 계산하여 보여주는 dashboard를 구성한다

# Tastytrade access token infomation
token.info 를 활용한다.

# Target account
5WX57665 account 값을 보여주되, 콤보박스로 선택이 account선택이 가능해야 하고, 각 account에 맞는 값을 계산하여 보여준다.

# 자금 규모 계산법
Sum of all stock's ( (stock number * stock price) + Nubmer of Stock's Deep ITM Call * 100 * Stock's Deep ITM Call's Delta value )

# Tastytrade API guide link
https://developer.tastytrade.com/
