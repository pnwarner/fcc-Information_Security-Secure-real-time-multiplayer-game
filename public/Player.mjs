class Player {
    constructor({x, y, score, id}) {
        this.x = x,
        this.y = y,
        this.score = score
        this.id = id
    }
  
    movePlayer(dir, speed) {
      switch(dir){
        case "up":
          this.y -= speed;
          break
        case "down":
          this.y += speed;
          break
        case "left":
          this.x -= speed;
          break
        case "right":
          this.x += speed;
          break
      }
    }
  
    collision(item) {
      let itemx = item.x;
      let itemx2 = item.x + 25;
      let itemy = item.y;
      let itemy2 = item.y + 25;
      let xCollision = false;
      let yCollision = false;
      if ((itemx >= this.x) && (itemx <= this.x + 50) || (itemx2 >= this.x) && (itemx2 <= this.x + 50)) {
        xCollision = true;
      }
      if ((itemy >= this.y) && (itemy <= this.y + 50) || (itemy2 >= this.y) && (itemy2 <= this.y + 50)) {
        yCollision = true;
      }
      if (xCollision && yCollision) {
        return true
      } else {
        return false
      }
    }
  
    calculateRank(arr) {
      arr.sort((a, b) => b.score - a.score);
      let position = (arr.findIndex(obj => obj.id === this.id))+1;
      return `Rank: ${position}/${arr.length}`;
    }
  }
  
  export default Player;
  