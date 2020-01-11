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
var hideButton = document.getElementById("hideButton");
var context = canvas.getContext("2d");
var background = new Image;

var makePlayerCanvasButton = document.getElementById("makePlayerCanvasButton");
var playerCanvas = document.getElementById('playerCanvas');
var playerContext = playerCanvas.getContext("2d");

var selectedCopy = new Image();

var dmImages = new Array();
var playerImages = new Array();
var hiddenTiles = new Array();
var selectedStuff;

var mode = 0;
var hideX, hideY;

var selectedToMove;

selectedCopy.src = selected.src;

addClickable();

context.strokeStyle = 'rgba(100,0,0,1)';

function drawImageOnGrid(image, gridX, gridY, drawContext)
{

        if (drawContext == null)
        {
                drawContext = context;
        }

        if (image == null)
        {
                return;
        }

        if (image.complete)
        {
                drawContext.drawImage(image, gridX * canvas.gridSize + 1, gridY * canvas.gridSize + 1, canvas.gridSize - 1, canvas.gridSize - 1);
        }
        else
        {
                if (image.toDo == null)
                {
                        image.toDo = new Array();
                }

                image.toDo.push(new Array(gridX,gridY,canvas.gridSize));
                image.onload = function() 
                {
                       for (var i = 0; i < image.toDo.length;i++)
                        {
                                drawContext.drawImage(image, image.toDo[i][0]*image.toDo[i][2] + 1,image.toDo[i][1]*image.toDo[i][2] + 1,image.toDo[i][2] - 1,image.toDo[i][2] - 1);
                        }
                        image.toDo = null;
                };
        }
}

function makeCanvasWithBackgroundImage(background, gridSize, remakeImageArrays)
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
                drawGridLines(gridSize);
                if (remakeImageArrays)
                {
                        dmImages = new Array(Math.ceil(canvas.height / gridSize) * Math.ceil(canvas.width / gridSize));
                        playerImages = new Array(Math.ceil(canvas.height / gridSize) * Math.ceil(canvas.width / gridSize));
                        hiddenTiles = new Array(Math.ceil(canvas.height / gridSize) * Math.ceil(canvas.width / gridSize));
                
                }
        }
}

function drawGridLines(i)
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

function getGridImage(gridX, gridY, arr)
{
        return arr[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)];
}


function addClickable()
{

        // canvas mouse down instructions
        canvas.onmousedown = function (event)
        {
                if (mode == 1)
                {
                        if (event.button == 0)
                        {
                                var gridX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                                var gridY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize); 
                                selectedToMove = getGridImage(gridX, gridY, playerImages);
                                removeGridImageFromArray(gridX, gridY, playerImages);
                                selectedStuff = playerImages;
                                if (selectedToMove == null)
                                {
                                        selectedToMove = getGridImage(gridX, gridY, dmImages);
                                        removeGridImageFromArray(gridX, gridY, dmImages);
                                        selectedStuff = dmImages;
                                }
                                if (selectedToMove == null)
                                {
                                        selectedStuff = null;
                                }
                                else
                                {
                                        drawGrid(gridX, gridY);
                                }
                        }
                }
                else if (mode == 2)
                {
                        hideX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                        hideY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize); 
                }
        };

        // canvas mouse up instructions
        canvas.onmouseup = function (event)
        {
                if (mode == 1)
                {
                        if (event.button == 0 && selectedToMove != null)
                        {
                                var gridX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                                var gridY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize);

                                drawImageOnGrid(selectedToMove, gridX,gridY);
                                selectedStuff[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)] = selectedToMove;
                                selectedStuff = null;
                                selectedToMove = null;
                        }
                }
                else if (mode == 2)
                {
                        if (hideX != null && hideY != null)
                        {
                                var gridX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                                var gridY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize);

                                var x1 = Math.min(gridX, hideX);
                                var x2 = Math.max(gridX, hideX);
                                var y1 = Math.min(gridY, hideY);
                                var y2 = Math.max(gridY, hideY);

                                for (var x = x1; x <= x2; x++)
                                {
                                        for (var y = y1; y <= y2; y++)
                                        {
                                                if (event.button == 0)
                                                {
                                                        hiddenTiles[x + y * Math.ceil(canvas.width / canvas.gridSize)] = true;
                                                }
                                                else if (event.button == 2)
                                                {
                                                        hiddenTiles[x + y * Math.ceil(canvas.width / canvas.gridSize)] = null;
                                                }
                                                drawGrid(x, y);
                                        }
                                }
                        }
                }
        };

        // Make Player Canvas Button Instructions
        makePlayerCanvasButton.onclick = function (event)
        {
                makePlayerCanvas();
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

        // hide button instructions
        hideButton.onclick = function (event)
        {
                mode = 2;
                modeLabel.textContent = "Hide";
        }

        // set background instructions
        setBackgroundButton.onclick = function (event)
        {
                background.src = setBackgroundInput.value;
                setBackgroundInput.value = "";
                makeCanvasWithBackgroundImage(background, 40, true);
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
                        var gridX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                        var gridY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize); 
                        drawImageOnGrid(selectedCopy, gridX,gridY);
                        playerImages[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)] = selectedCopy;
                }
        };

        //right click removing images from the Canvas
        canvas.oncontextmenu = function (event)
        {
                event.preventDefault(); //stop the context menu from showing up
                if (mode == 0)
                {
                        var gridX = Math.floor((event.pageX - canvas.offsetLeft)/canvas.gridSize); 
                        var gridY = Math.floor((event.pageY - canvas.offsetTop)/canvas.gridSize); 

                        removeGridImageFromArray(gridX, gridY, dmImages);
                        removeGridImageFromArray(gridX, gridY, playerImages);

                        drawGrid(gridX, gridY);
                }
        };
}

