let listItems = document.querySelectorAll('.collection p');
listItems.forEach(item => item.addEventListener('click', () => {
    
    if(item.classList.contains('selected-remove')){
        item.classList.remove('selected-remove');
    }
    else if(item.classList.contains('selected-add')){
        item.classList.remove('selected-add');
    }
    else if(item.classList.contains('owned')){
        item.classList.add('selected-remove');
    }
    else{
        item.classList.add('selected-add');
    }
    
}));

document.getElementById("saveButton").addEventListener('click', submitChanges);

document.getElementById("songSelector").addEventListener('click', function(){changeView('song')});
document.getElementById("fossilSelector").addEventListener('click', function(){changeView('fossil')});
document.getElementById("artSelector").addEventListener('click', function(){changeView('art')});

function submitChanges(){
    let changelist = determineChanges();
    
    if(changelist){
        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/collection', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        let body = JSON.stringify({
            changes: changelist
        });
        xhr.send(body);

        xhr.onload = function(){
            window.location.reload();
        };
    }
}

function determineChanges(){
    let islandAdditions = [];
    let playerAdditions = [];
    let islandRemovals = [];
    let playerRemovals = [];
    
    listItems.forEach(item => {
        let itemType = item.parentElement.classList[1];
        if(item.classList.contains('selected-add')){
            switch(itemType){
                case "art":
                case "fossil":
                    islandAdditions.push({item_name: item.innerText, item_type: itemType});
                    break;
                case "song":
                    playerAdditions.push({item_name: item.innerText, item_type: itemType});
                    break;
            }
        }
        else if(item.classList.contains('selected-remove')){
            switch(itemType){
                case "art":
                case "fossil":
                    islandRemovals.push({item_name: item.innerText, item_type: itemType});
                    break;
                case "song":
                    playerRemovals.push({item_name: item.innerText, item_type: itemType});
                    break;
            }
        }
    });
    if(islandAdditions.length || islandRemovals.length || playerAdditions.length || playerRemovals.length)
        return {islandAdditions, playerAdditions, islandRemovals, playerRemovals};
    else
        return null;
}

function changeView(selection){
    let selectedId = `${selection}Selector`;
    if(!document.getElementById(selectedId).classList.contains('selected-view')){
        switch(selection){
            case "song":
                document.getElementById('songSelector').classList.add('selected-view');
                document.getElementById('fossilSelector').classList.remove('selected-view');
                document.getElementById('artSelector').classList.remove('selected-view');
                document.querySelector('.collection.song').classList.remove('hiddenView');
                document.querySelector('.collection.fossil').classList.add('hiddenView');
                document.querySelector('.collection.art').classList.add('hiddenView');
                break;
            case "fossil":
                document.getElementById('songSelector').classList.remove('selected-view');
                document.getElementById('fossilSelector').classList.add('selected-view');
                document.getElementById('artSelector').classList.remove('selected-view');
                document.querySelector('.collection.song').classList.add('hiddenView');
                document.querySelector('.collection.fossil').classList.remove('hiddenView');
                document.querySelector('.collection.art').classList.add('hiddenView');
                break;
            case "art":
                document.getElementById('songSelector').classList.remove('selected-view');
                document.getElementById('fossilSelector').classList.remove('selected-view');
                document.getElementById('artSelector').classList.add('selected-view');
                document.querySelector('.collection.song').classList.add('hiddenView');
                document.querySelector('.collection.fossil').classList.add('hiddenView');
                document.querySelector('.collection.art').classList.remove('hiddenView');
                break;
        }
    }
}