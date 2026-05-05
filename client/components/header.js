async function loadHeader(){

const response = await fetch("/components/header.html");

const data = await response.text();

document
.getElementById("header")
.innerHTML = data;

}

loadHeader();