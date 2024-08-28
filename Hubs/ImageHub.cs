using Microsoft.AspNetCore.SignalR;

namespace PictureSyncerSignalR.Hubs;

public class ImageHub : Hub
{

    public void SendMobileConnected(string destinationId) =>
        Clients.Client(destinationId).SendAsync("mobileConnected");

    public void SendPreviewImage(string destinationId, string dataUrl, int index) =>
        Clients.Client(destinationId).SendAsync("receivePreviewImage", dataUrl, index);
    
    public void SendFirstChunk(string destinationId, int count, string chunk) =>
        Clients.Client(destinationId).SendAsync("receiveFirstChunk", count, chunk);

    public void SendChunk(string destinationId, int index, string chunk)
    {
        Clients.Client(destinationId).SendAsync("receiveChunk", index, chunk);
    }

    public void SendData(string destinationId, string data) =>
        Clients.Client(destinationId).SendAsync("processdata", data);
    
}