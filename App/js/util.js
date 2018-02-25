

var deadline, goal, temp , timer;
var $address, $value,
    $contribute_btn, $refund_btn,
    $sold_bar, $status;
var deadlineReachedEvent, contributionEvent, goalReachedEvent, contributionOnlyAddressEvent

$(document).ready(function () {
    $status = $("#status");
    $timer = $("#timer");
    $address = $("#address");
    $value = $("#value");
    $contribute_btn = $("#contribution-btn");
    $refund_btn = $("#refund-btn");
    $sold_bar = $("#sold-bar");
    $address.empty();
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
    }

}

function setAsDone(hash,contributor,amout) {
    $transaction = $("#" + hash);
    if ($transaction.length) {
        $transaction.children().last().html("Done");
    }
    else {
        addRow(hash, contributor, amount, "Done")
    }
}

function updateProgressBar(amounRemaining) {
    bar_width = 1 - parseInt(amounRemaining) / goal;
    $sold_bar.animate({
        width: (bar_width * 100) + "%"
    }, 100, function () {
    });
}
function ICOFinished(canrRefund){
    if (canrRefund){
        $refund_btn.removeAttr("disabled");
        $status.removeClass("alert-info");
        $status.addClass("alert-danger");
        $status.html("Finished: Goal not Reached")
        refundPermission = true;
    }
    else{
        $status.removeClass("alert-info");
        $status.addClass("alert-success");
        $status.html("Finished: Goal Reached");
        refundPermission = false;
    }
}

