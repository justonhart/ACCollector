document.getElementById("songSelector").addEventListener('click', function(){changeView('song')});
document.getElementById("fossilSelector").addEventListener('click', function(){changeView('fossil')});
document.getElementById("artSelector").addEventListener('click', function(){changeView('art')});

let collections = document.querySelectorAll('.collection');

console.log(collections);

collections.forEach(collectionView => {
    if(!collectionView.firstElementChild){
        collectionView.hidden = true;
        document.getElementById(`${collectionView.classList[1]}Selector`).hidden = true;
    }
});

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