using PictureSyncerSignalR.Hubs;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Builder services
services.AddSignalR();
// services.AddControllers();


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();


app.UseRouting();

app.MapHub<ImageHub>("/imageHub");
// app.MapControllers();

app.Run();