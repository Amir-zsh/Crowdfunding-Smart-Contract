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
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    addresses = web3.eth.accounts;

    abi = [
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
            "constant": true,
            "inputs": [],
            "name": "beneficiary",
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
                    "name": "_amountRemaining",
                    "type": "uint256"
                }
            ],
            "name": "Contribution",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "name": "_canRefund",
                    "type": "bool"
                }
            ],
            "name": "DeadlineReached",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [],
            "name": "GoalReached",
            "type": "event"
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
            "name": "contribute",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_beneficiary",
                    "type": "address"
                },
                {
                    "name": "_totalSupply",
                    "type": "uint256"
                },
                {
                    "name": "_goal",
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
        }
    ]

    SimpleICOContract = web3.eth.contract(abi);

    SimpleICOContract = SimpleICOContract.at('0x5ad9593bfb606ea80a5c9abf1696aa815ef7cb7f');

    deadlineReachedEvent = SimpleICOContract.DeadlineReached({});
    contributionEvent = SimpleICOContract.Contribution({}, {fromBlock: 0, toBlock: 'latest'});
    goalReachedEvent = SimpleICOContract.GoalReached({});

    SimpleICOContract.goal.call(function (err, res) {
        goal = parseInt(res.toString());
    });
    SimpleICOContract.deadline.call(function (err, res) {
        deadline = parseInt(res.toString()) * 1000;
    });

    contributionEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        updateProgressBar(result.args._amountRemaining.toString());
    });
    deadlineReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        temp = result;
        ICOFinished(result.args._canRefund);
    });
    goalReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        window.alert("GOAL REACHED")
    });

}

function addressChanged() {
    console.log("test");
    if (contributionOnlyAddressEvent)
        contributionOnlyAddressEvent.stopWatching();
    contributionOnlyAddressEvent = SimpleICOContract.Contribution({_contributor: $(this).val()}, {
        fromBlock: 0,
        toBlock: 'latest'
    });
    emptyTable()
    contributionOnlyAddressEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        var hash = result.transactionHash;
        var contributor = result.args._contributor.toString()
        var amount = result.args._amount.toString()
        setAsDone(hash, contributor, amount);
    });
}

function refund(address) {
    SimpleICOContract.refund({from: address}, function () {
    });
    console.log("refund")
}

function contribute(address, amount) {
    SimpleICOContract.contribute({from: address, value: amount}, function (err, result) {
        var trasactionHash = result;
        addRow(trasactionHash, address, amount, "Pending");
    });
    console.log("contribute")
}











