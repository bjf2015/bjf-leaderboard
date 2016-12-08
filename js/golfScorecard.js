

var lon, lat;
var closeCourses;
var selectedCourse;
var numberOfHoles;
var options = {
    enableHighAccuracy: true
};

// Getting the original simplified course data for course id

navigator.geolocation.getCurrentPosition(function(position) {

    lat = position.coords.latitude;
    lon = position.coords.longitude;
    var userPosition = {
        latitude: lat,
        longitude: lon
    };

    $(document).ready(function () {
        $.post("https://golf-courses-api.herokuapp.com/courses/", userPosition, function(data, status){
            closeCourses = JSON.parse(data);
            for(i in closeCourses.courses){
                $("#courseSelect").append("<option value='" + closeCourses.courses[i].id + "'>" + closeCourses.courses[i].name + "</option>");
            }
        });
    });
}, error, options);

function error() {
    console.log("Failure...");
}

// Getting the full course data for all courses specific to the id

var courseValue = $("#courseSelect").find(":selected").text();

function loadCourse(theid) {
    $.get("https://golf-courses-api.herokuapp.com/courses/" + theid, function(data, status){
        resetCard();
        teeValue = "-";
        courseValue = $("#courseSelect").find(":selected").text();
        if(courseValue == "-"){
            $("#courseTitle").html("Choose Your Location");
        }
        $(".teeOptions").remove();
        $(".holeOptions").remove();
        selectedCourse = JSON.parse(data);
        $("#courseTitle").html(selectedCourse.course.name);
        numberOfHoles = selectedCourse.course.hole_count;
        for(var i = 0; i < selectedCourse.course.holes[0].tee_boxes.length - 1; i++){
            $("#teeTypes").append("<option class='teeOptions' value='"+ i + "'>" + selectedCourse.course.holes[0].tee_boxes[i].tee_type +"</option>");
        }
        if(numberOfHoles == 18){
            $("#holeAmount").append("<option class='holeOptions'>Front 9 Holes</option>" + "<option class='holeOptions'>Back 9 Holes</option>" + "<option class='holeOptions'>All 18 Holes</option>");
        } else {
            $("#holeAmount").append("<option class='holeOptions'>Front 9 Holes</option>");
        }
    });
}

// Have the page react based on the amount of holes

var holeValue;

function loadHole() {
    resetCard();
    holeValue = $("#holeAmount").find(":selected").val();
    if(holeValue == "Front 9 Holes" || holeValue == "Back 9 Holes"){
        numberOfHoles = 9;
    }
    else if(holeValue == "All 18 Holes" || holeValue == "-") {
        numberOfHoles = 18;
    }
}

// Have the yardage, par, and handicap react to the teeValue

var teeValue = $("#teeTypes").find(":selected").text();

function loadTee() {
    resetCard();
    teeValue = $("#teeTypes").find(":selected").text();
}

/*-------------------------------------------
 *   Create a way to add players
 -------------------------------------------*/

var playerNumber = 0;
var playerAmount = 0;
var itemNumber = 0;
var leftCard;
var errMaxPlayers = false;
var init = false;

$("#rightCard").css("display", "none");
$("#leftCardHeadings").css("display", "none");