function removeGridImageFromArray(gridX, gridY, arr)
{
        arr[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)] = null;
}


function clearGrid(gridX, gridY)
{
        context.drawImage(background, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize);
        
       
        var hidden = isTileHidden(gridX, gridY);
        var myColor;

        if (hidden)
        {
                myColor = '#FFFFFF'
        }
        else
        {
                myColor = '#000000'
        }

        var useColor = myColor;
        if (isTileHidden(gridX, gridY - 1) != hidden && isTileHidden(gridX, gridY -1) != null)
        {
                useColor = '#FF00FF';
        }

        context.beginPath();
        context.strokeStyle = useColor;
        context.moveTo(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5);
        context.lineTo(gridX * canvas.gridSize + canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5);
        context.stroke();
       
        useColor = myColor;
        if (isTileHidden(gridX + 1, gridY) != hidden && isTileHidden(gridX + 1, gridY) != null)
        {
                useColor = '#FF00FF';
        }

        context.beginPath();
        context.strokeStyle = useColor;
        context.moveTo(gridX * canvas.gridSize + 0.5 + canvas.gridSize, gridY * canvas.gridSize + 0.5);
        context.lineTo(gridX * canvas.gridSize + canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5 + canvas.gridSize);
        context.stroke();
       
        useColor = myColor;
        if (isTileHidden(gridX, gridY + 1) != hidden && isTileHidden(gridX, gridY + 1) != null)
        {
                useColor = '#FF00FF';
        }

        context.beginPath();
        context.strokeStyle = useColor;
        context.moveTo(gridX * canvas.gridSize + 0.5 + canvas.gridSize, gridY * canvas.gridSize + 0.5 + canvas.gridSize);
        context.lineTo(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5 + canvas.gridSize);
        context.stroke();
        
        useColor = myColor;
        if (isTileHidden(gridX - 1, gridY) != hidden && isTileHidden(gridX - 1, gridY) != null)
        {
                useColor = '#FF00FF';
        }

        context.beginPath();
        context.strokeStyle = useColor;
        context.moveTo(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5 + canvas.gridSize);
        context.lineTo(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5);
        context.stroke();
       
}

function isTileHidden(gridX, gridY)
{
        if (gridX >= 0 && gridX <= Math.ceil(canvas.width / canvas.gridSize))
        {
                if (gridY >= 0 && gridY <= Math.ceil(canvas.height / canvas.gridSize))
                {
                        if (hiddenTiles[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)] == true)
                        {
                                return true;
                        }
                        else
                        {
                                return false;
                        }
                }
        }

        return null;
}

function drawGrid(gridX, gridY)
{
        clearGrid(gridX, gridY);
        drawImageOnGrid(dmImages[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)], gridX, gridY);
        drawImageOnGrid(playerImages[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)], gridX, gridY);
}

function drawPlayerGrid(gridX, gridY)
{
        if (isTileHidden(gridX, gridY) == true)
        {
                playerContext.fillRect(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5, canvas.gridSize, canvas.gridSize);
        }
        else
        {
                playerContext.drawImage(background, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize, gridX * canvas.gridSize, gridY * canvas.gridSize, canvas.gridSize, canvas.gridSize); 
                playerContext.strokeRect(gridX * canvas.gridSize + 0.5, gridY * canvas.gridSize + 0.5, canvas.gridSize, canvas.gridSize);
                drawImageOnGrid(playerImages[gridX + gridY * Math.ceil(canvas.width / canvas.gridSize)], gridX, gridY, playerContext);
        }
}

function clearCanvas()
{
        context.clearRect(0,0,canvas.width,canvas.height);
}


function makePlayerCanvas()
{
        playerCanvas.width = canvas.width;
        playerCanvas.height = canvas.height;

        for (var x = 0; x < Math.ceil(playerCanvas.width / canvas.gridSize);x++)
        {
                for (var y = 0; y < Math.ceil(playerCanvas.height / canvas.gridSize); y++)
                {
                        drawPlayerGrid(x,y);
                }
        }
}

function restoreDmCanvas()
{
        makeCanvasWithBackgroundImage(canvas.background, canvas.gridSize, false);
        
        for (var i = 0; i < dmImages.length;i++)
        {
                drawImageOnGrid(dmImages[i], i % Math.ceil(canvas.width / canvas.gridSize), Math.floor(i / Math.ceil(canvas.width / canvas.gridSize)));
        }
        for (var i = 0; i < playerImages.length;i++)
        {
                drawImageOnGrid(playerImages[i], i % Math.ceil(canvas.width / canvas.gridSize), Math.floor(i / Math.ceil(canvas.width / canvas.gridSize)));
        }
}
