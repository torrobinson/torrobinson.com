// Helpers
var helpers = {
    randomBetween: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    distanceBetween: function(x1, y1, x2, y2){
        return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
    },
    guid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
};


// Browser
var browser = {
    rootUrl: "https://www.torrobinson.com",
    supportedIds: ['home','code','social'],
    currentUrl: function(){
        if(this.history.length === 0) return null;
        return this.history[this.history.length-1].url
    },
    functions:{
        forceRenderAddressBar: function(){
            document.getElementsByClassName('url')[0].value = browser.currentUrl();
        },
        setUrl: function(newUrl){
            browser.history.push({
                id: helpers.guid(),
                url: newUrl
            });

            browser.functions.forceRenderAddressBar();
        },
        shake: function(){
            document.body.classList.add('shake');
            setTimeout(function(){
                document.body.classList.remove('shake');
            }, 500);
        }
    },
    events:{
        tabSwitchedTo: function(id, customUrl){
            // Handle the tabs

            // Deactivate others
            var tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Make it active
            var clickedTab = document.querySelectorAll('.tab[id="'+id+'"]')[0];
            clickedTab.classList.add("active");

            // Update the fake URL
            if(id !== 'custom'){
                browser.functions.setUrl(id === '' ? browser.rootUrl : browser.rootUrl + '/' + id);
            }
            else if(customUrl !== undefined){
                browser.functions.setUrl(customUrl);
                document.getElementById('bad-url').textContent = customUrl;
            }
            else{
                browser.functions.setUrl('');
            }


            // Deactivate other pages
            var pages = document.querySelectorAll('.page');
            pages.forEach(page => page.style.display = 'none');

            // Show the new one
            var newPage = document.getElementById('page-' + id);
            newPage.style.display = 'block';
        },
        enterPressedInAddressBar: function(){
            var attemptedUrl = document.getElementsByClassName('url')[0].value;

            if(
                attemptedUrl.startsWith(browser.rootUrl)
                &&
                browser.supportedIds.includes(attemptedUrl.replace(browser.rootUrl + '/',''))
            ){
                // Internal
                var pageId = attemptedUrl.replace(browser.rootUrl + '/','');
                browser.events.tabSwitchedTo(pageId);
            }
            else{
                var tab = document.querySelectorAll('.tab[id="custom"]')[0];
                tab.style.display = 'inline-block';
                browser.events.tabSwitchedTo('custom', attemptedUrl);
            }
        },
        buttons: {
            homePressed: function(){
                // On home press, go home
                browser.events.tabSwitchedTo('home');
            },
            backPressed: function(){
                if(browser.history.length > 1){
                    // Grab the url before last
                    var urlToGoTo = browser.history[browser.history.length - 2].url;

                    // Pop current page off twice, since we need to pop and then setting the url
                    // will add the same page again
                    browser.history.pop();
                    browser.history.pop();

                    // Parse page Id and navigate
                    if(
                        urlToGoTo.startsWith(browser.rootUrl)
                        &&
                        browser.supportedIds.includes(urlToGoTo.replace(browser.rootUrl + '/',''))
                    ){
                        var pageId = urlToGoTo.replace(browser.rootUrl + '/','');
                        browser.events.tabSwitchedTo(pageId);
                    }
                    else{
                        browser.events.tabSwitchedTo('custom', urlToGoTo);
                    }
                }
            },
        }
    },
    history: [
        {
            id: helpers.guid(),
            url: "https://www.torrobinson.com" + '/home'
        }
    ] // array of id and url
};

// Stars
var stars = {
    starCount: 8,
    areaWidth: 300,
    areaHeight: 120,
    minDistanceBetweenStars: 50,
    existingPoints: [],
    cssFadeTime: 0,
    addPoint: function(id,x,y){
        this.existingPoints.push({
            x: x,
            y: y,
            id: id
        });
    },
    removePoint: function(removeId){
        this.existingPoints = this.existingPoints.filter(p => p.id !== removeId);
    },
    isTooCloseToExistingPoints: function(x, y, minimumDistance){
        if(this.existingPoints.length === 0) return false;
        for(var i=0; i<=this.existingPoints.length; i++){
            if(this.existingPoints[i] == undefined) continue;
            var distance = helpers.distanceBetween(x,y,this.existingPoints[i].x,this.existingPoints[i].y);
            if(
                distance < minimumDistance
            ){
                return true;
            }
        }
        return false;
    },
    createStar: function(){
        var star = document.createElement('i');

        star.classList.add('star');
        star.classList.add('fad');
        star.classList.add('fa-star-christmas');


        var depth = helpers.randomBetween(20,60);
        star.style.transform =  'translateZ('+depth+'px)';
        //star.classList.add('z-low');

        star.style.position = 'absolute';

        var lookingForPlace = true;
        var tries = 0;
        var maxTries = 20;
        while(lookingForPlace){
            var left = helpers.randomBetween(0, this.areaWidth);
            var top = helpers.randomBetween(0, this.areaHeight);
            if(!stars.isTooCloseToExistingPoints(left, top, stars.minDistanceBetweenStars)){
                lookingForPlace = false;
            }
            tries++
            if(tries >= maxTries){
                lookingForPlace = false;
            }
        }
        star.style.left = left;
        star.style.top = top;

        var space = document.getElementsByClassName('space')[0];
        space.appendChild(star);

        var id = helpers.guid();
        this.addPoint(
            id,
            left,
            top
        );

        // Wait 100 ms unitl it's on screen and then throw the 'vis' class on it to beging the css opacity transition
        setTimeout(function(){
            star.classList.add('vis');
        }, 10);

        // Start the countdown to death
        this.countdownToDeath(star, function(){
            stars.removePoint(id);
            star = stars.createStar();
        });

        return star;
    },
    countdownToDeath: function(star, onDeath){
       var lifetime = helpers.randomBetween(500,10000);

       // Start a countdown
       setTimeout(function(){
           // How to "kill" the star
           var space = document.getElementsByClassName('space')[0];
           space.removeChild(star);

           // Death callback which spawns a new one
           onDeath();
       }, lifetime);

       // Start another counter X milleseconds before hand to apply CSS transition
       setTimeout(function(){
           star.classList.remove('vis');
       }, lifetime - this.cssFadeTime);
   }
};