function addPlayer(){
    if(courseValue == "-" || teeValue == "-"){
        resetCard();
        $("#rightCard").css("display", "none");
        $("#leftCardHeadings").css("display", "none");
        $("#cardContainer").append("<p id='selectCourseError' style='color: red;'>*Must select a Course and a Tee Type before adding a player!</p>");
    } else {
        $("#addPlayerButton").text("Add a Player");
        $("#rightCard").css("display", "block");
        $("#leftCardHeadings").css("display", "block");
        $("#selectCourseError").remove();
        if (!init) {
            // Create hole titles
            if(holeValue == "Front 9 Holes"){
                for (var i = 0; i < numberOfHoles; i++) {
                    $("#holes").append("<td class='tableHeader'><strong>Hole " + (i + 1) + "</strong></td>");
                    if (i == 8) {
                        $("#holes").append("<td class='tableHeader'><strong>Total (Out)</strong></td>");
                    }
                    else if (i == 17) {
                        $("#holes").append("<td class='tableHeader'><strong>Total (In)</strong></td>");
                    }
                }
            }

            else if(holeValue == "Back 9 Holes"){
                for (var i = 9; i < numberOfHoles + 9; i++) {
                    $("#holes").append("<td class='tableHeader'><strong>Hole " + (i + 1) + "</strong></td>");
                    if (i == 17) {
                        $("#holes").append("<td class='tableHeader'><strong>Total (In)</strong></td>");
                    }
                }
            }

            else {
                for (var i = 0; i < numberOfHoles; i++) {
                    $("#holes").append("<td class='tableHeader'><strong>Hole " + (i + 1) + "</strong></td>");
                    if (i == 8) {
                        $("#holes").append("<td class='tableHeader'><strong>Total (Out)</strong></td>");
                    }
                    else if (i == 17) {
                        $("#holes").append("<td class='tableHeader'><strong>Total (In)</strong></td>");
                        $("#holes").append("<td class='tableHeader'><strong>Grand Total</strong></td>");
                    }
                }
            }

            var columns;

            if(numberOfHoles == 9){
                columns = numberOfHoles + 1;
            } else {
                columns = numberOfHoles + 3;
            }
            // Create yardage values

            var yardage,
                yardageIn = 0,
                yardageOut = 0,
                yardageGrand = 0;

            if(holeValue == "Front 9 Holes"){
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        yardage = selectedCourse.course.holes[i].tee_boxes[$("#teeTypes").val()].yards;
                        yardageOut += yardage;
                    }

                    if(i == 9) {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardageOut + "</td>");
                    } else {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardage + "</td>");
                    }
                }
            }

            else if(holeValue == "Back 9 Holes"){
                for (var i = 10; i < columns + 10; i++) {
                    if(i > 9 && i < 19) {
                        yardage = selectedCourse.course.holes[i - 1].tee_boxes[$("#teeTypes").val()].yards;
                        yardageIn += yardage;
                    }

                    if(i == 19) {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardageIn + "</td>");
                    }
                    else {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardage + "</td>");
                    }
                }
            }

            else {
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        yardage = selectedCourse.course.holes[i].tee_boxes[$("#teeTypes").val()].yards;
                    }
                    else if(i > 9 && i < 19) {
                        yardage = selectedCourse.course.holes[i - 1].tee_boxes[$("#teeTypes").val()].yards;
                    }

                    if(i < 9){
                        yardageOut += yardage;
                    }
                    else if (i > 9 && i < 19) {
                        yardageIn += yardage;
                    }

                    if(i == 9) {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardageOut + "</td>");
                    }
                    else if(i == 19) {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardageIn + "</td>");
                    }
                    else if(i == 20) {
                        yardageGrand = yardageIn + yardageOut;
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardageGrand + "</td>");
                    }
                    else {
                        $("#yardage").append("<td id='yardageId" + i + "' class='tableHeader'>" + yardage + "</td>");
                    }
                }
            }



            // Create par values

            var par,
                parIn = 0,
                parOut = 0,
                parGrand = 0;

            if(holeValue == "Front 9 Holes"){
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        par = selectedCourse.course.holes[i].tee_boxes[0].par;
                        parOut += par;
                    }

                    if(i == 9) {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + parOut + "</td>");
                    } else {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + par + "</td>");
                    }
                }
            }

            else if(holeValue == "Back 9 Holes"){
                for (var i = 10; i < columns + 10; i++) {
                    if(i > 9 && i < 19) {
                        par = selectedCourse.course.holes[i - 1].tee_boxes[0].par;
                        parIn += par;
                    }

                    if(i == 19) {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + parIn + "</td>");
                    } else {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + par + "</td>");
                    }
                }
            }

            else {
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        par = selectedCourse.course.holes[i].tee_boxes[0].par;
                    }
                    else if(i > 9 && i < 19) {
                        par = selectedCourse.course.holes[i - 1].tee_boxes[0].par;
                    }

                    if(i < 9){
                        parOut += par;
                    }
                    else if (i > 9 && i < 19) {
                        parIn += par;
                    }

                    if(i == 9) {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + parOut + "</td>");
                    }
                    else if(i == 19) {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + parIn + "</td>");
                    }
                    else if(i == 20) {
                        parGrand = parIn + parOut;
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + parGrand + "</td>");
                    }
                    else {
                        $("#par").append("<td id='parId" + i + "' class='tableHeader'>" + par + "</td>");
                    }
                }
            }



            // Create handicap values

            var handicap,
                handicapIn = 0,
                handicapOut = 0,
                handicapGrand = 0;

            if(holeValue == "Front 9 Holes"){
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        handicap = selectedCourse.course.holes[i].tee_boxes[0].hcp;
                        handicapOut += handicap;
                    }

                    if(i == 9) {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicapOut + "</td>");
                    } else {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicap + "</td>");
                    }
                }
            }

            else if(holeValue == "Back 9 Holes"){
                for (var i = 10; i < columns + 10; i++) {
                    if(i > 9 && i < 19) {
                        handicap = selectedCourse.course.holes[i - 1].tee_boxes[0].hcp;
                        handicapIn += handicap;
                    }

                    if(i == 19) {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicapIn + "</td>");
                    } else {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicap + "</td>");
                    }
                }
            }

            else {
                for (var i = 0; i < columns; i++) {
                    if(i < 9) {
                        handicap = selectedCourse.course.holes[i].tee_boxes[0].hcp;
                    }
                    else if(i > 9 && i < 19) {
                        handicap = selectedCourse.course.holes[i - 1].tee_boxes[0].hcp;
                    }

                    if(i < 9){
                        handicapOut += handicap;
                    }
                    else if (i > 9 && i < 19) {
                        handicapIn += handicap;
                    }

                    if(i == 9) {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicapOut + "</td>");
                    }
                    else if(i == 19) {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicapIn + "</td>");
                    }
                    else if(i == 20) {
                        handicapGrand = handicapIn + handicapOut;
                        $("#handicap").append("<td id=handicapId" + i + "' class='tableHeader'>" + handicapGrand + "</td>");
                    }
                    else {
                        $("#handicap").append("<td id='handicapId" + i + "' class='tableHeader'>" + handicap + "</td>");
                    }
                }
            }

            init = true;
        }
        if (playerAmount > 5) {
            if (!errMaxPlayers) {
                $("#cardContainer").append("<p id='errorMessage' style='color: red;'>* Cannot add more than 6 players.</p>");
                errMaxPlayers = true;
            }
        } else {
            $("#messages").append("<div class='playerMessage' id='message" + (playerAmount + 1) + "'>This is where the score compared to par will appear for Player " + (playerAmount + 1) + ".</div>");
            //Create the players themselves

            leftCard = $("#leftCard").html();
            if (leftCard == "Click \"Initialize Card\" to create your card.") {
                playerNumber = 0;
            }
            if (playerNumber == 0) {
                $("#leftCard").html("");
            }
            $("#leftCard").append("<div class='player' id='playerLabel" + playerNumber + "'><p data-editable class='name' id='name" + playerNumber + "' onclick='changeName(this, this.id)'>Player " + (playerNumber + 1) + "</p><span class='glyphicon glyphicon-minus-sign' onclick='removePlayer(" + playerNumber + ")'></span></div>");

            // Create the rows associated with those players

            $("#input").append("<tr id='row" + playerNumber + "'></tr>");

            // Create 9 holes if number of holes equals 9

            if (numberOfHoles == 9) {
                $("#leftCard").css("margin", "203px 0 0 30px");
                $("#leftCardHeadings").css("margin-bottom", "-203px");
                $(".tableHeadings:first-child").css("margin-bottom", "24px");
                for (var i = 0; i < numberOfHoles + 1; i++) {
                    if(i < 9){
                        $("#row" + playerNumber).append("<td class='dataItem' id='dataItem" + itemNumber + "'>" +
                            "<input onkeyup='validateInput(this.value, this)' maxlength='2' class='input' id='input" + itemNumber + "'>" +
                            "</td>");
                    }
                    else if(i == 9){
                        $("#row" + playerNumber).append("<td class='totals' id='totalOut" + playerNumber + "' style='height: 39px; width: 145px; vertical-align: middle;'>0</td>");
                    }
                    itemNumber++;
                }
                // Create 18 holes if number of holes equals anything other than 9.
            } else {
                $("#leftCard").css("margin", "220px 0 0 30px");
                $("#leftCardHeadings").css("margin-bottom", "-220px");
                $(".tableHeadings:first-child").css("margin-bottom", "32px");

                for (var i = 0; i < numberOfHoles + 3; i++) {
                    if(i < 9 || i > 9 && i < 19){
                        $("#row" + playerNumber).append("<td class='dataItem' id='dataItem" + itemNumber + "'>" +
                            "<input onkeyup='validateInput(this.value, this)' maxlength='2' class='input' id='input" + itemNumber + "'>" +
                            "</td>");
                    }
                    else if(i == 9) {
                        $("#row" + playerNumber).append("<td class='totals' id='totalOut" + playerNumber + "' style='height: 39px; width: 65px; vertical-align: middle;'>0</td>");
                    }
                    else if(i == 19) {
                        $("#row" + playerNumber).append("<td class='totals' id='totalIn" + playerNumber + "' style='height: 39px; width: 65px; vertical-align: middle;'>0</td>");
                    }
                    else if(i == 20)  {
                        $("#row" + playerNumber).append("<td class='totals' id='totalGrand" + playerNumber + "' style='height: 39px; width: 65px; vertical-align: middle;'>0</td>");
                    }
                    itemNumber++;
                }
            }
            playerNumber++;
            playerAmount++;
        }
    }
}

