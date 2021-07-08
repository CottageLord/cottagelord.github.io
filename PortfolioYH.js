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
});
