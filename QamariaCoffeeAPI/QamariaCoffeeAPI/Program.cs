using Microsoft.EntityFrameworkCore;
using QamariaCoffeeAPI.Models;

namespace QamariaCoffeeAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Register DbContext
            builder.Services.AddDbContext<QamariaCoffeeDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Allow React app to call this API
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact", policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowReact"); // enable CORS
            app.UseAuthorization();
            app.MapControllers();
            app.Run();
        }
    }
}