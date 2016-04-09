var spatialManager = {
	// "PRIVATE" DATA

	_nextSpatialID : 1, // make all valid IDs non-falsey (i.e. don't start at 0)

	_entities : [],

	// "PRIVATE" METHODS
	//
	// <none yet>


	// PUBLIC METHODS

	getNewSpatialID : function() {
		return this._nextSpatialID++;
	},

	register: function(entity) {
		var spatialID = entity.getSpatialID();
		this._entities[spatialID] = entity;
	},

	unregister: function(entity) {
		var spatialID = entity.getSpatialID();
		this._entities[spatialID] = undefined;
	},

	findEntitiesInRange: function(posX, posY, sizeX, sizeY) {
		var posX2,
			posY2,
			sizeX2,
			sizeY2;
		var entities = [];
		for(var i = 1 ; i < this._entities.length; i++){
			if(this._entities[i]){
				var pos = this._entities[i].getPos();
				posX2 = pos.posX;
				posY2 = pos.posY;
				var size = this._entities[i].getSize();
				sizeX2 = size.sizeX;
				sizeY2 = size.sizeY;
				
				var Xcollision = Math.abs(posX - posX2) - sizeX/2 - sizeX2/2;
				var Ycollision = Math.abs(posY - posY2) - sizeY/2 - sizeY2/2;

				if(Xcollision <= 0 && Ycollision <= 0){ 
					entities.push(this._entities[i])
				}
			}	
		}

		return entities;
	}
};