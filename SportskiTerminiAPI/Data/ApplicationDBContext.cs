using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            

        }
        public DbSet<Grad> Gradovi { get; set; } 
    }
}
