document.getElementById("addButton").addEventListener("click",showFriendEntry);
document.getElementById("cancelButton").addEventListener("click",closeFriendEntry);


function showFriendEntry(){
    document.getElementById("popup").removeAttribute("hidden");
}

function closeFriendEntry(){
	document.getElementById("popup").setAttribute("hidden", true);
	let fields = document.querySelectorAll("#popup input");
	fields.forEach(f => f.value = "");
}