using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportskiTerminiAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupDetailsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreated",
                table: "Groups",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<string>(
                name: "Grad",
                table: "Groups",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "KategorijaSporta",
                table: "Groups",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateCreated",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "Grad",
                table: "Groups");

            migrationBuilder.DropColumn(
                name: "KategorijaSporta",
                table: "Groups");
        }
    }
}
