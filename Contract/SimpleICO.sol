pragma solidity ^0.4.0;


contract SimpleICO {

    address public beneficiary;
    address public owner;
    uint public totalSupply;
    uint public goal;
    uint public deadline;
    uint public totalFundersNum;

    mapping (address => uint) funders;
    mapping (address => uint) tokenBalance;
    

    event Contribution(address indexed _contributor, uint _amount, uint _amountRemaining);
    event DeadlineReached(bool _canRefund);
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
    
    function SimpleICO(address _beneficiary, uint _totalSupply, uint _goal, uint _deadline) {
        //totalSuply init added;
        totalSupply = _totalSupply;
        owner = msg.sender;
        beneficiary = _beneficiary;
        goal = _goal*10**18;
        deadline = now + _deadline;
    }

    function currentFunding() view returns (uint) {
        return this.balance;
    }

    function contribute() onlyBefore(deadline) payable {
        require(this.balance < goal);
        if(funders[msg.sender] == 0) totalFundersNum += 1;
        
        uint contribuition_amount = msg.value;
        funders[msg.sender] += contribuition_amount;
        
        // What if balance passes goal?
        if (this.balance > goal) {
            GoalReached();
            uint extra_amount = this.balance - goal;
            msg.sender.transfer(extra_amount);
            contribuition_amount = contribuition_amount - extra_amount;
        }
        Contribution(msg.sender, contribuition_amount, goal - this.balance);
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



    function transfer(address _to, uint _amount) {
        
    }

    function disable() {
        if(this.balance != 0) throw;
        selfdestruct(beneficiary);
    }

}

