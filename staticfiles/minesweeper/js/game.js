//#region 변수
/** 게임 상태 */
const gameStatusObj = {
    NOT_STARTED: "notStarted",
    ONGOING: "ongoing",
    WIN: "win",
    LOSE: "lost",
}

const mineCount = 15;                          // 게임 내 지뢰 총 개수(40)
let gameStatus = gameStatusObj.NOT_STARTED;    // 현재 게임 상태
let mines = new Set();                         // 지뢰가 있는 곳의 ID Set
let flags = new Set();                         // 깃발이 있는 곳의 ID Set
let clickedPolygons = new Set();               // 이미 클릭된 곳의 ID Set
let leftDown = false, rightDown = false;       // 좌우 마우스 버튼 상태

const board = document.querySelector(`[id^="board"]`);

/** 
 * 각 polygon마다 주변에 몇 개의 지뢰가 있는지 정리된 객체. 
 * 
 * 각 요소는 "ID: 개수"의 형태로써 키값을 가집니다.
 */
let polygonObjs = {};
let polygons = Array.from(document.querySelectorAll('polygon'));
polygons.forEach((polygon) => {
    polygonObjs[polygon.id] = 0;
});

let stopwatchInterval = null;
let secondsElapsed = 0;
//#endregion



//#region 리스너
document.addEventListener('DOMContentLoaded', function() {
    // SVG 요소에 대해 브라우저의 기본 우클릭 이벤트와 드래그를 막습니다.
    let svgElement = document.querySelector('svg');
    svgElement.addEventListener('contextmenu', event => event.preventDefault());
    svgElement.addEventListener('mousedown', event => event.preventDefault());
    polygons.forEach(function(polygon) {
        polygon.addEventListener('click', leftClick);
        polygon.addEventListener('contextmenu', rightClick);
        polygon.addEventListener('mousedown', event => leftRightMouseDown(event, polygon));
        polygon.addEventListener('mouseup', function() {
            if (gameStatus===gameStatusObj.ONGOING && leftDown && rightDown) leftRightMouseUp(this);
        });
        polygon.addEventListener('mouseout', function() {
            if (gameStatus===gameStatusObj.ONGOING && leftDown && rightDown) leftRightMouseUp(this);
        });
    });
    displayFlagCount();
    calculateBestTime();
    calculateAverageTime();
});


document.getElementById('resetButton').addEventListener('click', resetGame);
//#endregion



//#region 함수
/** Session storaget의 평균기록을 표시합니다. */
function calculateAverageTime() {
    let times = JSON.parse(sessionStorage.getItem('times')) || [];
    if (times.length > 0) {
        let sum = times.reduce((a, b) => a + b, 0);
        let averageTime = sum / times.length;
        document.getElementById('averageTime').textContent = '평균 시간: ' + formatTime(Math.round(averageTime));
    }
}


/** Session storage의 최고기록을 표시합니다. */
function calculateBestTime() {
    let times = JSON.parse(sessionStorage.getItem('times')) || [];
    if (times.length > 0) {
        let bestTime = Math.min(...times);
        document.getElementById('bestTime').textContent = '최고 기록: ' + formatTime(bestTime);
    }
}


/**
 * 중앙 좌표 계산 함수
 * 
 * @param {Array} points  점들의 배열. 각 점은 "x,y" 형태의 문자열입니다.
 * @returns {Object} 중심점. { x: 중심의 x 좌표, y: 중심의 y 좌표 }
 */
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


/**
 * 주어진 id의 이웃들 중에 깃발이 있는 개수를 세어 반환합니다.
 *
 * @param {string} id - 깃발을 세려는 polygon의 id.
 * @returns {number} 깃발의 개수.
 */
function countFlags(id) {
    const neighbors = getNeighbors(id);
    const flagCount = neighbors.filter(neighbor => flags.has(neighbor)).length;
    return flagCount;
}


