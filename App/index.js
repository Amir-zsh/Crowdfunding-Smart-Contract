web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
abi =[
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
                "indexed": false,
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
                "name": "_goal",
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
var addresses = web3.eth.accounts;
var deadline ,goal;
var $address, $value,
    $contribute_btn, $refund_btn,
    $sold_bar;

SimpleICOContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
SimpleICOContract = SimpleICOContract.at('0x129d446cfb5d85e70ada3565572e6c25c24a62cf');
// var dealineReachedEvent = SimpleICOContract.DeadlineReached({_sender: userAddress}, {fromBlock: 0, toBlock: 'latest'});
var dealineReachedEvent = SimpleICOContract.DeadlineReached({});
var contributionEvent = SimpleICOContract.Contribution({},{fromBlock: 0, toBlock: 'latest'});
var goalReachedEvent = SimpleICOContract.GoalReached({});


// $("input[type=submit]").attr("disabled", "disabled");
// if (validated) $("input[type=submit]").removeAttr("disabled");
//
// function setHighestBid() {
//     $highestBidder.val(uctionContract.highestBid.call().toString());
//     $highestBidder.val(uctionContract.highestBidder.call().toString());
// }


$(document).ready(function () {
    // biddingEnd = parseInt(SimpleICOContract.biddingEnd.call().toString()) * 1000;
    // revealEnd = parseInt(SimpleICOContract.revealEnd.call().toString()) * 1000;
    goal =  parseInt(SimpleICOContract.goal.call().toString());
    $address = $("#address");
    $value = $("#value");
    $contribute_btn = $("#contribution-btn");
    $refund_btn = $("#refund-btn");
    $sold_bar = $("#sold-bar");
    $address.empty();
    $contribute_btn.click(function () {
        SimpleICOContract.contribute({from: $address.val(), value: $value.val()}, function () {
        });
        console.log("cont")
    })
    $refund_btn.click(function () {
        SimpleICOContract.refund({from: $address.val()}, function () {
        });
        console.log("ref")
    });

    $.each(addresses, function (index, value) {
        $address.append($('<option/>', {
            value: value,
            text: value
        }));
    });

// Update the count down every 1 second


    contributionEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        addRow(result.args._contributor.toString(),result.args._amount.toString());
        updateProgressBar(result.args._amountRemaining.toString());
    });
    dealineReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        // addresses(result.args._contributor.toString(),result.args._amount.toString())
        console.log(result);
        // $reveal_btn.removeAttribute("disabled");
    });
    goalReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        window.alert("GOAL REACHED")
        // addresses(result.args._contributor.toString(),result.args._amount.toString())
        console.log(result);
        // $reveal_btn.removeAttribute("disabled");
    });
    // var myResults = contributionEvent.get(function(error, logs){ console.log(logs) });

});


function addRow(address, contribution) {
    // $funder = $("#" + address);
    // if ($funder.length) {
    //     $funder.children().last().html(contribution);
    // }
    // else {
        $('#contributions-table  > tbody:last-child').append('<tr id="'
            + address
            + '"><td>'
            + address +
            '</td><td>'
            + contribution
            + '</td></tr>');
    // }
}

function deleteRow(address,) {
    var $funder = $("#" + address);
    $funder.remove();
}

function updateProgressBar(amounRemaining){
    console.log(amounRemaining);
    bar_width = 1 - parseInt(amounRemaining) / goal;
    console.log(bar_width);
    $sold_bar.animate({
        width : (bar_width * 100) + "%"
    },100,function(){
    });
}

