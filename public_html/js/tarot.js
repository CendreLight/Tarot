var db;
var joueurs;
var name;
var mois = new Array("Janvier", "Février", "Mars", 
"Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", 
"Octobre", "Novembre", "Décembre");

$(document).ready(function() {
    if (!window.indexedDB) {
        window.$('#jeu').append("Your browser doesn't support a stable version of IndexedDB.")
    }

    openDatabase(loadParties);
    $('h1:contains("loading")').remove();
    bindNouvellePartie();
    
})

function bindNouvellePartie()
{
    $('.newGameButton').bind('click',function(){
        $.get('./web/newGame.html', function(data){
            $('div#jeu #newGameTarget').html(data);
            $('.close').bind('click',function(){
                $('div#jeu #newGamePopUp').remove();
            });
            $('.commencerPartie').bind('click',function(){
                var partie = {name : $('.nomPartie').val(),parties : new Array($('.nomJoueur1').val(),$('.nomJoueur2').val(),$('.nomJoueur3').val(),$('.nomJoueur4').val(),$('.nomJoueur5').val())};
                addPartie(partie);
                $('div#jeu #newGamePopUp').remove();
            });
        });
        
    });
}

function openDatabase(callback)
{
    var request = window.indexedDB.open("TarotDB", 8);
    $('#jeu').append("Ouverture de la base.<br/>");
    
    request.onerror = function(event) {
        $('#jeu').append("error: request "+e.value);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        $('#jeu').append("Database ouverte.<br/>");
        if (typeof callback == "function")
            callback();
        

    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        $('#jeu').append("Mise à jour de la base ...<br/>");
        if(db.objectStoreNames.contains("parties")) {
            db.deleteObjectStore("parties");
        }
        var objectStore = db.createObjectStore("parties", {keyPath: "id", autoIncrement : true});
        objectStore.createIndex("by_date", "date", { unique: false });
        objectStore.createIndex("by_name", "name", { unique: true });
        $('#jeu').append("Database mise à jour.<br/>");
        
    };
}

function read() {
    $('#jeu').append("Récupération des données ...<br/>");
    var transaction = db.transaction(["parties"],"readonly");
    var store = transaction.objectStore("parties");
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);    
    
    cursorRequest.onerror = function(event) {
        $('#jeu').append("Unable to retrieve data from database!");
    };
    cursorRequest.onsuccess = function(event) {
        var result = event.target.result;
        if(!result)
            return;
        var stringJoueurs = '';
        for (var i = 0; i < result.value.joueurs.length; i++) {
            stringJoueurs += result.value.joueurs[i] + " -- ";
        }
        $('#jeu').append("Partie du : "+result.value.date+", nom : "+result.value.name+", joueurs : "+ stringJoueurs +"<br/>");
        result.continue();
    };
}

function readAll() {
    var objectStore = db.transaction("customers").objectStore("customers");

    objectStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            $('#jeu').append("Name for id " + cursor.key + " is " + cursor.value.name + ", Age: " + cursor.value.age + ", Email: " + cursor.value.email);
            cursor.continue();
        }
        else {
            $('#jeu').append("No more entries!<br/>");
        }
    };
}

function addPartie(partie) {
    $('#jeu').append("Ajout de données ...<br/>");
    if(db.objectStoreNames.contains('parties'))
    {
        var trans = db.transaction(["parties"], "readwrite");
        var store = trans.objectStore("parties");
        var date = new Date();
        var request = store.put({date: date.getDate()+" "+mois[date.getMonth()]+" "+date.getFullYear(), name: partie.name,joueurs: partie.joueurs});        

        request.onsuccess = function(event) {
            $('#jeu').append("Partie crée.<br/>");
        };

        request.onerror = function(event) {
            $('#jeu').append("Erreur lors de l'ajout de la partie.<br/>");
            loadParties();
        };
        
        trans.oncomplete = function(){
            loadParties();
            return true;
        }
    }
    else
        $('#jeu').append("else.<br/>");
}

function remove() {

    var request = db.transaction(["customers"], "readwrite")
            .objectStore("customers")
            .delete("00-03");
    request.onsuccess = function(event) {
        $('#jeu').append("L'objet a bien été supprimé de la base.<br/>");
    };
}

function deleteByName(nomPartie)
{
    var transaction = db.transaction(["parties"],'readwrite');
    var objectStore = transaction.objectStore("parties");
    var index = objectStore.index('by_name');
    var request = index.get(nomPartie);
    
    request.onsuccess = function(event){
        var result = event.target.result;
        objectStore.delete(result.id);
    };
    
    request.onerror = function(event){
        $('#jeu').append("Error delete.<br/>");
    }
    
    transaction.oncomplete = function(){
        loadParties();
    };
}
function loadParties()
{
    $('menu ul li').not(':first-of-type').remove();
    var transaction = db.transaction(["parties"],"readonly");
    var store = transaction.objectStore("parties");
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange); 
    cursorRequest.onerror = function(event) {
        $('#jeu').append("Unable to retrieve data from database!");
    };

    cursorRequest.onsuccess = function(event) {
        var result = event.target.result;
        if(!result)
            return;
        $('menu ul').append("<li><a href='#' class='partie'>"+result.value.name+"</a></li>");
        result.continue();
    };
    
    transaction.oncomplete = function(){
        $('.partie').unbind();
        $('.partie').bind('click',function(){
            $('#jeu').append($(this).text()+"<br/>");
            deleteByName($(this).text());
        });
    }
    
}

function baseReady()
{ 

}