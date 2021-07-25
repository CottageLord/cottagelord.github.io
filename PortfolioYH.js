// adapted from PM1.js
var pm3 = {
    currentTab: null,
    lastBtn   : null
}

// Toggle selected tab
pm3.selectTab = function (contentID) {
    pm3.currentTab.classList.remove('selected');
    pm3.currentTab.classList.add('unselected');
    pm3.currentTab = document.getElementById(contentID);
    pm3.currentTab.classList.remove('unselected');
    pm3.currentTab.classList.add('selected');
}

window.addEventListener('load', function () {
    var tabs = document.getElementsByClassName("tab");

    // set "Content" as the lastBtn and highlighted
    pm3.lastBtn = tabs[0];
    pm3.lastBtn.style.backgroundColor = "#111";
    //var notes = document.getElementsByClassName("notecontent");
    // Add functionality to change content on click
    for (var i = 0; i < tabs.length; i++) {
    	tabs[i].addEventListener('click', function (evt) {
            // reset last btn colors
            pm3.lastBtn.style.background = "#333";
            // highlight clicked btn
    	    var tab = document.getElementById(evt.target.id);
            tab.style.backgroundColor = "#111";
            // update lastBtn
            pm3.lastBtn = tab;
            // scroll back to top
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
            //if(tab.id == "note") for (var j = notes.length - 1; j >= 0; j--) notes[j].scrollTop = 0; // reset all notes
            
    	    return pm3.selectTab(tab.getAttribute("associated-content"));
    	});
        tabs[i].addEventListener('mouseover', function (evt) {
            var tab = document.getElementById(evt.target.id);
            tab.style.backgroundColor = "#111";
        });
        // mouseleave only works when the leaving button is not selected (clicked)
        tabs[i].addEventListener('mouseleave', function (evt) {
            var tab = document.getElementById(evt.target.id);
            if(evt.target != pm3.lastBtn){
                tab.style.backgroundColor = "#333";
            }
        });
    }

    var content = document.getElementsByClassName("tabcontent");

    // Set only first content to shown
    for (var i = 1; i < content.length; i++) {
	   content[i].classList.add('unselected');
    }
    pm3.currentTab = content[0];
    content[0].classList.add('selected');

    var acc = document.getElementsByClassName("accordion");
    var i;
    
    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
    // on hover effects

    
    var bodies = document.getElementsByClassName("bodyspace");
    var divs = document.getElementsByClassName("overviewdiv");
    for (var i = bodies.length - 1; i >= 0; i--) {
        bodies[i].addEventListener('mouseleave', function (evt) {
            this.parentNode.style.backgroundImage = "url(media/bg_default.png)";
            for (var j = divs.length - 1; j >= 0; j--) {
                divs[j].classList.remove('hide');
                divs[j].classList.add('unfocused');
            }
        });
    }

    for (i = 0; i < divs.length; i++) {
        divs[i].addEventListener('mouseover', function (evt) {
            this.parentNode.parentNode.parentNode.style.backgroundImage = "url(" + this.getAttribute("associated-img") + ")";
            for (var j = divs.length - 1; j >= 0; j--) {
                divs[j].classList.remove('focused');
                divs[j].classList.remove('unfocused');
                divs[j].classList.add('hide');
            }
            this.classList.remove('unfocused');
            this.classList.remove('hide');
            this.classList.add('focused');

            //document.getElementById('navidiv').classList.add('hide');

        });
        divs[i].addEventListener('mouseleave', function (evt) {
            for (var j = divs.length - 1; j >= 0; j--) {
                divs[j].classList.remove('hide');
                divs[j].classList.remove('focused');
                divs[j].classList.add('unfocused');
            }
            //document.getElementById('navidiv').classList.remove('hide');
        });
    }


    // functions to perform gradual change animation
    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        )
    }

    function amountscrolled(){
        var winheight= window.innerHeight || (document.documentElement || document.body).clientHeight;
        var docheight = getDocHeight();
        var scrollTop = window.pageYOffset || 
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
        var trackLength = docheight - winheight;
        var pctScrolled = Math.floor(scrollTop/trackLength * 100); // gets percentage scrolled (ie: 80 or NaN if tracklength == 0)
        //console.log(pctScrolled + '% scrolled');
        var whoami = document.getElementById('whoami');
        var thanksletter = document.getElementById('thanksletter');
        if (pctScrolled > 45 && pctScrolled <= 65) {
            whoami.style.color = "green";
            whoami.innerHTML = "实践者";
        }
        else if (pctScrolled <= 45) {
            whoami.style.color = "pink";
            whoami.innerHTML = "爱好者";
        } else if (pctScrolled > 65) {
            whoami.style.color = "yellow";
            whoami.innerHTML = "梦想家";
            thanksletter.style.opacity = (pctScrolled - 65) / 40;
            //console.log(thanksletter.style.opacity);
        }
    }
     
    window.addEventListener("scroll", function(){
        if(document.getElementById('home').classList.contains('selected')) amountscrolled();
    }, false);

    // codes for disabling scrolling when focusing on notes
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    /*
    // TODO: when note is scroll to bottom, disable scroll down
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
      if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
      }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
      window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
        get: function () { supportsPassive = true; } 
      }));
    } catch(e) {}

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    var notepage = document.getElementById('note');
    // call this to Disable
    function disableScroll() {
      notepage.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
      notepage.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
      notepage.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
      notepage.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
      notepage.removeEventListener('DOMMouseScroll', preventDefault, false);
      notepage.removeEventListener(wheelEvent, preventDefault, wheelOpt); 
      notepage.removeEventListener('touchmove', preventDefault, wheelOpt);
      notepage.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    var notes = document.getElementsByClassName("notecontent");
    for (var i = notes.length - 1; i >= 0; i--) {
        notes[i].addEventListener('mouseover', function (evt) {
            disableScroll();
        });
        notes[i].addEventListener('mouseleave', function (evt) {
            enableScroll();
        });
    }*/
});

