const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const $sprite = document.querySelector('#sprite')
const $bricks = document.querySelector('#bricks')

//tamaño del canvas
canvas.width = 448
canvas.height = 400

//variables globales del juego
const ballRadius = 3

//posicion de la pelota
let x = canvas.width / 2
let y = canvas.height - 30

//velocidad de la bola
let dx = -2
let dy = -2

//variables de la paleta
const paddleHeight = 10
const paddleWidth = 50
let paddleX = (canvas.width - paddleWidth) / 2
let paddleY = canvas.height - paddleHeight - 10
let rightPressed = false
let leftPressed = false
const PADDLE_SENSITIVITY = 6

//variables de los birkcs
const bricksRowCount = 6
const bricksColumnCounts = 13
const brickWidth = 30
const brickHeight = 14
const bricksPadding = 2
const bricksOffSetTop = 80
const bricksOffSetLeft = 17
const bricks = []
const BRICK_STATUS = {
	NOHITTED: 1,
	HITTED: 0
}

for (let c = 0; c < bricksColumnCounts; c++) {
	bricks[c] = [] //inicia array vacio
	for (let r = 0; r < bricksRowCount; r++) {
		//calcula la posicion del ladrillo en la pantalla
		const bricksX = c * (brickWidth + bricksPadding) + bricksOffSetLeft
		const bricksY = r * (brickHeight + bricksPadding) + bricksOffSetTop

		//asigna colores aleatorios a los bricks
		const random = Math.floor(Math.random() * 8)

		//guarda la info del brick
		bricks[c][r] = {
			x: bricksX,
			y: bricksY,
			status: BRICK_STATUS.NOHITTED,
			color: random
		}
	}
}

//Funciones
function drawBall() {
	ctx.beginPath()
	ctx.arc(x, y, ballRadius, 0, Math.PI * 2)
	ctx.fillStyle = '#fff'
	ctx.fill()
	ctx.closePath()
}

//dibuja la paleta
function drawPaddle() {
	ctx.drawImage(
		$sprite, //imagen
		29, //coordenadas del recorte X
		174, //coordenadas de recorte Y
		paddleWidth, //el tamaño del recorte ancho
		paddleHeight, // el tamaño del recorte alto
		paddleX, //posicion X del dibujo
		paddleY, // posicion Y del dibujo
		paddleWidth, //ancho del dibujo
		paddleHeight //alto del dibujo
	)
}

function drawBricks() {
	for (let c = 0; c < bricksColumnCounts; c++) {
		for (let r = 0; r < bricksRowCount; r++) {
			const currentBrick = bricks[c][r]
			if (currentBrick.status === BRICK_STATUS.HITTED) continue

			const clipX = currentBrick.color * 32

			ctx.drawImage(
				$bricks,
				clipX,
				0,
				32,
				16,
				currentBrick.x,
				currentBrick.y,
				brickWidth,
				brickHeight
			)
		}
	}
}
function collisionDetection() {
	//recupera el bloque actual
	for (let c = 0; c < bricksColumnCounts; c++) {
		for (let r = 0; r < bricksRowCount; r++) {
			const currentBrick = bricks[c][r]
			//si esta golpeado el bloque continua
			if (currentBrick.status === BRICK_STATUS.HITTED) continue;

			const isBallSameXAsBrick =
				x > currentBrick.x && x < currentBrick.x + brickWidth
			const isBallSameYAsBrick =
				y > currentBrick.y && y < currentBrick.y + brickHeight

			//si la bola esta en la misma eje de x e y que el bloque es que hay una colision y lo ha golpeado
			if(isBallSameXAsBrick && isBallSameYAsBrick){
				dy=-dy
				currentBrick.status = BRICK_STATUS.HITTED
			}
		}
	}
}

function ballMovement() {
	//la pelota toca la pala
	const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth
	const isBallTouchingPaddle = y + dy > paddleY

	//rebote en las paredes
	if (
		x + dx > canvas.width - ballRadius || //rebote pared derecha
		x + dx < ballRadius // rebote pared izquierda
	) {
		dx = -dx
	}

	//rebote en el techo
	if (y + dy < ballRadius) {
		dy = -dy
	}

	//cuando toque la pala
	if (isBallSameXAsPaddle && isBallTouchingPaddle) {
		dy = -dy //si toca la pala cambia de direccion
	} else if (y + dy > canvas.height - ballRadius) {
		//si sale por la parte de abajo pierde
		console.log('Game over')
		document.location.reload()
	}

	//movimiento de la pala
	x += dx
	y += dy
}

/*
    para el movimiento a la izquierda no hay que tener nada en cuenta porque llega hasta 0 y para, 
    pero para el movimiento a la derecha hay que tener en cuenta el tamaño de la paleta para que 
    no se cuele masdel tamaño del canvas
*/
function paddleMovement() {
	if (rightPressed && paddleX < canvas.width - paddleWidth) {
		paddleX += PADDLE_SENSITIVITY
	} else if (leftPressed && paddleX > 0) {
		paddleX -= PADDLE_SENSITIVITY
	}
}

//limpia el canvas completo
function cleanCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
}

/* 
    movimientos de la paleta a derecha e izquierda,
    contempla que se usen tanto las flechas de direccion como las letras A(izquierda) y D (derecha)
*/
function initEvents() {
	document.addEventListener('keydown', keyDownHandler)
	document.addEventListener('keyup', keyUpHandler)

	//recoge la tecla presionada
	function keyDownHandler(event) {
		const { key } = event
		if (key === 'Right' || key === 'ArrowRight' || key === 'd') {
			rightPressed = true
		} else if (key === 'Left' || key === 'ArrowLeft' || key === 'a') {
			leftPressed = true
		}
	}

	//recoge cuando la tecla presionada se a levantado
	function keyUpHandler(event) {
		const { key } = event
		if (key === 'Right' || key === 'ArrowRight' || key === 'd') {
			rightPressed = false
		} else if (key === 'Left' || key === 'ArrowLeft' || key === 'a') {
			leftPressed = false
		}
	}
}

function draw() {
	cleanCanvas()
	//creacion de elementos
	drawBall()
	drawPaddle()
	drawBricks()

	//colisiones y movimientos
	collisionDetection()
	ballMovement()
	paddleMovement()

	window.requestAnimationFrame(draw)
}

draw()
initEvents()
