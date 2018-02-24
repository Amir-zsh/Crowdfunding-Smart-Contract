/*
web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "",
                "type": "address"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "bids",
        "outputs": [
            {
                "name": "blindedBid",
                "type": "bytes32"
            },
            {
                "name": "deposit",
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
        "name": "highestBidder",
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
        "name": "highestBid",
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
        "name": "ended",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "revealEnd",
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
        "name": "biddingEnd",
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
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "highestBid",
                "type": "uint256"
            }
        ],
        "name": "AuctionEnded",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "auctionEnd",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_values",
                "type": "uint256[]"
            },
            {
                "name": "_fake",
                "type": "bool[]"
            },
            {
                "name": "_secret",
                "type": "bytes32[]"
            }
        ],
        "name": "reveal",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_blindedBid",
                "type": "bytes32"
            }
        ],
        "name": "bid",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "_biddingTime",
                "type": "uint256"
            },
            {
                "name": "_revealTime",
                "type": "uint256"
            },
            {
                "name": "_beneficiary",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    }
]
var addresses = web3.eth.accounts;
var biddingEnd, revealEnd;
var $addresses, $bid_btn, $reveal_btn,
    $clock, $withdraw_btn, $finished,
    $bid_value, $transaction_value,
    $secret, $fake, $highestBidder, $highestBid;
var values = []
var fakes = []
var secrets = []
AuctionContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
auctionContract = AuctionContract.at('0xf823f2d72d45a3c0613b5ed4c306a6e3aa33d157');
// var winEvent = auctionContact.Deposit({_sender: userAddress}, {fromBlock: 0, toBlock: 'latest'});
// var withdrawEvent = auctionContact.Deposit({_sender: userAddress}, {fromBlock: 0, toBlock: 'latest'});

// $("input[type=submit]").attr("disabled", "disabled");
// if(validated) $("input[type=submit]").removeAttr("disabled");
function keccak256(...args) {
    args = args.map(arg => {
        if (typeof arg === 'string') {
            if (arg.substring(0, 2) === '0x') ;
            return arg.slice(2)
        }
        return web3.toHex(arg).slice(2);
        // if (typeof arg === 'number') {
        //     return leftPad((arg).toString(16), 64, 0)
        // } else {
        //     return ''
        // }
    })

    args = args.join('')

    return web3.sha3(args, {encoding: 'hex'})
}

function bid() {
    values.push($bid_value.val());
    secrets.push($secret.val());
    fakes.push($fake.val());
    hash = keccak256($bid_value.val(), Boolean($fake.val()), $secret.val());
    auctionContract.bid(hash, {from: $addresses.val(), value: $transaction_value.val()}, function () {
    });
    console.log(hash)
}

function reveal() {
    auctionContract.voteForCandidate([values], [fakes], [secrets], {from: $addresses.val()}, function () {
    });
    setHighestBid();
}
function  setHighestBid() {
    $highestBidder.val(uctionContract.highestBid.call().toString());
    $highestBidder.val(uctionContract.highestBidder.call().toString());
}


$(document).ready(function () {
    biddingEnd = parseInt(auctionContract.biddingEnd.call().toString()) * 1000;
    revealEnd = parseInt(auctionContract.revealEnd.call().toString()) * 1000;
    $addresses = $("#addresses");
    $bid_btn = $("#bid-btn");
    $reveal_btn = $("#reveal-btn");
    $addresses.empty();
    $clock = $("#bidding-end-count-down");
    $finished = $("#finished");
    $secret = $("#secret");
    $fake = $("#fake");
    $bid_value = $("#bid-value");
    $transaction_value = $("#transaction-value");
    highestBidder = $("#highest-bidder");
    highestBid = $("#highest-bid");
    $secret = $("#secret");
    $highestBidder.hide();
    $highestBid.hide();
    $finished.hide();
    $bid_btn.click(function () {
        bid();
    });

    $reveal_btn.click(function () {
        window.alert("reveal");
    });

    $.each(addresses, function (index, value) {
        $addresses.append($('<option/>', {
            value: value,
            text: value
        }));
    });

// Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = Math.floor(new Date().getTime());
        // Find the distance between now an the count down date
        var distance = biddingEnd - now;
        if (distance >= 0) {
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="demo"
            $clock.html(days + ":" + hours + ":"
                + minutes + ":" + seconds);
        }
        // If the count down is over, write some text
        else {
            clearInterval(x);
        }

    }, 1000);
    endBiddingEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        $reveal_btn.removeAttribute("disabled")
    });
    endReveal.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        $reveal_btn.removeAttribute("disabled")
        setHighestBid();
    });
    winEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        setHighestBid();
        $finished.show()
    });
    withdrawEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        $reveal_btn.hide();
        $withdraw_btn.show()
        setHighestBid();
    });

});

*/
function addRow(address, contribution) {
    var $funder = $("#"+address);
    if (funder){
        $funder.children().last().html(contribution);
    }
    else {
        $('#contributions-table  > tbody:last-child').append('<tr id="'
            + address
            + '"><td>'
            + address +
            '</td><td>'
            + contribution
            + '</td></tr>');
    }
}

function deleteRow(address,) {
    var $funder = $("#"+address);
    $funder.remove();
}

function getContribution(address) {

}
