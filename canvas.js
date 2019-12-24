var canvas = document.getElementById("can");
var addImageButton = document.getElementById("addImgB");
var addImageInput = document.getElementById("addImgT");
var selected = document.getElementById("selected");
var setBackgroundInput = document.getElementById("setBackgroundInput");
var setBackgroundButton = document.getElementById("setBackgroundButton");
var addedImagesDiv = document.getElementById("addedImgs");
var insertButton = document.getElementById("insertButton");
var moveButton = document.getElementById("moveButton");
var modeLabel = document.getElementById("modeLabel");
var context = canvas.getContext("2d");
var background = new Image;

var selectedCopy = new Image();

var dmStuff = new Array();
var playerStuff = new Array();
var selectedStuff;

var mode = 0;

var selectedToMove;

selectedCopy.src = selected.src;

addClickable();

context.strokeStyle = 'rgba(100,0,0,1)';

function drawImageOnGrid(image, gridX, gridY)
{
        if (image.complete)
        {
                context.drawImage(image, gridX * canvas.gridSize + 1, gridY * canvas.gridSize + 1, canvas.gridSize - 1, canvas.gridSize - 1);
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
                                context.drawImage(image, image.toDo[i][0]*image.toDo[i][2] + 1,image.toDo[i][1]*image.toDo[i][2] + 1,image.toDo[i][2] - 1,image.toDo[i][2] - 1);
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
        context.beginPath();
        context.strokeStyle = 'rgba(0,0,0,1)';

        for (var y = 0.5; y < canvas.height;y+=i)
        {
                context.moveTo(0,y);
                context.lineTo(canvas.width,y);
        }

        for (var x = 0.5; x < canvas.width;x+=i)
        {
                context.moveTo(x,0);
                context.lineTo(x,canvas.height);        
        }
        context.stroke();
        canvas.gridSize = i;
}

function getGridImage(gridX, gridY, arr, remove)
{

        for (var i = 0; i < arr.length;i++)
        {
                if (arr[i][1] == gridX && arr[i][2] == gridY)
                {
                        var toReturn = arr[i][0];
                        if (remove)
                        {
                                arr.splice(i,1);
                        }
                        
                        return toReturn;
                }
        }

}


function addClickable()
{

        // canvas mouse down instructions
        canvas.onmousedown = function (event)
        {
                if (mode == 1 && event.button == 0)
                {
                        var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                        var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize); 
                        selectedToMove = getGridImage(gridX, gridY, playerStuff, true);
                        selectedStuff = playerStuff;
                        if (selectedToMove == null)
                        {
                                selectedToMove = getGridImage(gridX, gridY, dmStuff, true);
                                selectedStuff = dmStuff;
                        }
                        if (selectedToMove == null)
                        {
                                selectedStuff = null;
                        }
                        else
                        {
                                clearGrid(gridX, gridY);
                        }
                }
        };

        // canvas mouse up instructions
        canvas.onmouseup = function (event)
        {
                if (mode == 1 && event.button == 0 && selectedToMove != null)
                {
                        var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                        var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize);

                        drawImageOnGrid(selectedToMove, gridX,gridY);
                        selectedStuff.push(new Array(selectedToMove, gridX, gridY));
                        selectedStuff = null;
                        selectedToMove = null;
                }
        };

        // canvas mouse move instructions
        canvas.onmousemove = function (event)
        {
                if (mode == 1)
                {

                }
        };

        // insert button instructions
        insertButton.onclick = function (event)
        {
                mode = 0;
                modeLabel.textContent = "Insert";
        };

        // move button instructions
        moveButton.onclick = function (event)
        {
                mode = 1;
                modeLabel.textContent = "Move";
        };

        // set background instructions
        setBackgroundButton.onclick = function (event)
        {
                background.src = setBackgroundInput.value;
                setBackgroundInput.value = "";
                makeCanvasWithBackgroundImage(background, 40);
        };

        // add image instructions
        addImageButton.onclick = function (event)
        {
                selected.src = addImageInput.value;
                addImageInput.value = "";

                for (var i = 0; i < addedImagesDiv.childNodes.length;i++)
                {
                        if (addedImagesDiv.childNodes[i].src == selected.src)
                        {
                                selectedCopy = addedImagesDiv.childNodes[i];
                                return;
                        }
                }

                selectedCopy = new Image();
                selectedCopy.src = selected.src;
                selectedCopy.width = 60;
                selectedCopy.onclick = function (event)
                {
                        selectedCopy = this;
                        selected.src = this.src;
                };
                addedImagesDiv.appendChild(selectedCopy);
                
        };

        // left click adding selected to Canvas
        canvas.onclick = function (event)
        {
                if (mode == 0)
                {
                        var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                         var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize); 
                        drawImageOnGrid(selectedCopy, gridX,gridY);
                        playerStuff.push(new Array(selectedCopy, gridX, gridY));
                }
        };

        //right click removing images from the Canvas
        canvas.oncontextmenu = function (event)
        {
                event.preventDefault(); //stop the context menu from showing up
                var gridX = Math.floor((event.layerX - canvas.offsetLeft)/canvas.gridSize); 
                var gridY = Math.floor((event.layerY - canvas.offsetTop)/canvas.gridSize); 
                clearGrid(gridX, gridY);

                removeGridImageFromArray(gridX, gridY, dmStuff);
                removeGridImageFromArray(gridX, gridY, playerStuff);
        };
}

function removeGridImageFromArray(gridX, gridY, arr)
{
        for (var i = 0; i < arr.length;i++)
        {
                if (arr[i][1] == gridX && arr[i][2] == gridY)
                {
                        arr.splice(i,1);
                }
        }
}


function clearGrid(gridX, gridY)
{
        context.drawImage(background, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize);
        context.beginPath();
        context.rect(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5, canvas.gridSize, canvas.gridSize);
        context.stroke();
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
