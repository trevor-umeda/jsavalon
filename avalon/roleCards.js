module.exports.AllyCard = function(){
    return{
        isEnemy : function(){
            return false;
        },

        //Convert the tile into json
        tojson : function(){
            var data = {
                isEnemy: false
            };
            return data;
        }
    }
}

module.exports.EnemyCard = function(){
    return{
        isEnemy : function(){
            return true;
        },

        //Convert the tile into json
        tojson : function(){
            var data = {
                isEnemy: true
            };
            return data;
        }
    }
}

