const canvases = document.querySelectorAll(".section__bg");
const svg = document.querySelector("svg");
const pathElement = svg.querySelector("path");
let gap = 30;
let quality = 15;
let imageOffset = 80;
let wavesOffset = 30;
let animationSpeed = 1.5;
const contexts = [];
let firstTime = true;

let perlinYOffset = 2;
let perlinScale = 200;

const tempCanvas = document.querySelector(".temp-canvas");

let someData = {
    imageAlpha: 0,
};
let dataPrev = Date.now();

let img = new window.Image();
img.crossOrigin = `Anonymous`;

img.src = "./assets/logo-my-biz-20.jpg";

img.onload = function() {
    // const tempCanvas = document.createElement("canvas");
    // tempCanvas.width = img.width;
    // tempCanvas.height = img.height;
    tempCanvas.width = svg.clientWidth;
    tempCanvas.height = svg.clientHeight;
    console.log(svg.clientWidth, svg.clientWidth);

    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true, alpha: false });

    // const left = (tempCanvas.width - img.width) / 2;
    // const top = (tempCanvas.height - img.height) / 2;
    // tempCtx.drawImage(img, left, top);
    drawImageScaled(img, tempCtx)

    let imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data = imgData.data;

    let part = 0;
    let dt = 0.1;
    function makeImageDarker(alpha = 1) {
        tempCtx.save();
        // tempCtx.fillStyle = "rgba(0, 0, 0, 1)";
        // tempCtx.fillRect(0, 0, canvases[0].width, canvases[0].height);
        tempCtx.canvas.width = tempCtx.canvas.width;
        drawImageScaled(img, tempCtx);
        
        tempCtx.fillStyle = `rgba(0, 0, 0, ${1 - alpha})`;
        tempCtx.fillRect(0, 0, canvases[0].width, canvases[0].height);
        // tempCtx.globalAlpha = alpha;
        // tempCtx.drawImage(img, left, top);
        tempCtx.restore();

        part += 1;
    }

    function update() {
        imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        data = imgData.data;
    }

    window.makeImageDarker = makeImageDarker;

    function startAnimaton(local_part) {   
        function animateFunction() {
            if(local_part != part) {
                update();
            }

            // contexts.forEach((ctx) => {
            //     draw(ctx, data, dt);
            // });
            draw(null, data, dt);
            // draw(contexts[0], data, dt);
    
            dt += animationSpeed;
    
            //animate stuff
            window.requestAnimationFrame(animateFunction);
        }
        window.requestAnimationFrame(animateFunction);
    }

    TweenLite.to(someData, .5, { imageAlpha: 1, ease: "power2.out" });
    startAnimaton(part);


    
    (window.onresize = () => {
        canvases.forEach(canvas => {
            canvas.width = innerWidth, canvas.height = innerHeight;
        });
        tempCanvas.width = svg.clientWidth;
        tempCanvas.height = svg.clientHeight;
        drawImageScaled(img, tempCtx);
        imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        data = imgData.data;

        gap = 30;
        quality = 15;
        imageOffset = 80;
        wavesOffset = 30;

        if(innerWidth < 1024) {
            quality = 10
        }

        if(innerWidth < 850) {
            quality = 5
            gap = 15
            imageOffset = 30
            wavesOffset = 20;
            console.log('small');
        }
    })();
}

for (let canvasEl of canvases) {
    // canvasEl.width = canvasEl.clientWidth;
    // canvasEl.height = canvasEl.clientHeight;
    // const ctx = canvasEl.getContext("2d", { alpha: false });
    // contexts.push(ctx);

    draw(window.ctx, null, 1);
}

function hideImage(time = 2) {
    TweenLite.to(someData, time, { imageAlpha: 0, ease: "power2.out" });
}

function showImage(time = 2) {
    TweenLite.to(someData, time, { imageAlpha: 1, ease: "power2.out" });
}

document.querySelector(".ctrl-btn--hide").addEventListener('click', () => hideImage());
document.querySelector(".ctrl-btn--show").addEventListener('click', () => showImage());

function draw(ctx, imageData, perlinOffset) {
    // ctx.beginPath();
    // ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.fillStyle = "#000";
    // ctx.fill();
    // ctx.canvas.width = ctx.canvas.width;

    if (firstTime) {
        firstTime = false;
        TweenLite.to(someData, 0.5, { imageAlpha: 1, ease: "power2.out" });
    }
    let local_gap = gap;
    if(local_gap < 1) local_gap = 20;

    let path = '';
        
    // ctx.beginPath();
    for (let y = gap; y < svg.clientHeight; y += local_gap) {
        
        const prln = perlin.noise(perlinOffset / perlinScale, (y + perlinOffset / perlinYOffset) / perlinScale, 1);
        let prln_val = map_range(prln, 0, 1, 0, wavesOffset);
        // ctx.moveTo(0, y - prln_val);
        path += `M${0} ${y - prln_val.toFixed(4)}`;
        for (let x = 0; x < svg.clientWidth + quality; x += quality) {
            let local_y = y;
            if(imageData) {
                const pixelStart = (svg.clientWidth * y + x) * 4;
                const val = imageData[pixelStart];
                local_y -= map_range(val, 0, 255, 0, imageOffset) * someData.imageAlpha;
            }
            if(perlinOffset) {
                const prln = perlin.noise((x + perlinOffset) / perlinScale, (y + perlinOffset / perlinYOffset) / perlinScale, 1);
                let prln_val = map_range(prln, 0, 1, 0, wavesOffset);
                local_y -= prln_val;
            }
            // ctx.lineTo(x, local_y << 0);
            path += `L${x} ${local_y.toFixed(4)}`;

            let dateNow = Date.now();
            if(dateNow >= dataPrev + 70) {
                console.log(dateNow - dataPrev, x, local_y, perlinOffset, y + perlinOffset / 2);
            }
            dataPrev = dateNow;
        }
        
    }

    pathElement.setAttribute('d', path);
    // console.log(path);
    // ctx.strokeStyle = "rgba(255, 255, 255, .6)";
    // ctx.stroke();
}

function map_range(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}

function drawImageScaled(img, ctx) {
    const canvas = ctx.canvas ;
    const hRatio = canvas.width  / img.width    ;
    const vRatio =  canvas.height / img.height  ;
    const ratio  = Math.min ( hRatio, vRatio );
    const centerShift_x = ( canvas.width - img.width*ratio ) / 2;
    const centerShift_y = ( canvas.height - img.height*ratio ) / 2;  
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(img, 0,0, img.width, img.height,
                        centerShift_x,centerShift_y,img.width*ratio, img.height*ratio);  
}

const settings = QuickSettings.create(20, 100, 'settings');
settings.addRange('gap', 10, 100, gap, 1, (val) => {gap = val});
settings.addRange('quality', 5, 150, quality, 1, (val) => {quality = val});
settings.addRange('imageOffset', 0, 200, imageOffset, 1, (val) => {imageOffset = val});
settings.addRange('wavesOffset', 0, 200, wavesOffset, 1, (val) => {wavesOffset = val});
settings.addRange('animationSpeed', 0, 20, animationSpeed, 0.1, (val) => {animationSpeed = val});
settings.addRange('perlinScale', 0, 1000, perlinScale, 10, (val) => {perlinScale = val});
settings.addRange('perlinYOffset', 1, 10, perlinYOffset, 1, (val) => {perlinYOffset = val});
// let imageOffset = 80;
// let wavesOffset = 30;