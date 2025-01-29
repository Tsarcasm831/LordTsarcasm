// collision.js - Centralized collision detection system

export class CollisionSystem {
  /**
   * Check if two rectangles are colliding using AABB collision detection
   * @param {number} x1 - First rectangle's x position
   * @param {number} y1 - First rectangle's y position
   * @param {number} w1 - First rectangle's width
   * @param {number} h1 - First rectangle's height
   * @param {number} x2 - Second rectangle's x position
   * @param {number} y2 - Second rectangle's y position
   * @param {number} w2 - Second rectangle's width
   * @param {number} h2 - Second rectangle's height
   * @returns {boolean} True if the rectangles are colliding
   */
  static checkRectangleCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 &&
           x1 + w1 > x2 &&
           y1 < y2 + h2 &&
           y1 + h1 > y2;
  }

  /**
   * Resolve a collision between two rectangles by calculating the minimum translation vector
   * @param {Object} obj1 - First object with x, y, width, height properties
   * @param {Object} obj2 - Second object with x, y, width, height properties
   * @returns {Object} Translation vector {x, y} to resolve the collision
   */
  static resolveCollision(obj1, obj2) {
    const dx = (obj1.x + obj1.width / 2) - (obj2.x + obj2.width / 2);
    const dy = (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    const combinedHalfWidths = (obj1.width + obj2.width) / 2;
    const combinedHalfHeights = (obj1.height + obj2.height) / 2;

    if (Math.abs(dx) < combinedHalfWidths && Math.abs(dy) < combinedHalfHeights) {
      const overlapX = combinedHalfWidths - Math.abs(dx);
      const overlapY = combinedHalfHeights - Math.abs(dy);
      
      if (overlapX >= overlapY) {
        return { x: 0, y: dy > 0 ? overlapY : -overlapY };
      } else {
        return { x: dx > 0 ? overlapX : -overlapX, y: 0 };
      }
    }
    
    return { x: 0, y: 0 };
  }

  /**
   * Handle collisions between a moving object and a list of collidable objects
   * @param {Object} movingObj - The moving object (e.g., player)
   * @param {Array} collidableObjects - Array of objects to check collisions against
   */
  static handleCollisions(movingObj, collidableObjects) {
    collidableObjects.forEach(obj => {
      if (obj.collidable && this.checkRectangleCollision(
        movingObj.x, movingObj.y, movingObj.width, movingObj.height,
        obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height
      )) {
        const resolution = this.resolveCollision(movingObj, {
          x: obj.x - obj.width / 2,
          y: obj.y - obj.height / 2,
          width: obj.width,
          height: obj.height
        });
        
        movingObj.x += resolution.x;
        movingObj.y += resolution.y;
      }
    });
  }

  /**
   * Check if a point is inside a rectangle
   * @param {number} pointX - Point x coordinate
   * @param {number} pointY - Point y coordinate
   * @param {number} rectX - Rectangle x position
   * @param {number} rectY - Rectangle y position
   * @param {number} rectWidth - Rectangle width
   * @param {number} rectHeight - Rectangle height
   * @returns {boolean} True if the point is inside the rectangle
   */
  static pointInRectangle(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
    return pointX >= rectX &&
           pointX <= rectX + rectWidth &&
           pointY >= rectY &&
           pointY <= rectY + rectHeight;
  }
}