/** 각 polygon마다 주변 지뢰의 개수를 세어 `polygonObjs`에 정리합니다. */
function countMines() {
    polygons.forEach(function(polygon) {
        const id = polygon.getAttribute('id');
        if (!mines.has(id)) {
            const neighbors = getNeighbors(id);
            for (const neighbor of neighbors) {
                if (mines.has(neighbor)) polygonObjs[id]++;
            }
        }
    });
}


/**
 * 지뢰가 있는 모든 polygon에 지뢰를 표시합니다.
 * 
 * @param {Element} polygon 지뢰가 있는 polygon 요소
 * @param {string} imgURL 지뢰 이미지의 URL
*/
function displayAllMines(polygon, imgURL) {
    polygon.style.fill = 'orangered';
    mines.forEach((mine) => {
        let minePolygon = document.getElementById(mine);
        if (!flags.has(mine)) displayMine(minePolygon, imgURL);
    });
}


/** 현재 깃발의 개수를 계산하고 웹페이지에 표시합니다. */
function displayFlagCount() {
    document.getElementById('flagCount').textContent = '🚩' + (mineCount - flags.size).toString();
}


/**
 * 지뢰를 표시합니다.
 * 
 * @param {Element} polygon 지뢰를 표시할 polygon 요소
 * @param {string} imgURL 지뢰 이미지의 URL
 */
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


/**
 * 인근 지뢰 개수를 표시합니다.
 * 
 * @param {Element} polygon 숫자를 표시할 polygon 요소.
 * @param {Object} xy 표시할 위치. { x: x 좌표, y: y 좌표 }
 * @param {number} num 표시할 숫자.
  */
function displayNum(polygon, xy, num) {
    const numElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    numElement.setAttribute("x", xy.x);
    numElement.setAttribute("y", xy.y-1);
    numElement.setAttribute("text-anchor", "middle");
    numElement.setAttribute("dominant-baseline", "central");
    numElement.setAttribute("fill", "white");
    numElement.setAttribute("font-size", "8px");
    numElement.textContent = num;
    
    numElement.addEventListener('mousedown', function(event) {
        leftRightMouseDown(event, polygon);
    });
    numElement.addEventListener('mouseup', function(event) {
        leftRightMouseUp(polygon);
    });

    board.appendChild(numElement);
}


/** 
 * 'X'를 표시합니다.
 * 
 * @param {Element} polygon 'X'를 표시할 polygon 요소.
 */
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


/** 게임을 종료합니다. */
function endGame() {
    stopStopwatch();
    polygons.forEach((polygon) => {
        polygon.classList.add('game-ended');
    });
    if (gameStatus === gameStatusObj.WIN) {
        saveTime();
        calculateBestTime();
        calculateAverageTime();
        mines.forEach((mine) => {
            if (!flags.has(mine)) toggleFlag(document.getElementById(mine));  // 깃발이 없는 곳에 깃발 표시
        });
    }
}


/** 
 * 주어진 초를 'mm:ss' 형식으로 변환
 * 
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds - (minutes * 60);
    return minutes.toString().padStart(2, '0') + ':' + 
        secs.toString().padStart(2, '0');
}


/** 
 * 이웃하는 polygon들의 id값을 반환합니다.
 * 
 * @param {string} id 이웃을 계산할 polygon의 id.
 */
function getNeighbors(id) {
    const neighbors = [];
    const [x_len, y_len] = board.getAttribute('id').slice(5).split('-');
    const [id_x, id_y] = id.split('-').map(Number);
    neighborCoordinates = [
        [id_x-!(id_y%2), id_y-1], [id_x+(id_y%2), id_y-1], 
        [id_x-1, id_y], [id_x+1, id_y], 
        [id_x-!(id_y%2),id_y+1], [id_x+(id_y%2),id_y+1]
    ];
    for (const [x,y] of neighborCoordinates) {
        if (y>=0 && y<y_len && x>=0 && x<(x_len-(y%2))) {
            neighbors.push(`${x}-${y}`);
        }
    }
    return neighbors;
}


