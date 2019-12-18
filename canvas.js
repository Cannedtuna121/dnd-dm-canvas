var canvas = document.getElementById("can");
var context = canvas.getContext("2d");
var img = new Image;
img.src = "https://static.thenounproject.com/png/318104-200.png";
var background = new Image;
background.src = "https://i.redd.it/sisriaj1j4v31.jpg";

var dmStuff = new Array();
var playerStuff = new Array();
var selected = img;

makeCanvasWithBackgroundImage(background, 40);
addClickable();


function drawImageOnGrid(image, gridX, gridY)
{
        if (image.complete)
        {
                context.drawImage(image, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize);
        }
        else
        {
                if (image.toDo == null)
                        image.toDo = new Array();
                image.toDo.push(new Array(gridX,gridY,canvas.gridSize));
                image.onload = function() 
                {
                       for (var i = 0; i < image.toDo.length;i++)
                        {
                                context.drawImage(image, image.toDo[i][0]*image.toDo[i][2],image.toDo[i][1]*image.toDo[i][2],image.toDo[i][2],image.toDo[i][2]);
                        }
                        image.toDo = null;
                };
        }


}

function makeCanvasWithBackgroundImage(background, gridSize)
{
        if (!background.complete)
        {
                background.onload = function()
                {
                        makeCanvasWithBackgroundImage(this, gridSize);
                };
        }
        else
        {
        canvas.background = background;
        canvas.height = background.height;
        canvas.width = background.width;
        context.drawImage(background, 0,0);
        drawGrid(gridSize);
        }
}

function drawGrid(i)
{
        for (var y = 0; y < canvas.height;y+=i)
        {
                context.moveTo(0,y);
                context.lineTo(canvas.width,y);
        }

        for (var x = 0; x < canvas.width;x+=i)
        {
                context.moveTo(x,0);
                context.lineTo(x,canvas.height);        
        }
        context.stroke();
        context.beginPath();
        canvas.gridSize = i;
}

function addClickable()
{
        //left click adding things
        canvas.onclick = function (event)
        {
                var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize); 
                drawImageOnGrid(selected, gridX,gridY);
                playerStuff.push(new Array(selected, gridX, gridY));
        };

        //right click removing things
        canvas.oncontextmenu = function (event)
        {
                event.preventDefault(); //stop the context menu from showing up
                var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize); 
                clearGrid(gridX, gridY);

                for (var i = 0; i < dmStuff.length;i++)
                {
                        if (dmStuff[i][1] == gridX && dmStuff[i][2] == gridY)
                        {
                                dmStuff.splice(i,1);
                        }
                }
                
                for (var i = 0; i < playerStuff.length;i++)
                {
                        if (playerStuff[i][1] == gridX && playerStuff[i][2] == gridY)
                        {
                                playerStuff.splice(i,1);
                        }
                }
        };
}

function clearGrid(gridX, gridY)
{
        context.drawImage(background, gridX * canvas.gridSize + 1, gridY * canvas.gridSize + 1, canvas.gridSize - 2, canvas.gridSize - 2, gridX * canvas.gridSize + 1, gridY * canvas.gridSize + 1, canvas.gridSize - 2, canvas.gridSize - 2);
}

function clearCanvas()
{
        context.clearRect(0,0,canvas.width,canvas.height);
}


function restorePlayerCanvas()
{
        makeCanvasWithBackgroundImage(canvas.background, canvas.gridSize);
                
        for (var i = 0; i < playerStuff.length;i++)
        {
                drawImageOnGrid(playerStuff[i][0], playerStuff[i][1], playerStuff[i][2]);
        }
}

function restoreDmCanvas()
{
        makeCanvasWithBackgroundImage(canvas.background, canvas.gridSize);
        
        for (var i = 0; i < dmStuff.length;i++)
        {
                drawImageOnGrid(dmStuff[i][0], dmStuff[i][1], dmStuff[i][2]);
        }
        for (var i = 0; i < playerStuff.length;i++)
        {
                drawImageOnGrid(playerStuff[i][0], playerStuff[i][1], playerStuff[i][2]);
        }
}
