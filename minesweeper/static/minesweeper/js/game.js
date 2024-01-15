const mineCount = 5;    // 지뢰 개수
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
            }
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



// const board = document.getElementById("board");

// // 첫 번째 도형에 숫자 입력
// const polygon1 = document.getElementById("polygon6");
// const polygon1Points = polygon1.getAttribute("points").split(" ");
// const polygon1CenterX = calculateCenterX(polygon1Points);
// const polygon1CenterY = calculateCenterY(polygon1Points);
// addText(board, polygon1CenterX, polygon1CenterY, "42");

// // 중앙 좌표 계산 함수
// function calculateCenterX(points) {
//     let sumX = 0;
//     for (const point of points) {
//       const [x, _] = point.split(",");
//       sumX += parseInt(x);
//     }
//     return sumX / points.length;
// }

// function calculateCenterY(points) {
//     let sumY = 0;
//     for (const point of points) {
//         const [_, y] = point.split(",");
//         sumY += parseInt(y);
//     }
//     return sumY / points.length;
// }

// // 텍스트 추가 함수
// function addText(board, x, y, text) {
//     const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
//     textElement.setAttribute("x", x);
//     textElement.setAttribute("y", y+5);
//     textElement.setAttribute("text-anchor", "middle");
//     textElement.setAttribute("fill", "white");
//     textElement.textContent = text;
//     board.appendChild(textElement);
// }