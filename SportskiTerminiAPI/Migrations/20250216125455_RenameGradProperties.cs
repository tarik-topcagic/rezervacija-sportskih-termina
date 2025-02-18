using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportskiTerminiAPI.Migrations
{
    /// <inheritdoc />
    public partial class RenameGradProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn
            (
                name: "Name",
                table: "Gradovi",
                newName: "Naziv"
            );

            migrationBuilder.RenameColumn
            (
                name: "County",
                table: "Gradovi",
                newName: "Kanton"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn
            (
                name: "Naziv",
                table: "Gradovi",
                newName: "Name"
            );

            migrationBuilder.RenameColumn
            (
                name: "Kanton",
                table: "Gradovi",
                newName: "County"
            );
        }
    }
}
