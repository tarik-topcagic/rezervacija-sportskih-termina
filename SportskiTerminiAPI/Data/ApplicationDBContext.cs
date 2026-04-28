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
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMembership> GroupMemberships { get; set; }
        public DbSet<GroupMessage> GroupMessages { get; set; }
        public DbSet<GroupChatReadState> GroupChatReadStates { get; set; }
        public DbSet<AppNotification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Group>()
                .HasOne(g => g.Admin)
                .WithMany(u => u.Groups)
                .HasForeignKey(g => g.AdminId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<GroupMembership>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<GroupMembership>()
                .HasOne(gm => gm.group)
                .WithMany(g => g.Memberships)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMembership>()
                .HasIndex(gm => new { gm.GroupId, gm.UserId })
                .IsUnique();

            modelBuilder.Entity<GroupMessage>()
                .HasOne(message => message.Group)
                .WithMany(group => group.GroupMessages)
                .HasForeignKey(message => message.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessage>()
                .HasOne(message => message.SenderUser)
                .WithMany(user => user.GroupMessages)
                .HasForeignKey(message => message.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMessage>()
                .HasIndex(message => new { message.GroupId, message.CreatedAt });

            modelBuilder.Entity<GroupChatReadState>()
                .HasOne(readState => readState.Group)
                .WithMany()
                .HasForeignKey(readState => readState.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupChatReadState>()
                .HasOne(readState => readState.User)
                .WithMany()
                .HasForeignKey(readState => readState.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupChatReadState>()
                .HasIndex(readState => new { readState.GroupId, readState.UserId })
                .IsUnique();

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.ActorUser)
                .WithMany()
                .HasForeignKey(n => n.ActorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.Group)
                .WithMany()
                .HasForeignKey(n => n.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AppNotification>()
                .HasOne(n => n.Membership)
                .WithMany()
                .HasForeignKey(n => n.MembershipId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AppNotification>()
                .HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });
        }
    }
}
