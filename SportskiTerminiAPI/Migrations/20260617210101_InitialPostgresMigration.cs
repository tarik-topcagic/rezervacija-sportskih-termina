using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SportskiTerminiAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgresMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Arenas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    City = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SportType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arenas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    ProfilePictureUrl = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    EmailNotificationsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LanguagePreference = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false, defaultValue: "bs"),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Gradovi",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Naziv = table.Column<string>(type: "text", nullable: false),
                    Kanton = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Gradovi", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Grad = table.Column<string>(type: "text", nullable: false),
                    KategorijaSporta = table.Column<string>(type: "text", nullable: false),
                    AdminId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Groups_AspNetUsers_AdminId",
                        column: x => x.AdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrivateConversations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserOneId = table.Column<string>(type: "text", nullable: false),
                    UserTwoId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateConversations_AspNetUsers_UserOneId",
                        column: x => x.UserOneId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrivateConversations_AspNetUsers_UserTwoId",
                        column: x => x.UserTwoId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupChatReadStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupChatReadStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupChatReadStates_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupChatReadStates_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMemberships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMemberships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMemberships_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupMemberships_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupId = table.Column<int>(type: "integer", nullable: false),
                    SenderUserId = table.Column<string>(type: "text", nullable: false),
                    MessageText = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMessages_AspNetUsers_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupMessages_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrivateChatReadStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConversationId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateChatReadStates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateChatReadStates_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrivateChatReadStates_PrivateConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "PrivateConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PrivateMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConversationId = table.Column<int>(type: "integer", nullable: false),
                    SenderUserId = table.Column<string>(type: "text", nullable: false),
                    MessageText = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateMessages_AspNetUsers_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PrivateMessages_PrivateConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "PrivateConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ActorUserId = table.Column<string>(type: "text", nullable: true),
                    GroupId = table.Column<int>(type: "integer", nullable: true),
                    MembershipId = table.Column<int>(type: "integer", nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_GroupMemberships_MembershipId",
                        column: x => x.MembershipId,
                        principalTable: "GroupMemberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notifications_Groups_GroupId",
                        column: x => x.GroupId,
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GroupMessageReceipts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GroupMessageId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SeenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GroupMessageReceipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GroupMessageReceipts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GroupMessageReceipts_GroupMessages_GroupMessageId",
                        column: x => x.GroupMessageId,
                        principalTable: "GroupMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Arenas",
                columns: new[] { "Id", "Address", "City", "CreatedAt", "Description", "ImageUrl", "Name", "SportType" },
                values: new object[,]
                {
                    { 1, "Patriotske lige 41, Sarajevo", "Sarajevo", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni teren smješten tik uz gradske saobraćajnice i nekoliko kafića, pa je pogodan za rekreativne i takmičarske termine. Reflektori pružaju vrlo dobro večernje osvjetljenje, a teren se redovno održava tokom cijele sezone. Na raspolaganju su svlačionice, manji tribinski prostor i parking u neposrednoj blizini.", "https://image.pollinations.ai/prompt/photorealistic%20modern%20outdoor%20football%20arena%20in%20Sarajevo%2C%20Balkan%20sports%20center%20architecture%2C%20empty%20artificial%20turf%20field%2C%20stadium%20lights%2C%20small%20seating%20area%2C%20fences%2C%20evening%20atmosphere%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1001&model=flux&nologo=true&private=true", "Arena Koševo Center", "Football" },
                    { 2, "Terezija bb, Sarajevo", "Sarajevo", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Moderna dvorana sa parketom pogodnim za treninge klubova, škola košarke i rekreativne mečeve. Unutrašnji prostor je dobro ventilisan, a gledalište omogućava ugodno praćenje utakmica za manju publiku. U objektu se nalaze svlačionice, sanitarni čvorovi i recepcijski prostor.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20hall%20in%20Sarajevo%2C%20modern%20European%20sports%20facility%2C%20polished%20wooden%20court%2C%20seating%20stands%2C%20ceiling%20lights%2C%20empty%20arena%2C%20realistic%20architecture%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1002&model=flux&nologo=true&private=true", "Skenderija Basket Hall", "Basketball" },
                    { 3, "Fra Anđela Zvizdovića 8, Sarajevo", "Sarajevo", new DateTime(2026, 5, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Padel centar otvorenog tipa sa kvalitetnom podlogom i zaštitnim staklenim panelima koji dobro drže ritam igre. Arena ima večernju rasvjetu, rezervisana parking mjesta i lounge zonu za odmor između termina. Lokacija je praktična za dolazak iz više dijelova grada.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20padel%20court%20complex%20in%20Sarajevo%2C%20glass%20walls%2C%20modern%20Balkan%20sports%20center%2C%20evening%20lighting%2C%20spectator%20benches%2C%20fenced%20courts%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1003&model=flux&nologo=true&private=true", "Padel Vista Marijin Dvor", "Padel" },
                    { 4, "Maršala Tita 178, Mostar", "Mostar", new DateTime(2026, 5, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni nogometni kompleks s prirodnim osjećajem terena i uredno obilježenim linijama za rekreativne lige. Prostor je osvijetljen za večernje termine, a uz teren se nalazi nekoliko klupa i manja natkrivena zona za gledaoce. Arena je posebno popularna među ekipama koje žele termin u mirnijem dijelu grada.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20football%20sports%20park%20in%20Mostar%2C%20Balkan%20urban%20setting%2C%20green%20field%2C%20floodlights%2C%20fences%2C%20modest%20grandstand%2C%20warm%20stone%20architecture%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1004&model=flux&nologo=true&private=true", "Velež Sport Park", "Football" },
                    { 5, "Kneza Branimira 12, Mostar", "Mostar", new DateTime(2026, 5, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Zatvorena košarkaška dvorana sa stabilnom rasvjetom i vrlo dobrim akustičnim uslovima za trening i turnire. Parket je redovno održavan, a uz salu su dostupne svlačionice, tuševi i manja tribina. U blizini se nalaze parking mjesta i nekoliko ugostiteljskih objekata.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20arena%20in%20Mostar%2C%20modern%20sports%20hall%2C%20hardwood%20court%2C%20bright%20roof%20lighting%2C%20compact%20spectator%20area%2C%20clean%20European%20design%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1005&model=flux&nologo=true&private=true", "Neretva Basket House", "Basketball" },
                    { 6, "Bulevar narodne revolucije 21, Mostar", "Mostar", new DateTime(2026, 5, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Mirniji padel kompleks smješten nedaleko od gradskog jezgra, idealan za rekreativce i manje turnire. Tereni su na otvorenom, imaju snažno noćno osvjetljenje i dovoljno prostora oko staklenih ograda za sigurnu igru. Gostima su na raspolaganju parking, svlačionice i terasa za odmor.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20padel%20club%20in%20Mostar%2C%20glass%20padel%20courts%2C%20Mediterranean%20Balkan%20atmosphere%2C%20modern%20lighting%2C%20lounge%20terrace%2C%20clean%20fences%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1006&model=flux&nologo=true&private=true", "Padel Club Buna", "Padel" },
                    { 7, "Rudarska 2, Tuzla", "Tuzla", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Nogometni teren sa umjetnom travom projektovan za dinamične termine malog fudbala i treninge mlađih selekcija. Reflektori pokrivaju čitavu površinu, a pored terena postoji dovoljno prostora za zagrijavanje i kratki odmor. Kompleks nudi svlačionice, parking i pristup glavnim gradskim saobraćajnicama.", "https://image.pollinations.ai/prompt/photorealistic%20small%20football%20arena%20in%20Tuzla%2C%20empty%20synthetic%20turf%20field%2C%20floodlights%2C%20fences%2C%20parking%20nearby%2C%20modern%20Bosnian%20sports%20facility%2C%20overcast%20daylight%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1007&model=flux&nologo=true&private=true", "Tušanj Arena 5+", "Football" },
                    { 8, "Bosne Srebrene 55, Tuzla", "Tuzla", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Višenamjenska dvorana sa kvalitetnim parketom i odličnom preglednošću terena iz gledališta. Prostor je pogodan za treninge, prijateljske utakmice i školske turnire, uz uredne svlačionice i pomoćne prostorije. Lokacija u sportskom centru olakšava pristup i organizaciju događaja.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20sports%20hall%20in%20Tuzla%2C%20clean%20wooden%20court%2C%20bright%20lighting%2C%20tiered%20seating%2C%20modern%20Balkan%20civic%20arena%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1008&model=flux&nologo=true&private=true", "Mejdan Basket Arena", "Basketball" },
                    { 9, "Šetalište Slana banja 18, Tuzla", "Tuzla", new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Padel teren u modernom rekreativnom kompleksu, poznat po urednoj podlozi i prijatnom ambijentu tokom cijelog dana. Reflektori omogućavaju stabilnu igru i u kasnijim večernjim satima, a gostima su dostupni garderoberi i caffe zona. Posebna prednost je blizina parkinga i centra grada.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20padel%20arena%20in%20Tuzla%2C%20modern%20glass%20courts%2C%20evening%20lights%2C%20urban%20recreational%20zone%2C%20fenced%20facility%2C%20empty%20courts%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1009&model=flux&nologo=true&private=true", "Padel Panonika", "Padel" },
                    { 10, "Kralja Petra I Karađorđevića 91, Banja Luka", "Banja Luka", new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Otvorena arena za mali fudbal sa čvrstom umjetnom travom i vrlo dobrom drenažom nakon kiše. Teren je osvijetljen, ograda je uredna i sigurna, a uz objekat se nalaze svlačionice i prostor za kraće zadržavanje ekipa. Arena često okuplja rekreativne lige i vikend turnire.", "https://image.pollinations.ai/prompt/photorealistic%20football%20hub%20in%20Banja%20Luka%2C%20empty%20artificial%20grass%20pitch%2C%20European%20sports%20facility%2C%20perimeter%20fences%2C%20floodlights%2C%20modest%20stands%2C%20modern%20architecture%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1010&model=flux&nologo=true&private=true", "Krajina Football Hub", "Football" },
                    { 11, "Aleja Svetog Save 48, Banja Luka", "Banja Luka", new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Košarkaška dvorana poznata po ravnomjernom osvjetljenju i dobro održavanom parketu koji odgovara i intenzivnijim treninzima. U sklopu objekta nalaze se svlačionice, prostor za trenere i manja zona za gledaoce. U neposrednoj blizini postoji više parking mjesta i pristup glavnim ulicama.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20court%20in%20Banja%20Luka%2C%20bright%20sports%20hall%20lighting%2C%20polished%20parquet%2C%20spectator%20seating%2C%20contemporary%20Balkan%20arena%20interior%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1011&model=flux&nologo=true&private=true", "Borik Basket Zone", "Basketball" },
                    { 12, "Cara Lazara 77, Banja Luka", "Banja Luka", new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Padel centar sa otvorenim terenima i prijatnim ambijentom uz rijeku, što ga čini popularnim za popodnevne i večernje termine. Podloga je brza, staklene ograde su kvalitetne, a osvjetljenje ravnomjerno raspoređeno. Gosti imaju pristup parkingu, garderoberima i zoni za osvježenje.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20padel%20complex%20near%20river%20in%20Banja%20Luka%2C%20modern%20glass%20courts%2C%20elegant%20lighting%2C%20landscaped%20sports%20center%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1012&model=flux&nologo=true&private=true", "Padel Riverside Vrbas", "Padel" },
                    { 13, "5. korpusa 14, Bihać", "Bihać", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Nogometni teren u mirnijem dijelu Bihaća, pogodan za termine prijateljskih ekipa i školskih sekcija. Reflektori pružaju dobru vidljivost, a uz teren postoje klupe za igrače i mali prostor za gledaoce. Površina terena je uredna i pogodna za cjelogodišnje korištenje.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20football%20terrain%20in%20Bihac%2C%20empty%20field%2C%20fences%2C%20tribune%20benches%2C%20clean%20Balkan%20sports%20center%2C%20natural%20daylight%2C%20parking%20and%20trees%20nearby%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1013&model=flux&nologo=true&private=true", "Una Football Point", "Football" },
                    { 14, "Harmanski sokak 9, Bihać", "Bihać", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Zatvoreni košarkaški prostor sa ugodnom atmosferom i parketom koji dobro podnosi česte treninge. Arena je pogodna za omladinske selekcije i rekreativne mečeve, uz svlačionice i pristojan prostor za publiku. Lokacija je lako dostupna i u blizini ima dovoljno parking mjesta.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20hall%20in%20Bihac%2C%20hardwood%20court%2C%20bright%20ceiling%20lighting%2C%20modest%20stands%2C%20local%20European%20sports%20facility%2C%20empty%20arena%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1014&model=flux&nologo=true&private=true", "Dvorana Sokol Basket", "Basketball" },
                    { 15, "Bedem 23, Bihać", "Bihać", new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni padel kompleks sa čistim linijama terena i dobro održavanom podlogom za rekreativnu i takmičarsku igru. Prostor ima rasvjetu za noćne termine, svlačionice i manji lounge kutak za ekipe nakon meča. Blizina zelenih zona daje cijelom centru opušten i prijatan dojam.", "https://image.pollinations.ai/prompt/photorealistic%20outdoor%20padel%20gardens%20in%20Bihac%2C%20glass%20wall%20courts%2C%20green%20surroundings%2C%20evening%20lights%2C%20modern%20recreational%20center%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1015&model=flux&nologo=true&private=true", "Padel Una Gardens", "Padel" },
                    { 16, "Bulevar Kralja Tvrtka I 6, Zenica", "Zenica", new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Arena za mali fudbal sa kvalitetnom umjetnom travom i vrlo dobrom preglednošću cijele površine. Reflektori i zaštitna ograda omogućavaju sigurne večernje termine, a u sklopu centra nalaze se svlačionice i parking. Često je izbor ekipa koje traže centralnu lokaciju u Zenici.", "https://image.pollinations.ai/prompt/photorealistic%20football%20arena%20in%20Zenica%2C%20empty%20artificial%20turf%2C%20powerful%20floodlights%2C%20fences%2C%20compact%20stands%2C%20urban%20Balkan%20sports%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1016&model=flux&nologo=true&private=true", "Bilino Football Arena", "Football" },
                    { 17, "Prve zeničke brigade 3, Zenica", "Zenica", new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Unutrašnja dvorana sa profesionalnim osjećajem prostora, pogodna za treninge klubova i rekreativne utakmice. Parket je u dobrom stanju, rasvjeta je ravnomjerna, a manja tribina omogućava prisustvo publike bez gužve. Korisnicima su dostupne svlačionice, sanitarni čvorovi i prateći sadržaji.", "https://image.pollinations.ai/prompt/photorealistic%20indoor%20basketball%20arena%20in%20Zenica%2C%20polished%20wood%20floor%2C%20balanced%20lighting%2C%20spectator%20tribune%2C%20contemporary%20European%20sports%20hall%2C%20empty%20facility%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1017&model=flux&nologo=true&private=true", "Arena Kamberovića Basket", "Basketball" },
                    { 18, "Londža 41, Zenica", "Zenica", new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Savremeni padel teren sa urednim staklenim panelima, kvalitetnim osvjetljenjem i dovoljno prostora oko terena za udobno kretanje igrača. Centar je pogodan i za početnike i za naprednije rekreativce, a uz teren se nalaze parking i zona za odmor. Atmosfera je mirna, ali dovoljno živahna za turnirske dane.", "https://image.pollinations.ai/prompt/photorealistic%20modern%20padel%20center%20in%20Zenica%2C%20empty%20glass%20courts%2C%20evening%20lights%2C%20fences%2C%20sleek%20Balkan%20sports%20architecture%2C%20realistic%20facility%20atmosphere%2C%20no%20players%2C%20no%20logos?width=1280&height=720&seed=1018&model=flux&nologo=true&private=true", "Padel City Zen", "Padel" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Arenas_City_SportType",
                table: "Arenas",
                columns: new[] { "City", "SportType" });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupChatReadStates_GroupId_UserId",
                table: "GroupChatReadStates",
                columns: new[] { "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupChatReadStates_UserId",
                table: "GroupChatReadStates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMemberships_GroupId_UserId",
                table: "GroupMemberships",
                columns: new[] { "GroupId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMemberships_UserId",
                table: "GroupMemberships",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessageReceipts_GroupMessageId_UserId",
                table: "GroupMessageReceipts",
                columns: new[] { "GroupMessageId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessageReceipts_UserId",
                table: "GroupMessageReceipts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_GroupId_CreatedAt",
                table: "GroupMessages",
                columns: new[] { "GroupId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GroupMessages_SenderUserId",
                table: "GroupMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Groups_AdminId",
                table: "Groups",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorUserId",
                table: "Notifications",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_GroupId",
                table: "Notifications",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_MembershipId",
                table: "Notifications",
                column: "MembershipId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_CreatedAt",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PrivateChatReadStates_ConversationId_UserId",
                table: "PrivateChatReadStates",
                columns: new[] { "ConversationId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrivateChatReadStates_UserId",
                table: "PrivateChatReadStates",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PrivateConversations_UserOneId_UserTwoId",
                table: "PrivateConversations",
                columns: new[] { "UserOneId", "UserTwoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PrivateConversations_UserTwoId",
                table: "PrivateConversations",
                column: "UserTwoId");

            migrationBuilder.CreateIndex(
                name: "IX_PrivateMessages_ConversationId_CreatedAt",
                table: "PrivateMessages",
                columns: new[] { "ConversationId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PrivateMessages_SenderUserId",
                table: "PrivateMessages",
                column: "SenderUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Arenas");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Gradovi");

            migrationBuilder.DropTable(
                name: "GroupChatReadStates");

            migrationBuilder.DropTable(
                name: "GroupMessageReceipts");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PrivateChatReadStates");

            migrationBuilder.DropTable(
                name: "PrivateMessages");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "GroupMessages");

            migrationBuilder.DropTable(
                name: "GroupMemberships");

            migrationBuilder.DropTable(
                name: "PrivateConversations");

            migrationBuilder.DropTable(
                name: "Groups");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
