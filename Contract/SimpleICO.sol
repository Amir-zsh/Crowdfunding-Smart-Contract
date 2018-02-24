pragma solidity ^0.4.0;


contract SimpleICO {

    address public beneficiary;
    address public owner;
    uint public totalSupply;
    uint public goal;
    uint public deadline;
    uint public totalFundersNum;

    mapping (address => uint) funders;

    event Contribution(address _contributor, uint _amount, uint _amountRemaining);
    event DeadlineReached(address _contributor, uint _amount, uint _amountRemaining);
    event GoalReached();

    modifier onlyAfter(uint _time) {
        require(now > _time);
        _;
    }

    modifier onlyIfGoalReached() {
        require(this.balance >= goal);
        _;
    }

    function SimpleICO(address _beneficiary, uint _totalSupply, uint _goal, uint _deadline) {
        //totalSuply init added;
        totalSupply = _totalSupply;
        owner = msg.sender;
        beneficiary = _beneficiary;
        goal = _goal;
        deadline = now + _deadline;
    }

    function currentFunding() view returns (uint) {
        return this.balance;
    }

    function contribute() payable {
        if(funders[msg.sender] == 0) totalFundersNum += 1;
        funders[msg.sender] += msg.value;
        // What if balance passes goal?
        Contribution(msg.sender, msg.value, goal - this.balance);
        if (this.balance > goal) GoalReached();
    }

    function payout() onlyAfter(deadline) onlyIfGoalReached() {
        beneficiary.transfer(this.balance);
    }

    function refund() {
        var amount = funders[msg.sender];
        if(now > deadline && this.balance < goal && amount != 0) {
            // re-entrancy attack resistant
            funders[msg.sender] = 0;
            msg.sender.transfer(amount);
        }
    }

    function disable() {
        if(this.balance != 0) throw;
        selfdestruct(beneficiary);
    }

}