/*-------------------------------------------
 *   Create a way to change player names
 -------------------------------------------*/



function changeName(theelement, theid) {
    var $el = $(theelement);
    var $input = $("<input onkeyup='validatePlayer(this.value, this)' class='" + theid + "Input' type='text' maxlength='15' style='height: 24px; width: 100px;'/>").val( $el.text() );
    $el.replaceWith( $input );

    var save = function(){
        var $p = $("<p data-editable class='name' id='" + theid + "' onclick='changeName(this, this.id)'></p>").text( $input.val() );
        if($input.val() !== ""){
            $input.replaceWith( $p );
        } else {
            $("#playerValidationError").remove();
            $input.replaceWith($el);
        }
    };
    $input.one('blur', save).focus()
}

/*-------------------------------------------
 *   Validate the names of the players
 -------------------------------------------*/

function validatePlayer(thevalue, theelement) {
    $("#playerValidationError").remove();
    $("#playerRepeatError").remove();
    if(!isNaN(parseInt(thevalue))){
        $(theelement).val("");
        $("#cardContainer").append("<p id='playerValidationError' style='color: red;'>* Cannot use numbers as names unless a word comes first (Ex: Larry3).</p>");
    } else {
        for(var i = 0; i < 6; i++){
            var value = $("#name" + i).text();
            if(value !== "" && value !== undefined){
                if(value == thevalue){
                    i = 6;
                    $("#cardContainer").append("<p id='playerRepeatError' style='color: red;'>* No two names can be the same.</p>");
                    $(theelement).val("");
                }
            }

        }
    }
}


