using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportskiTerminiAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupMembershipFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GroupMemberships_GroupId",
                table: "GroupMemberships");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "GroupMemberships",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<DateTime>(
                name: "RespondedAt",
                table: "GroupMemberships",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GroupMemberships_GroupId_UserId",
                table: "GroupMemberships",
                columns: new[] { "GroupId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GroupMemberships_GroupId_UserId",
                table: "GroupMemberships");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "GroupMemberships");

            migrationBuilder.DropColumn(
                name: "RespondedAt",
                table: "GroupMemberships");

            migrationBuilder.CreateIndex(
                name: "IX_GroupMemberships_GroupId",
                table: "GroupMemberships",
                column: "GroupId");
        }
    }
}
