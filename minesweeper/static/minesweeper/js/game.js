const mineCount = 6;    // 지뢰 개수
let gameState = "notStarted";   // 게임 상태(notStarted, ongoing, ended 중 하나)
let mines = new Set();    // 지뢰에 해당하는 ID Set
let flags = new Set();   // 깃발이 있는 polygon의 ID Set
let clickedPolygons = new Set(); // 클릭된 polygon의 id를 저장하는 Set 객체

const board = document.querySelector(`[id^="board"]`);    // 'board'로 시작하는 요소(=svg 요소)

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
    // SVG 요소에 대해 드래그를 못하게 합니다.
    svgElement.addEventListener('mousedown', function(event) {
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
            if (gameState === "ongoing" && !flags.has(this.id)) {
                revealPolygon(this);
                // 모든 polygon이 클릭되었는지 확인하고, 그렇다면 게임 종료
                if (Object.keys(polygonObjs).every(id => clickedPolygons.has(id))) {
                    gameState = "ended";
                    polygons.forEach((polygon) => {
                        polygon.classList.add('game-ended');
                    });
                    console.log("Game over");
                }
            }
        });
        // polygon 태그에 우클릭 이벤트 추가
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
    const [x_len, y_len] = board.getAttribute('id').slice(5).split('-');
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
    return neighbors;
}


// polygon을 좌클릭시 발생하는 이벤트에 관한 함수
function revealPolygon(polygon) {
    polygon.parentNode.appendChild(polygon);    // 가장 위 계층으로 옮기기
    polygon.style.fill = 'peru';
    polygon.style.stroke = 'sienna';

    if (mines.has(polygon.id)) {
        // polygon에 지뢰가 있는 경우
        displayAllMines(polygon, "/static/minesweeper/images/bee.png");
        // 지뢰가 없는 곳에 깃발이 있는 경우 'X'를 표시
        flags.forEach((flag) => {
            if (!mines.has(flag)) {
                let flagElement = document.getElementById('flag' + flag);
                if (flagElement) flagElement.remove();
                displayX(document.getElementById(flag));
            }
        });
        // 게임이 끝났을 때 모든 polygon에 'game-ended' 클래스 추가
        polygons.forEach((polygon) => {
            polygon.classList.add('game-ended');
        });
        gameState = "ended";  // 게임 상태를 종료로 변경
        console.log("Game over");
    } else if(polygonObjs[polygon.id]==0) {
        // polygon에 지뢰가 없고, 주변에도 없는 경우
        // delete polygonObjs[polygon.id];
        clickedPolygons.add(polygon.id);
        let neighbors = getNeighbors(polygon.id).filter(id => !clickedPolygons.has(id) && !flags.has(id));    // 인접한 polygon들의 ID 배열
        let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
        neighborPolygons.forEach(function(neighborPolygon) {
            revealPolygon(neighborPolygon);
        });
    } else {
        // polygon에 지뢰가 없고, 주변에 1개이상 있는 경우
        let polygonPoints = polygon.getAttribute("points").split(" ");
        let polygonXY = calculateCenter(polygonPoints);
        let polygonNum = polygonObjs[polygon.id];
        displayNum(polygonXY, polygonNum);
        clickedPolygons.add(polygon.id);
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
function displayNum(xy, num) {
    const numElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    numElement.setAttribute("x", xy.x);
    numElement.setAttribute("y", xy.y-1);
    numElement.setAttribute("text-anchor", "middle");
    numElement.setAttribute("dominant-baseline", "central");
    numElement.setAttribute("fill", "white");
    numElement.setAttribute("font-size", "8px");
    numElement.textContent = num;
    board.appendChild(numElement);
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
        const flagElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
        flagElement.setAttribute("x", polygonCenter.x);
        flagElement.setAttribute("y", polygonCenter.y);
        flagElement.setAttribute("text-anchor", "middle");
        flagElement.setAttribute("dominant-baseline", "central");
        flagElement.setAttribute("font-size", "8px");
        flagElement.setAttribute("font-family", "Arial, Helvetica, sans-serif");
        flagElement.setAttribute("id", flagId);
        flagElement.textContent = "🚩"; 

        // 깃발 아이콘에 대한 우클릭 이벤트 핸들러를 추가
        flagElement.addEventListener('contextmenu', function(event) {
            if (gameState === "ongoing") {
                toggleFlag(polygon);
            }
        });

        board.appendChild(flagElement);
    }
}


// 지뢰를 표시하는 함수
function displayMine(polygon, imgURL) {
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
        let minePolygon = document.getElementById(mine);
        if (!flags.has(mine)) {
            displayMine(minePolygon, imgURL);
        }
    });
}


// 'X'를 표시하는 함수
function displayX(polygon) {
    const xElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    let polygonCenter = calculateCenter(polygon.getAttribute("points").split(" "));
    xElement.setAttribute("x", polygonCenter.x);
    xElement.setAttribute("y", polygonCenter.y);
    xElement.setAttribute("text-anchor", "middle");
    xElement.setAttribute("dominant-baseline", "central");
    xElement.setAttribute("font-size", "8px");
    xElement.setAttribute("fill", "red");
    xElement.setAttribute("font-family", "Arial, Helvetica, sans-serif");
    xElement.textContent = "X"; 
    board.appendChild(xElement);
}