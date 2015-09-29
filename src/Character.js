import Stroke from './Stroke';
import ComboStroke from './ComboStroke';
import Drawable from './Drawable';
import {emptyFunc} from './utils';

class Character extends Drawable {

  constructor(pathStrings, options = {}) {
    super();
    this.options = options;
    this.strokes = [];
    const rawStrokes = pathStrings.map((pathString) => {
      return new Stroke(pathString, this.options);
    });
    let comboStrokeBuffer = [];
    for (const stroke of rawStrokes) {
      if (stroke.isComplete && comboStrokeBuffer.length === 0) {
        this.strokes.push(stroke);
      } else if (stroke.isComplete) {
        comboStrokeBuffer.push(stroke);
        this.strokes.push(new ComboStroke(comboStrokeBuffer, this.options));
        comboStrokeBuffer = [];
      } else {
        comboStrokeBuffer.push(stroke);
      }
    }
  }

  getBounds() {
    const strokeBoundingPoints = this.getAllStrokeBounds();
    const [maxY, , minY] = this.getExtremes(this.getAllYs(strokeBoundingPoints));
    const [maxX, , minX] = this.getExtremes(this.getAllXs(strokeBoundingPoints));
    return [{x: minX, y: minY}, {x: maxX, y: maxY}];
  }

  getAllStrokeBounds() {
    const bounds = [];
    for (const stroke of this.strokes) {
      const strokeBounds = stroke.getBounds();
      bounds.push(strokeBounds[0]);
      bounds.push(strokeBounds[1]);
    }
    return bounds;
  }

  getMatchingStroke(points) {
    let closestStroke = null;
    let bestAvgDist = 0;
    for (const stroke of this.strokes) {
      const avgDist = stroke.getAverageDistance(points);
      if (avgDist < bestAvgDist || !closestStroke) {
        closestStroke = stroke;
        bestAvgDist = avgDist;
      }
    }
    if (bestAvgDist < Character.DISTANCE_THRESHOLD) return closestStroke;
  }

  show(animationOptions = {}) {
    for (const stroke of this.strokes) {
      stroke.show(animationOptions);
    }
  }

  hide(animationOptions = {}) {
    for (const stroke of this.strokes) {
      stroke.hide(animationOptions);
    }
  }

  showStroke(strokeNum, animationOptions = {}) {
    this.getStroke(strokeNum).show(animationOptions);
  }

  getStroke(strokeNum) {
    return this.strokes[strokeNum];
  }

  getNumStrokes() {
    return this.strokes.length;
  }

  draw() {
    for (const stroke of this.strokes) {
      stroke.draw();
    }
  }

  animate(onComplete = emptyFunc) {
    this.hide({onComplete: () => this.animateStroke(onComplete, 0)});
  }

  setCanvas(canvas) {
    super.setCanvas(canvas);
    for (const stroke of this.strokes) {
      stroke.setCanvas(canvas);
    }
  }

  animateStroke(onComplete, strokeNum) {
    const stroke = this.strokes[strokeNum];
    stroke.animate(() => {
      if (strokeNum < this.strokes.length - 1) {
        const nextStroke = () => this.animateStroke(onComplete, strokeNum + 1);
        setTimeout(nextStroke, this.options.delayBetweenStrokes);
      } else {
        onComplete();
      }
    });
  }
}

Character.DISTANCE_THRESHOLD = 30;

export default Character;