$(document).ready(function () {



    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    // if (typeof web3 !== 'undefined') {
    //     // Use Mist/MetaMask's provider
    //     web3 = new Web3(web3.currentProvider);
    // } else {
    //     console.log('No web3? You should consider trying MetaMask!')
    //     // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    // }

    // Now you can start your app & access web3 freely:
    // startApp()
    // // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    // var addresses = web3.eth.accounts;
    //
    // abi = [
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "totalSupply",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "beneficiary",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "address"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "currentFunding",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "owner",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "address"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "goal",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "totalFundersNum",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "constant": true,
    //         "inputs": [],
    //         "name": "deadline",
    //         "outputs": [
    //             {
    //                 "name": "",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "view",
    //         "type": "function"
    //     },
    //     {
    //         "anonymous": false,
    //         "inputs": [
    //             {
    //                 "indexed": true,
    //                 "name": "_contributor",
    //                 "type": "address"
    //             },
    //             {
    //                 "indexed": false,
    //                 "name": "_amount",
    //                 "type": "uint256"
    //             },
    //             {
    //                 "indexed": false,
    //                 "name": "_amountRemaining",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "name": "Contribution",
    //         "type": "event"
    //     },
    //     {
    //         "anonymous": false,
    //         "inputs": [
    //             {
    //                 "indexed": false,
    //                 "name": "_canRefund",
    //                 "type": "bool"
    //             }
    //         ],
    //         "name": "DeadlineReached",
    //         "type": "event"
    //     },
    //     {
    //         "anonymous": false,
    //         "inputs": [],
    //         "name": "GoalReached",
    //         "type": "event"
    //     },
    //     {
    //         "constant": false,
    //         "inputs": [],
    //         "name": "refund",
    //         "outputs": [],
    //         "payable": false,
    //         "stateMutability": "nonpayable",
    //         "type": "function"
    //     },
    //     {
    //         "constant": false,
    //         "inputs": [],
    //         "name": "contribute",
    //         "outputs": [],
    //         "payable": true,
    //         "stateMutability": "payable",
    //         "type": "function"
    //     },
    //     {
    //         "inputs": [
    //             {
    //                 "name": "_beneficiary",
    //                 "type": "address"
    //             },
    //             {
    //                 "name": "_totalSupply",
    //                 "type": "uint256"
    //             },
    //             {
    //                 "name": "_goal",
    //                 "type": "uint256"
    //             },
    //             {
    //                 "name": "_deadline",
    //                 "type": "uint256"
    //             }
    //         ],
    //         "payable": false,
    //         "stateMutability": "nonpayable",
    //         "type": "constructor"
    //     },
    //     {
    //         "constant": false,
    //         "inputs": [],
    //         "name": "payout",
    //         "outputs": [],
    //         "payable": false,
    //         "stateMutability": "nonpayable",
    //         "type": "function"
    //     },
    //     {
    //         "constant": false,
    //         "inputs": [],
    //         "name": "disable",
    //         "outputs": [],
    //         "payable": false,
    //         "stateMutability": "nonpayable",
    //         "type": "function"
    //     }
    // ]
    //
    // SimpleICOContract = web3.eth.contract(abi);
    // SimpleICOContract = SimpleICOContract.at('0x6e28cc6d89ae643b5422804d6135aa32c5e419eb');
    //
    // deadlineReachedEvent = SimpleICOContract.DeadlineReached({});
    // contributionEvent = SimpleICOContract.Contribution({}, {fromBlock: 0, toBlock: 'latest'});
    // goalReachedEvent = SimpleICOContract.GoalReached({});
    //
    // goal = SimpleICOContract.goal.call(function (err, res) {
    //     goal = parseInt(res.toString());
    // });
    // SimpleICOContract.deadline.call(function (err, res) {
    //     deadline = parseInt(res.toString()) * 1000;
    // });
    // timer = setInterval(countDown, 1000);
    // initAddresses(addresses);
    // $address.change(function (e) {
    //     if (contributionOnlyAddressEvent)
    //         contributionOnlyAddressEvent.stopWatching();
    //     contributionOnlyAddressEvent = SimpleICOContract.Contribution({_contributor: $(this).val()}, {
    //         fromBlock: 0,
    //         toBlock: 'latest'
    //     });
    //     $("#contributions-table > tbody").html("");
    //     contributionOnlyAddressEvent.watch(function (err, result) {
    //         if (err) {
    //             console.log(err);
    //             return;
    //         }
    //         hash = result.transactionHash;
    //         contributor = result.args._contributor.toString()
    //         amount = result.args._amount.toString()
    //         setAsDone(hash, contributor, amount);
    //     });
    // });
    // $address.change();
    // $contribute_btn.click(function () {
    //     SimpleICOContract.contribute({from: $address.val(), value: $value.val()}, function (err, result) {
    //         addRow(result, $address.val(), $value.val(), "Pending");
    //     });
    // });
    //
    // $refund_btn.click(function () {
    //     SimpleICOContract.refund({from: $address.val()}, function () {
    //     });
    //     console.log("ref")
    // });

    // contributionEvent.watch(function (err, result) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     updateProgressBar(result.args._amountRemaining.toString());
    // });
    // deadlineReachedEvent.watch(function (err, result) {
    //     if (err) {
    //         console.log(err)
    //         return;
    //     }
    //     temp = result;
    //     ICOFinished(result.args._canRefund);
    // });
    // goalReachedEvent.watch(function (err, result) {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     window.alert("GOAL REACHED")
    // });
});

