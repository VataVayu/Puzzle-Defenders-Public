/**
 *  param image: A full image object which should have been set in the varpage will have its 
 *  	pointer passed in
 *	param rectangleWidthHeight: Represents the width and height of the drawn sprites rectangle
 *		NOTE: This should be a Pair (see the VarContainer) containing width then height (ints): [width, height]
 *  param xyCanvasCoords: Represents the top left x and y cordinates on the canvas where the sprite should be drawn
 *		NOTE: This again should be a Pair of ints: [x, y]
 *	param xyScale: Represents the x and y scalar values that should be applied to the sprite
 *		NOTE: This once again should be a Pair containing 2 floats: [xScale, yScale]
 *	param animationCount: Represents the number of animation in the given sprite
 *		NOTE: If this param is null then no animation will be performed and the first sprite of 
 *			rectangleWidthHeight size will be drawn. This will cause frameIndex and animationsPerRow to be ignored!
 *	param animationsPerRow: Represents the number of animations per row on the sprite sheet
 **/
function Sprite(image, rectangleWidthHeight, animationCount, animationsPerRow) {
	var sourceXY = new Pair(0, 0);
	this.xyScale = new Pair(rectangleWidthHeight.getFirst() / 48, rectangleWidthHeight.getSecond() / 48);
	if (animationCount != null && animationsPerRow == null) {
		animationsPerRow = animationCount;
	}
	
	/**
	 *	param xyCanvasCoords: Represents the top left x and y cordinates on the canvas where the sprite should be drawn
	 *	NOTE: This again should be a Pair of ints: [x, y]
	 **/
	this.draw = function(col, row, frameIndex, xIncreasedScale, yIncreasedScale) {
		adjustToFrame(frameIndex);
		if (xIncreasedScale == null || yIncreasedScale == null) {
			xIncreasedScale = this.xyScale.getFirst();
			yIncreasedScale = this.xyScale.getSecond();
		}
		
		context2D.drawImage(	image,                // The source Image object
						sourceXY.getFirst(),  //moves to the second tile  +32
						sourceXY.getSecond(), // the y position in the tile sheet
						rectangleWidthHeight.getFirst(), // x-rectangle
						rectangleWidthHeight.getSecond(), // y-rectangle
						col * variableContainer.cellDimensions.getFirst(),// - (rectangleWidthHeight.getFirst() / 2), // x-coordinate in the canvas
						row * variableContainer.cellDimensions.getSecond(),// - (rectangleWidthHeight.getSecond() / 2), // y-coordinate in the canvas
						xIncreasedScale * variableContainer.cellDimensions.getFirst(),  //x-scale
						yIncreasedScale * variableContainer.cellDimensions.getSecond()  //y-scale
						);
		sourceXY.setFirst(0);
		sourceXY.setSecond(0);
	}
	
	/**
	 * This functions allows for rotation of an image given a central point to pivot around and an angle
	 **/
	this.drawRotatedImage = function(col, row, xOffset, yOffset, angle, frameIndex, xIncreasedScale, yIncreasedScale) {
		adjustToFrame(frameIndex);
		if (xIncreasedScale == null || yIncreasedScale == null) {
			xIncreasedScale = this.xyScale.getFirst();
			yIncreasedScale = this.xyScale.getSecond();
		}
		// save the current co-ordinate system 
		// before we screw with it
		context2D.save();
 
		// move to the middle of where we want to draw our image
		context2D.translate((col + xOffset) * variableContainer.cellDimensions.getFirst(), 
			(row + yOffset) * variableContainer.cellDimensions.getSecond());
 
		// rotate around that point, converting our 
		// angle from degrees to radians 
		context2D.rotate(-angle * variableContainer.TO_RADIANS);
		
		// draw it up and to the left by half the width
		// and height of the image 
		context2D.drawImage(image, -xOffset * variableContainer.cellDimensions.getFirst(), 
			-yOffset * variableContainer.cellDimensions.getSecond(), 
			xIncreasedScale * variableContainer.cellDimensions.getFirst(),
			yIncreasedScale * variableContainer.cellDimensions.getSecond());
 
		// and restore the co-ords to how they were when we began
		context2D.restore();
		sourceXY.setFirst(0);
		sourceXY.setSecond(0);
	
	}
	
	/**
	 * This function allows for mirro fliping an image around the Y axis. 
	 * Can be improved to allow for relection around the X axis if needed.
	 **/
	this.drawFlipImage = function(col, row, frameIndex, xIncreasedScale, yIncreasedScale){
		adjustToFrame(frameIndex);
		if (xIncreasedScale == null || yIncreasedScale == null) {
			xIncreasedScale = this.xyScale.getFirst();
			yIncreasedScale = this.xyScale.getSecond();
		}
		
		context2D.save();
		context2D.scale(-1, 1);
		
		var translateFlipX = -2 * (col * variableContainer.cellDimensions.getFirst()) - 
			(this.xyScale.getFirst() * variableContainer.cellDimensions.getFirst());
		context2D.translate(translateFlipX, 0);
		context2D.drawImage(	image,                // The source Image object
							sourceXY.getFirst(),  //moves to the second tile  +32
							sourceXY.getSecond(), // the y position in the tile sheet
							rectangleWidthHeight.getFirst(), // x-rectanle
							rectangleWidthHeight.getSecond(), // y-rectangle
							(col * variableContainer.cellDimensions.getFirst()) , // - (rectangleWidthHeight.getFirst() / 2), // x-coordinate in the canvas
							(row * variableContainer.cellDimensions.getSecond()) , // - (rectangleWidthHeight.getSecond() / 2), // y-coordinate in the canvas
							xIncreasedScale * variableContainer.cellDimensions.getFirst(),
							yIncreasedScale * variableContainer.cellDimensions.getSecond()
							);
	
		context2D.restore();
		sourceXY.setFirst(0);
		sourceXY.setSecond(0);
	}
	
	/**
	 * Adjusts the sprite to be at the correct index. This is used only when the frameIndex is > 0
	 **/
	var adjustToFrame = function(frameIndex) {
		if (animationCount != null && frameIndex != null && frameIndex != 0) {
			if (frameIndex  > animationCount) {
				frameIndex = frameIndex % animationCount;
			}
			sourceXY.setFirst(Math.floor(frameIndex % animationsPerRow) 
								* rectangleWidthHeight.getFirst());
			sourceXY.setSecond(Math.floor(frameIndex / animationsPerRow) 
								* rectangleWidthHeight.getSecond());
		}
	}
}