/*-------------------------------------------
 *   Create a way to remove players
 -------------------------------------------*/


function removePlayer(theid) {
    if(playerAmount <= 6){
        $("#errorMessage").remove();
        errMaxPlayers = false;
    }
    $("#playerLabel" + theid).remove();
    $("#row" + theid).remove();
    $("#message" + (playerAmount)).remove();
    playerAmount--;
    if($("#leftCard").html() == ""){
        $("#leftCard").html("Click \"Initialize Card\" to create your card.");
        $("#addPlayerButton").text("Initialize Card");
        $("#rightCard").css("display", "none");
        $("#leftCardHeadings").css("display", "none");
        itemNumber = 0;
        $(".tableHeader").remove();
        init = false;
        $(".playerMessage").remove();
    }
}

/*-------------------------------------------
 *   Validate the input and add inputs
 -------------------------------------------*/

var totalOut0 = 0,
    totalOut1 = 0,
    totalOut2 = 0,
    totalOut3 = 0,
    totalOut4 = 0,
    totalOut5 = 0;

var totalIn0 = 0,
    totalIn1 = 0,
    totalIn2 = 0,
    totalIn3 = 0,
    totalIn4 = 0,
    totalIn5 = 0;

var totalGrand0 = 0,
    totalGrand1 = 0,
    totalGrand2 = 0,
    totalGrand3 = 0,
    totalGrand4 = 0,
    totalGrand5 = 0;

var parseVal;
var regVal;

var incomplete0 = true,
    incomplete1 = true,
    incomplete2 = true,
    incomplete3 = true,
    incomplete4 = true,
    incomplete5 = true;

var compareToPar0,
    compareToPar1,
    compareToPar2,
    compareToPar3,
    compareToPar4,
    compareToPar5;

