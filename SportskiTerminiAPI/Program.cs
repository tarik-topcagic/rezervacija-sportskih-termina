
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SportskiTerminiAPI.Data;
using SportskiTerminiAPI.Helpers;
using SportskiTerminiAPI.Hubs;
using SportskiTerminiAPI.Interfaces;
using SportskiTerminiAPI.Models;
using SportskiTerminiAPI.Repositories;
using SportskiTerminiAPI.Services;
using System.Text;

namespace SportskiTerminiAPI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
                    policy => policy.WithOrigins("http://localhost:4200")
                                    .AllowAnyHeader()
                                    .AllowAnyMethod()
                                    .AllowCredentials());
            });

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
                });
            builder.Services.AddSignalR();
            builder.Services.AddSingleton<IUserIdProvider, SignalRUserIdProvider>();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter JWT with Bearer into field",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });

                c.SwaggerDoc("v1", new OpenApiInfo { Title = "SportskiTerminiAPI", Version = "v1" });
                c.MapType<IFormFile>(() => new OpenApiSchema { Type = "string", Format = "binary" });

                c.OperationFilter<FileUploadOperationFilter>();
            });

            builder.Services.AddDbContext<ApplicationDBContext>(options => 
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddIdentity<AppUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDBContext>()
                .AddDefaultTokenProviders();

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidateAudience = false
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrWhiteSpace(accessToken)
                            && (path.StartsWithSegments("/hubs/chat")
                                || path.StartsWithSegments("/hubs/system-notifications")))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
            });

            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IUserSettingsService, UserSettingsService>();
            builder.Services.AddScoped<IUserProfileService, UserProfileService>();
            builder.Services.AddScoped<IGradService, GradService>();
            builder.Services.AddScoped<IGradRepository, GradRepository>();
            builder.Services.AddScoped<IGroupRepository, GroupRepository>();
            builder.Services.AddScoped<IGroupChatRepository, GroupChatRepository>();
            builder.Services.AddScoped<IPrivateChatRepository, PrivateChatRepository>();
            builder.Services.AddScoped<IGroupService, GroupService>();
            builder.Services.AddScoped<IGroupChatService, GroupChatService>();
            builder.Services.AddScoped<IPrivateChatService, PrivateChatService>();
            builder.Services.AddSingleton<IPresenceService, PresenceService>();
            builder.Services.AddScoped<IPresenceAccessService, PresenceAccessService>();
            builder.Services.AddScoped<IGroupChatNotificationService, GroupChatNotificationService>();
            builder.Services.AddScoped<IPrivateChatNotificationService, PrivateChatNotificationService>();
            builder.Services.AddScoped<IGroupMembershipService, GroupMembershipService>();
            builder.Services.AddScoped<IGroupImageService, GroupImageService>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            builder.Services.AddScoped<IGroupNotificationService, GroupNotificationService>();

            var app = builder.Build();

            app.UseCors("AllowFrontend"); 


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles(); 

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<ChatHub>("/hubs/chat");
            app.MapHub<SystemNotificationHub>("/hubs/system-notifications");

            app.Run();
        }
    }
}
