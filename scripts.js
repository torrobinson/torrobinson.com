// On click
var url ="https://www.torrobinson.com";

var currentUrl = url + '/home';

function setUrl(newUrl){
    document.getElementsByClassName('url')[0].innerHTML = newUrl;
}
document.addEventListener('click', function (event) {
    var el = event.target;

    // Handle active tab classes
    if (el.matches('.tab') ||el.closest('.tab') !== null){
        var clickedTab = el.closest('.tab');

        // Tab clicked

        // Deactivate others
        var tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));

        // Make it active
        clickedTab.classList.add("active");

        tabSwitchedTo(clickedTab.id);
    }

    // Handle page switching
    function tabSwitchedTo(id){

        // Update the fake URL
        setUrl(id === '' ? url : url + '/' + id);

        // Deactivate other pages
        var pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');

        // Show the new one
        var newPage = document.getElementById('page-' + id);
        newPage.style.display = 'block';
    }
}, false);


function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function distanceBetween(x1, y1, x2, y2){
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

var existingPoints = [];
function addPoint(id,x,y){
    window.existingPoints.push({
        x: x,
        y: y,
        id: id
    });
}
function removePoint(removeId){
    window.existingPoints = window.existingPoints.filter(p => p.id !== removeId);
}
function isTooCloseToExistingPoints(x, y, minimumDistance){
    if(window.existingPoints.length === 0) return false;
    for(var i=0; i<=window.existingPoints.length; i++){
        if(window.existingPoints[i] == undefined) continue;
        var distance = distanceBetween(x,y,existingPoints[i].x,existingPoints[i].y);
        if(
            distance < minimumDistance
        ){
            return true;
        }
    }
    return false;
}

// Create the star animations
var space = document.getElementsByClassName('space')[0];
var maxX = 250;
var maxY = 120;
var minDistanceBetweenStars = 75;

function createStar(){
    var star = document.createElement('i');

    star.classList.add('star');
    star.classList.add('fad');
    star.classList.add('fa-star-christmas');
    star.classList.add('vis');

    var depth = randomBetween(20,60);
    star.style.transform =  'translateZ('+depth+'px)';
    //star.classList.add('z-low');

    star.style.position = 'absolute';

    var lookingForPlace = true;
    var tries = 0;
    var maxTries = 20;
    while(lookingForPlace){
        var left = randomBetween(0, maxX);
        var top = randomBetween(0, maxY);
        if(!isTooCloseToExistingPoints(left, top, minDistanceBetweenStars)){
            lookingForPlace = false;
        }
        tries++
        if(tries >= maxTries){
            lookingForPlace = false;
        }
    }
    star.style.left = left;
    star.style.top = top;

    space.appendChild(star);

    var id = guid();
    addPoint(
        id,
        left,
        top
    );

    countdownToDeath(star, function(){
        removePoint(id);
        star = createStar();
    });
    return star;
}

function countdownToDeath(star, onDeath){
    var lifetime = randomBetween(500,10000);
    setTimeout(function(){
        // How to "kill" the star
        space.removeChild(star);

        // Death callback which spawns a new one
        onDeath();
    }, lifetime);
}


// Wait for page total load
document.addEventListener("DOMContentLoaded", function() {
    // Actually spawn the stars
    var starCount = 7;
    for(var x = 0; x < starCount; x++){
        var star = createStar();
    }

    // Set default starting url
    setUrl(currentUrl);
});
