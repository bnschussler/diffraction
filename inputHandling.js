
var linked=[
["zt","zs"],
["it","is"]];

linked.forEach(function(element){
	document.getElementById(element[0]).addEventListener("input",function(){ //these should only trigger with user input, not when they edit eachother's values
		document.getElementById(element[1]).value=document.getElementById(element[0]).value;
	});
	document.getElementById(element[1]).addEventListener("input",function(){
		document.getElementById(element[0]).value=document.getElementById(element[1]).value;
	});
});

function updateFilter() {
	document.getElementById("canvas").style.filter="hue-rotate("+document.getElementById("ht").value+"deg) saturate("+document.getElementById("st").value+"%) contrast("+document.getElementById("ct").value+"%)";
}

Array.from(document.getElementsByClassName('dropdown')).forEach(dropdown => {
  
  let options=dropdown.querySelector(".options");
  let temp=options.offsetHeight;

  options.setAttribute('style', dropdown.querySelector(".toggle input").checked?('height:'+temp+"px"):"height: 0px");

  dropdown.querySelector(".toggle input").addEventListener('change', function handle(event) {
    dropdown.querySelector(".toggle").style.background=this.checked?"#505050":"#303030";
    options.setAttribute('style', this.checked?('height:'+temp+"px"):"height: 0px");
  });
});

Array.from(document.getElementsByClassName('toggle')).forEach(toggle => {
  toggle.style.background=toggle.querySelector("input").checked?"#505050":"#303030";
  toggle.querySelector("input").addEventListener('change', function handle(event) {
    toggle.style.background=this.checked?"#505050":"#303030";
  });
});

window.onresize = function(){bb = canvas.getBoundingClientRect();};

function autoBOff(){
  document.getElementById("autoBdiv").style.background="#303030";
  document.getElementById('autoBright').checked=false
}

