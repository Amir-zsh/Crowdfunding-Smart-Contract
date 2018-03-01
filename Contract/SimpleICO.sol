pragma solidity ^0.4.0;


contract SimpleICO {

    address public owner;
    uint public totalSupply;
    uint public goal;
    uint public tokenPrice;
    uint public deadline;
    uint public totalFundersNum;
    fixed public fake;

    mapping (address => uint) funders;
    mapping (address => uint) tokenBalance;


    event Contribution(address indexed _contributor, uint _amount, uint _amountRemaining);
    event GoalReached();

    modifier onlyAfter(uint _time) {
        require(now > _time);
        _;
    }

    modifier onlyBefore(uint _time) {
        require(now < _time);
        _;
    }

    modifier onlyIfGoalReached() {
        require(this.balance >= goal);
        _;
    }

    function SimpleICO(uint _totalSupply, uint _deadline) {
        //totalSuply init added;
        owner = msg.sender;
        totalSupply = _totalSupply;
        tokenPrice = 10**16;
        tokenBalance[owner] = totalSupply;
        goal = (totalSupply * tokenPrice * 7) / 10;
        deadline = now + _deadline;
    }

    function test() {
        fake = 8 % 3;
    }

    function currentFunding() view returns (uint) {
        return this.balance;
    }

    function contribute() onlyBefore(deadline) payable {

        // current this.balance is previous this.balance + msg.value at the begining of the function
        require(this.balance - msg.value < goal);
        if(funders[msg.sender] == 0) totalFundersNum += 1;

        uint contributionAmount = msg.value;

        // What if balance passes goal?
        uint extraAmount = 0;
        if (this.balance > goal) {
            GoalReached();
            extraAmount = this.balance - goal;
            contributionAmount = contributionAmount - extraAmount;
        }

        uint remainder = contributionAmount % tokenPrice;
        uint purchasedTokens = contributionAmount / tokenPrice;

        extraAmount += remainder;
        msg.sender.transfer(extraAmount);

        funders[msg.sender] += contributionAmount;
        tokenBalance[msg.sender] += purchasedTokens;
        Contribution(msg.sender, contributionAmount, goal - this.balance);
    }

    function payout() onlyAfter(deadline) onlyIfGoalReached() {
        owner.transfer(this.balance);
    }

    function refund() {
        var amount = funders[msg.sender];
        if(now > deadline && this.balance < goal && amount != 0) {
            // re-entrancy attack resistant
            funders[msg.sender] = 0;
            msg.sender.transfer(amount);
        }
    }

    // assignment
    function transfer(address _to, uint _amount) returns (bool) {
        require(tokenBalance[msg.sender] > _amount);
        tokenBalance[msg.sender] -= _amount;
        tokenBalance[_to] += _amount;
        return true;
    }

    function disable() {
        if(this.balance != 0) throw;
        selfdestruct(owner);
    }

}
