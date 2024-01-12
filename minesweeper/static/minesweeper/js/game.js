const mineCount = 5;    // 지뢰 개수
var gameStarted = false;    // 게임시작 여부
var mines = new Set();


document.addEventListener('DOMContentLoaded', function() {
    var polygons = document.querySelectorAll('polygon');
    polygons.forEach(function(polygon) {
        // 마우스 커서가 해당 요소 위로 올라갔을 때 'polygon'의 채우기 색상을 흰색으로 바꿉니다.
        polygon.addEventListener('mouseover', function() {
            this.style.fill = 'white';
        });
        // 마우스 커서가 해당 요소에서 벗어났을 때 'polygon'의 채우기 색상을 연한 회색으로 바꿉니다.
        polygon.addEventListener('mouseout', function() {
            this.style.fill = 'lightgrey';
        });
        polygon.addEventListener('click', function() {
            if (!gameStarted) {
                gameStarted = true
                let id = this.getAttribute('id');
                placeMines(id);
            }
        });
    });
});


// polygon의 ID값을 랜덤으로 지정하여 'mines' Set에 추가하는 함수
function placeMines(excludeId) {
    var polygons = document.querySelectorAll('polygon');
    while (mines.size < mineCount) {
        let randomPolygon = polygons[Math.floor(Math.random() * polygons.length)];
        if (randomPolygon.getAttribute('id') !== excludeId) {
            mines.add(randomPolygon.getAttribute('id'));
        }
    }
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