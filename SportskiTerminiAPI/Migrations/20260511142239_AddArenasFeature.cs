using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SportskiTerminiAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddArenasFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Arenas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SportType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Arenas", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Arenas",
                columns: new[] { "Id", "Address", "City", "CreatedAt", "Description", "ImageUrl", "Name", "SportType" },
                values: new object[,]
                {
                    { 1, "Patriotske lige 41, Sarajevo", "Sarajevo", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni teren smješten tik uz gradske saobraćajnice i nekoliko kafića, pa je pogodan za rekreativne i takmičarske termine. Reflektori pružaju vrlo dobro večernje osvjetljenje, a teren se redovno održava tokom cijele sezone. Na raspolaganju su svlačionice, manji tribinski prostor i parking u neposrednoj blizini.", "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80", "Arena Koševo Center", "Football" },
                    { 2, "Terezija bb, Sarajevo", "Sarajevo", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Moderna dvorana sa parketom pogodnim za treninge klubova, škola košarke i rekreativne mečeve. Unutrašnji prostor je dobro ventilisan, a gledalište omogućava ugodno praćenje utakmica za manju publiku. U objektu se nalaze svlačionice, sanitarni čvorovi i recepcijski prostor.", "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80", "Skenderija Basket Hall", "Basketball" },
                    { 3, "Fra Anđela Zvizdovića 8, Sarajevo", "Sarajevo", new DateTime(2026, 5, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Padel centar otvorenog tipa sa kvalitetnom podlogom i zaštitnim staklenim panelima koji dobro drže ritam igre. Arena ima večernju rasvjetu, rezervisana parking mjesta i lounge zonu za odmor između termina. Lokacija je praktična za dolazak iz više dijelova grada.", "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80", "Padel Vista Marijin Dvor", "Padel" },
                    { 4, "Maršala Tita 178, Mostar", "Mostar", new DateTime(2026, 5, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni nogometni kompleks s prirodnim osjećajem terena i uredno obilježenim linijama za rekreativne lige. Prostor je osvijetljen za večernje termine, a uz teren se nalazi nekoliko klupa i manja natkrivena zona za gledaoce. Arena je posebno popularna među ekipama koje žele termin u mirnijem dijelu grada.", "https://images.unsplash.com/photo-1486286701208-1d58e9338013?auto=format&fit=crop&w=1200&q=80", "Velež Sport Park", "Football" },
                    { 5, "Kneza Branimira 12, Mostar", "Mostar", new DateTime(2026, 5, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Zatvorena košarkaška dvorana sa stabilnom rasvjetom i vrlo dobrim akustičnim uslovima za trening i turnire. Parket je redovno održavan, a uz salu su dostupne svlačionice, tuševi i manja tribina. U blizini se nalaze parking mjesta i nekoliko ugostiteljskih objekata.", "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80", "Neretva Basket House", "Basketball" },
                    { 6, "Bulevar narodne revolucije 21, Mostar", "Mostar", new DateTime(2026, 5, 3, 0, 0, 0, 0, DateTimeKind.Utc), "Mirniji padel kompleks smješten nedaleko od gradskog jezgra, idealan za rekreativce i manje turnire. Tereni su na otvorenom, imaju snažno noćno osvjetljenje i dovoljno prostora oko staklenih ograda za sigurnu igru. Gostima su na raspolaganju parking, svlačionice i terasa za odmor.", "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80", "Padel Club Buna", "Padel" },
                    { 7, "Rudarska 2, Tuzla", "Tuzla", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Nogometni teren sa umjetnom travom projektovan za dinamične termine malog fudbala i treninge mlađih selekcija. Reflektori pokrivaju čitavu površinu, a pored terena postoji dovoljno prostora za zagrijavanje i kratki odmor. Kompleks nudi svlačionice, parking i pristup glavnim gradskim saobraćajnicama.", "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80", "Tušanj Arena 5+", "Football" },
                    { 8, "Bosne Srebrene 55, Tuzla", "Tuzla", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Utc), "Višenamjenska dvorana sa kvalitetnim parketom i odličnom preglednošću terena iz gledališta. Prostor je pogodan za treninge, prijateljske utakmice i školske turnire, uz uredne svlačionice i pomoćne prostorije. Lokacija u sportskom centru olakšava pristup i organizaciju događaja.", "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=1200&q=80", "Mejdan Basket Arena", "Basketball" },
                    { 9, "Šetalište Slana banja 18, Tuzla", "Tuzla", new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Padel teren u modernom rekreativnom kompleksu, poznat po urednoj podlozi i prijatnom ambijentu tokom cijelog dana. Reflektori omogućavaju stabilnu igru i u kasnijim večernjim satima, a gostima su dostupni garderoberi i caffe zona. Posebna prednost je blizina parkinga i centra grada.", "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80", "Padel Panonika", "Padel" },
                    { 10, "Kralja Petra I Karađorđevića 91, Banja Luka", "Banja Luka", new DateTime(2026, 5, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Otvorena arena za mali fudbal sa čvrstom umjetnom travom i vrlo dobrom drenažom nakon kiše. Teren je osvijetljen, ograda je uredna i sigurna, a uz objekat se nalaze svlačionice i prostor za kraće zadržavanje ekipa. Arena često okuplja rekreativne lige i vikend turnire.", "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80", "Krajina Football Hub", "Football" },
                    { 11, "Aleja Svetog Save 48, Banja Luka", "Banja Luka", new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Košarkaška dvorana poznata po ravnomjernom osvjetljenju i dobro održavanom parketu koji odgovara i intenzivnijim treninzima. U sklopu objekta nalaze se svlačionice, prostor za trenere i manja zona za gledaoce. U neposrednoj blizini postoji više parking mjesta i pristup glavnim ulicama.", "https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=1200&q=80", "Borik Basket Zone", "Basketball" },
                    { 12, "Cara Lazara 77, Banja Luka", "Banja Luka", new DateTime(2026, 5, 6, 0, 0, 0, 0, DateTimeKind.Utc), "Padel centar sa otvorenim terenima i prijatnim ambijentom uz rijeku, što ga čini popularnim za popodnevne i večernje termine. Podloga je brza, staklene ograde su kvalitetne, a osvjetljenje ravnomjerno raspoređeno. Gosti imaju pristup parkingu, garderoberima i zoni za osvježenje.", "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80", "Padel Riverside Vrbas", "Padel" },
                    { 13, "5. korpusa 14, Bihać", "Bihać", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Nogometni teren u mirnijem dijelu Bihaća, pogodan za termine prijateljskih ekipa i školskih sekcija. Reflektori pružaju dobru vidljivost, a uz teren postoje klupe za igrače i mali prostor za gledaoce. Površina terena je uredna i pogodna za cjelogodišnje korištenje.", "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80", "Una Football Point", "Football" },
                    { 14, "Harmanski sokak 9, Bihać", "Bihać", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Utc), "Zatvoreni košarkaški prostor sa ugodnom atmosferom i parketom koji dobro podnosi česte treninge. Arena je pogodna za omladinske selekcije i rekreativne mečeve, uz svlačionice i pristojan prostor za publiku. Lokacija je lako dostupna i u blizini ima dovoljno parking mjesta.", "https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80", "Dvorana Sokol Basket", "Basketball" },
                    { 15, "Bedem 23, Bihać", "Bihać", new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Otvoreni padel kompleks sa čistim linijama terena i dobro održavanom podlogom za rekreativnu i takmičarsku igru. Prostor ima rasvjetu za noćne termine, svlačionice i manji lounge kutak za ekipe nakon meča. Blizina zelenih zona daje cijelom centru opušten i prijatan dojam.", "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80", "Padel Una Gardens", "Padel" },
                    { 16, "Bulevar Kralja Tvrtka I 6, Zenica", "Zenica", new DateTime(2026, 5, 8, 0, 0, 0, 0, DateTimeKind.Utc), "Arena za mali fudbal sa kvalitetnom umjetnom travom i vrlo dobrom preglednošću cijele površine. Reflektori i zaštitna ograda omogućavaju sigurne večernje termine, a u sklopu centra nalaze se svlačionice i parking. Često je izbor ekipa koje traže centralnu lokaciju u Zenici.", "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=80", "Bilino Football Arena", "Football" },
                    { 17, "Prve zeničke brigade 3, Zenica", "Zenica", new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Unutrašnja dvorana sa profesionalnim osjećajem prostora, pogodna za treninge klubova i rekreativne utakmice. Parket je u dobrom stanju, rasvjeta je ravnomjerna, a manja tribina omogućava prisustvo publike bez gužve. Korisnicima su dostupne svlačionice, sanitarni čvorovi i prateći sadržaji.", "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?auto=format&fit=crop&w=1200&q=80", "Arena Kamberovića Basket", "Basketball" },
                    { 18, "Londža 41, Zenica", "Zenica", new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Savremeni padel teren sa urednim staklenim panelima, kvalitetnim osvjetljenjem i dovoljno prostora oko terena za udobno kretanje igrača. Centar je pogodan i za početnike i za naprednije rekreativce, a uz teren se nalaze parking i zona za odmor. Atmosfera je mirna, ali dovoljno živahna za turnirske dane.", "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=1200&q=80", "Padel City Zen", "Padel" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Arenas_City_SportType",
                table: "Arenas",
                columns: new[] { "City", "SportType" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Arenas");
        }
    }
}