document.addEventListener('click', function (event) {
    var el = event.target;

    // Handle active tab classes
    if (el.matches('.tab') ||el.closest('.tab') !== null){
        var clickedTab = el.closest('.tab');
        browser.events.tabSwitchedTo(clickedTab.id);
    }

}, false);



// Wait for page total load
document.addEventListener("DOMContentLoaded", function() {

    // To ensure we know the actual fade time of our stars from code, build and render one
    var _temp = document.createElement('div');
    _temp.classList.add('star');
    document.body.appendChild(_temp);
    setTimeout(function() {

        // And now that a repaint has been done and we can assume the dummy-star is on screen,
        // derive it's transition duration and set our cssFadeTime variable which will be used to
        // start star fades exactly before the stars are supposed to die
        stars.cssFadeTime = getComputedStyle(_temp).transitionDuration;
        if(stars.cssFadeTime.endsWith('s')){
            stars.cssFadeTime = parseFloat(stars.cssFadeTime.replace('s','')) * 1000;
        }
        else{
            cssFadeTime = parseInt(cssFadeTime);
        }
        document.body.removeChild(_temp);

        // Actually start to spawn the stars. They will loop themselves.
        for(var x = 0; x < stars.starCount; x++){
            var star = stars.createStar();
        }

        // Render initial address bar
        browser.functions.forceRenderAddressBar();

        // Watch for Enter presses in the address bar
        document.getElementsByClassName('url')[0].addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                browser.events.enterPressedInAddressBar();
            }
        });

        document.body.style.opacity = 1.0;

    }, 0);
});


var defaultColorScheme = document.documentElement.style;
var themes = {
    pale: function(){
        document.documentElement.style = defaultColorScheme;
    },
    dark: function(){
        var html = document.documentElement;
        html.style.setProperty('--red','#6d4254');
        html.style.setProperty('--yellow','#796433');
        html.style.setProperty('--green','#346b61');
        html.style.setProperty('--blue','#007cef');
        html.style.setProperty('--blue-secondary','#024c90');
        html.style.setProperty('--blue-glow','rgb(12, 91, 165)');
        html.style.setProperty('--white','rgb(33, 33, 33)');
        html.style.setProperty('--light-grey','rgb(27, 27, 27)');
        html.style.setProperty('--darker-grey','rgb(21, 21, 21)');
        html.style.setProperty('--darkest-grey','rgb(14, 14, 14)');
        html.style.setProperty('--black','#d0d0d0');
        html.style.setProperty('--address-bar-color','var(--white)');
        html.style.setProperty('--site-background-color','#101010');
    },
    vivid: function(){
        var html = document.documentElement;
        html.style.setProperty('--red','#ff006a');
        html.style.setProperty('--yellow','#ffb200');
        html.style.setProperty('--green','#00ffd2');
        html.style.setProperty('--blue','#0085ff');
        html.style.setProperty('--blue-glow','rgba(117, 183, 244, 0.25)');
        html.style.setProperty('--blue-secondary','var(--red)');
        html.style.setProperty('--white','rgb(255, 255, 255)');
        html.style.setProperty('--light-grey','rgba(237,237,237,1.0)');
        html.style.setProperty('--darker-grey','rgba(212,212,212,1.0)');
        html.style.setProperty('--darkest-grey','rgba(200,200,200,1.0)');
        html.style.setProperty('--black','#565656');
        html.style.setProperty('--address-bar-color','var(--white)');
        html.style.setProperty('--site-background-color','var(--red)');
    }
};

// Set a theme picker dropdown
var themeNames = Object.getOwnPropertyNames(themes);
var themeDropdown = document.getElementById('theme-select');
themeNames.forEach(themeName => {
    themeDropdown.options[themeDropdown.options.length] = new Option(themeName.charAt(0).toUpperCase() + themeName.slice(1),themeName);
});
document.addEventListener('input', function (event) {
	if (event.target.id === 'theme-select'){
        eval('themes.' + themeDropdown.value + '();');
    }
}, false);

// Decide on which default theme to use
function changeToDefaultTheme(){
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // dark mode
        themes.dark();
    }
    else{
        themes.pale();
    }
}

// Decide default theme immediately
changeToDefaultTheme();

// And watch for dark-mode changes to re-evaluate
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    changeToDefaultTheme();
});
