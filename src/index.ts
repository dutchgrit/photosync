import 'bootstrap/dist/css/bootstrap.min.css';
import * as signalR from "@microsoft/signalr";
import * as QRCode from 'qrcode'

// Create connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/imageHub")
    .build();


// Variables
const imageRow = document.getElementById('imageRow') as HTMLDivElement;
const qrCodecanvasIdName:string = "canvas-qrcode";
const qrCodeContIdName:string = "cont-qrcode";

let indexList: Array<number> = new Array<number>();
let chunkMax = 999999999;
let chunkReceived = 0;
let chunkArray : Array<string> = new Array<string>();
let url:string;

// Start the connection
connection.start()
    .then(() => {
        console.log('Now connected, connection ID=' + connection.connectionId);
        
        // url = window.location.protocol + "//" + window.location.hostname + "/mobileIndex.html?destId=" + connection.connectionId;
        url = "https://localhost:44397" + "/mobileIndex.html?destId=" + connection.connectionId;
        
        
        const qrParent = document.getElementById('cont-qrcode');
        const textNode = document.createElement('a');
        // textNode.href = "https://localhost:44397" + "/mobileIndex.html?destId=" + connection.connectionId;
        textNode.href = url;
        textNode.text = "Test Link";
        qrParent.appendChild(textNode);
        
        QRCode.toCanvas(url, { errorCorrectionLevel: "H"}, function (error, canvas) {
            if (error) throw error
            
            canvas.id += qrCodecanvasIdName;
            console.log(url);
            
            const QRCodeElement = document.getElementById(qrCodeContIdName);
            QRCodeElement.appendChild(canvas);
            
        });
    })
    .catch(err => console.error(err.toString()));
    

connection.on("processData", function (data: string) 
{
    alert(data)
});

connection.on("mobileConnected", function () 
{
    console.log("Should notify the mobile device is connected. And hide the QR code.");
    alert("Phone connected.")


    const qrCanvasElement  = document.getElementById(qrCodeContIdName);
    if (qrCanvasElement)
        qrCanvasElement.style.display = 'none';
});

connection.on("receivePreviewImage", function (dataUrl:string, index:number) 
{
    const row: HTMLElement = document.getElementById("imageRow");

    row.appendChild(createImageCol(dataUrl, index));
    
    indexList.push(index);
});

connection.on("receiveFirstChunk", function (count:number, chunk:string) 
{
    let index:number;
    
    if (indexList.length != 0) {
        index = indexList[indexList.length - 1];
        const queryToSearch = `.col-2[data-index="${index}"]`;

        var specificElement = document.querySelector(queryToSearch);
        var progressBar = specificElement.querySelector('.progress-bar') as HTMLElement;
        
        progressBar.style.width = ("0%");
        
        chunkMax = count;
        chunkReceived = 1;
        chunkArray[0] = chunk;
    }
});

connection.on("receiveChunk", function (index:number, chunk:string) 
{
    const indexOfList = indexList[indexList.length - 1];
    const queryToSearch = `.col-2[data-index="${indexOfList}"]`;
    const colElement = document.querySelector(queryToSearch);
    const progressBar = colElement.querySelector('.progress-bar') as HTMLElement;

    if (progressBar) {
        chunkArray[index] = chunk;
        chunkReceived++;

        let perc = (chunkReceived === chunkMax) ? 100 : Math.ceil((chunkReceived/chunkMax)*100);
        progressBar.style.width = (perc + "%");
        progressBar.textContent = (perc.toString() + "%");
        progressBar.ariaValueNow = `${perc}`;

        if (chunkReceived == chunkMax)
        {
            let dataUrl = "";
            for (let i = 0; i < chunkMax; i++)
            {
                dataUrl += chunkArray[i];
            }
            const imgElement = document.querySelector(queryToSearch + " img");
            imgElement.setAttribute("src", dataUrl);
        }
    } else {
        console.log("progress bar not found.");
    }
    
});

imageRow.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;
    
    if (target.classList.contains('delete-btn')) {
        const imageCol = target.closest('.col-2');
        
        if (imageCol) {
            imageCol.remove();
        }
    }
});

function createImageCol(dataUrl:string, index:number) : HTMLDivElement {
    let img : HTMLImageElement= document.createElement("img");
    let deleteButton = document.createElement('button');
    let progressBarWrapper = document.createElement('div');
    let progressBar = document.createElement('div');
    let col : HTMLDivElement = document.createElement('div');

    // Col variables
    col.className += "col-2";
    col.dataset.index = `${index}`;
    
    // Img variables
    img.setAttribute("src", dataUrl);
    img.style.height = "100%";
    img.style.width = "100%";
    // img.dataset.index = `${index}`;

    // Delete button variables
    deleteButton.className += "btn btn-danger delete-btn";
    deleteButton.textContent = 'X';

    // Progress bar Wrapper
    progressBarWrapper.className += "progress";

    // Progress bar
    progressBar.className += "progress-bar";
    progressBar.role = "progressbar";
    progressBar.ariaValueNow = "0";
    progressBar.ariaValueMin = "0";
    progressBar.ariaValueMax = "100";


    progressBarWrapper.appendChild(progressBar);

    col.appendChild(img);
    col.appendChild(deleteButton);
    col.appendChild(progressBarWrapper);
    
    return col;
}