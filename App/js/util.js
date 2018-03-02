var deadline, goal, temp, timer, addresses;
var $address, $value,
    $contribute_btn, $refund_btn,
    $sold_bar, $status;
var deadlineReachedEvent, contributionEvent, goalReachedEvent, contributionOnlyAddressEvent ,refundEvent

window.addEventListener('load', function() {

    $status = $("#status");
    $timer = $("#timer");
    $address = $("#address");
    $value = $("#value");
    $contribute_btn = $("#contribution-btn");
    $refund_btn = $("#refund-btn");
    $sold_bar = $("#sold-bar");
    $user_balance = $('#user-balance');
    $address.empty();

    init();
    var now = Math.floor(new Date().getTime());
    var distance = deadline - now;
    if (distance <= 0)
        ICOFinished();
    else
        timer = setInterval(countDown, 1000);
    initAddresses(addresses);

    $address.change(updateBalance);
    $address.change();
    $contribute_btn.click(function () {
        var address = $address.val();
        var amount =  $value.val();
        contribute(address,amount);
    });
    $refund_btn.click(function () {
        var address = $address.val();
        refund(address);
    });


})
// $(window).on(,function () {
//     $status = $("#status");
//     $timer = $("#timer");
//     $address = $("#address");
//     $value = $("#value");
//     $contribute_btn = $("#contribution-btn");
//     $refund_btn = $("#refund-btn");
//     $sold_bar = $("#sold-bar");
//     $user_balance = $('#user-balance');
//     $address.empty();
//
//     init();
//     var now = Math.floor(new Date().getTime());
//     var distance = deadline - now;
//     if (distance <= 0)
//         ICOFinished();
//     else
//         timer = setInterval(countDown, 1000);
//     initAddresses(addresses);
//
//     $address.change(addressChanged);
//     $address.change();
//     $contribute_btn.click(function () {
//         var address = $address.val();
//         var amount =  $value.val();
//         contribute(address,amount);
//     });
//     $refund_btn.click(function () {
//         var address = $address.val();
//         refund(address);
//     });
//
//
// });



function updateBalance(){
    var address = $address.val();
    var balance = getBalance(address);
    $user_balance.html(balance);
    console.log(balance);
}

function addRow(transactionHash,address , amount, status) {
    $('#contributions-table  > tbody:last-child').append('<tr id="'
        + transactionHash
        + '"><td>'
        + address +
        '</td><td>'
        + amount
        + '</td>'
        + '<td>' + status + '</td>'
        + '</tr>');

}

function countDown() {
    var now = Math.floor(new Date().getTime());
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
    else {
        $timer.html(0 + ":" + 0 + ":"
            + 0 + ":" + 0);
        clearInterval(timer);
        ICOFinished();
    }

}

function setAsDone(hash, contributor, amount) {
    $transaction = $("#" + hash);
    if ($transaction.length) {
        $transaction.children().eq(1).html(amount);
        $transaction.children().last().html("Done");
    }
    else {
        addRow(hash, contributor, amount, "Done")
    }
}

function updateProgressBar(amounRemaining) {
    console.log(amounRemaining);
    console.log(goal);
    bar_width = 1 - parseInt(amounRemaining) / goal;
    console.log(bar_width);
    $sold_bar.animate({
        width: (bar_width * 100) + "%"
    }, 100, function () {
    });
}

function ICOFinished() {
        $refund_btn.removeAttr("disabled");
        $status.removeClass("alert-info");
        $status.addClass("alert-danger");
        $status.html("Finished");
        refundPermission = true;
}


function emptyTable() {
    $("#contributions-table > tbody").html("");
}

function initAddresses(addresses) {
    $.each(addresses, function (index, value) {
        $address.append($('<option/>', {
            value: value,
            text: value
        }));
    });
}
