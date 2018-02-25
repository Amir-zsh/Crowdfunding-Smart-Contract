web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
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
var addresses = web3.eth.accounts;
var deadline, goal, temp;
var $address, $value,
    $contribute_btn, $refund_btn,
    $sold_bar;
var deadlineReachedEvent, contributionEvent, goalReachedEvent, contributionOnlyAddressEvent
SimpleICOContract = web3.eth.contract(abi);
// In your nodejs console, execute contractInstance.address to get the address at which the contract is deployed and change the line below to use your deployed address
SimpleICOContract = SimpleICOContract.at('0x19171df69139c358aaa879aaaf2592cf82bdf692');
deadlineReachedEvent = SimpleICOContract.DeadlineReached({});
contributionEvent = SimpleICOContract.Contribution({}, {fromBlock: 0, toBlock: 'latest'});
goalReachedEvent = SimpleICOContract.GoalReached({});

$(document).ready(function () {
    goal = parseInt(SimpleICOContract.goal.call().toString());
    deadline = parseInt(SimpleICOContract.deadline.call().toString()) * 1000;
    $timer = $("#timer");
    $address = $("#address");
    $value = $("#value");
    $contribute_btn = $("#contribution-btn");
    $refund_btn = $("#refund-btn");
    $sold_bar = $("#sold-bar");
    $address.empty();
    $.each(addresses, function (index, value) {
        $address.append($('<option/>', {
            value: value,
            text: value
        }));
    });
    $address.change(function (e) {
        if (contributionOnlyAddressEvent)
            contributionOnlyAddressEvent.stopWatching();
        contributionOnlyAddressEvent = SimpleICOContract.Contribution({_contributor: $(this).val()}, {
            fromBlock: 0,
            toBlock: 'latest'
        });
        $("#contributions-table > tbody").html("");
        contributionOnlyAddressEvent.watch(function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            setAsDone(result);
        });
    });
    $address.change();
    $contribute_btn.click(function () {
        SimpleICOContract.contribute({from: $address.val(), value: $value.val()}, function (err, result) {
            addRow(result, $address.val(), $value.val(), "Pending");
        });
    });

    $refund_btn.click(function () {
        SimpleICOContract.refund({from: $address.val()}, function () {
        });
        console.log("ref")
    });
// Update the count down every 1 second


    contributionEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        updateProgressBar(result.args._amountRemaining.toString());
        temp = result;
    });
    deadlineReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        $refund_btn.removeAttr("disabled");
        $status.removeClass("alert-success");
        $status.addClass("alert-warning")
    });
    goalReachedEvent.watch(function (err, result) {
        if (err) {
            console.log(err);
            return;
        }
        window.alert("GOAL REACHED")
        console.log(result);
    });
    var x = setInterval(function () {

        // Get todays date and time
        var now = Math.floor(new Date().getTime());
        // Find the distance between now an the count down date
        var distance = deadline - now;
        if (distance >= 0) {
            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Output the result in an element with id="demo"
            $timer.html(days + ":" + hours + ":"
                + minutes + ":" + seconds);
        }
        // If the count down is over, write some text
        else {
            clearInterval(x);
        }

    }, 1000);

});


function addRow(transactionHash, address, contribution, status) {
    $('#contributions-table  > tbody:last-child').append('<tr id="'
        + transactionHash
        + '"><td>'
        + address +
        '</td><td>'
        + contribution
        + '</td>'
        + '<td>' + status + '</td>'
        + '</tr>');

}


function setAsDone(result) {
    // temp.transactionHash,result.args._contributor.toString(), result.args._amount.toString()
    hash = result.transactionHash
    $transaction = $("#" + hash);
    if ($transaction.length) {
        $transaction.children().last().html("Done");
    }
    else {
        contributor = result.args._contributor.toString()
        amount = result.args._amount.toString()
        addRow(hash, contributor, amount, "Done")
    }
}

function updateProgressBar(amounRemaining) {
    // console.log(amounRemaining);
    bar_width = 1 - parseInt(amounRemaining) / goal;
    // console.log(bar_width);
    $sold_bar.animate({
        width: (bar_width * 100) + "%"
    }, 100, function () {
    });
}