/** 좌클릭을 했을 때의 동작 정의 */
function leftClick() {
    // 게임시작 전
    if (gameStatus === gameStatusObj.NOT_STARTED) {
        gameStatus = gameStatusObj.ONGOING;
        let id = this.getAttribute('id');
        placeMines(id);
        countMines();
        startStopwatch();
        document.getElementById("guide-message").textContent = "벌을 피해 꿀을 채취하십시오."
    }
    // 게임진행 중
    if (gameStatus===gameStatusObj.ONGOING && !flags.has(this.id) && !clickedPolygons.has(this.id)) revealPolygon(this);
    // 모든 polygon이 클릭되었는지 확인하고, 그렇다면 게임 종료
    if (Object.keys(polygonObjs).every(id => clickedPolygons.has(id))) {
        gameStatus = gameStatusObj.WIN;
        endGame();
    }
}


/** 
 * 마우스의 좌우 버튼을 동시에 눌렀을 때의 동작 정의 
 *
 * @param {Event} event 발생한 이벤트.
 * @param {Element} polygon 이벤트가 발생한 polygon 요소. 
 */
function leftRightMouseDown(event, polygon) {
    const id = polygon.getAttribute('id');
    if (clickedPolygons.has(id) && gameStatus===gameStatusObj.ONGOING && polygonObjs[id]!==0) {
        if (event.button === 0) leftDown = true;
        else if (event.button === 2) rightDown = true;
        
        if (leftDown && rightDown) {
            let neighbors = getNeighbors(id).filter(neighbor => !clickedPolygons.has(neighbor) && !flags.has(neighbor));
            let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
            // 오답, 정답을 가리는 경우
            if (polygonObjs[id] === countFlags(id)) {
                neighborPolygons.forEach(function(neighborPolygon) {
                    revealPolygon(neighborPolygon);
                });
                // 모든 polygon이 클릭되었는지 확인하고, 그렇다면 게임 종료
                if (Object.keys(polygonObjs).every(id => clickedPolygons.has(id))) {
                    gameStatus = gameStatusObj.WIN;
                    endGame();
                }
            // 아무 일도 일어나지 않는 경우
            } else {
                neighborPolygons.forEach(function(neighborPolygon) {
                    neighborPolygon.classList.add('highlight');
                });
            }
        }
    }
}


/** 
 * 마우스의 좌우 버튼을 떼었을 때의 동작 정의 
 * @param {Element} polygon 이벤트가 발생한 polygon 요소. 
 */
function leftRightMouseUp(polygon) {
    leftDown = false;
    rightDown = false;

    // 인접한 polygon들의 색깔 원상복구
    let neighbors = getNeighbors(polygon.getAttribute('id'));
    let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
    neighborPolygons.forEach(function(neighborPolygon) {
        neighborPolygon.classList.remove('highlight');
    });
}


/**
 * 지뢰를 배치합니다. 지정된 polygon을 제외하고 무작위로 지뢰를 지정하여 'mines'에 저장합니다.
 * 
 * @param {string} excludeId 지뢰를 배치하지 않을 polygon의 id.
 */
function placeMines(excludeId) {
    let polygonsWithoutId = polygons.filter(polygon => polygon.getAttribute('id') !== excludeId);
    while (mines.size < mineCount) {
        let randomIndex = Math.floor(Math.random() * polygonsWithoutId.length);
        let randomPolygon = polygonsWithoutId.splice(randomIndex, 1)[0];
        mines.add(randomPolygon.getAttribute('id'));
    }
    // 지뢰가 배치된 polygon을 polygonObjs에서 제거합니다.
    for (const mine of mines) delete polygonObjs[mine];    
}


