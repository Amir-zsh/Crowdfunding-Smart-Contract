function init() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    // var goal,deadline,tokenPrice;
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    addresses = web3.eth.accounts;

    abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "x",
                "type": "address"
            }
        ],
        "name": "getTokenBalance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalFundersNum",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "tokenPrice",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "currentFunding",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "deadline",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "goal",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_contributor",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_purchasedTokens",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_amountRemaining",
                "type": "uint256"
            }
        ],
        "name": "Contribution",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "GoalReached",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_contributor",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "name": "_canRefund",
                "type": "bool"
            }
        ],
        "name": "Refund",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "contribute",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_totalSupply",
                "type": "uint256"
            },
            {
                "name": "_deadline",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "refund",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "payout",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "disable",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }]

    SimpleICOContract = web3.eth.contract(abi);

    SimpleICOContract = SimpleICOContract.at('0xcf6cbd3a060f7421a12c35007cc3197658976182');


    contributionEvent = SimpleICOContract.Contribution({}, {fromBlock: 0, toBlock: 'latest'});
    goalReachedEvent = SimpleICOContract.GoalReached({});


    SimpleICOContract.goal.call(function (err, res) {
        goal = web3.fromWei(parseInt(res.toString()));
    });
    SimpleICOContract.deadline.call(function (err, res) {
        deadline = parseInt(res.toString()) * 1000;
    });
    SimpleICOContract.tokenPrice.call(function (err, res) {
        tokenPrice = parseInt(res.toString()) * 1000;
    });

    contributionEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var hash = result.transactionHash;
        var contributor = result.args._contributor.toString();
        var amount = result.args._purchasedTokens.toString();
        var amountRemaining = web3.fromWei(parseInt(result.args._amountRemaining.toString()));
        console.log("log");
        console.log(hash);
        setAsDone(hash, contributor, amount);
        updateProgressBar(amountRemaining);
    });
    goalReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        window.alert("GOAL REACHED")
    });

}


function refund(address) {
    SimpleICOContract.refund({},{from: address}, function (err, transactionHash) {
        if (err)
            return ;
        console.log(transactionHash);
        if (refundEvent) refundEvent.stopWatching();
        refundEvent = SimpleICOContract.Refund({_contributor: address});
        refundEvent.watch(function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            var hash = result.transactionHash;
            var contributor = result.args._contributor.toString()
            var amount = result.args._amount.toString();
            var canRefund = result.args._canRefund;
            if (canRefund)
                window.alert(contributor + " refunded " + amount  + " tokens");
            else
                window.alert("can't refund");
            refundEvent.stopWatching();
        });
    });

    console.log("refund")
}

function contribute(address, value) {
    SimpleICOContract.contribute({},{from: address, value: web3.toWei(value, "ether")}, function (err, transactionHash) {
        if (err)
            return;
        console.log("cont");
        console.log(transactionHash);
        addRow(transactionHash, address, "", "Pending");
    });
    console.log("contribute")
}


