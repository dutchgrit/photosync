import * as signalR from "@microsoft/signalr";
import 'bootstrap/dist/css/bootstrap.min.css';
// import '@fortawesome/fontawesome-free/js/fontawesome.min.js';
// import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// import '@fortawesome/fontawesome-free/js/fontawesome.min.js';

// Create connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/imageHub")
    .build();

var destId = getParameterByName("destId");


// Start the connection
// connection.start().catch(err => console.error(err.toString()));

function getParameterByName(name:string, url:string = window.location.href): string {
    const parsedUrl = new URL(url);
    const params = new URLSearchParams(parsedUrl.search);
    
    return params.get(name);
}

connection.start().then(function () {
    console.log('Connected to: ' + connection.connectionId)
    
    connection.send("SendMobileConnected", destId)
})
    .catch(function () { console.log('Failed to connect.')});


function resizeImage(url, width, height, callback) {
    var sourceImage = new Image();

    sourceImage.onload = function () {
        
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, width, height);

        // Convert the canvas to a data URL in PNG format
        // console.log(canvas.toDataURL());
        callback(canvas.toDataURL());
    }
    sourceImage.src = url;
}

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) : void {
    var files = evt.target.files; // FileList object

    for (let fileN : number = 0; fileN < files.length; fileN++) {
        
        //check type is image.
        // Only process image files.
        if (files[fileN].type.match('image.*')) {
            
            var reader = new FileReader();
            reader.onload = (e) => {
                    var dataurl = e.target.result;
                    
                    //resize image
                    resizeImage(dataurl, 50, 50, function (sizedImg) {
                        // imageHubProxy.server.sendPreviewImage(destId, sizedImg);
                        connection.send("sendPreviewImage", destId, sizedImg, fileN).then(r => {
                            var l = dataurl.toString().length;
                            let lc = 0;
                            let chunks = [];
                            let count = 0;
                            const chunkSize = 2048;

                            for (; lc < l; count++) {
                                chunks[count] = dataurl.slice(lc, lc += chunkSize);
                            }

                            //Probeer dit in een timeout constructie nog te gooien..
                            connection.send("sendFirstChunk", destId, count, chunks[0]);
                            for (var i = 1; i < count; i++) {
                                // console.log(chunks[i]);
                                connection.send("sendChunk", destId, i, chunks[i]);
                            }
                        });
                    });
                };
            reader.readAsDataURL(files[fileN]);
        }
    }
}