function validateInput(thevalue, theid) {
    $("#inputValidationError").remove();
    if(isNaN(parseInt(thevalue)) && thevalue != "") {
        $(theid).val("");
        $("#cardContainer").append("<p id='inputValidationError' style='color: red;'>* Must only input numbers (0 - 99)</p>");
    } else {
        if(numberOfHoles == 9){
            /*-------------------------------------------
             *   Validate Input for 9 Holes
             -------------------------------------------*/
            totalOut0 = 0;
            totalOut1 = 0;
            totalOut2 = 0;
            totalOut3 = 0;
            totalOut4 = 0;
            totalOut5 = 0;
            incomplete0 = false;
            incomplete1 = false;
            incomplete2 = false;
            incomplete3 = false;
            incomplete4 = false;
            incomplete5 = false;
            for(var i = 0; i < 60; i++){
                regVal = $("#input" + i).val();
                parseVal = parseInt($("#input" + i).val());
                if (!isNaN(parseVal)) {
                    // R0W 0
                    if (i < 9) {
                        totalOut0 += parseVal;
                    }
                    // ROW 1
                    else if (i > 9 && i < 19) {
                        totalOut1 += parseVal;
                    }
                    // ROW 2
                    else if (i > 19 && i < 29) {
                        totalOut2 += parseVal;
                    }
                    // ROW 3
                    else if (i > 29 && i < 39) {
                        totalOut3 += parseVal;
                    }
                    // ROW 4
                    else if (i > 39 && i < 49) {
                        totalOut4 += parseVal;
                    }
                    // ROW 5
                    else if (i > 49 && i < 59) {
                        totalOut5 += parseVal;
                    }
                } else {
                    // R0W 0
                    if (i < 9) {
                        if(regVal == "" || regVal == undefined){
                            incomplete0 = true;
                        }
                    }
                    // ROW 1
                    else if (i > 9 && i < 19) {
                        if(regVal == "" || regVal == undefined){
                            incomplete1 = true;
                        }
                    }
                    // ROW 2
                    else if (i > 19 && i < 29) {
                        if(regVal == "" || regVal == undefined){
                            incomplete2 = true;
                        }
                    }
                    // ROW 3
                    else if (i > 29 && i < 39) {
                        if(regVal == "" || regVal == undefined){
                            incomplete3 = true;
                        }
                    }
                    // ROW 4
                    else if (i > 39 && i < 49) {
                        if(regVal == "" || regVal == undefined){
                            incomplete4 = true;
                        }
                    }
                    // ROW 5
                    else if (i > 49 && i < 59) {
                        if(regVal == "" || regVal == undefined){
                            incomplete5 = true;
                        }
                    }
                }
                // ROW 0
                if (i == 9) {
                    $("#totalOut0").text(totalOut0);
                }
                // ROW 1
                else if (i == 19) {
                    $("#totalOut1").text(totalOut1);
                }
                // ROW 2
                else if (i == 29) {
                    $("#totalOut2").text(totalOut2);
                }
                // ROW 3
                else if (i == 39) {
                    $("#totalOut3").text(totalOut3);
                }
                // ROW 4
                else if (i == 49) {
                    $("#totalOut4").text(totalOut4);
                }
                // ROW 5
                else if (i == 59) {
                    $("#totalOut5").text(totalOut5);
                }

            }
            if(!incomplete0){
                compareToPar0 = totalOut0 - 36;
                if(compareToPar0 < 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is " + compareToPar0 + ". Well done! You are fit for the PGA!");
                    $("#message1").css("color", "green");
                }
                else if(compareToPar0 == 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is " + compareToPar0 + ". Congratulations! You got exactly par!");
                    $("#message1").css("color", "blue");
                }
                else if(compareToPar0 > 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is \+" + compareToPar0 + ". You need serious practice. After that come back and try again.");
                    $("#message1").css("color", "red");
                }
            }
            if(!incomplete1){
                compareToPar1 = totalOut1 - 36;
                if(compareToPar1 < 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is " + compareToPar1 + ". Well done! You are fit for the PGA!");
                    $("#message2").css("color", "green");
                }
                else if(compareToPar1 == 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is " + compareToPar1 + ". Congratulations! You got exactly par!");
                    $("#message2").css("color", "blue");
                }
                else if(compareToPar1 > 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is \+" + compareToPar1 + ". You need serious practice. After that come back and try again.");
                    $("#message2").css("color", "red");
                }
            }
            if(!incomplete2){
                compareToPar2 = totalOut2 - 36;
                if(compareToPar2 < 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is " + compareToPar2 + ". Well done! You are fit for the PGA!");
                    $("#message3").css("color", "green");
                }
                else if(compareToPar2 == 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is " + compareToPar2 + ". Congratulations! You got exactly par!");
                    $("#message3").css("color", "blue");
                }
                else if(compareToPar2 > 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is \+" + compareToPar2 + ". You need serious practice. After that come back and try again.");
                    $("#message3").css("color", "red");
                }
            }
            if(!incomplete3){
                compareToPar3 = totalOut3 - 36;
                if(compareToPar3 < 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is " + compareToPar3 + ". Well done! You are fit for the PGA!");
                    $("#message4").css("color", "green");
                }
                else if(compareToPar3 == 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is " + compareToPar3 + ". Congratulations! You got exactly par!");
                    $("#message4").css("color", "blue");
                }
                else if(compareToPar3 > 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is \+" + compareToPar3 + ". You need serious practice. After that come back and try again.");
                    $("#message4").css("color", "red");
                }
            }
            if(!incomplete4){
                compareToPar4 = totalOut4 - 36;
                if(compareToPar4 < 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is " + compareToPar4 + ". Well done! You are fit for the PGA!");
                    $("#message5").css("color", "green");
                }
                else if(compareToPar4 == 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is " + compareToPar4 + ". Congratulations! You got exactly par!");
                    $("#message5").css("color", "blue");
                }
                else if(compareToPar4 > 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is \+" + compareToPar4 + ". You need serious practice. After that come back and try again.");
                    $("#message5").css("color", "red");
                }
            }
            if(!incomplete5){
                compareToPar5 = totalOut5 - 36;
                if(compareToPar5 < 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is " + compareToPar5 + ". Well done! You are fit for the PGA!");
                    $("#message6").css("color", "green");
                }
                else if(compareToPar5 == 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is " + compareToPar5 + ". Congratulations! You got exactly par!");
                    $("#message6").css("color", "blue");
                }
                else if(compareToPar5 > 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is \+" + compareToPar5 + ". You need serious practice. After that come back and try again.");
                    $("#message6").css("color", "red");
                }
            }
        } else {

            /*-------------------------------------------
             *   Validate the input for 18 holes
             -------------------------------------------*/

            totalOut0 = 0;
            totalOut1 = 0;
            totalOut2 = 0;
            totalOut3 = 0;
            totalOut4 = 0;
            totalOut5 = 0;

            totalIn0 = 0;
            totalIn1 = 0;
            totalIn2 = 0;
            totalIn3 = 0;
            totalIn4 = 0;
            totalIn5 = 0;

            totalGrand0 = 0;
            totalGrand1 = 0;
            totalGrand2 = 0;
            totalGrand3 = 0;
            totalGrand4 = 0;
            totalGrand5 = 0;

            incomplete0 = false;
            incomplete1 = false;
            incomplete2 = false;
            incomplete3 = false;
            incomplete4 = false;
            incomplete5 = false;

            for(var i = 0; i < 126; i++) {
                regVal = $("#input" + i).val();
                parseVal = parseInt($("#input" + i).val());
                if (!isNaN(parseVal)) {
                    // ROW O
                    if (i < 9) {
                        totalOut0 += parseVal;
                    }
                    else if (i > 9 && i < 19) {
                        totalIn0 += parseVal;
                    }
                    // ROW 1
                    else if (i > 20 && i < 30) {
                        totalOut1 += parseVal;
                    }
                    else if (i > 30 && i < 40) {
                        totalIn1 += parseVal;
                    }
                    // ROW 2
                    else if (i > 41 && i < 51) {
                        totalOut2 += parseVal;
                    }
                    else if (i > 51 && i < 61) {
                        totalIn2 += parseVal;
                    }
                    // ROW 3
                    else if (i > 62 && i < 72) {
                        totalOut3 += parseVal;
                    }
                    else if (i > 72 && i < 82) {
                        totalIn3 += parseVal;
                    }
                    // ROW 4
                    else if (i > 83 && i < 93) {
                        totalOut4 += parseVal;
                    }
                    else if (i > 93 && i < 103) {
                        totalIn4 += parseVal;
                    }
                    // ROW 5
                    else if (i > 104 && i < 114) {
                        totalOut5 += parseVal;
                    }
                    else if (i > 114 && i < 124) {
                        totalIn5 += parseVal;
                    }
                } else {
                    // ROW O
                    if (i < 9) {
                        if(regVal == "" || regVal == undefined){
                            incomplete0 = true;
                        }
                    }
                    else if (i > 9 && i < 19) {
                        if(regVal == "" || regVal == undefined){
                            incomplete0 = true;
                        }
                    }
                    // ROW 1
                    else if (i > 20 && i < 30) {
                        if(regVal == "" || regVal == undefined){
                            incomplete1 = true;
                        }
                    }
                    else if (i > 30 && i < 40) {
                        if(regVal == "" || regVal == undefined){
                            incomplete1 = true;
                        }
                    }
                    // ROW 2
                    else if (i > 41 && i < 51) {
                        if(regVal == "" || regVal == undefined){
                            incomplete2 = true;
                        }
                    }
                    else if (i > 51 && i < 61) {
                        if(regVal == "" || regVal == undefined){
                            incomplete2 = true;
                        }
                    }
                    // ROW 3
                    else if (i > 62 && i < 72) {
                        if(regVal == "" || regVal == undefined){
                            incomplete3 = true;
                        }
                    }
                    else if (i > 72 && i < 82) {
                        if(regVal == "" || regVal == undefined){
                            incomplete3 = true;
                        }
                    }
                    // ROW 4
                    else if (i > 83 && i < 93) {
                        if(regVal == "" || regVal == undefined){
                            incomplete4 = true;
                        }
                    }
                    else if (i > 93 && i < 103) {
                        if(regVal == "" || regVal == undefined){
                            incomplete4 = true;
                        }
                    }
                    // ROW 5
                    else if (i > 104 && i < 114) {
                        if(regVal == "" || regVal == undefined){
                            incomplete5 = true;
                        }
                    }
                    else if (i > 114 && i < 124) {
                        if(regVal == "" || regVal == undefined){
                            incomplete5 = true;
                        }
                    }
                }
                // ROW 0
                if (i == 9) {
                    $("#totalOut0").text(totalOut0);
                }
                else if (i == 19) {
                    $("#totalIn0").text(totalIn0);
                }
                else if (i == 20) {
                    totalGrand0 = totalOut0 + totalIn0;
                    $("#totalGrand0").text(totalGrand0);
                }
                // ROW 1
                else if (i == 30) {
                    $("#totalOut1").text(totalOut1);
                }
                else if (i == 40) {
                    $("#totalIn1").text(totalIn1);
                }
                else if (i == 41) {
                    totalGrand1 = totalOut1 + totalIn1;
                    $("#totalGrand1").text(totalGrand1);
                }
                // ROW 2
                else if (i == 51) {
                    $("#totalOut2").text(totalOut2);
                }
                else if (i == 61) {
                    $("#totalIn2").text(totalIn2);
                }
                else if (i == 62) {
                    totalGrand2 = totalOut2 + totalIn2;
                    $("#totalGrand2").text(totalGrand2);
                }
                // ROW 3
                else if (i == 72) {
                    $("#totalOut3").text(totalOut3);
                }
                else if (i == 82) {
                    $("#totalIn3").text(totalIn3);
                }
                else if (i == 83) {
                    totalGrand3 = totalOut3 + totalIn3;
                    $("#totalGrand3").text(totalGrand3);
                }
                // ROW 4
                else if (i == 93) {
                    $("#totalOut4").text(totalOut4);
                }
                else if (i == 103) {
                    $("#totalIn4").text(totalIn4);
                }
                else if (i == 104) {
                    totalGrand4 = totalOut4 + totalIn4;
                    $("#totalGrand4").text(totalGrand4);
                }
                // ROW 5
                else if (i == 114) {
                    $("#totalOut5").text(totalOut5);
                }
                else if (i == 124) {
                    $("#totalIn5").text(totalIn5);
                }
                else if (i == 125) {
                    totalGrand5 = totalOut5 + totalIn5;
                    $("#totalGrand5").text(totalGrand5);
                }
            }
            if(!incomplete0){
                compareToPar0 = totalGrand0 - 72;
                if(compareToPar0 < 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is " + compareToPar0 + ". Well done! You are fit for the PGA!");
                    $("#message1").css("color", "green");
                }
                else if(compareToPar0 == 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is " + compareToPar0 + ". Congratulations! You got exactly par!");
                    $("#message1").css("color", "blue");
                }
                else if(compareToPar0 > 0){
                    $("#message1").text($("#name0").text() + ": Your score compared to par is \+" + compareToPar0 + ". You need serious practice. After that come back and try again.");
                    $("#message1").css("color", "red");
                }
            }
            if(!incomplete1){
                compareToPar1 = totalGrand1 - 72;
                if(compareToPar1 < 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is " + compareToPar1 + ". Well done! You are fit for the PGA!");
                    $("#message2").css("color", "green");
                }
                else if(compareToPar1 == 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is " + compareToPar1 + ". Congratulations! You got exactly par!");
                    $("#message2").css("color", "blue");
                }
                else if(compareToPar1 > 0){
                    $("#message2").text($("#name1").text() + ": Your score compared to par is \+" + compareToPar1 + ". You need serious practice. After that come back and try again.");
                    $("#message2").css("color", "red");
                }
            }
            if(!incomplete2){
                compareToPar2 = totalGrand2 - 72;
                if(compareToPar2 < 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is " + compareToPar2 + ". Well done! You are fit for the PGA!");
                    $("#message3").css("color", "green");
                }
                else if(compareToPar2 == 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is " + compareToPar2 + ". Congratulations! You got exactly par!");
                    $("#message3").css("color", "blue");
                }
                else if(compareToPar2 > 0){
                    $("#message3").text($("#name2").text() + ": Your score compared to par is \+" + compareToPar2 + ". You need serious practice. After that come back and try again.");
                    $("#message3").css("color", "red");
                }
            }
            if(!incomplete3){
                compareToPar3 = totalGrand3 - 72;
                if(compareToPar3 < 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is " + compareToPar3 + ". Well done! You are fit for the PGA!");
                    $("#message4").css("color", "green");
                }
                else if(compareToPar3 == 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is " + compareToPar3 + ". Congratulations! You got exactly par!");
                    $("#message4").css("color", "blue");
                }
                else if(compareToPar3 > 0){
                    $("#message4").text($("#name3").text() + ": Your score compared to par is \+" + compareToPar3 + ". You need serious practice. After that come back and try again.");
                    $("#message4").css("color", "red");
                }
            }
            if(!incomplete4){
                compareToPar4 = totalGrand4 - 72;
                if(compareToPar4 < 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is " + compareToPar4 + ". Well done! You are fit for the PGA!");
                    $("#message5").css("color", "green");
                }
                else if(compareToPar4 == 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is " + compareToPar4 + ". Congratulations! You got exactly par!");
                    $("#message5").css("color", "blue");
                }
                else if(compareToPar4 > 0){
                    $("#message5").text($("#name4").text() + ": Your score compared to par is \+" + compareToPar4 + ". You need serious practice. After that come back and try again.");
                    $("#message5").css("color", "red");
                }
            }
            if(!incomplete5){
                compareToPar5 = totalGrand5 - 72;
                if(compareToPar5 < 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is " + compareToPar5 + ". Well done! You are fit for the PGA!");
                    $("#message6").css("color", "green");
                }
                else if(compareToPar5 == 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is " + compareToPar5 + ". Congratulations! You got exactly par!");
                    $("#message6").css("color", "blue");
                }
                else if(compareToPar5 > 0){
                    $("#message6").text($("#name5").text() + ": Your score compared to par is \+" + compareToPar5 + ". You need serious practice. After that come back and try again.");
                    $("#message6").css("color", "red");
                }
            }
        }
    }
}

/*-------------------------------------------
 *   Reset Card function
 -------------------------------------------*/

function resetCard() {
    $("#rightCard").css("display", "none");
    $("#leftCardHeadings").css("display", "none");
    $(".tableHeader").remove();
    $(".player").remove();
    $(".dataItem").remove();
    $(".totals").remove();
    playerAmount = 0;
    playerNumber = 0;
    itemNumber = 0;
    init = false;
    errMaxPlayers = false;
    $("#selectCourseError").remove();
    $("#errorMessage").remove();
    $("#leftCard").html("Click \"Initialize Card\" to create your card.");
    $("#addPlayerButton").text("Initialize Card");
    $(".playerMessage").remove();
}

/*-------------------------------------------
 *   Reset Card function
 -------------------------------------------*/

function clearCard() {
    $(".totals").text("0");
    $(".input").val("");
    $(".playerMessage").text("This is where the score compared to par will appear.");
    $(".playerMessage").css("color", "black");
}
