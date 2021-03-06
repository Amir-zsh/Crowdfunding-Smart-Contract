pragma solidity ^0.4.0;


contract SimpleICO {

    //***********************************************
    //****************** variables ******************
    //***********************************************
    
    address public owner;
    uint public totalSupply;
    uint public goal;
    uint public tokenPrice;
    uint public deadline;
    uint public totalFundersNum;


    mapping (address => uint) tokenBalance;

    
    //***********************************************
    //****************** events *********************
    //***********************************************
    
    event Contribution(address indexed _contributor, uint _purchasedTokens, uint _tokensRemaining);
    event GoalReached();
    event Refund(address indexed _contributor,uint _amount, bool _canRefund);
    
    //***********************************************
    //****************** modifiers ******************
    //***********************************************

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
    
    //*************************************************
    //****************** Constructor ******************
    //*************************************************

    function SimpleICO(uint _totalSupply, uint256 _deadline) {
        //totalSuply init added;
        owner = msg.sender;
        totalSupply = _totalSupply;
        tokenPrice = 10**16;
        tokenBalance[owner] = totalSupply;
        goal = (totalSupply * tokenPrice * 7) / 10;
        deadline = now + _deadline;
    }

    
    //****************************************************
    //****************** Getter/Setters ******************
    //****************************************************
    
    function getTokenBalance(address x) view returns(uint){
        return tokenBalance[x];
    }

    function currentFunding() view returns (uint) {
        return this.balance;
    }
    
    function getGoalAsTokens() view returns (uint) {
        return (totalSupply * 7) / 10;
    }
    
    
    //***********************************************
    //****************** functions ******************
    //***********************************************

    function contribute() onlyBefore(deadline) payable {

        // current this.balance is previous this.balance + msg.value at the begining of the function
        require(this.balance - msg.value < goal);
        if(tokenBalance[msg.sender] == 0) totalFundersNum += 1;

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

        tokenBalance[owner] -= purchasedTokens;
        tokenBalance[msg.sender] += purchasedTokens;
        Contribution(msg.sender, purchasedTokens, (goal - this.balance) / tokenPrice);
    }
    
    function payout() onlyAfter(deadline) onlyIfGoalReached() {
        owner.transfer(this.balance);
    }
    
    function refund() {
        var amount = tokenBalance[msg.sender];
        if(now > deadline && this.balance < goal && amount != 0) {
            // re-entrancy attack resistant
            tokenBalance[msg.sender] = 0;
            msg.sender.transfer(amount * tokenPrice);
            Refund(msg.sender,amount,true);
        }
        else{
            Refund(msg.sender,amount,false);
        }
    }

    function disable() {
        if(this.balance != 0) revert();
        selfdestruct(owner);
    }

}