/** 게임을 리셋합니다. */
function resetGame() {
    // 각 text와 image 요소를 삭제합니다.
    let textElements = Array.from(board.getElementsByTagName('text'));
    let imageElements = Array.from(board.getElementsByTagName('image'));
    for (let i = 0; i < textElements.length; i++) board.removeChild(textElements[i])    
    for (let i = 0; i < imageElements.length; i++) board.removeChild(imageElements[i]);

    polygons.forEach(function(polygon) {
        polygon.style.fill = 'gold';
        polygon.style.stroke = 'peru';
        polygon.classList.remove('game-ended');
    });
   
    // 변수 초기화
    gameStatus = gameStatusObj.NOT_STARTED;
    mines.clear();
    flags.clear();
    clickedPolygons.clear();
    polygonObjs = {};
    polygons.forEach((polygon) => { polygonObjs[polygon.id] = 0; });

    resetStopwatch();
    displayFlagCount();
}


/** 스톱워치를 초기화합니다. */
function resetStopwatch() {
    stopStopwatch();
    secondsElapsed = 0;
    document.getElementById('stopwatch').textContent = '00:00';
}


/** 
 * polygon을 공개할 경우 발생하는 이벤트에 관한 함수
 * 
 * @param {Element} polygon 공개할 polygon 요소.
 */
function revealPolygon(polygon) {
    polygon.parentNode.appendChild(polygon);    // 가장 위 계층으로 옮기기
    polygon.style.fill = 'peru';
    polygon.style.stroke = 'sienna';
    
    // 지뢰가 있는 경우
    if (mines.has(polygon.id)) {
        gameStatus = gameStatusObj.LOSE;
        displayAllMines(polygon, "/static/minesweeper/images/bee.png");
        // 잘못된 곳에 깃발이 있는 경우 'X'를 표시
        flags.forEach((flag) => {
            if (!mines.has(flag)) {
                let flagElement = document.getElementById('flag' + flag);
                if (flagElement) flagElement.remove();
                displayX(document.getElementById(flag));
            }
        });
        endGame();
    // 지뢰가 없고, 주변에도 없는 경우
    } else if(polygonObjs[polygon.id]==0) {
        clickedPolygons.add(polygon.id);
        let neighbors = getNeighbors(polygon.id).filter(id => !clickedPolygons.has(id) && !flags.has(id));
        let neighborPolygons = polygons.filter(polygon => neighbors.includes(polygon.getAttribute('id')));
        neighborPolygons.forEach(function(neighborPolygon) {
            revealPolygon(neighborPolygon);
        });
    // 지뢰가 없고, 주변에 1개이상 있는 경우
} else {
    clickedPolygons.add(polygon.id);
    let polygonPoints = polygon.getAttribute("points").split(" ");
    let polygonXY = calculateCenter(polygonPoints);
    let polygonNum = polygonObjs[polygon.id];
    displayNum(polygon, polygonXY, polygonNum);
}
}


/** 우클릭을 했을 때의 동작 정의 */
function rightClick() {
    if (gameStatus===gameStatusObj.ONGOING && !clickedPolygons.has(this.id)) toggleFlag(this);
}


/** 스톱워치 시간을 Session storage에 저장합니다. */
function saveTime() {
    let times = JSON.parse(sessionStorage.getItem('times')) || [];
    times.push(secondsElapsed);
    sessionStorage.setItem('times', JSON.stringify(times));
}


/** 스톱워치 시작 */
function startStopwatch() {
    stopwatchInterval = setInterval(() => {
        secondsElapsed++;
        document.getElementById('stopwatch').textContent = formatTime(secondsElapsed);
    }, 1000);
}


/** 스톱워치 중지 */
function stopStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
}


/**
 * 깃발을 추가 혹은 제거합니다.
 * 
 * @param {Element} polygon 깃발을 추가하거나 제거할 polygon 요소.
*/
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
            if (gameStatus === gameStatusObj.ONGOING) toggleFlag(polygon);
        });
        
        board.appendChild(flagElement);
    }
    displayFlagCount();
}

//#endregion
