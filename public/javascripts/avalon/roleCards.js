var AllyCard = function(){
//	this.suit = s;
//	this.value = v;

    this.isEnemy = function(){
        return false;
    }
	//Return a comparable value for the tile.
	this.sval = function(){ 
		return this.suit * 10 + this.value
	}
	
	//Convert the tile into json
	this.tojson = function(){ 
		var data = { 
			isEnemy: false
		};
		return data;
	}

}

var EnemyCard = function(){
//    this.suit = s;
//    this.value = v;

    this.isEnemy = function(){
        return true;
    }
    //Return a comparable value for the tile.
    this.sval = function(){
        return this.suit * 10 + this.value
    }

    //Convert the tile into json
    this.tojson = function(){
        var data = {
            isEnemy: true
        };
        return data;
    }

}

