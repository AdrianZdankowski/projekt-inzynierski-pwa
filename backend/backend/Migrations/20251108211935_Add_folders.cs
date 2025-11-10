using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_folders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ParentFolderid",
                table: "Files",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Folders",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FolderName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ParentFolderid = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Folders", x => x.id);
                    table.ForeignKey(
                        name: "FK_Folders_Folders_ParentFolderid",
                        column: x => x.ParentFolderid,
                        principalTable: "Folders",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Files_ParentFolderid",
                table: "Files",
                column: "ParentFolderid");

            migrationBuilder.CreateIndex(
                name: "IX_Folders_ParentFolderid",
                table: "Folders",
                column: "ParentFolderid");

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Folders_ParentFolderid",
                table: "Files",
                column: "ParentFolderid",
                principalTable: "Folders",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Files_Folders_ParentFolderid",
                table: "Files");

            migrationBuilder.DropTable(
                name: "Folders");

            migrationBuilder.DropIndex(
                name: "IX_Files_ParentFolderid",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "ParentFolderid",
                table: "Files");
        }
    }
}
