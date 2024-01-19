const mineCount = 4;    // 지뢰 개수
let gameState = "notStarted";   // 게임 상태(notStarted, ongoing, ended 중 하나)
let mines = new Set();    // 지뢰에 해당하는 ID Set
let flags = new Set();   // 깃발이 있는 polygon의 ID Set

// 각 polygon의 넘버링, 혹은 지뢰 여부를 나타내는 객체
let polygonObjs = {};
let polygons = Array.from(document.querySelectorAll('polygon'));
polygons.forEach((polygon) => {
    polygonObjs[polygon.id] = 0;
});


document.addEventListener('DOMContentLoaded', function() {

    // SVG 요소에 대해 브라우저의 기본 우클릭 이벤트를 막습니다.
    let svgElement = document.querySelector('svg');
    svgElement.addEventListener('contextmenu', function(event) {
        event.preventDefault();
    });

    polygons.forEach(function(polygon) {
        polygon.addEventListener('click', function() {
            if (gameState === "notStarted") {
                gameState = "ongoing";
                let id = this.getAttribute('id');
                placeMines(id);    // 지뢰를 정함
                countMines();    // 각 polygon 근처의 지뢰의 개수를 셉니다.
            }
            if (gameState === "ongoing") {
                revealPolygon(this);
            }
        });
        // 우클릭 이벤트 추가
        polygon.addEventListener('contextmenu', function(event) {
            if (gameState === "ongoing") {
                toggleFlag(this);    // 깃발 표시 혹은 제거
            }
        });
    });
});


// 지뢰에 해당하는 polygon ID값을 랜덤으로 지정하여 'mines'에 저장하는 함수
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


// 이웃하는 polygon들의 id값을 반환하는 함수
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


// polygon을 좌클릭시 발생하는 이벤트에 관한 함수
function revealPolygon(polygon) {
    polygon.parentNode.appendChild(polygon);    // 가장 위 계층으로 옮기기
    polygon.style.fill = 'peru';
    polygon.style.stroke = 'sienna';
    if (mines.has(polygon.id)) {
        // polygon에 지뢰가 있는 경우
        displayAllMines(polygon, "/static/minesweeper/images/bee.png");
        gameState = "ended";  // 게임 상태를 종료로 변경
        // return ;
    } else if(polygonObjs[polygon.id]==0) {
        delete polygonObjs[polygon.id];
        let neighbors = getNeighbors(polygon.id).filter(id => polygonObjs.hasOwnProperty(id));    // 인접한 polygon들의 ID 배열
        let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
        neighborPolygons.forEach(function(neighborPolygon) {
            revealPolygon(neighborPolygon);
        });
    } else {    
        const board = document.querySelector(`[id^="board"]`);
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


// 깃발을 표시 혹은 제거하는 함수
function toggleFlag(polygon) {    
    const flagId = 'flag' + polygon.id;
    let existingFlag = document.getElementById(flagId);
    if (existingFlag) {
        flags.delete(polygon.id);
        existingFlag.remove();
    } else {
        flags.add(polygon.id);    // 'flag' Set에 polygon ID값을 추가
        let polygonCenter = calculateCenter(polygon.getAttribute("points").split(" "));
        const board = document.querySelector(`[id^="board"]`);
        const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElement.setAttribute("x", polygonCenter.x);
        textElement.setAttribute("y", polygonCenter.y);
        textElement.setAttribute("text-anchor", "middle");
        textElement.setAttribute("dominant-baseline", "central");
        textElement.setAttribute("font-size", "8px");
        textElement.setAttribute("font-family", "Arial, Helvetica, sans-serif");
        textElement.setAttribute("id", flagId);
        textElement.textContent = "🚩"; 

        // 깃발 아이콘에 대한 우클릭 이벤트 핸들러를 추가
        textElement.addEventListener('contextmenu', function(event) {
            if (gameState === "ongoing") {
                toggleFlag(polygon);
            }
        });

        board.appendChild(textElement);
    }
}


// 지뢰를 표시하는 함수
function displayMine(polygon, imgURL) {
    const board = document.querySelector(`[id^="board"]`);
    const imageElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    let polygonCenter = calculateCenter(polygon.getAttribute("points").split(" "));
    imageElement.setAttribute("x", polygonCenter.x - 5);
    imageElement.setAttribute("y", polygonCenter.y - 5);
    imageElement.setAttribute("height", "10");
    imageElement.setAttribute("width", "10");
    imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", imgURL);
    board.appendChild(imageElement);
}


// 모든 지뢰를 표시하는 함수
function displayAllMines(polygon, imgURL) {
    polygon.style.fill = 'orangered';
    mines.forEach((mine) => {
        let allPolygon = document.getElementById(mine);
        displayMine(allPolygon, imgURL);
    });
}
