using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.File
{
    /// <inheritdoc />
    public partial class SecureUploadMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BlobUri",
                table: "Files",
                newName: "BlobName");

            migrationBuilder.AddColumn<string>(
                name: "Checksum",
                table: "Files",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Files",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Checksum",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Files");

            migrationBuilder.RenameColumn(
                name: "BlobName",
                table: "Files",
                newName: "BlobUri");
        }
    }
}
