const mineCount = 3;    // 지뢰 개수
let gameStarted = false;    // 게임시작 여부
let mines = new Set();    // 지뢰에 해당하는 ID Set

// 각 polygon의 넘버링, 혹은 지뢰 여부를 나타내는 객체
let polygonObjs = {};
let polygons = Array.from(document.querySelectorAll('polygon'));
polygons.forEach((polygon) => {
    polygonObjs[polygon.id] = 0;
});


document.addEventListener('DOMContentLoaded', function() {
    polygons.forEach(function(polygon) {
        polygon.addEventListener('click', function() {
            if (!gameStarted) {
                gameStarted = true
                let id = this.getAttribute('id');
                placeMines(id);    // 지뢰를 정함
                countMines();    // 각 polygon 인근의 지뢰 개수를 셈
            };
            revealPolygon(this);
        });
        // 우클릭 이벤트 추가
        polygon.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            drawFlag(this);
        });
    });
});


// 지뢰에 해당하는 polygon ID값을 랜덤으로 지정하는 함수
function placeMines(excludeId) {
    while (mines.size < mineCount) {
        let randomPolygon = polygons[Math.floor(Math.random() * polygons.length)];
        if (randomPolygon.getAttribute('id') !== excludeId) {
            mines.add(randomPolygon.getAttribute('id'));
        }
    }
    for (const mine of mines) {
        delete polygonObjs[mine];    
    }
}


// 주어진 id의 이웃하는 요소들의 id를 반환하는 함수
function getNeighbors(id) {
    const neighbors = [];
    const [x_len, y_len] = document.querySelector(`[id^="board"]`).getAttribute('id').slice(5).split('-');
    const [id_x, id_y] = id.split('-').map(Number);
    x_y = [
        [id_x-!(id_y%2), id_y-1], [id_x+(id_y%2), id_y-1], 
        [id_x-1, id_y], [id_x+1, id_y], 
        [id_x-!(id_y%2),id_y+1], [id_x+(id_y%2),id_y+1]
    ];
    for (const [x,y] of x_y) {
        if (y>=0 && y<y_len && x>=0 && x<(x_len-(y%2))) {
            neighbors.push(`${x}-${y}`);
        }
    }
    return neighbors
}


// 각 polygon마다 주변 지뢰의 개수를 세어 `polygonObjs`에 정리
function countMines() {
    polygons.forEach(function(polygon) {
        if (!mines.has(polygon.getAttribute('id'))) {
            let neighbors = getNeighbors(polygon.getAttribute('id'));    // 인접한 polygon ID값들
            for (const neighbor of neighbors) {
                if (mines.has(neighbor)) {
                    polygonObjs[polygon.getAttribute('id')]++;
                }
            }
        }
    });
}


//
function revealPolygon(polygon) {
    polygon.parentNode.appendChild(polygon);    // 가장 위 계층으로 옮기기
    polygon.style.fill = 'limegreen';
    polygon.style.stroke = 'green';
    if (mines.has(polygon.id)) {
        console.log("지뢰 있다");
    } else if(polygonObjs[polygon.id]==0) {
        delete polygonObjs[polygon.id];
        let neighbors = getNeighbors(polygon.id).filter(id => polygonObjs.hasOwnProperty(id));    // 인접한 polygon들의 ID 배열
        let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
        neighborPolygons.forEach(function(neighborPolygon) {
            revealPolygon(neighborPolygon);
        });
    } else {    
        let board = document.querySelector(`[id^="board"]`);
        let polygonPoints = polygon.getAttribute("points").split(" ");
        let polygonXY = calculateCenter(polygonPoints);
        let polygonNum = polygonObjs[polygon.id];
        displayNum(board, polygonXY, polygonNum);
    }
}


// 중앙 좌표 계산 함수
function calculateCenter(points) {
    let sumX = 0;
    let sumY = 0;
    for (const point of points) {
      const [x, y] = point.split(",").map(Number);
      sumX += x;
      sumY += y;
    }
    return { x: sumX/points.length, y: sumY/points.length };
}


// 인근 지뢰 개수를 표시해주는 함수
function displayNum(board, xy, num) {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", xy.x);
    textElement.setAttribute("y", xy.y+3);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("fill", "white");
    textElement.setAttribute("font-size", "8px");
    textElement.textContent = num;
    board.appendChild(textElement);
}


// 깃발을 그리는 함수
function drawFlag(polygon) {
    let board = document.querySelector(`[id^="board"]`);
    let polygonPoints = polygon.getAttribute("points").split(" ");
    let polygonXY = calculateCenter(polygonPoints);
    const flagElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // flagElement.setAttribute("d", "M" + (polygonXY.x-2) + " " + (polygonXY.y-4) + " l 4 0 l -2 4 z");
    // flagElement.setAttribute("fill", "red");
    // board.appendChild(flagElement);
    console.log(polygonXY);
}
