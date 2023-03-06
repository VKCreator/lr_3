"use strict";

function setLocalStorage() {
    localStorage.setItem('weightMachine', localStorage.getItem("weightMachine") || 1500);
    localStorage.setItem('weightPetrol', localStorage.getItem("weightPetrol") || 500);
    localStorage.setItem('weightImpulse', localStorage.getItem("weightImpulse") || 10);
    localStorage.setItem('speedExpiry', localStorage.getItem("speedExpiry") || 300);
    localStorage.setItem('maxSpeedTouch', localStorage.getItem("maxSpeedTouch") || 25);
    localStorage.setItem('accFreeFall', localStorage.getItem("accFreeFall") || 1.6);
    localStorage.setItem('limitTime', localStorage.getItem("limitTime")  || 120);
    localStorage.setItem('startDistance', localStorage.getItem("startDistance")  || 600);
}

setLocalStorage()

const statesApp = { OK: 'ok', ERROR: 'error', GAMING: 'gaming' };

const app = new Vue({
    el: "#app",
    data: {
        imgShip: new Image(),
        imgSurface: new Image(),
        surfaceMoonHeight: 100,
        startPositionX: null,
        startPositionY: null,
        currentPositionY: 0,
        weightMachine: +localStorage.getItem('weightMachine'),
        weightPetrol: +localStorage.getItem('weightPetrol'),
        weightImpulse: +localStorage.getItem('weightImpulse'),
        speedExpiry: +localStorage.getItem('speedExpiry'),
        maxSpeedTouch: +localStorage.getItem('maxSpeedTouch'),
        accFreeFall: +localStorage.getItem('accFreeFall'),
        limitTime: +localStorage.getItem('limitTime'),
        startDistance: +localStorage.getItem('startDistance'), // Начальная дистанция до поверхности
        currentSpeed: 0,
        time: 0,
        distance: 0,
        currentPetrol: 0,
        isStart: false,
        state: statesApp.OK,
        finishGame: "success", // или "fail", или "finishTime"
        step: null,
        allDistance: 1100, // Дистанция до поверхности от точки отсчёта
        offsetSurfaceMoon: 70,
        isInitSurface: false,
        imageCollection: {
            imgWithoutPetrol: "./img/spaceship_without_petrol.png",
            imgAllFlames: "./img/spaceship.png",
            imgOneFlames: "./img/spaceship_petrol_1-right.png",
            imgTwoFlames: "./img/spaceship_petrol_2-right.png",
            imgTwoFlamesNoMiddle: "./img/spaceship_petrol_2.png",
            imgOnlyMiddle: "./img/spaceship_petrol_onlymiddle.png",
            crash: "./img/crash.png",
            surface: "./img/moon_surface_crop.png"
        },
        image: {
            imgAllFlames: new Image(),
            imgOneFlames: new Image(),
            imgTwoFlames: new Image(),
            imgTwoFlamesNoMiddle: new Image(),
            imgOnlyMiddle: new Image(),
            crash: new Image(),
            imgWithoutPetrol: new Image(),
        }
    },
    methods: {
        initShip() {
            let canvas = document.querySelector("canvas");
            canvas.getContext("2d").clearRect(0,0, document.querySelector("canvas").width,  document.querySelector("canvas").height);

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight; 

            this.startPositionX = (canvas.width - this.imgShip.width) / 2;
            this.startPositionY = 0

            this.step = (canvas.height - (this.surfaceMoonHeight -  this.offsetSurfaceMoon) - this.imgShip.height) / this.allDistance ;
            this.currentPositionY = this.step * (this.allDistance - this.startDistance);

            // this.imgShip.onload = this.render

            if (this.isInitSurface){
                this.initSurface()
            }

            canvas.getContext("2d").drawImage(this.imgShip,  this.startPositionX, this.currentPositionY);
        },
        initSurface() {
            let canvas = document.querySelector("canvas");
            this.isInitSurface = true

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight; 

            canvas.getContext("2d").drawImage(this.imgSurface,  0, canvas.height - this.surfaceMoonHeight);
        },
        checkValue(event, nameProperty, isNotFloat=true) {

            this[nameProperty] = +event.target.value;

            let isString = false;
            if (!this.isNumber(event.target.value) || (event.target.value % 1 != 0 && isNotFloat)) {
                event.target.value = ""
                this[nameProperty] = ""
                isString = true;
            }

            let maxlength = event.target.getAttribute("max").length
            if (event.target.value.length > maxlength) {
                event.target.value = event.target.value.slice(0,  maxlength)
                this[nameProperty] = event.target.value;

            }

            if (isString || +event.target.value > +event.target.getAttribute("max") || +event.target.value < +event.target.getAttribute("min")) 
            {
                event.target.classList.add("is-invalid")
                event.target.classList.remove("is-valid")
            }
            else 
            {
                event.target.classList.add("is-valid")
                event.target.classList.remove("is-invalid")
                localStorage.setItem(nameProperty, this[nameProperty]);
            }

            this.isErrorInParams()
        },
        isNumber(value) {
            return value != ""
        },
        isErrorInParams() {
            let paramsContainer = document.querySelector(".paramsContainer")
            let inputs = [...paramsContainer.querySelectorAll("input")]

            this.state = statesApp.OK
            inputs.forEach(element => {
                if (element.classList.contains("is-invalid"))
                    this.state = statesApp.ERROR
            }); 
        },
        startGame(event) {

            // Set gaming state
            this.state = statesApp.GAMING
            this.isStart = true
            document.getElementById("startButton").blur()

            // Init currentPetrol
            this.currentPetrol =  this.weightPetrol;
            this.distance = this.startDistance

            // Disabled all params
            let paramsContainer = document.querySelector(".paramsContainer");
            let inputs = [...paramsContainer.querySelectorAll("input")];

            inputs.forEach(element => {
                element.setAttribute("disabled", "disabled")
            }); 

            // Let's go
            this.move()

        },
        move() {

            let diffdist;
            let timeInGame = 20 / 1000;

            const dt = 100 / 1000
            this.time += timeInGame

            if (document.getElementById("petrolButton").classList.contains("active") && (this.currentPetrol - this.weightImpulse) >= 0) 
            {
                // let imgArray = ["imgAllFlames", "imgOneFlames", "imgTwoFlames", "imgTwoFlamesNoMiddle", "imgOnlyMiddle"]
                // this.imgShip.src = this.imageCollection[imgArray[Math.floor(Math.random() * 5)]]
                let imgArray = ["imgAllFlames", "imgOneFlames", "imgTwoFlames", "imgTwoFlamesNoMiddle", "imgOnlyMiddle"]
                this.imgShip = this.image[imgArray[Math.floor(Math.random() * 5)]]

                this.currentPetrol -= (this.weightImpulse * timeInGame);
                this.currentSpeed = ((this.weightMachine + this.currentPetrol) * this.currentSpeed - this.weightImpulse * this.speedExpiry) / (this.weightMachine + this.currentPetrol - this.weightImpulse);
            }
            else 
            {
                this.imgShip = this.image.imgWithoutPetrol
                // this.currentSpeed += (this.accFreeFall * timeInGame);
                this.currentSpeed += (this.accFreeFall * dt);

            }

            diffdist = this.currentSpeed * dt;
            // diffdist = this.currentSpeed * timeInGame;
            this.distance -= diffdist;
            this.currentPositionY += (diffdist * this.step);

            this.render()

            let canvas = document.querySelector("canvas")

            if ((this.currentPositionY < (canvas.height - (this.surfaceMoonHeight -  this.offsetSurfaceMoon) - this.imgShip.height)) && (this.limitTime > this.time)) {
                setTimeout(this.move, 20);
            }
            else {
                // console.log("Касание")
                let result
                if (this.limitTime <= this.time) {
                    result = "Отведённое время на посадку космического корабля закончилось!"
                }
                else if (this.currentSpeed > this.maxSpeedTouch) {

                    this.imgShip = this.image.crash
                    result = "Космический корабль разбился! Превышена максимальная скорость касания!"
                }
                else {
                    this.imgShip = this.image.imgWithoutPetrol
                    result = `Космический корабль успешно приземлился! Скорость при посадке: ${this.currentSpeed.toFixed(2)} м/c. Поздравляем!`
                }

                this.render()

                this.distance = 0
                this.currentSpeed = 0

                $("#myModal").on('shown.bs.modal', function () {
                    $('#reloadButton').trigger('focus')
                })

                document.getElementById("textFinishGame").textContent = result
                new bootstrap.Modal(document.getElementById("myModal")).show()   

                // setTimeout(document.getElementById("reloadButton").focus, 1000) 
            }
        },
        supplyFuel() {
            let btn = document.getElementById("petrolButton");
            // btn.classList.toggle("active");
        },
        render() {
            let canvas = document.querySelector("canvas")
            canvas.getContext("2d").clearRect(0,0, document.querySelector("canvas").width,  document.querySelector("canvas").height);
            canvas.getContext("2d").drawImage(this.imgSurface,  0, canvas.height - this.surfaceMoonHeight);

            canvas.getContext("2d").drawImage(this.imgShip,  this.startPositionX, this.currentPositionY);
        },
        displayWindowSize() {

            let canvas = document.querySelector("canvas");
            canvas.width = canvas.offsetWidth; 
            canvas.height = canvas.offsetHeight;

            this.startPositionX = (canvas.width - this.imgShip.width) / 2;

            if (this.initSurface) {
                this.render()
            }
        },
        reload() {
            location.reload()
        }
    },
    computed: {
        isDisabled() {
            return this.state == statesApp.ERROR || this.state == statesApp.GAMING
        },
        petrolDisable() {
            return !this.isStart || !this.currentPetrol
        }
    },
    mounted() {

        // Game start
        let startButton = document.getElementById("startButton")
        startButton.focus()

        // Resize window
        window.addEventListener("resize", this.displayWindowSize);

        // Init sprites and change sizes a canvas
        let canvas = document.querySelector("canvas");

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight; 

        this.imgSurface.onload = this.initSurface
        this.imgSurface.src = this.imageCollection.surface;

        this.imgShip.onload = this.initShip
        this.imgShip.src = this.imageCollection.imgWithoutPetrol;

        this.image.imgAllFlames.src = this.imageCollection.imgAllFlames
        this.image.imgOneFlames.src = this.imageCollection.imgOneFlames
        this.image.imgOnlyMiddle.src = this.imageCollection.imgOnlyMiddle
        this.image.imgTwoFlames.src = this.imageCollection.imgTwoFlames
        this.image.imgTwoFlamesNoMiddle.src = this.imageCollection.imgTwoFlamesNoMiddle
        this.image.imgWithoutPetrol.src = this.imageCollection.imgWithoutPetrol
        this.image.crash.src = this.imageCollection.crash

    },
    watch: {
        startDistance() {
            this.initShip()
        },
        currentPetrol() {
            let btn = document.getElementById("petrolButton");

            if ((this.currentPetrol - this.weightImpulse) < 0) {
                btn.classList.remove("active");
                btn.classList.add("disabled")
            }
        }
    }
})